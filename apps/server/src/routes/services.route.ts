import { FastifyInstance } from 'fastify';
import { serviceManager } from '../services/service.manager';

export async function serviceRoutes(fastify: FastifyInstance) {

  fastify.get('/', {
    schema: {
      tags: ['services'],
      description: 'Get list of all available services, actions, and reactions with their parameters definitions.',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              actions: { type: 'array', items: { /* ... structure ActionDto ... */ } },
              reactions: { type: 'array', items: { /* ... structure ReactionDto ... */ } }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return serviceManager.getAllServices();
  });
}
