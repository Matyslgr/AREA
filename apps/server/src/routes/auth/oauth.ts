import '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { AuthManager } from '../../services/auth/auth.manager';

interface OAuthLoginBody {
  provider: string;
  code: string;
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['provider', 'code'],
    properties: {
      provider: { type: 'string' },
      code: { type: 'string' }
    }
  }
};

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
}