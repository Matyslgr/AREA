import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Using fastify-plugin (fp) allows the decorator to be accessible globally
export default fp(async (server: FastifyInstance) => {
  // 1. Register JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
  });

  // 2. Add Authenticate Decorator
  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
});
