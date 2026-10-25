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
  transport: http('https://rpc.mainnet.chain.robinhood.com', { timeout: 10000 }),
});

const testnet = createPublicClient({
  transport: http('https://rpc.testnet.chain.robinhood.com', { timeout: 10000 }),
});

async function profile() {
  const token = '0x39dBED3a2bd333467115dE45665cC57F813C4571';
  console.log('--- Profiling ---');

  let t0 = Date.now();
  const code = await mainnet.getBytecode({ address: token });
  console.log('1. getBytecode mainnet:', Date.now() - t0, 'ms', code ? code.length : 0);

  t0 = Date.now();
  try {
    const deployer = await mainnet.readContract({ address: token, abi: ABI, functionName: 'deployer' });
    console.log('2. deployer() mainnet:', Date.now() - t0, 'ms', deployer);
  } catch (e) {
    console.log('2. deployer failed:', e.message);
  }

  t0 = Date.now();
  try {
    const res = await fetch(`https://api.pons.family/token/${token}`, { signal: AbortSignal.timeout(3000) });
    console.log('3. pons api:', Date.now() - t0, 'ms', res.status);
  } catch (e) {
    console.log('3. pons api failed:', Date.now() - t0, 'ms', e.message);
  }

  t0 = Date.now();
  try {
    const res = await fetch(`https://robinhoodchain.blockscout.com/api?module=contract&action=getcontractcreation&contractaddresses=${token}`, { signal: AbortSignal.timeout(3500) });
    console.log('4. blockscout explorer:', Date.now() - t0, 'ms', res.status);
  } catch (e) {
    console.log('4. blockscout explorer failed:', Date.now() - t0, 'ms', e.message);
  }

  t0 = Date.now();
  const [name, symbol, decimals, totalSupply, logo, desc] = await Promise.all([
    mainnet.readContract({ address: token, abi: ABI, functionName: 'name' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'symbol' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'decimals' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'totalSupply' }),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'logo' }).catch(() => null),
    mainnet.readContract({ address: token, abi: ABI, functionName: 'description' }).catch(() => null),
  ]);
  console.log('5. Promise.all metadata:', Date.now() - t0, 'ms', { name, symbol, decimals, logo, desc });
}

profile();
