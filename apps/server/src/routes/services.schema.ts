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
    // Ici, on réutilise parameterObject !
    parameters: {
      type: 'array',
      items: parameterObject
    }
  }
};

const reactionObject = {
  ...actionObject
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
  description: 'Get catalog of all available services',
  tags: ['services'],
  response: {
    200: {
      description: 'List of services',
      type: 'array',
      items: serviceObject
    }
  }
};