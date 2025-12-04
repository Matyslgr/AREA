const areaObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    is_active: { type: 'boolean' },
    user_id: { type: 'string' },
    last_executed_at: { type: 'string', format: 'date-time', nullable: true },
    error_log: { type: 'string', nullable: true },

    action: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Action ID (ex: GITHUB_NEW_ISSUE)' },
        parameters: { type: 'object', additionalProperties: true }
      }
    },
    reactions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Reaction ID (ex: DISCORD_SEND_MSG)' },
          parameters: { type: 'object', additionalProperties: true }
        }
      }
    }
  }
};

export const createAreaSchema = {
  description: 'Create a new AREA (Automation)',
  tags: ['areas'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'action', 'reactions'],
    properties: {
      name: { type: 'string', minLength: 1 },
      action: {
        type: 'object',
        required: ['name', 'parameters'],
        properties: {
          name: { type: 'string' },
          parameters: { type: 'object' }
        }
      },
      reactions: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['name', 'parameters'],
          properties: {
            name: { type: 'string' },
            parameters: { type: 'object' }
          }
        }
      }
    }
  },
  response: {
    201: {
      description: 'AREA created successfully',
      type: 'object',
      properties: {
        message: { type: 'string' },
        area: areaObject
      }
    }
  }
};

export const listAreasSchema = {
  description: 'List all AREAs for the current user',
  tags: ['areas'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: 'List of AREAs',
      type: 'array',
      items: areaObject
    }
  }
};

export const deleteAreaSchema = {
  description: 'Delete an AREA by ID',
  tags: ['areas'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  },
  response: {
    200: {
      description: 'AREA deleted',
      type: 'object',
      properties: { success: { type: 'boolean' } }
    },
    404: {
      description: 'AREA not found',
      type: 'object',
      properties: { error: { type: 'string' } }
    }
  }
};

export const updateAreaSchema = {
  description: 'Update an AREA (Enable, Disable, or Change Params)',
  tags: ['areas'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: { id: { type: 'string', format: 'uuid' } }
  },
  body: {
    type: 'object',
    properties: {
      is_active: { type: 'boolean' },
      name: { type: 'string' },
      action: {
        type: 'object',
        properties: {
          parameters: { type: 'object' }
        }
      },
      reactions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            parameters: { type: 'object' }
          }
        }
      }
    }
  },
  response: {
    200: {
      description: 'AREA updated',
      type: 'object',
      properties: { success: { type: 'boolean' } }
    }
  }
};