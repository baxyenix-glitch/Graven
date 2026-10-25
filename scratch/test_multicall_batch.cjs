const { createPublicClient, http, parseAbi, defineChain } = require('viem');

const chain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://rpc.mainnet.chain.robinhood.com'] } },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
});

const client = createPublicClient({
  chain,
  transport: http('https://rpc.mainnet.chain.robinhood.com', { batch: true }),
  batch: { multicall: true },
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

async function testMulticallBatch() {
  const token = '0x39dBED3a2bd333467115dE45665cC57F813C4571';
  const t0 = Date.now();

  const results = await Promise.allSettled([
    client.readContract({ address: token, abi: ABI, functionName: 'name' }),
    client.readContract({ address: token, abi: ABI, functionName: 'symbol' }),
    client.readContract({ address: token, abi: ABI, functionName: 'decimals' }),
    client.readContract({ address: token, abi: ABI, functionName: 'totalSupply' }),
    client.readContract({ address: token, abi: ABI, functionName: 'deployer' }),
    client.readContract({ address: token, abi: ABI, functionName: 'owner' }),
    client.readContract({ address: token, abi: ABI, functionName: 'creator' }),
    client.readContract({ address: token, abi: ABI, functionName: 'logo' }),
    client.readContract({ address: token, abi: ABI, functionName: 'description' }),
  ]);

  console.log('Batch multicall completed in:', Date.now() - t0, 'ms');
  console.log(
    results.map((r, i) => [
      ['name', 'symbol', 'decimals', 'totalSupply', 'deployer', 'owner', 'creator', 'logo', 'desc'][i],
      r.status === 'fulfilled' ? r.value : 'reverted',
    ])
  );
}

testMulticallBatch();
