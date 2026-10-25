const { createPublicClient, http, parseAbi } = require('viem');

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

const mainnet = createPublicClient({
  transport: http('https://rpc.mainnet.chain.robinhood.com', { timeout: 8000 }),
});

async function singlePassTest() {
  const token = '0x39dBED3a2bd333467115dE45665cC57F813C4571';
  const t0 = Date.now();

  const [nameRes, symRes, decRes, supplyRes, depRes, ownRes, logoRes, descRes] = await Promise.allSettled([
    mainnet.readContract({ address: token, abi: ABI, functionName: 'name' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'symbol' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'decimals' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'totalSupply' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'deployer' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'owner' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'logo' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'description' }),
  ]);

  const name = nameRes.status === 'fulfilled' ? nameRes.value : 'Unknown Token';
  const symbol = symRes.status === 'fulfilled' ? symRes.value : 'DEAD';
  const decimals = decRes.status === 'fulfilled' ? decRes.value : 18;
  const deployer = depRes.status === 'fulfilled' ? depRes.value : null;
  const owner = ownRes.status === 'fulfilled' ? ownRes.value : null;
  const logo = logoRes.status === 'fulfilled' ? logoRes.value : null;
  const desc = descRes.status === 'fulfilled' ? descRes.value : null;

  const creator = deployer || owner || '0x0000000000000000000000000000000000000000';
  const launchpad = deployer ? 'pons' : 'other';

  console.log(`Resolved in ${Date.now() - t0}ms:`, {
    name,
    symbol,
    decimals,
    creator,
    launchpad,
    logo,
    desc,
  });
}

singlePassTest();
