const { createPublicClient, http, parseAbi } = require('viem');

const ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function deployer() view returns (address)',
  'function logo() view returns (string)',
  'function description() view returns (string)',
]);

async function testRPC(name, url) {
  const client = createPublicClient({
    transport: http(url, { timeout: 8000, batch: true }),
    batch: { multicall: true },
  });
  const token = '0x39dBED3a2bd333467115dE45665cC57F813C4571';
  const t0 = Date.now();
  try {
    const [tName, sym, dec, dep, log] = await Promise.all([
      client.readContract({ address: token, abi: ABI, functionName: 'name' }),
      client.readContract({ address: token, abi: ABI, functionName: 'symbol' }),
      client.readContract({ address: token, abi: ABI, functionName: 'decimals' }),
      client.readContract({ address: token, abi: ABI, functionName: 'deployer' }).catch(() => null),
      client.readContract({ address: token, abi: ABI, functionName: 'logo' }).catch(() => null),
    ]);
    console.log(`[${name}] SUCCESS in ${Date.now() - t0}ms:`, { tName, sym, dec, dep, log });
  } catch (e) {
    console.log(`[${name}] FAILED in ${Date.now() - t0}ms:`, e.message);
  }
}

async function run() {
  await testRPC('robinhood-rpc.publicnode.com', 'https://robinhood-rpc.publicnode.com');
  await testRPC('rpc.mainnet.chain.robinhood.com', 'https://rpc.mainnet.chain.robinhood.com');
}

run();
