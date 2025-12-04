import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { AreaDto } from '@area/shared';
import { areaEngine } from '../core/area.engine';
import { serviceManager } from '../services/service.manager';

import {
  createAreaSchema,
  listAreasSchema,
  deleteAreaSchema,
  updateAreaSchema
} from './areas.schema';

const mapToDto = (area: any): AreaDto => ({
  id: area.id,
  name: area.name,
  is_active: area.is_active,
  user_id: area.user_id,
  last_executed_at: area.last_executed_at?.toISOString() ?? null,
  error_log: area.error_log,
  action: {
    name: area.action?.name ?? "UNKNOWN",
    parameters: area.action?.parameters as Record<string, any> ?? {}
  },
  reactions: area.reactions.map((r: any) => ({
    name: r.name,
    parameters: r.parameters as Record<string, any>
  }))
});

interface CreateAreaBody {
  name: string;
  action: { name: string; parameters: Record<string, any> };
  reactions: { name: string; parameters: Record<string, any> }[];
}

interface UpdateAreaBody {
  is_active?: boolean;
  name?: string;
  action?: { parameters: Record<string, any> };
  reactions?: { id: string; parameters: Record<string, any> }[];
}

export async function areaRoutes(fastify: FastifyInstance) {
  fastify.get<{ Reply: AreaDto[] }>('/', {
    schema: listAreasSchema,
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const userId = request.user.id;

    const areas = await prisma.area.findMany({
      where: { user_id: userId },
      include: { action: true, reactions: true },
      orderBy: { name: 'asc' }
    });

    return areas.map(mapToDto);
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

      const areaDto = mapToDto(newArea);
      return reply.status(201).send({
        message: 'AREA created and initialized',
        area: areaDto
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

  fastify.put<{ Params: { id: string }, Body: UpdateAreaBody }>('/:id', {
    schema: updateAreaSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params;
    const { is_active, name, action, reactions } = request.body;
    const userId = request.user.id;

    const existingArea = await prisma.area.findFirst({
      where: { id, user_id: userId },
      include: { action: true }
    });

    if (!existingArea) return reply.status(404).send({ error: 'AREA not found' });

    await prisma.area.update({
      where: { id },
      data: {
        is_active: is_active ?? undefined,
        name: name ?? undefined
      }
    });

    if (action && existingArea.action) {
      await prisma.action.update({
        where: { id: existingArea.action.id },
        data: {
          parameters: action.parameters,
          state: {}
        }
      });

      // Re-init AREA after action update
      areaEngine.processArea({ ...existingArea, is_active: is_active ?? existingArea.is_active }).catch(err => {
        request.log.error(`Failed to re-initialize area ${existingArea.id}: ${err.message}`);
      });
    }

    if (reactions && reactions.length > 0) {
      for (const reactionUpdate of reactions) {
        await prisma.reaction.updateMany({
          where: { id: reactionUpdate.id, area_id: id },
          data: { parameters: reactionUpdate.parameters }
        });
      }
    }

    return { success: true };
  });
}
