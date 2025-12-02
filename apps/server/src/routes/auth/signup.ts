import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signupSchema } from './signup.schema';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

interface SignupBody {
  email: string;
  password: string;
}

export async function signupHandler(
  request: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return reply.status(409).send({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username: email.split('@')[0],
        password: hashedPassword
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return reply.status(201).send({
      id: user.id,
      email: user.email,
      token
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export const signupRoute = {
  method: 'POST' as const,
  url: '/auth/signup',
  schema: signupSchema,
  handler: signupHandler
};
