import { UserWithAccounts } from '../types/user.types';
import { IEncryptionService } from '../interfaces/encryption.interface';
import { NodeCryptoAdapter } from '../adapters/node-crypto.adapter';

export const getAccessToken = (
  user: UserWithAccounts,
  provider: string,
  encryptionService: IEncryptionService = new NodeCryptoAdapter()
): string => {
  const account = user.accounts.find((a) => a.provider === provider);

  if (!account || !account.access_token) {
    throw new Error(`No connected account found for provider: ${provider}`);
  }

  return encryptionService.decrypt(account.access_token);
};
