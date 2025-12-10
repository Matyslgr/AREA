import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { Argon2Adapter } from '../../adapters/argon2.adapter';
import { IPasswordHasher } from '../../interfaces/hasher.interface';
import { signupSchema } from './signup.schema';

interface SignupBody {
  email: string;
  password: string;
}

export async function signupRoute(fastify: FastifyInstance) {
  // Dependency Injection: We use the adapter
  const hasher: IPasswordHasher = new Argon2Adapter();

  fastify.post<{ Body: SignupBody }>('/signup', { schema: signupSchema }, async (request, reply) => {
    const { email, password } = request.body;

    request.log.info({ email, bodyKeys: Object.keys(request.body) }, 'Signup attempt');

    try {
      // 1. Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        request.log.info({ email }, 'User already exists');
        return reply.status(409).send({ error: 'Email already exists' });
      }

      // 2. Hash password using Argon2 (Clean Architecture)
      const hashedPassword = await hasher.hash(password);

      // 3. Create user
      const user = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0], // Default username
          password: hashedPassword
        }
      });

      request.log.info({ userId: user.id }, 'User created successfully');

      // 4. Generate JWT using Fastify plugin
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
      });

      return reply.status(201).send({
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token,
        message: 'User created successfully',
        isNewUser: true
      });

    } catch (error) {
      request.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return reply.status(500).send({
        error: 'Internal server error',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      });
    }
  });
}
