export const forgotPasswordSchema = {
    description: 'Request a password reset',
    tags: ['auth'],
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
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
        }
    }
};
