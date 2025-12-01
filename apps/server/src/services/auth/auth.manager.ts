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
}