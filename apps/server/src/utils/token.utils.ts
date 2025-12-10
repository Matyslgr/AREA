import { UserWithAccounts } from '../types/user.types';
import { IEncryptionService } from '../interfaces/encryption.interface';
import { NodeCryptoAdapter } from '../adapters/node-crypto.adapter';

export const getAccessToken = (
  user: UserWithAccounts,
  provider: string,
  encryptionService: IEncryptionService = new NodeCryptoAdapter()
): string => {
  const account = user.accounts.find((a) => a.provider === provider);

  if (!account) {
    throw new Error(`Service connection missing: User ${user.email} has no ${provider} account linked.`);
  }

  if (!account.access_token) {
    throw new Error(`Corrupted account: ${provider} account exists but has no access token.`);
  }

  try {
    return encryptionService.decrypt(account.access_token);
  } catch (error) {
    throw new Error(`Token decryption failed for ${provider}. The encryption key might have changed.`);
  }
};