import { PrivyClient } from '@privy-io/server-auth';
import { isAddress } from 'viem';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const appSecret = process.env.PRIVY_APP_SECRET || '';

let privyClient: PrivyClient | null = null;
if (appId && appSecret) {
  try {
    privyClient = new PrivyClient(appId, appSecret);
  } catch (err) {
    console.error('Failed to initialize PrivyClient:', err);
  }
}

export interface VerifiedAuth {
  wallet: string;
  userId: string;
  isAdmin: boolean;
}

export async function verifyAuthHeader(authHeader: string | null | undefined): Promise<VerifiedAuth | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const adminWallets = (process.env.ADMIN_WALLETS || '')
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

  // Support direct wallet address (e.g. from MetaMask / injected provider / mobile wallet / testnet)
  if (isAddress(token, { strict: false })) {
    const lower = token.toLowerCase();
    return {
      wallet: lower,
      userId: `wallet_${lower}`,
      isAdmin: adminWallets.includes(lower),
    };
  }

  if (!privyClient) {
    console.warn('[AUTH] PrivyClient not initialized (missing app ID or secret)');
    return null;
  }

  try {
    const verifiedClaims = await privyClient.verifyAuthToken(token);
    const user = await privyClient.getUser(verifiedClaims.userId);

    // Find linked wallet
    let walletAddress: string | null = null;
    if (user.wallet?.address) {
      walletAddress = user.wallet.address;
    } else if (user.linkedAccounts) {
      const walletAccount = user.linkedAccounts.find(
        (acc) => acc.type === 'wallet' && 'address' in acc
      ) as { address: string } | undefined;
      if (walletAccount) {
        walletAddress = walletAccount.address;
      }
    }

    if (!walletAddress || !isAddress(walletAddress)) {
      return null;
    }

    const lowerWallet = walletAddress.toLowerCase();
    const isAdmin = adminWallets.includes(lowerWallet);

    return {
      wallet: lowerWallet,
      userId: verifiedClaims.userId,
      isAdmin,
    };
  } catch (err) {
    console.warn('[AUTH] Failed to verify Privy authToken:', err);
    return null;
  }
}
