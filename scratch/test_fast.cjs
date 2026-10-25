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
  transport: http('https://rpc.mainnet.chain.robinhood.com', { timeout: 6000 }),
});

async function testFastLookup() {
  const token = '0x39dBED3a2bd333467115dE45665cC57F813C4571';
  const t0 = Date.now();

  // Run all on-chain queries concurrently
  const [name, symbol, decimals, totalSupply, deployer, owner, creator, logo, description] = await Promise.all([
    mainnet.readContract({ address: token, abi: ABI, functionName: 'name' }).catch(() => 'Unknown Token'),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'symbol' }).catch(() => 'DEAD'),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'decimals' }).catch(() => 18),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'totalSupply' }).catch(() => 0n),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'deployer' }).catch(() => null),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'owner' }).catch(() => null),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'creator' }).catch(() => null),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'logo' }).catch(() => null),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'description' }).catch(() => null),
  ]);

  console.log('Total parallel time:', Date.now() - t0, 'ms');
  console.log({
    name,
    symbol,
    decimals,
    deployer,
    owner,
    creator,
    logo,
    description,
  });
}

testFastLookup();
