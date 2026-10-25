import fs from 'fs';
import path from 'path';

function inspectRewards() {
  const dataDir = path.resolve('data');
  const graves = JSON.parse(fs.readFileSync(path.join(dataDir, 'graves.json'), 'utf8'));
  const config = JSON.parse(fs.readFileSync(path.join(dataDir, 'config.json'), 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(path.join(dataDir, 'ledger.json'), 'utf8'));

  const axoGrave = graves.find(g => g.symbol === 'AXO');
  console.log('--- 1. AXO Grave Record ---');
  console.log('Address:', axoGrave?.tokenAddress);
  console.log('Dev Wallet (Wallet A):', axoGrave?.devWallet);
  console.log('Total Views:', axoGrave?.viewsCount);
  console.log('Qualified Views:', axoGrave?.qualifiedViewsCount);
  console.log('Total ETH Earned by Grave:', axoGrave?.totalEthEarned);

  console.log('\n--- 2. AXO Holder Snapshot ---');
  const snapPath = path.join(dataDir, 'holder_snapshots', `${axoGrave?.tokenAddress}.json`);
  if (fs.existsSync(snapPath)) {
    const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
    console.log('Snapshot Taken At:', snap.snapshotTakenAt);
    console.log('Eligible Holders List:');
    snap.eligibleHolders.forEach((h, idx) => {
      console.log(`  [#${idx + 1}] Wallet: ${h.wallet} (Matches Dev: ${h.wallet.toLowerCase() === axoGrave?.devWallet.toLowerCase()})`);
    });
    console.log('Excluded Holders List:', snap.excludedHolders);
  } else {
    console.log('No snapshot file found at', snapPath);
  }

  console.log('\n--- 3. Ledger Balances for Dev Wallet ---');
  const devWallet = axoGrave?.devWallet.toLowerCase();
  const devAccruals = ledger.filter(l => l.recipient.toLowerCase() === devWallet && l.type === 'ACCRUAL');
  const devClaims = ledger.filter(l => l.recipient.toLowerCase() === devWallet && l.type === 'CLAIM_PAID');
  const devEarned = devAccruals.reduce((sum, l) => sum + l.amountEth, 0);
  const devClaimed = devClaims.reduce((sum, l) => sum + l.amountEth, 0);
  console.log(`Dev Wallet Accrued: ${devEarned} ETH, Claimed: ${devClaimed} ETH, Claimable: ${devEarned - devClaimed} ETH`);

  console.log('\n--- 4. Protocol Config Rules ---');
  console.log(`Reward Per Qualified View: ${config.rewardEthPerQualifiedView} ETH`);
  console.log(`  - Dev Cut (60%): ${config.rewardEthPerQualifiedView * config.rewardDevPct / 100} ETH`);
  console.log(`  - Holder Cut (30%): ${config.rewardEthPerQualifiedView * config.rewardHoldersPct / 100} ETH`);
  console.log(`  - Platform Cut (10%): ${config.rewardEthPerQualifiedView * config.rewardPlatformPct / 100} ETH`);
  console.log(`Min Claim Threshold: ${config.minClaimThresholdEth} ETH`);
}

inspectRewards();
