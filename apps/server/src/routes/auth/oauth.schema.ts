export const loginSchema = {
  description: 'Login with OAuth provider',
  tags: ['auth'],
  body: {
    type: 'object',
    required: ['provider', 'code'],
    properties: {
      provider: { type: 'string', description: 'OAuth provider name (google, github, spotify, twitch, notion, linkedin)' },
      code: { type: 'string', description: 'Authorization code from OAuth provider' }
    }
  },
  response: {
    200: {
      description: 'Authentication successful',
      type: 'object',
      properties: {
        message: { type: 'string' },
        token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    },
    400: {
      description: 'Bad request - Provider not supported',
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

export const linkSchema = {
  description: 'Link OAuth account to authenticated user',
  tags: ['auth'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['provider', 'code'],
    properties: {
      provider: { type: 'string', description: 'OAuth provider name (google, github, spotify, twitch, notion, linkedin)' },
      code: { type: 'string', description: 'Authorization code from OAuth provider' }
    }
  },
  response: {
    200: {
      description: 'Account linked successfully',
      type: 'object',
      properties: {
        message: { type: 'string' },
        account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            provider: { type: 'string' },
            provider_account_id: { type: 'string' }
          }
        }
      }
    },
    400: {
      description: 'Bad request',
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
      description: 'Conflict - Account already linked to another user',
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

export const getAccountsSchema = {
  description: 'Get all linked OAuth accounts',
  tags: ['auth'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: 'List of linked accounts',
      type: 'object',
      properties: {
        accounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              provider: { type: 'string' },
              provider_account_id: { type: 'string' },
              expires_at: { type: 'string', format: 'date-time', nullable: true }
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
