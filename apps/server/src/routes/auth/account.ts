import '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { AuthManager } from '../../services/auth/auth.manager';
import { getAccountSchema, updateAccountSchema, getLinkedAccountSchema, unlinkAccountSchema } from './account.schema';

interface UpdateAccountBody {
  email?: string;
  username?: string;
  password?: string;
  currentPassword?: string;
}

export async function accountRoutes(fastify: FastifyInstance) {
  const authManager = new AuthManager();

  fastify.get('/account', {
    schema: getAccountSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id;

    if (!userId) {
        request.log.error('JWT Payload is missing ID');
        return reply.status(401).send({ error: 'Invalid Token' });
    }

    try {
      const accountDetails = await authManager.getAccountDetails(userId);

      return reply.send(accountDetails);

    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to retrieve account details' });
    }
  });

  fastify.put<{ Body: UpdateAccountBody }>('/account', {
    schema: updateAccountSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id;

    if (!userId) {
        request.log.error('JWT Payload is missing ID');
        return reply.status(401).send({ error: 'Invalid Token' });
    }

    const updates = request.body;

    try {
      const updatedUser = await authManager.updateAccount(userId, updates);

      return reply.send({
        message: 'Account updated successfully',
        user: updatedUser
      });

    } catch (error: any) {
      request.log.error(error);

      if (error.message.includes('Current password required')) {
        return reply.status(400).send({ error: error.message });
      }

      if (error.message.includes('Current password is incorrect')) {
        return reply.status(400).send({ error: error.message });
      }

      if (error.message.includes('Unique constraint')) {
        return reply.status(409).send({ error: 'Email already in use' });
      }

      return reply.status(500).send({ error: 'Failed to update account' });
    }
  });

  fastify.post<{ Body: { password: string; currentPassword?: string } }>('/account/password', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id;

    if (!userId) {
        request.log.error('JWT Payload is missing ID');
        return reply.status(401).send({ error: 'Invalid Token' });
    }

    const { password, currentPassword } = request.body;

    try {
      const updatedUser = await authManager.updateAccount(userId, { password, currentPassword });

      return reply.send({
        message: 'Password updated successfully',
        user: updatedUser
      });

    } catch (error: any) {
      request.log.error(error);

      if (error.message.includes('Current password required')) {
        return reply.status(400).send({ error: error.message });
      }

      if (error.message.includes('Current password is incorrect')) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Failed to update password' });
    }
  });

  fastify.get<{ Params: { provider: string } }>('/account/providers/:provider', {
    schema: getLinkedAccountSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id;
    const { provider } = request.params;

    try {
      const account = await authManager.getLinkedAccount(userId, provider);

      if (!account) {
        return reply.status(404).send({ error: `No linked account found for ${provider}` });
      }

      return reply.send({ account });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.delete<{ Params: { provider: string } }>('/account/providers/:provider', {
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
