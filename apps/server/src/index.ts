import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// Config & Plugins
import { swaggerConfig, swaggerUiConfig } from './config/swagger';
import authPlugin from './plugins/auth';
import { registerServices } from './services';

// Routes
import { oauthRoutes } from './routes/auth/oauth';
import { signupRoute } from './routes/auth/signup';
import { signinRoute } from './routes/auth/signin';
import { forgotPasswordRoute } from './routes/auth/forgot-password';
import { resetPasswordRoute } from './routes/auth/reset-password';
import { areaRoutes } from './routes/areas.route';
import { accountRoutes } from './routes/auth/account';
import { serviceManager } from './services/service.manager';
import { serviceRoutes } from './routes/services.route';

// Core
import { areaEngine } from './core/area.engine';

const server = Fastify({
  logger: true
});

const main = async () => {
  try {
    // 1. Plugins
    await server.register(cors, { origin: true });
    await server.register(swagger, swaggerConfig);
    await server.register(swaggerUi, swaggerUiConfig);
    await server.register(authPlugin); // JWT + Decorator

    // 2. Business Logic Setup
    registerServices();

    // 3. Routes

    // Public Routes
    server.get('/about.json', async (req) => {
      return {
        client: { host: req.ip },
        server: {
          current_time: Math.floor(Date.now() / 1000),
          services: serviceManager.getAllServices()
        }
      };
    });

    // API Routes
    await server.register(async (api) => {
        // Grouping auth routes
        await api.register(oauthRoutes, { prefix: '/auth' });
        await api.register(accountRoutes, { prefix: '/auth' });
        await api.register(signupRoute, { prefix: '/auth' });
        await api.register(signinRoute, { prefix: '/auth' });
        api.route(forgotPasswordRoute);
        api.route(resetPasswordRoute);

        await api.register(areaRoutes, { prefix: '/areas' });
        await api.register(serviceRoutes, { prefix: '/services' });
    });


    // 4. Start Server
    await server.listen({ port: 8080, host: '0.0.0.0' });
    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    console.log(`Server running at ${address}:${port}`);
    console.log(`Swagger docs available at ${address}:${port}/docs`);

    // 5. Start Engine
    areaEngine.start(1000 * 10); // Check every 10 seconds

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

main();
