import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { AreaDto, CreateAreaDto, UpdateAreaDto } from '@area/shared';
import { areaEngine } from '../core/area.engine';
import { serviceManager } from '../services/service.manager';

import {
  createAreaSchema,
  listAreasSchema,
  getAreaSchema,
  deleteAreaSchema,
  updateAreaSchema
} from './areas.schema';

// --- Helpers ---
const resolveAccountId = (userAccounts: any[], elementId: string, type: 'action' | 'reaction'): string | undefined => {
  const services = serviceManager.getAllServices();

  const service = services.find(s => {
    if (type === 'action') return s.actions.some(a => a.id === elementId);
    return s.reactions.some(r => r.id === elementId);
  });

  if (!service) return undefined;

  // Find the account linked to the service
  const account = userAccounts.find(acc => acc.provider === service.id);

  return account?.id; // May be undefined if no account linked
};

const getScopesForElement = (elementId: string, type: 'action' | 'reaction'): string[] => {
  const services = serviceManager.getAllServices();

  const service = services.find(s => {
    if (type === 'action') return s.actions.some(a => a.id === elementId);
    return s.reactions.some(r => r.id === elementId);
  });

  if (!service) return [];

  if (type === 'action') {
    return service.actions.find(a => a.id === elementId)?.scopes || [];
  } else {
    return service.reactions.find(r => r.id === elementId)?.scopes || [];
  }
};

const mapToDto = (area: any): AreaDto => ({
  id: area.id,
  name: area.name,
  is_active: area.is_active,
  user_id: area.user_id,
  last_executed_at: area.last_executed_at?.toISOString() ?? null,
  error_log: area.error_log,
  action: {
    name: area.action?.name ?? "UNKNOWN",
    accountId: area.action?.account_id,
    parameters: area.action?.parameters as Record<string, any> ?? {},
    scopes: area.action?.name ? getScopesForElement(area.action.name, 'action') : []
  },
  reactions: area.reactions.map((r: any) => ({
    name: r.name,
    accountId: r.account_id,
    parameters: r.parameters as Record<string, any>,
    scopes: getScopesForElement(r.name, 'reaction')
  }))
});

interface ErrorReply {
  error: string;
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

  fastify.get<{ Params: { id: string }, Reply: AreaDto | ErrorReply }>('/:id', {
    schema: getAreaSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    const area = await prisma.area.findFirst({
      where: { id, user_id: userId },
      include: { action: true, reactions: true }
    });

    if (!area) {
      return reply.status(404).send({ error: 'AREA not found' });
    }

    return mapToDto(area);
  });

  fastify.post<{ Body: CreateAreaDto }>('/', {
    schema: createAreaSchema,
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { name, action, reactions } = request.body;
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true }
    });

    if (!user) {
      request.log.error({ userId }, 'User not found during AREA creation');
      return reply.status(404).send({ error: "User not found" });
    }

    // A. Validation Action & Reactions
    const actionExists = serviceManager.getAllServices().some(s => s.actions.some(a => a.id === action.name));

    if (!actionExists) {
      request.log.error({ actionName: action.name }, 'Validation failed: Action not found in registry');
      return reply.status(400).send({ error: `Action ${action.name} not found` });
    }

    try {
      const actionAccountId = resolveAccountId(user.accounts, action.name, 'action');
      const newArea = await prisma.area.create({
        data: {
          name,
          user_id: userId,
          is_active: true,
          action: {
            create: {
              name: action.name,
              parameters: action.parameters,
              state: {},
              account_id: actionAccountId
            }
          },
          reactions: {
            create: reactions.map(r => ({
              name: r.name,
              parameters: r.parameters,
              account_id: resolveAccountId(user.accounts, r.name, 'reaction')
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

  fastify.put<{ Params: { id: string }, Body: UpdateAreaDto }>('/:id', {
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

    if (!existingArea) {
        request.log.error({ areaId: id, userId }, 'AREA not found during update');
        return reply.status(404).send({ error: 'AREA not found' });
    }

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { accounts: true }
    });

    try {
      await prisma.$transaction(async (tx) => {

        await tx.area.update({
          where: { id },
          data: {
            is_active: is_active ?? undefined,
            name: name ?? undefined
          }
        });

        if (action && existingArea.action) {
          const targetActionName = action.name || existingArea.action.name;

          if (action.name && action.name !== existingArea.action.name) {
            const actionExists = serviceManager.getAllServices().some(s => s.actions.some(a => a.id === action.name));
            if (!actionExists) throw new Error(`Action ${action.name} not found`);
          }

          const newAccountId = resolveAccountId(user.accounts, targetActionName, 'action');

          await tx.action.update({
            where: { id: existingArea.action.id },
            data: {
              name: action.name ?? undefined,
              parameters: action.parameters ?? undefined,
              account_id: newAccountId,
              state: (action.name && action.name !== existingArea.action.name) ? {} : undefined,
            }
          });
        }

        if (reactions) {
          await tx.reaction.deleteMany({
            where: { area_id: id }
          });

          if (reactions.length > 0) {
            await tx.reaction.createMany({
              data: reactions.map(r => ({
                area_id: id,
                name: r.name,
                parameters: r.parameters || {},
                account_id: resolveAccountId(user.accounts, r.name, 'reaction')
              }))
            });
          }
        }
      });

      const updatedArea = await prisma.area.findUnique({
          where: { id },
          include: { action: true, reactions: true, user: { include: { accounts: true } } }
      });

      if (updatedArea) {
          areaEngine.processArea(updatedArea).catch(err => {
            request.log.error(`Failed to re-initialize area ${id}: ${err.message}`);
          });
      }

      return { success: true };

    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to update AREA' });
    }
  });
}
