export const signinSchema = {
  description: 'Sign in to an existing account',
  tags: ['auth'],
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address'
      },
      password: {
        type: 'string',
        description: 'User password'
      }
    }
  },
  response: {
    200: {
      description: 'Sign in successful',
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' }
          }
        },
        token: { type: 'string', description: 'JWT token for authentication' }
      }
    },
    401: {
      description: 'Unauthorized - Invalid credentials',
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};
