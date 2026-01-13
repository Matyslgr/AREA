import { UserWithAccounts } from '../types/user.types';
import { IEncryptionService } from '../interfaces/encryption.interface';
import { NodeCryptoAdapter } from '../adapters/node-crypto.adapter';
import { prisma } from '../lib/prisma';
import { GoogleProvider } from '../services/auth/providers/google.provider';

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

export const getNotionAccessToken = (
  user: UserWithAccounts,
  encryptionService: IEncryptionService = new NodeCryptoAdapter()
): string => {
  const compositeToken = getAccessToken(user, 'notion', encryptionService);

  try {
    const decoded = JSON.parse(Buffer.from(compositeToken, 'base64').toString('utf-8'));
    return decoded.real_token;
  } catch (error) {
    throw new Error('Failed to extract Notion token from composite token');
  }
};

export const getAccessTokenWithRefresh = async (
  user: UserWithAccounts,
  provider: string,
  encryptionService: IEncryptionService = new NodeCryptoAdapter()
): Promise<string> => {
  const account = user.accounts.find((a) => a.provider === provider);

  if (!account) {
    throw new Error(`Service connection missing: User ${user.email} has no ${provider} account linked.`);
  }

  if (!account.access_token) {
    throw new Error(`Corrupted account: ${provider} account exists but has no access token.`);
  }

  const now = new Date();
  const isExpired = account.expires_at && account.expires_at < now;

  if (isExpired && account.refresh_token) {
    console.log(`Token expired for ${provider}, refreshing...`);

    try {
      let newTokens;

      if (provider === 'google') {
        const googleProvider = new GoogleProvider();
        const decryptedRefreshToken = encryptionService.decrypt(account.refresh_token);
        newTokens = await googleProvider.refreshAccessToken(decryptedRefreshToken);
      } else {
        throw new Error(`Token refresh not implemented for ${provider}`);
      }

      const expiresAt = new Date(now.getTime() + newTokens.expires_in * 1000);

      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: encryptionService.encrypt(newTokens.access_token),
          refresh_token: newTokens.refresh_token
            ? encryptionService.encrypt(newTokens.refresh_token)
            : account.refresh_token,
          expires_at: expiresAt,
        },
      });

      console.log(`Token refreshed successfully for ${provider}`);
      return newTokens.access_token;

    } catch (error) {
      console.error(`Failed to refresh token for ${provider}:`, error);
      throw new Error(`Token refresh failed for ${provider}. User needs to re-authenticate.`);
    }
  }

  try {
    return encryptionService.decrypt(account.access_token);
  } catch (error) {
    throw new Error(`Token decryption failed for ${provider}. The encryption key might have changed.`);
  }
};