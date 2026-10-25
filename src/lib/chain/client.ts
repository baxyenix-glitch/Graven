import {
  createPublicClient,
  http,
  fallback,
  formatUnits,
  isAddress,
  getAddress,
  verifyMessage as viemVerifyMessage,
  type PublicClient,
} from 'viem';
export { isAddress, getAddress } from 'viem';
import {
  robinhoodChain,
  robinhoodMainnet,
  robinhoodTestnet,
  robinhoodMainnetRpcUrls,
  robinhoodTestnetRpcUrls,
  gravenTokenAddress,
  minGravenHold,
  isTestnet,
} from './config';

// 1. Robinhood Chain Mainnet Client (Chain ID 4663)
export const mainnetClient = createPublicClient({
  chain: robinhoodMainnet,
  transport: fallback([
    http(robinhoodMainnetRpcUrls[0], { timeout: 6000, retryCount: 1, batch: true }),
    http(robinhoodMainnetRpcUrls[1], { timeout: 6000, retryCount: 1, batch: true }),
  ]),
  batch: { multicall: true },
});

// 2. Robinhood Chain Testnet Client (Chain ID 46630)
export const testnetClient = createPublicClient({
  chain: robinhoodTestnet,
  transport: http(robinhoodTestnetRpcUrls[0], {
    timeout: 6000,
    retryCount: 1,
    batch: true,
  }),
  batch: { multicall: true },
});

// 3. Active default client
export const publicClient = isTestnet ? testnetClient : mainnetClient;

// Comprehensive ERC-20 & Launchpad ABI (including Pons deployer, logo, description)
export const COMPREHENSIVE_TOKEN_ABI = [
  // Standard ERC-20
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ type: 'address', name: 'account' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  // Ownership / Creator variants
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'getOwner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'creator',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'deployer',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'admin',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  // Token Metadata / Visuals (Pons & extensions)
  {
    type: 'function',
    name: 'logo',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'logoURI',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'image',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'description',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
] as const;

// Global BigInt serialization patch so JSON.stringify / NextResponse.json never throws
if (typeof BigInt !== 'undefined') {
  try {
    if (!(BigInt.prototype as any).toJSON) {
      (BigInt.prototype as any).toJSON = function () {
        return this.toString();
      };
    }
  } catch {}
}

/**
 * Normalizes IPFS / HTTPS image URLs for reliable frontend rendering.
 * Never defaults to Graven protocol mascot logo so other tokens show their own images.
 */
export function formatTokenImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const clean = url.trim();
  if (clean === '/assets/logo.png') return '';
  if (clean.startsWith('ipfs://')) {
    const hash = clean.replace('ipfs://', '').replace(/^ipfs\//, '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('/')) {
    return clean;
  }
  return '';
}

/**
 * Queries DexScreener token API for live token images, headers, and metadata
 */
export async function fetchDexScreenerTokenImage(tokenAddress: string): Promise<string | null> {
  if (!tokenAddress || !isAddress(tokenAddress, { strict: false })) return null;
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.pairs)) {
      const pairWithImg = data.pairs.find((p: any) => p.info?.imageUrl);
      if (pairWithImg?.info?.imageUrl) {
        return pairWithImg.info.imageUrl;
      }
      const pairWithHeader = data.pairs.find((p: any) => p.info?.header);
      if (pairWithHeader?.info?.header) {
        return pairWithHeader.info.header;
      }
    }
  } catch {}
  return null;
}

// In-memory cache for network detection to eliminate duplicate RPC roundtrips
const networkDetectionCache = new Map<
  string,
  { network: 'mainnet' | 'testnet'; client: PublicClient; hasCode: boolean; timestamp: number }
>();

/**
 * Detects whether a contract address exists on Mainnet or Testnet
 */
export async function detectTokenNetwork(tokenAddress: string): Promise<{
  network: 'mainnet' | 'testnet';
  client: PublicClient;
  hasCode: boolean;
}> {
  if (!tokenAddress || !isAddress(tokenAddress, { strict: false })) {
    return {
      network: isTestnet ? 'testnet' : 'mainnet',
      client: publicClient as PublicClient,
      hasCode: false,
    };
  }

  const addr = getAddress(tokenAddress);
  const lower = addr.toLowerCase();
  const cached = networkDetectionCache.get(lower);
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    return { network: cached.network, client: cached.client, hasCode: cached.hasCode };
  }

  // Check Mainnet and Testnet concurrently in parallel
  const [mainnetCodeRes, testnetCodeRes] = await Promise.allSettled([
    mainnetClient.getBytecode({ address: addr }),
    testnetClient.getBytecode({ address: addr }),
  ]);

  let result: { network: 'mainnet' | 'testnet'; client: PublicClient; hasCode: boolean };

  if (mainnetCodeRes.status === 'fulfilled' && mainnetCodeRes.value && mainnetCodeRes.value.length > 2) {
    result = { network: 'mainnet', client: mainnetClient as PublicClient, hasCode: true };
  } else if (testnetCodeRes.status === 'fulfilled' && testnetCodeRes.value && testnetCodeRes.value.length > 2) {
    result = { network: 'testnet', client: testnetClient as PublicClient, hasCode: true };
  } else {
    result = {
      network: isTestnet ? 'testnet' : 'mainnet',
      client: publicClient as PublicClient,
      hasCode: false,
    };
  }

  networkDetectionCache.set(lower, { ...result, timestamp: Date.now() });
  return result;
}

export async function checkGravenBalance(walletAddress: string): Promise<{
  balance: number;
  rawBalance: string;
  hasEnough: boolean;
  required: number;
}> {
  if (!walletAddress || !isAddress(walletAddress, { strict: false })) {
    return { balance: 0, rawBalance: '0', hasEnough: false, required: minGravenHold };
  }

  try {
    const formattedTokenAddr = getAddress(gravenTokenAddress);
    const formattedWalletAddr = getAddress(walletAddress);

    // Check Testnet and Mainnet concurrently in parallel to avoid sequential timeouts
    let raw: bigint = 0n;
    const [testnetBalRes, mainnetBalRes] = await Promise.allSettled([
      testnetClient.readContract({
        address: formattedTokenAddr,
        abi: COMPREHENSIVE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [formattedWalletAddr],
      }),
      mainnetClient.readContract({
        address: formattedTokenAddr,
        abi: COMPREHENSIVE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [formattedWalletAddr],
      }),
    ]);

    if (testnetBalRes.status === 'fulfilled' && typeof testnetBalRes.value === 'bigint') {
      if (testnetBalRes.value > raw) raw = testnetBalRes.value;
    }
    if (mainnetBalRes.status === 'fulfilled' && typeof mainnetBalRes.value === 'bigint') {
      if (mainnetBalRes.value > raw) raw = mainnetBalRes.value;
    }

    const formatted = parseFloat(formatUnits(raw, 18));
    return {
      balance: formatted,
      rawBalance: raw.toString(),
      hasEnough: formatted >= minGravenHold,
      required: minGravenHold,
    };
  } catch (err) {
    console.warn('Could not read $GRAVEN balance from contract:', err);
    return { balance: 0, rawBalance: '0', hasEnough: false, required: minGravenHold };
  }
}

/**
 * Searches for token creator / owner across on-chain contract functions in parallel
 */
export async function getTokenOwnerOnChain(
  tokenAddress: string,
  clientOverride?: PublicClient
): Promise<string | null> {
  if (!tokenAddress || !isAddress(tokenAddress, { strict: false })) return null;
  const addr = getAddress(tokenAddress);

  const client = clientOverride || (await detectTokenNetwork(addr)).client;

  try {
    const [depRes, creRes, ownRes, getOwnRes, admRes] = await Promise.allSettled([
      client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'deployer' }),
      client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'creator' }),
      client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'owner' }),
      client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'getOwner' }),
      client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'admin' }),
    ]);

    const candidates = [depRes, creRes, ownRes, getOwnRes, admRes];
    for (const res of candidates) {
      if (
        res.status === 'fulfilled' &&
        typeof res.value === 'string' &&
        res.value !== '0x0000000000000000000000000000000000000000' &&
        isAddress(res.value, { strict: false })
      ) {
        return res.value.toLowerCase();
      }
    }
  } catch {}

  return null;
}

/**
 * Universal token metadata reader: checks Mainnet and Testnet,
 * extracts name, symbol, decimals, totalSupply, logo, description, and creator in a single parallel pass.
 */
export async function readTokenMetadata(tokenAddress: string) {
  if (!tokenAddress || !isAddress(tokenAddress, { strict: false })) {
    throw new Error('Invalid token address');
  }

  const addr = getAddress(tokenAddress);
  const { network, client } = await detectTokenNetwork(addr);

  // Read standard fields + launchpad visual metadata all concurrently
  const [
    nameRes,
    symRes,
    decRes,
    supplyRes,
    depRes,
    ownerRes,
    creatorRes,
    getOwnerRes,
    adminRes,
    logoRes,
    logoUriRes,
    imageRes,
    descRes,
  ] = await Promise.allSettled([
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'name' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'symbol' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'decimals' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'totalSupply' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'deployer' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'owner' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'creator' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'getOwner' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'admin' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'logo' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'logoURI' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'image' }),
    client.readContract({ address: addr, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'description' }),
  ]);

  const name =
    nameRes.status === 'fulfilled' && typeof nameRes.value === 'string' && nameRes.value.trim()
      ? nameRes.value.trim()
      : 'Unknown Token';

  const symbol =
    symRes.status === 'fulfilled' && typeof symRes.value === 'string' && symRes.value.trim()
      ? symRes.value.trim()
      : 'DEAD';

  const decimals = decRes.status === 'fulfilled' ? Number(decRes.value) : 18;
  const totalSupply = supplyRes.status === 'fulfilled' && supplyRes.value ? supplyRes.value.toString() : '0';

  const deployer =
    depRes.status === 'fulfilled' &&
    typeof depRes.value === 'string' &&
    depRes.value !== '0x0000000000000000000000000000000000000000' &&
    isAddress(depRes.value, { strict: false })
      ? depRes.value.toLowerCase()
      : null;

  const creatorCandidate =
    creatorRes.status === 'fulfilled' &&
    typeof creatorRes.value === 'string' &&
    creatorRes.value !== '0x0000000000000000000000000000000000000000' &&
    isAddress(creatorRes.value, { strict: false })
      ? creatorRes.value.toLowerCase()
      : null;

  const ownerCandidate =
    ownerRes.status === 'fulfilled' &&
    typeof ownerRes.value === 'string' &&
    ownerRes.value !== '0x0000000000000000000000000000000000000000' &&
    isAddress(ownerRes.value, { strict: false })
      ? ownerRes.value.toLowerCase()
      : null;

  const getOwnerCandidate =
    getOwnerRes.status === 'fulfilled' &&
    typeof getOwnerRes.value === 'string' &&
    getOwnerRes.value !== '0x0000000000000000000000000000000000000000' &&
    isAddress(getOwnerRes.value, { strict: false })
      ? getOwnerRes.value.toLowerCase()
      : null;

  const adminCandidate =
    adminRes.status === 'fulfilled' &&
    typeof adminRes.value === 'string' &&
    adminRes.value !== '0x0000000000000000000000000000000000000000' &&
    isAddress(adminRes.value, { strict: false })
      ? adminRes.value.toLowerCase()
      : null;

  const resolvedCreator =
    deployer || creatorCandidate || ownerCandidate || getOwnerCandidate || adminCandidate || '0x0000000000000000000000000000000000000000';

  let rawLogo: string | null = null;
  if (logoRes.status === 'fulfilled' && typeof logoRes.value === 'string') rawLogo = logoRes.value;
  else if (logoUriRes.status === 'fulfilled' && typeof logoUriRes.value === 'string') rawLogo = logoUriRes.value;
  else if (imageRes.status === 'fulfilled' && typeof imageRes.value === 'string') rawLogo = imageRes.value;

  // Concurrently query DexScreener to get real token logo
  const dexImage = await fetchDexScreenerTokenImage(tokenAddress);
  const resolvedLogoUrl = formatTokenImageUrl(dexImage || rawLogo);

  const description =
    descRes.status === 'fulfilled' && typeof descRes.value === 'string' ? descRes.value : null;

  return {
    address: tokenAddress.toLowerCase(),
    name,
    symbol,
    decimals,
    totalSupply,
    network,
    creator: resolvedCreator,
    deployer,
    owner: ownerCandidate,
    logoUrl: resolvedLogoUrl,
    description,
    hasDeployer: Boolean(deployer),
  };
}

export async function verifySignature(message: string, signature: string, expectedAddress: string): Promise<boolean> {
  try {
    return await viemVerifyMessage({
      address: expectedAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Checks an account's ERC-20 token balance on the detected network (Mainnet or Testnet)
 */
export async function checkTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<{ balance: bigint; hasBalance: boolean; network: 'mainnet' | 'testnet' }> {
  if (
    !tokenAddress ||
    !walletAddress ||
    !isAddress(tokenAddress, { strict: false }) ||
    !isAddress(walletAddress, { strict: false })
  ) {
    return { balance: 0n, hasBalance: false, network: isTestnet ? 'testnet' : 'mainnet' };
  }

  try {
    const formattedToken = getAddress(tokenAddress);
    const formattedWallet = getAddress(walletAddress);
    const { network, client } = await detectTokenNetwork(formattedToken);

    const raw = await client.readContract({
      address: formattedToken,
      abi: COMPREHENSIVE_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [formattedWallet],
    });

    return {
      balance: raw,
      hasBalance: raw > 0n,
      network,
    };
  } catch (err) {
    console.warn(`[ON-CHAIN HOLDER CHECK] Failed to read balanceOf for ${walletAddress} on ${tokenAddress}:`, err);
    return { balance: 0n, hasBalance: false, network: isTestnet ? 'testnet' : 'mainnet' };
  }
}

/**
 * Verifies if an address is an eligible token holder on-chain across Mainnet or Testnet
 * 1. Checks live balanceOf > 0
 * 2. Checks historical Transfer event logs if current balance is 0
 */
export async function checkIsTokenHolderOnChain(
  tokenAddress: string,
  walletAddress: string
): Promise<{ isHolder: boolean; currentBalance: bigint; source: 'balance' | 'transfer_history' | 'none'; network: 'mainnet' | 'testnet' }> {
  if (
    !tokenAddress ||
    !walletAddress ||
    !isAddress(tokenAddress, { strict: false }) ||
    !isAddress(walletAddress, { strict: false })
  ) {
    return { isHolder: false, currentBalance: 0n, source: 'none', network: isTestnet ? 'testnet' : 'mainnet' };
  }

  try {
    const formattedToken = getAddress(tokenAddress);
    const formattedWallet = getAddress(walletAddress);
    const { network, client } = await detectTokenNetwork(formattedToken);

    // 1. Direct live balance check
    const { balance, hasBalance } = await checkTokenBalance(tokenAddress, walletAddress);
    if (hasBalance) {
      return { isHolder: true, currentBalance: balance, source: 'balance', network };
    }

    // 2. Transfer history check: did this wallet ever receive this token?
    try {
      const currentBlock = await client.getBlockNumber();
      const fromBlock = currentBlock > 500000n ? currentBlock - 500000n : 0n;

      const logs = await client.getLogs({
        address: formattedToken,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value', indexed: false },
          ],
        },
        args: {
          to: formattedWallet,
        },
        fromBlock,
        toBlock: 'latest',
      });

      if (logs && logs.length > 0) {
        return { isHolder: true, currentBalance: 0n, source: 'transfer_history', network };
      }
    } catch (logErr) {
      console.warn(`[ON-CHAIN HOLDER CHECK] Transfer log query skipped/failed:`, logErr);
    }

    return { isHolder: false, currentBalance: 0n, source: 'none', network };
  } catch (err) {
    console.warn(`[ON-CHAIN HOLDER CHECK] Verification error for ${walletAddress}:`, err);
    return { isHolder: false, currentBalance: 0n, source: 'none', network: isTestnet ? 'testnet' : 'mainnet' };
  }
}

