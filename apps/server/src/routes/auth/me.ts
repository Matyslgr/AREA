import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { meSchema } from './me.schema';

export async function meRoute(fastify: FastifyInstance) {
  fastify.get(
    '/me',
    {
      schema: meSchema,
      onRequest: [fastify.authenticate]
    },
    async (request, reply) => {
      try {
        const { id } = request.user as { id: string };

        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true
          }
        });

        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }

        return reply.send(user);

      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}