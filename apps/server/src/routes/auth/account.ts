import '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { AuthManager } from '../../services/auth/auth.manager';
import { getAccountSchema, updateAccountSchema } from './account.schema';

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
    const userId = (request.user as any).userId;

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
    const userId = (request.user as any).userId;
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
    const userId = (request.user as any).userId;
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
}
