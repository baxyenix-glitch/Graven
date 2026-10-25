const { createPublicClient, http } = require('viem');

const mainnet = createPublicClient({
  transport: http('https://rpc.mainnet.chain.robinhood.com', { timeout: 4000 }),
});

const testnet = createPublicClient({
  transport: http('https://rpc.testnet.chain.robinhood.com', { timeout: 4000 }),
});

async function testParallel() {
  const token = '0x39dBED3a2bd333467115dE45665cC57F813C4571';
  const t0 = Date.now();
  const [mainnetCode, testnetCode] = await Promise.all([
    mainnet.getBytecode({ address: token }).catch(() => null),
    testnet.getBytecode({ address: token }).catch(() => null),
  ]);
  console.log('Parallel getBytecode took:', Date.now() - t0, 'ms');
  console.log('Mainnet code:', Boolean(mainnetCode && mainnetCode.length > 2));
  console.log('Testnet code:', Boolean(testnetCode && testnetCode.length > 2));
}

testParallel();
