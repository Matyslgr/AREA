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
    throw new Error(`No account found for provider: ${provider}`);
  }
  if (!account.access_token) {
    throw new Error(`Account for provider '${provider}' exists but has no access token`);
  }

  return encryptionService.decrypt(account.access_token);
};
