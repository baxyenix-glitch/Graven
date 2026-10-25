import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { db } from '@/lib/db';
import { resolveToken } from '@/lib/launchpads';
import { checkGravenBalance } from '@/lib/chain/client';

export const dynamic = 'force-dynamic';

// Global safeguard: BigInt cannot be serialized by standard JSON.stringify
if (typeof BigInt !== 'undefined') {
  try {
    if (!(BigInt.prototype as any).toJSON) {
      (BigInt.prototype as any).toJSON = function () {
        return this.toString();
      };
    }
  } catch {}
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address')?.trim();
    const userWallet = searchParams.get('wallet')?.trim();

    if (!address || !isAddress(address, { strict: false })) {
      return NextResponse.json({ error: 'Valid token address required' }, { status: 400 });
    }

    const lowerAddress = address.toLowerCase();

    // Fast-path: If caller provided zero address, they only need gravenHoldStatus for userWallet
    if (lowerAddress === '0x0000000000000000000000000000000000000000') {
      let gravenHoldStatus = null;
      if (userWallet && isAddress(userWallet, { strict: false })) {
        gravenHoldStatus = await checkGravenBalance(userWallet);
      }
      return NextResponse.json({
        alreadyBuried: false,
        token: null,
        gravenHoldStatus,
        isCreatorMatch: false,
        isDirectCreatorMatch: false,
        testnetOverrideActive: false,
      });
    }

    // Check if already buried
    const existingGrave = db.getGraveByAddress(lowerAddress);
    if (existingGrave) {
      return NextResponse.json({
        alreadyBuried: true,
        grave: existingGrave,
      });
    }

    // Resolve token through launchpad adapters and check user $GRAVEN in parallel
    const [details, gravenHoldStatus] = await Promise.all([
      resolveToken(lowerAddress),
      userWallet && isAddress(userWallet, { strict: false })
        ? checkGravenBalance(userWallet)
        : Promise.resolve(null),
    ]);

    const adminWallets = (process.env.ADMIN_WALLETS || '')
      .toLowerCase()
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);
    const isAdmin = userWallet ? adminWallets.includes(userWallet.toLowerCase()) : false;

    const isDirectCreatorMatch = Boolean(
      userWallet &&
        isAddress(userWallet, { strict: false }) &&
        details.creator.toLowerCase() === userWallet.toLowerCase()
    );

    // Only genuine on-chain creators or system admins can bury tokens (no dev bypass)
    const canProceed = isDirectCreatorMatch || isAdmin;

    return NextResponse.json({
      alreadyBuried: false,
      token: details,
      gravenHoldStatus,
      isCreatorMatch: canProceed,
      isDirectCreatorMatch,
      testnetOverrideActive: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Token lookup failed' }, { status: 500 });
  }
}
