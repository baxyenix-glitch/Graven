const { mainnetClient, testnetClient, COMPREHENSIVE_TOKEN_ABI } = require('../src/lib/chain/client');

async function profile() {
  const tokenAddress = '0x39dBED3a2bd333467115dE45665cC57F813C4571';
  console.log('Starting profile for:', tokenAddress);
  
  let t0 = Date.now();
  const code = await mainnetClient.getBytecode({ address: tokenAddress });
  console.log('1. mainnet getBytecode:', Date.now() - t0, 'ms');

  t0 = Date.now();
  const deployer = await mainnetClient.readContract({
    address: tokenAddress,
    abi: COMPREHENSIVE_TOKEN_ABI,
    functionName: 'deployer',
  });
  console.log('2. mainnet deployer():', Date.now() - t0, 'ms', deployer);

  t0 = Date.now();
  try {
    const res = await fetch(`https://api.pons.family/token/${tokenAddress}`, {
      signal: AbortSignal.timeout(3000),
    });
    console.log('3. pons API fetch:', Date.now() - t0, 'ms', res.status);
  } catch (e) {
    console.log('3. pons API fetch failed:', Date.now() - t0, 'ms', e.message);
  }

  t0 = Date.now();
  const [name, symbol, decimals, totalSupply, logo, desc] = await Promise.all([
    mainnetClient.readContract({ address: tokenAddress, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'name' }),
    mainnetClient.readContract({ address: tokenAddress, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'symbol' }),
    mainnetClient.readContract({ address: tokenAddress, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'decimals' }),
    mainnetClient.readContract({ address: tokenAddress, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'totalSupply' }),
    mainnetClient.readContract({ address: tokenAddress, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'logo' }).catch(() => null),
    mainnetClient.readContract({ address: tokenAddress, abi: COMPREHENSIVE_TOKEN_ABI, functionName: 'description' }).catch(() => null),
  ]);
  console.log('4. Promise.all metadata:', Date.now() - t0, 'ms', { name, symbol, decimals });
}

profile().catch(console.error);
