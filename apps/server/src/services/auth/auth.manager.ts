import { prisma } from '../../lib/prisma';
import { OAuthFactory } from './oauth.factory';
import { IEncryptionService } from '../../interfaces/encryption.interface';
import { NodeCryptoAdapter } from '../../adapters/node-crypto.adapter';

export class AuthManager {
  constructor(private encryptionService: IEncryptionService = new NodeCryptoAdapter()) {}

  async loginWithOAuth(providerName: string, code: string) {
    const provider = OAuthFactory.getProvider(providerName);

    const tokens = await provider.getTokens(code);

    const oauthUser = await provider.getUserInfo(tokens.access_token);

    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: providerName,
        provider_account_id: oauthUser.id
      }
    });

    let userId = existingAccount?.user_id;

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          access_token: this.encryptionService.encrypt(tokens.access_token),
          refresh_token: tokens.refresh_token
            ? this.encryptionService.encrypt(tokens.refresh_token)
            : existingAccount.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000),
        }
      });
    } else {
      let user = await prisma.user.findUnique({
        where: { email: oauthUser.email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: oauthUser.email,
            username: oauthUser.name,
            password: '',
          }
        });
      }

      await prisma.account.create({
        data: {
          user_id: user.id,
          provider: providerName,
          provider_account_id: oauthUser.id,
          access_token: this.encryptionService.encrypt(tokens.access_token),
          refresh_token: tokens.refresh_token
            ? this.encryptionService.encrypt(tokens.refresh_token)
            : null,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000),
        }
      });

      userId = user.id;
    }

    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  async linkOAuthAccount(userId: string, providerName: string, code: string) {
    const provider = OAuthFactory.getProvider(providerName);

    const tokens = await provider.getTokens(code);
    const oauthUser = await provider.getUserInfo(tokens.access_token);

    // Check if this OAuth account is already linked to another user
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: providerName,
        provider_account_id: oauthUser.id
      }
    });

    if (existingAccount && existingAccount.user_id !== userId) {
      throw new Error('This account is already linked to another user');
    }

    // Check if user already has this provider linked
    const userExistingAccount = await prisma.account.findFirst({
      where: {
        user_id: userId,
        provider: providerName
      }
    });

    if (userExistingAccount) {
      // Update existing account
      return prisma.account.update({
        where: { id: userExistingAccount.id },
        data: {
          provider_account_id: oauthUser.id,
          access_token: this.encryptionService.encrypt(tokens.access_token),
          refresh_token: tokens.refresh_token
            ? this.encryptionService.encrypt(tokens.refresh_token)
            : null,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000),
        }
      });
    }

    // Create new account link
    return prisma.account.create({
      data: {
        user_id: userId,
        provider: providerName,
        provider_account_id: oauthUser.id,
        access_token: this.encryptionService.encrypt(tokens.access_token),
        refresh_token: tokens.refresh_token
          ? this.encryptionService.encrypt(tokens.refresh_token)
          : null,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      }
    });
  }

  async unlinkOAuthAccount(userId: string, providerName: string) {
    const account = await prisma.account.findFirst({
      where: {
        user_id: userId,
        provider: providerName
      }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Check if user has at least one other account or a password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // User must have at least one other account or a password to unlink
    if (user.accounts.length <= 1 && !user.password) {
      throw new Error('Cannot unlink last authentication method');
    }

    await prisma.account.delete({
      where: { id: account.id }
    });

    return { success: true, message: 'Account unlinked successfully' };
  }

  async getLinkedAccounts(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        provider: true,
        provider_account_id: true,
        expires_at: true,
      }
    });

    return accounts;
  }
}