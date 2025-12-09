import { prisma } from '../../lib/prisma';
import { OAuthFactory } from './oauth.factory';
import { IEncryptionService } from '../../interfaces/encryption.interface';
import { NodeCryptoAdapter } from '../../adapters/node-crypto.adapter';
import { IPasswordHasher } from '../../interfaces/hasher.interface';
import { Argon2Adapter } from '../../adapters/argon2.adapter';
import { IOAuthProvider, OAuthTokens, OAuthUser } from '../../interfaces/auth.interface';

export class AuthManager {
  constructor(
    private encryptionService: IEncryptionService = new NodeCryptoAdapter(),
    private passwordHasher: IPasswordHasher = new Argon2Adapter()
  ) {}

  /**
   * Helper to upsert an OAuth account for a user
   */
  private async upsertAccount(userId: string, provider: string, oauthUser: any, tokens: any) {
    const data = {
      provider_account_id: oauthUser.id,
      access_token: this.encryptionService.encrypt(tokens.access_token),
      refresh_token: tokens.refresh_token ? this.encryptionService.encrypt(tokens.refresh_token) : undefined,
      expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
      scope: tokens.scope
    };

    const existing = await prisma.account.findFirst({
        where: { user_id: userId, provider }
    });

    if (existing) {
        return prisma.account.update({ where: { id: existing.id }, data });
    } else {
        return prisma.account.create({ data: { ...data, user_id: userId, provider } });
    }
  }

  async loginWithOAuth(providerName: string, code: string) {
    const provider: IOAuthProvider = OAuthFactory.getProvider(providerName);
    const tokens: OAuthTokens = await provider.getTokens(code);
    const oauthUser: OAuthUser = await provider.getUserInfo(tokens.access_token);


    let userId: string;
    let isNewUser = false;
    let isNewAccount = false;

    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: providerName,
        provider_account_id: oauthUser.id
      }
    });

    if (existingAccount) {
      userId = existingAccount.user_id;
      await this.upsertAccount(userId, providerName, oauthUser, tokens);
    } else {
      isNewAccount = true;
      let user = await prisma.user.findUnique({
        where: { email: oauthUser.email }
      });

      if (!user) {
        isNewUser = true;
        user = await prisma.user.create({
          data: {
            email: oauthUser.email,
            username: oauthUser.name || oauthUser.email.split('@')[0],
            password: '',
          }
        });
      }

      userId = user.id;
      await this.upsertAccount(userId, providerName, oauthUser, tokens);
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    return {
      user,
      isNewUser,
      isNewAccount,
      hasPassword: !!user.password && user.password.length > 0
    };
  }

  async linkOAuthAccount(userId: string, providerName: string, code: string) {
    const provider: IOAuthProvider = OAuthFactory.getProvider(providerName);
    const tokens: OAuthTokens = await provider.getTokens(code);
    const oauthUser: OAuthUser = await provider.getUserInfo(tokens.access_token);

    const conflictAccount = await prisma.account.findFirst({
      where: { provider: providerName, provider_account_id: oauthUser.id }
    });

    if (conflictAccount && conflictAccount.user_id !== userId) {
      throw new Error('This account is already linked to another user');
    }

    return this.upsertAccount(userId, providerName, oauthUser, tokens);
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

  async getAccountDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            id: true,
            provider: true,
            provider_account_id: true,
            expires_at: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      hasPassword: !!user.password && user.password.length > 0,
      linkedAccounts: user.accounts
    };
  }

  async updateAccount(userId: string, updates: { email?: string; username?: string; password?: string; currentPassword?: string }) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId }
    });

    // If updating password
    if (updates.password) {
      // If user has existing password, verify current password
      if (user.password && user.password.length > 0) {
        if (!updates.currentPassword) {
          throw new Error('Current password required to set new password');
        }

        const isValid = await this.passwordHasher.verify(user.password, updates.currentPassword);
        if (!isValid) throw new Error('Current password is incorrect');
      }

      updates.password = await this.passwordHasher.hash(updates.password);
    } else {
      // If not updating password, remove it from updates to avoid overwriting
      delete updates.password;
    }

    const { currentPassword, ...dataToUpdate } = updates;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        username: true,
      }
    });

    return {
      ...updatedUser,
      hasPassword: !!updates.password || (!!user.password && user.password.length > 0)
    };
  }
}
