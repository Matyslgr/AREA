import { prisma } from '../../lib/prisma';
import { OAuthFactory } from './oauth.factory';
import { IEncryptionService } from '../../interfaces/encryption.interface';
import { NodeCryptoAdapter } from '../../adapters/node-crypto.adapter';
import { IPasswordHasher } from '../../interfaces/hasher.interface';
import { Argon2Adapter } from '../../adapters/argon2.adapter';
import { IOAuthProvider, OAuthTokens, OAuthUser } from '../../interfaces/auth.interface';
import { AccountDetailsDto } from '@area/shared';

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

    console.log(`🔍 OAuth Login Debug - Provider: ${providerName}`);
    console.log(`📧 OAuth Email: ${oauthUser.email}`);
    console.log(`🆔 OAuth User ID: ${oauthUser.id}`);

    let userId: string;
    let isNewUser = false;
    let isNewAccount = false;

    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: providerName,
        provider_account_id: oauthUser.id
      }
    });

    console.log(`🔗 Existing ${providerName} account:`, existingAccount ? 'FOUND' : 'NOT FOUND');

    if (existingAccount) {
      userId = existingAccount.user_id;
      console.log(`✅ Using existing account, user_id: ${userId}`);
      await this.upsertAccount(userId, providerName, oauthUser, tokens);
    } else {
      isNewAccount = true;
      console.log(`🆕 New ${providerName} account, checking if user exists by email...`);

      let user = await prisma.user.findUnique({
        where: { email: oauthUser.email }
      });

      console.log(`👤 User with email ${oauthUser.email}:`, user ? 'FOUND' : 'NOT FOUND');

      if (!user) {
        isNewUser = true;
        console.log(`🎉 Creating NEW user with email: ${oauthUser.email}`);
        user = await prisma.user.create({
          data: {
            email: oauthUser.email,
            username: oauthUser.name || oauthUser.email.split('@')[0],
            password: '',
          }
        });
      } else {
        console.log(`🔄 Linking ${providerName} to EXISTING user: ${user.id}`);
      }

      userId = user.id;
      await this.upsertAccount(userId, providerName, oauthUser, tokens);
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    console.log(`📤 Returning: isNewUser=${isNewUser}, isNewAccount=${isNewAccount}, hasPassword=${!!user.password && user.password.length > 0}`);

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
        expires_at: true
      }
    });

    return accounts;
  }

  async getLinkedAccount(userId: string, provider: string) {
    const account = await prisma.account.findFirst({
      where: { user_id: userId, provider: provider }
    });

    if (!account) return null;

    return {
      id: account.id,
      provider: account.provider,
      provider_account_id: account.provider_account_id,
      expires_at: account.expires_at,
      scopes: account.scope ? account.scope.split(' ') : []
    };
  }

  async getAccountDetails(userId: string): Promise<AccountDetailsDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            id: true,
            provider: true,
            provider_account_id: true,
            expires_at: true,
            scope: true
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
      linkedAccounts: user.accounts.map(acc => ({
        id: acc.id,
        provider: acc.provider,
        provider_account_id: acc.provider_account_id,
        expires_at: acc.expires_at,
        scopes: acc.scope ? acc.scope.split(' ') : []
      }))
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
