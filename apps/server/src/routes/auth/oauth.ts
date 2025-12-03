import '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { AuthManager } from '../../services/auth/auth.manager';
import { getAuthUrlSchema, loginSchema, linkSchema, getAccountsSchema, unlinkAccountSchema } from './oauth.schema';

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

  fastify.get<{ Params: { provider: string } }>('/oauth/authorize/:provider', { schema: getAuthUrlSchema }, async (request, reply) => {
    const { provider } = request.params;

    const providerConfigs: Record<string, { url: string; scopes: string }> = {
      google: {
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
        scopes: 'openid email profile'
      },
      github: {
        url: 'https://github.com/login/oauth/authorize',
        scopes: 'user:email'
      },
      spotify: {
        url: 'https://accounts.spotify.com/authorize',
        scopes: 'user-read-email user-read-private'
      },
      twitch: {
        url: 'https://id.twitch.tv/oauth2/authorize',
        scopes: 'user:read:email'
      },
      notion: {
        url: 'https://api.notion.com/v1/oauth/authorize',
        scopes: ''
      },
      linkedin: {
        url: 'https://www.linkedin.com/oauth/v2/authorization',
        scopes: 'openid profile email'
      }
    };

    const config = providerConfigs[provider.toLowerCase()];
    if (!config) {
      return reply.status(400).send({
        error: `Provider "${provider}" not supported. Supported providers: ${Object.keys(providerConfigs).join(', ')}`
      });
    }

    const clientIdKey = `${provider.toUpperCase()}_CLIENT_ID`;
    const redirectUriKey = `${provider.toUpperCase()}_REDIRECT_URI`;
    const clientId = process.env[clientIdKey];
    const redirectUri = process.env[redirectUriKey];

    if (!clientId || !redirectUri) {
      return reply.status(400).send({
        error: `${provider} OAuth not configured. Missing ${clientIdKey} or ${redirectUriKey}`
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      ...(config.scopes && { scope: config.scopes })
    });

    const authUrl = `${config.url}?${params.toString()}`;

    return reply.send({
      url: authUrl,
      provider,
      instructions: `1. Visit the URL above in your browser\n2. Authorize the application\n3. Copy the "code" parameter from the redirect URL\n4. Use that code in the /auth/oauth/login endpoint`
    });
  });

  fastify.post<{ Body: OAuthLoginBody }>('/oauth/login', { schema: loginSchema }, async (request, reply) => {
    const { provider, code } = request.body;

    try {
      const result = await authManager.loginWithOAuth(provider, code);

      const token = fastify.jwt.sign({
        id: result.user.id,
        email: result.user.email,
        username: result.user.username
      });

      return reply.send({
        message: result.isNewUser ? 'Account created successfully' : 'Authentication successful',
        token,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email
        },
        isNewUser: result.isNewUser,
        isNewAccount: result.isNewAccount,
        hasPassword: result.hasPassword
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