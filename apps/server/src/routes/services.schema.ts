const parameterObject = {
  type: 'object',
  required: ['name', 'type', 'description'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    type: { type: 'string', enum: ['string', 'number', 'boolean', 'select'] },
    required: { type: 'boolean' },
    options: { type: 'array', items: { type: 'string' } }
  }
};

const actionObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    parameters: {
      type: 'array',
      items: parameterObject
    },
    scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    return_values: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          example: { type: 'string' }
        }
      }
    }
  }
};

const reactionObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    parameters: {
      type: 'array',
      items: parameterObject
    },
    scopes: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

const serviceObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    is_oauth: { type: 'boolean' },
    actions: {
      type: 'array',
      items: actionObject
    },
    reactions: {
      type: 'array',
      items: reactionObject
    }
  }
};

export const listServicesSchema = {
  description: 'Get catalog of all available services, actions, and reactions.',
  tags: ['services'],
  response: {
    200: {
      description: 'List of services',
      type: 'array',
      items: serviceObject
    }
  }
};