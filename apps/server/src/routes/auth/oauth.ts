import '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { AuthManager } from '../../services/auth/auth.manager';
import { loginSchema, linkSchema, getAccountsSchema, unlinkAccountSchema } from './oauth.schema';

interface OAuthLoginBody {
  provider: string;
  code: string;
}

interface OAuthLinkBody {
  provider: string;
  code: string;
}

export async function oauthRoutes(fastify: FastifyInstance) {
  const authManager = new AuthManager();

  fastify.post<{ Body: OAuthLoginBody }>('/oauth/login', { schema: loginSchema }, async (request, reply) => {
    const { provider, code } = request.body;

    try {
      const user = await authManager.loginWithOAuth(provider, code);

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
      });

      return reply.send({
        message: 'Authentication successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });

    } catch (error: any) {
      request.log.error(error);
      if (error.message.includes('not supported')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'OAuth authentication failed' });
    }
  });

  fastify.post<{ Body: OAuthLinkBody }>('/oauth/link', {
    schema: linkSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { provider, code } = request.body;
    const userId = request.user.id;

    try {
      const account = await authManager.linkOAuthAccount(userId, provider, code);

      return reply.send({
        message: 'Account linked successfully',
        account: {
          id: account.id,
          provider: account.provider,
          provider_account_id: account.provider_account_id
        }
      });

    } catch (error: any) {
      request.log.error(error);
      if (error.message.includes('not supported')) {
        return reply.status(400).send({ error: error.message });
      }
      if (error.message.includes('already linked to another user')) {
        return reply.status(409).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Failed to link OAuth account' });
    }
  });

  fastify.get('/oauth/accounts', {
    schema: getAccountsSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id;

    try {
      const accounts = await authManager.getLinkedAccounts(userId);

      return reply.send({
        accounts: accounts.map((acc: any) => ({
          id: acc.id,
          provider: acc.provider,
          provider_account_id: acc.provider_account_id,
          expires_at: acc.expires_at
        }))
      });

    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to retrieve linked accounts' });
    }
  });

  fastify.delete<{ Params: { provider: string } }>('/oauth/accounts/:provider', {
    schema: unlinkAccountSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { provider } = request.params;
    const userId = request.user.id;

    try {
      const result = await authManager.unlinkOAuthAccount(userId, provider);

      return reply.send(result);

    } catch (error: any) {
      request.log.error(error);
      if (error.message.includes('not found')) {
        return reply.status(404).send({ error: error.message });
      }
      if (error.message.includes('Cannot unlink last authentication method')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Failed to unlink account' });
    }
  });
}