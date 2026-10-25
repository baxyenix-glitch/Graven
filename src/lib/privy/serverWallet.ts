import { parseEther, toHex } from 'viem';
import { robinhoodChainId } from '../chain/config';

export interface SendEthResult {
  txHash: string;
  simulated?: boolean;
}

/**
 * Sends native ETH on Robinhood Chain using Privy Server Wallet
 * Calls Privy Server Wallet REST API: POST https://api.privy.io/v1/wallets/{wallet_id}/rpc
 */
export async function sendNativeEthViaServerWallet(
  toAddress: string,
  amountEth: number
): Promise<SendEthResult> {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  const appSecret = process.env.PRIVY_APP_SECRET?.trim();
  const walletId = process.env.PRIVY_SERVER_WALLET_ID?.trim();

  // If server wallet credentials are not fully provided, return simulated tx in testnet dev mode
  if (!appId || !appSecret || !walletId) {
    console.warn('[PRIVY SERVER WALLET] Missing credentials. Returning simulated testnet tx.');
    const fakeHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
    return { txHash: fakeHash, simulated: true };
  }

  const basicAuth = Buffer.from(`${appId}:${appSecret}`).toString('base64');
  const weiValue = parseEther(amountEth.toFixed(18));
  const hexValue = toHex(weiValue);
  const chainId = robinhoodChainId;

  try {
    const res = await fetch(`https://api.privy.io/v1/wallets/${walletId}/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
        'privy-app-id': appId,
      },
      body: JSON.stringify({
        method: 'eth_sendTransaction',
        caip2: `eip155:${chainId}`,
        params: {
          transaction: {
            to: toAddress,
            value: hexValue,
          },
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[PRIVY SERVER WALLET ERROR]', res.status, errText);
      throw new Error(`Privy Server Wallet error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const txHash = data.data?.hash || data.result;

    if (!txHash) {
      throw new Error('Privy Server Wallet did not return a transaction hash');
    }

    return { txHash, simulated: false };
  } catch (err: any) {
    console.error('[PRIVY SERVER WALLET EXCEPTION]', err);
    throw err;
  }
}
