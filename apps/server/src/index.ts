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
    console.log('Server running at http://localhost:8080');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
