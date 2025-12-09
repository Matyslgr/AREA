import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { Argon2Adapter } from '../../adapters/argon2.adapter';
import { IPasswordHasher } from '../../interfaces/hasher.interface';
import { signinSchema } from './signin.schema';

interface SigninBody {
  email: string;
  password: string;
}
export async function signinRoute(fastify: FastifyInstance) {
  const hasher: IPasswordHasher = new Argon2Adapter();

  fastify.post<{ Body: SigninBody }>('/signin', { schema: signinSchema }, async (request, reply) => {
    const { email, password } = request.body;

    try {
      // 1. Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        // "Or !user.password" handles OAuth users who try to login with empty password
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // 2. Verify password using Argon2
      const isPasswordValid = await hasher.verify(user.password, password);

      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // 3. Generate JWT
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
      });

      return reply.status(200).send({
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token,
        message: 'Login successful'
      });

    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}