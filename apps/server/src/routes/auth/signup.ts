import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signupSchema } from './signup.schema';
import { prisma } from '../../lib/prisma';
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

  request.log.info({ email, bodyKeys: Object.keys(request.body) }, 'Signup attempt');

  try {
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      request.log.info({ email }, 'User already exists');
      return reply.status(409).send({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    request.log.info({ email, username: email.split('@')[0] }, 'Creating user in database');
    const user = await prisma.user.create({
      data: {
        email,
        username: email.split('@')[0],
        password: hashedPassword
      }
    });
    request.log.info({ userId: user.id }, 'User created successfully');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
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
}

export const signupRoute = {
  method: 'POST' as const,
  url: '/auth/signup',
  schema: signupSchema,
  handler: signupHandler
};
