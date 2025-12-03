import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { areaEngine } from '../core/area.engine';
import { serviceManager } from '../services/service.manager';

import {
  createAreaSchema,
  listAreasSchema,
  deleteAreaSchema,
  updateAreaSchema
} from './areas.schema';

interface CreateAreaBody {
  name: string;
  action: { name: string; parameters: Record<string, any> };
  reactions: { name: string; parameters: Record<string, any> }[];
}

export async function areaRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    schema: listAreasSchema,
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const userId = request.user.id;

    const areas = await prisma.area.findMany({
      where: { user_id: userId },
      include: { action: true, reactions: true },
      orderBy: { name: 'asc' }
    });

    return areas;
  });

  fastify.post<{ Body: CreateAreaBody }>('/', {
    schema: createAreaSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { name, action, reactions } = request.body;
    const userId = request.user.id;

    // A. Validation Action & Reactions
    const actionExists = serviceManager.getAllServices().some(s => s.actions.some(a => a.id === action.name));
    if (!actionExists) return reply.status(400).send({ error: `Action ${action.name} not found` });

    try {
      const newArea = await prisma.area.create({
        data: {
          name,
          user_id: userId,
          is_active: true,
          action: {
            create: {
              name: action.name,
              parameters: action.parameters,
              state: {}
            }
          },
          reactions: {
            create: reactions.map(r => ({
              name: r.name,
              parameters: r.parameters
            }))
          }
        },
        include: {
          action: true,
          reactions: true,
          user: { include: { accounts: true } }
        }
      });

      areaEngine.processArea(newArea).catch(err => {
        request.log.error(`Failed to initialize area ${newArea.id}: ${err.message}`);
      });

      return reply.status(201).send({
        message: 'AREA created and initialized',
        area: newArea
      });

    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to create AREA' });
    }
  });

  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: deleteAreaSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    const area = await prisma.area.findFirst({
      where: { id, user_id: userId }
    });

    if (!area) {
      return reply.status(404).send({ error: 'AREA not found' });
    }

    await prisma.area.delete({ where: { id } });

    return { success: true };
  });

  fastify.put<{ Params: { id: string }, Body: { is_active: boolean } }>('/:id', {
    schema: updateAreaSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params;
    const { is_active } = request.body;
    const userId = request.user.id;

    const count = await prisma.area.count({ where: { id, user_id: userId } });
    if (count === 0) return reply.status(404).send({ error: 'AREA not found' });

    await prisma.area.update({
      where: { id },
      data: { is_active }
    });

    return { success: true };
  });
}
