export const signupSchema = {
  description: 'Create a new user account',
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
        minLength: 6,
        description: 'User password (minimum 6 characters)'
      }
    }
  },
  response: {
    201: {
      description: 'User created successfully',
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        token: { type: 'string', description: 'JWT token for authentication' }
      }
    },
    400: {
      description: 'Bad request - Invalid input',
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    409: {
      description: 'Conflict - Email already exists',
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
