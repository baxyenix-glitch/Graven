import { PonsAdapter } from './pons';
import { GenericAdapter } from './generic';
import { TokenLaunchDetails } from './types';
import { readTokenMetadata } from '../chain/client';

const ponsAdapter = new PonsAdapter();
const genericAdapter = new GenericAdapter();

export async function resolveToken(tokenAddress: string): Promise<TokenLaunchDetails> {
  const meta = await readTokenMetadata(tokenAddress);
  const isPons = Boolean(meta.hasDeployer || meta.description?.toLowerCase().includes('pons'));

  if (isPons) {
    return ponsAdapter.getDetails(tokenAddress, meta);
  }
  return genericAdapter.getDetails(tokenAddress, meta);
}

export { ponsAdapter, genericAdapter };
