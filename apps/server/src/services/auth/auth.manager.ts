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
    let isNewUser = false;
    let isNewAccount = false;

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
      isNewAccount = true;
      let user = await prisma.user.findUnique({
        where: { email: oauthUser.email }
      });

      if (!user) {
        isNewUser = true;
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

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    return {
      user,
      isNewUser,
      isNewAccount,
      hasPassword: !!user.password && user.password.length > 0
    };
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
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // If updating password
    if (updates.password) {
      // If user has existing password, verify current password
      if (user.password && user.password.length > 0) {
        if (!updates.currentPassword) {
          throw new Error('Current password required to set new password');
        }

        const bcrypt = require('bcrypt');
        const isValid = await bcrypt.compare(updates.currentPassword, user.password);
        if (!isValid) {
          throw new Error('Current password is incorrect');
        }
      }

      // Hash new password
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      updates.password = hashedPassword;
    }

    // Build update data
    const updateData: any = {};
    if (updates.email) updateData.email = updates.email;
    if (updates.username) updateData.username = updates.username;
    if (updates.password) updateData.password = updates.password;

    // Remove currentPassword from updates as it's not a user field
    delete updateData.currentPassword;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
      }
    });

    return {
      ...updatedUser,
      hasPassword: !!updateData.password || (!!user.password && user.password.length > 0)
    };
  }
}