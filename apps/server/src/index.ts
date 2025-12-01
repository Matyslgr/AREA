import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { oauthRoutes } from './routes/auth/oauth';
import { signupRoute } from './routes/auth/signup';
import { signinRoute } from './routes/auth/signin';

const server = Fastify({
  logger: true
});

const start = async () => {
  try {
    // Register CORS first
    await server.register(cors, {
      origin: true
    });

    // Register Swagger
    await server.register(swagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'AREA API',
          description: 'API documentation for AREA automation platform',
          version: '1.0.0'
        },
        servers: [
          {
            url: 'http://127.0.0.1:8080',
            description: 'Development server'
          }
        ]
      }
    });

    // Register JWT
    await server.register(jwt, {
      secret: process.env.JWT_SECRET || 'supersecret'
    });

    // Register routes
    server.get('/', async (request, reply) => {
      return { hello: 'world' };
    });

    server.get('/about.json', async (request, reply) => {
      return {
        client: {
          host: request.ip
        },
        server: {
          current_time: Math.floor(Date.now() / 1000),
          services: []
        }
      };
    });

    await server.register(oauthRoutes, { prefix: '/auth' });

    // Register auth routes
    server.route(signupRoute);
    server.route(signinRoute);

    // Register Swagger UI last (after all routes)
    await server.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false
      },
      staticCSP: true
    });

    await server.listen({ port: 8080, host: '0.0.0.0' });
    console.log('Server running at http://127.0.0.1:8080');
    console.log('Swagger docs available at http://127.0.0.1:8080/docs');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
