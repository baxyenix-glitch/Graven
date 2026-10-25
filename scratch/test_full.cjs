const { createPublicClient, http, parseAbi, defineChain } = require('viem');

const robinhoodMainnet = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://rpc.mainnet.chain.robinhood.com'] } },
});

const robinhoodTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://rpc.testnet.chain.robinhood.com'] } },
});

const mainnetClient = createPublicClient({
  chain: robinhoodMainnet,
  transport: http('https://rpc.mainnet.chain.robinhood.com', { timeout: 8000, batch: true }),
});

const testnetClient = createPublicClient({
  chain: robinhoodTestnet,
  transport: http('https://rpc.testnet.chain.robinhood.com', { timeout: 8000, batch: true }),
});

const ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function deployer() view returns (address)',
  'function owner() view returns (address)',
  'function creator() view returns (address)',
  'function logo() view returns (string)',
  'function description() view returns (string)',
]);

async function detect(addr) {
  const [mRes, tRes] = await Promise.allSettled([
    mainnetClient.getBytecode({ address: addr }),
    testnetClient.getBytecode({ address: addr }),
  ]);
  if (mRes.status === 'fulfilled' && mRes.value && mRes.value.length > 2) {
    return { network: 'mainnet', client: mainnetClient };
  }
  if (tRes.status === 'fulfilled' && tRes.value && tRes.value.length > 2) {
    return { network: 'testnet', client: testnetClient };
  }
  return { network: 'mainnet', client: mainnetClient };
}

async function testFull() {
  const token = '0x39dBED3a2bd333467115dE45665cC57F813C4571';
  const t0 = Date.now();
  console.log('Testing full new resolution for:', token);

  const { network, client } = await detect(token);
  console.log(`Network detected in ${Date.now() - t0}ms:`, network);

  const [nameRes, symRes, decRes, supplyRes, depRes, ownRes, logoRes, descRes] = await Promise.allSettled([
    client.readContract({ address: token, abi: ABI, functionName: 'name' }),
    client.readContract({ address: token, abi: ABI, functionName: 'symbol' }),
    client.readContract({ address: token, abi: ABI, functionName: 'decimals' }),
    client.readContract({ address: token, abi: ABI, functionName: 'totalSupply' }),
    client.readContract({ address: token, abi: ABI, functionName: 'deployer' }),
    client.readContract({ address: token, abi: ABI, functionName: 'owner' }),
    client.readContract({ address: token, abi: ABI, functionName: 'logo' }),
    client.readContract({ address: token, abi: ABI, functionName: 'description' }),
  ]);

  const name = nameRes.status === 'fulfilled' ? nameRes.value : 'Unknown Token';
  const symbol = symRes.status === 'fulfilled' ? symRes.value : 'DEAD';
  const decimals = decRes.status === 'fulfilled' ? decRes.value : 18;
  const deployer = depRes.status === 'fulfilled' ? depRes.value : null;
  const owner = ownRes.status === 'fulfilled' ? ownRes.value : null;
  const logo = logoRes.status === 'fulfilled' ? logoRes.value : null;
  const desc = descRes.status === 'fulfilled' ? descRes.value : null;

  const creator = (deployer || owner || '0x0000000000000000000000000000000000000000').toLowerCase();
  const launchpad = deployer ? 'pons' : 'other';

  console.log(`Entire resolution completed in ${Date.now() - t0}ms:`, {
    name,
    symbol,
    decimals,
    creator,
    launchpad,
    network,
    logo,
    desc,
  });
}

testFull();
