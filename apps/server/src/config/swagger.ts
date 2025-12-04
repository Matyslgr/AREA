export const swaggerConfig = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'AREA API',
      description: 'API documentation for AREA automation platform',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://127.0.0.1:8080', description: 'Development server' },
      { url: 'https://server-production.up.railway.app', description: 'Production server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token'
        }
      }
    }
  }
};

export const swaggerUiConfig = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list' as const,
    deepLinking: false
  },
  staticCSP: true
};
