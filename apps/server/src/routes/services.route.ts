import { FastifyInstance } from 'fastify';
import { serviceManager } from '../services/service.manager';
import { ServiceDto } from '@area/shared';
import { listServicesSchema } from './services.schema';

export async function serviceRoutes(fastify: FastifyInstance) {

  fastify.get<{ Reply: ServiceDto[] }>('/', {
    schema: listServicesSchema
  }, async (request, reply) => {

    const services = serviceManager.getAllServices();

    const response: ServiceDto[] = services.map(s => ({
      id: s.id,
      name: s.name,
      version: s.version || '1.0.0',
      description: s.description,

      actions: s.actions.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: a.parameters,
        scopes: a.scopes || []
      })),

      reactions: s.reactions.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        parameters: r.parameters,
        scopes: r.scopes || []
      }))
    }));

    return response;
  });
}
