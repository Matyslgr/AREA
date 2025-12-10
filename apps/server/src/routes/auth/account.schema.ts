export const getAccountSchema = {
  description: 'Get current user account details',
  tags: ['auth'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: 'Account details retrieved successfully',
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        hasPassword: { type: 'boolean', description: 'Whether user has a password set' },
        linkedAccounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              provider: { type: 'string' },
              provider_account_id: { type: 'string' },
              expires_at: { type: 'string', format: 'date-time', nullable: true },
              scopes: { type: 'array', items: { type: 'string' }}
            }
          }
        }
      }
    },
    401: {
      description: 'Unauthorized',
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

export const updateAccountSchema = {
  description: 'Update user account details (email, username, password)',
  tags: ['auth'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', description: 'New email address' },
      username: { type: 'string', minLength: 1, description: 'New username' },
      password: { type: 'string', minLength: 6, description: 'New password (minimum 6 characters)' },
      currentPassword: { type: 'string', description: 'Current password (required if user already has a password and wants to change it)' }
    }
  },
  response: {
    200: {
      description: 'Account updated successfully',
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            hasPassword: { type: 'boolean' }
          }
        }
      }
    },
    400: {
      description: 'Bad request - Invalid input or current password required',
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    409: {
      description: 'Conflict - Email already in use',
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

export const getLinkedAccountSchema = {
  description: 'Get details of a specific linked OAuth provider',
  tags: ['auth'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['provider'],
    properties: {
      provider: { type: 'string', description: 'Provider name (google, github...)' }
    }
  },
  response: {
    200: {
      description: 'Linked account details',
      type: 'object',
      properties: {
        account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            provider: { type: 'string' },
            provider_account_id: { type: 'string' },
            expires_at: { type: 'string', format: 'date-time', nullable: true },
            scopes: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    },
    404: {
      description: 'Provider not linked',
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

export const unlinkAccountSchema = {
  description: 'Unlink OAuth account from user',
  tags: ['auth'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['provider'],
    properties: {
      provider: { type: 'string', description: 'OAuth provider name to unlink' }
    }
  },
  response: {
    200: {
      description: 'Account unlinked successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    400: {
      description: 'Bad request - Cannot unlink last authentication method',
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    404: {
      description: 'Account not found',
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

