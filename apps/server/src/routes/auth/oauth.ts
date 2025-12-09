import '@fastify/jwt';
import { prisma } from '../../lib/prisma';
import { FastifyInstance } from 'fastify';
import { AuthManager } from '../../services/auth/auth.manager';
import { getAuthUrlSchema, loginSchema, linkSchema } from './oauth.schema';
import { OAuthFactory } from '../../services/auth/oauth.factory';
interface OAuthLoginBody {
  provider: string;
  code: string;
}

interface OAuthLinkBody {
  provider: string;
  code: string;
}

interface AuthorizeQuery {
  scope?: string;
  mode?: 'login' | 'connect';
}

export async function oauthRoutes(fastify: FastifyInstance) {
  const authManager = new AuthManager();

  fastify.get<{ Params: { provider: string }, Querystring: AuthorizeQuery }>('/oauth/authorize/:provider', {
    schema: getAuthUrlSchema
  }, async (request, reply) => {
    const { provider: providerName } = request.params;
    const { scope: requestedScope, mode } = request.query;

    try {
      const providerStrategy = OAuthFactory.getProvider(providerName);

      const clientIdKey = `${providerName.toUpperCase()}_CLIENT_ID`;
      const redirectUriKey = `${providerName.toUpperCase()}_REDIRECT_URI`;
      const clientId = process.env[clientIdKey];
      const redirectUri = process.env[redirectUriKey];

      if (!clientId || !redirectUri) {
        return reply.status(400).send({
          error: `${providerName} OAuth not configured. Missing ${clientIdKey} or ${redirectUriKey}`
        });
      }

      let finalScopeList: string[] = providerStrategy.defaultScopes;
      if (requestedScope) {
        finalScopeList.push(...requestedScope.split(' '));
      }

      const authHeader = request.headers.authorization;
      if (authHeader) {
        try {
          const decoded = fastify.jwt.verify<{ userId: string }>(authHeader.replace('Bearer ', ''));

          const account = await prisma.account.findFirst({
            where: { user_id: decoded.userId, provider: providerName }
          });
          if (account && account.scope) {
            finalScopeList.push(...account.scope.split(' '));
          }
        } catch (error) {
          // Handle token verification error if needed
        }
      }

      const uniqueScopes = Array.from(new Set(finalScopeList)).join(' ');
      console.log('Unique Scopes:', uniqueScopes);

      const statePayload: any = {
        mode: mode || 'login',
        provider: providerName,
      };

      if (mode === 'connect' && authHeader) {
        try {
          const token = authHeader.replace('Bearer ', '');
          statePayload.token = token;
        } catch (error) {
          console.warn('Failed to include token in state:', error);
        }
      }

      const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: uniqueScopes,
        state: state,
        ...providerStrategy.getAuthUrlParameters()
      });

      const authUrl = `${providerStrategy.authorizationUrl}?${params.toString()}`;

      return reply.send({
        url: authUrl,
        provider: providerName,
        instructions: `1. Visit the URL above in your browser\n2. Authorize the application\n3. Copy the "code" parameter from the redirect URL\n4. Use that code in the /auth/oauth/login endpoint`
      });
    }

    catch (error: any) {
      request.log.error(error);
      if (error.message.includes('not supported')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Failed to generate OAuth authorization URL' });
    }
  });

  fastify.post<{ Body: OAuthLoginBody }>('/oauth/login', {
    schema: loginSchema
  }, async (request, reply) => {
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
}