const { createPublicClient, http } = require('viem');

const client = createPublicClient({
  transport: http('https://rpc.mainnet.chain.robinhood.com'),
});

async function testMulticall() {
  // Multicall3 address standard: 0xcA11bde05977b3631167028862bE2a173976CA11
  const code = await client.getBytecode({ address: '0xcA11bde05977b3631167028862bE2a173976CA11' });
  console.log('Multicall3 code length on Robinhood Mainnet:', code ? code.length : 0);
}

testMulticall().catch(console.error);
