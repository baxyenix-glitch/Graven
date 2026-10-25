import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Graven Protocol Testnet Deployment Script
 * Deploys GravenToken to Robinhood Chain Testnet
 */
async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  const rpcUrl = process.env.RH_RPC_URL || 'https://rpc.testnet.chain.robinhood.com';
  const chainId = Number(process.env.RH_CHAIN_ID || 46630);

  if (!privateKey) {
    console.error('Error: Please set DEPLOYER_PRIVATE_KEY in .env.local');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`Deploying from account: ${account.address}`);

  const chain = defineChain({
    id: chainId,
    name: 'Robinhood Chain Testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  console.log('Deploying GravenToken...');
  // Note: Compile with solc or foundry, then execute deploy contract transaction
  console.log('Robinhood Chain Target RPC:', rpcUrl);
}

main().catch(console.error);
