import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify({
  logger: true
});

server.register(cors, {
  origin: true
});

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

const start = async () => {
  try {
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
