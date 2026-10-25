async function runTests() {
  console.log('--- STARTING BURIAL RULES VERIFICATION ---');

  // An unburied ERC-20 contract address on Robinhood Chain
  const tokenAddress = '0x000000000000000000000000000000000000dead';
  const unauthorizedWallet = '0x1111111111111111111111111111111111111111';

  // TEST 1: Token Lookup with Unauthorized Wallet
  console.log('\n[TEST 1] Checking /api/tokens/lookup with unauthorized wallet:');
  const lookupRes = await fetch(`http://localhost:3000/api/tokens/lookup?address=${tokenAddress}&wallet=${unauthorizedWallet}`);
  const lookupData = await lookupRes.json();
  console.log('HTTP Status:', lookupRes.status);
  console.log('isCreatorMatch:', lookupData.isCreatorMatch);
  console.log('isDirectCreatorMatch:', lookupData.isDirectCreatorMatch);
  console.log('gravenHoldStatus:', lookupData.gravenHoldStatus);
  console.log('testnetOverrideActive:', lookupData.testnetOverrideActive);

  if (lookupData.isCreatorMatch === false && lookupData.testnetOverrideActive === false) {
    console.log('>>> TEST 1 PASSED: Unauthorized wallet correctly flagged as isCreatorMatch: false');
  } else {
    console.error('>>> TEST 1 FAILED');
  }

  // TEST 2: Request Burial Nonce with Unauthorized Wallet
  console.log('\n[TEST 2] Requesting burial nonce with unauthorized wallet:');
  const nonceRes = await fetch('http://localhost:3000/api/bury/nonce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: unauthorizedWallet,
      tokenAddress: tokenAddress,
    }),
  });
  const nonceData = await nonceRes.json();
  console.log('HTTP Status:', nonceRes.status);
  console.log('Response body:', nonceData);

  if (nonceRes.status === 403) {
    console.log('>>> TEST 2 PASSED: Request rejected with HTTP 403 Forbidden:', nonceData.error);
  } else {
    console.error('>>> TEST 2 FAILED: Expected 403, got', nonceRes.status);
  }

  // TEST 3: Verify Burial with Unauthorized Wallet
  console.log('\n[TEST 3] Calling /api/bury/verify directly with unauthorized wallet:');
  const verifyRes = await fetch('http://localhost:3000/api/bury/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: unauthorizedWallet,
      tokenAddress: tokenAddress,
      epitaph: 'R.I.P. test',
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      message: 'test message',
      nonce: 'invalid_nonce_123',
    }),
  });
  const verifyData = await verifyRes.json();
  console.log('HTTP Status:', verifyRes.status);
  console.log('Response body:', verifyData);

  if (verifyRes.status === 400 || verifyRes.status === 403) {
    console.log('>>> TEST 3 PASSED: Direct burial attempt blocked with HTTP', verifyRes.status, ':', verifyData.error);
  } else {
    console.error('>>> TEST 3 FAILED: Expected 400 or 403, got', verifyRes.status);
  }

  // TEST 4: Wallet with GRAVEN but trying to bury a token they didn't create
  console.log('\n[TEST 4] Wallet holding GRAVEN but NOT the creator requesting burial nonce:');
  const gravenHolderWallet = '0x6e34f343438f90ff82619b470ccddf5bcc016f6e';
  const otherToken = '0x000000000000000000000000000000000000dead';
  const nonceRes4 = await fetch('http://localhost:3000/api/bury/nonce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: gravenHolderWallet,
      tokenAddress: otherToken,
    }),
  });
  const nonceData4 = await nonceRes4.json();
  console.log('HTTP Status:', nonceRes4.status);
  console.log('Response body:', nonceData4);

  if (nonceRes4.status === 403 && nonceData4.error?.includes('Creator mismatch')) {
    console.log('>>> TEST 4 PASSED: Creator mismatch enforced even for $GRAVEN holders!:', nonceData4.error);
  } else {
    console.log('HTTP result:', nonceRes4.status, nonceData4);
  }

  console.log('\n--- BURIAL RULES VERIFICATION COMPLETE ---');
}

runTests().catch(console.error);
