export const resetPasswordSchema = {
    description: 'Reset password with token',
    tags: ['auth'],
    body: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
            token: {
                type: 'string',
                description: 'Password reset token'
            },
            password: {
                type: 'string',
                minLength: 6,
                description: 'New password (minimum 6 characters)'
            }
        }
    },
    response: {
        200: {
            description: 'Success response',
            type: 'object',
            properties: {
                message: {
                    type: 'string'
                }
            }
        },
        400: {
            description: 'Invalid or expired token',
            type: 'object',
            properties: {
                error: {
                    type: 'string'
                }
            }
        }
    }
};
