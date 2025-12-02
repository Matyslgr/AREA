import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { forgotPasswordSchema } from './forgot-password.schema';
import { MockEmailAdapter } from '../../adapters/mock-email.adapter';

const prisma = new PrismaClient();
const emailService = new MockEmailAdapter();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const RESET_TOKEN_EXPIRATION_HOURS = parseInt(process.env.RESET_TOKEN_EXPIRATION || '1');

interface ForgotPasswordBody {
    email: string;
}

export async function forgotPasswordHandler(
    request: FastifyRequest<{ Body: ForgotPasswordBody }>,
    reply: FastifyReply
) {
    const { email } = request.body;

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return reply.status(200).send({
                message: 'If the email exists, a password reset link has been sent.'
            });
        }

        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');

        // Calculate expiration time
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRATION_HOURS);

        // Store token in database
        await prisma.passwordResetToken.create({
            data: {
                user_id: user.id,
                token,
                expires_at: expiresAt,
                used: false
            }
        });

        // Generate reset URL
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

        // Send email
        await emailService.sendPasswordResetEmail(email, resetUrl);

        return reply.status(200).send({
            message: 'If the email exists, a password reset link has been sent.'
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
    }
}

export const forgotPasswordRoute = {
    method: 'POST' as const,
    url: '/auth/forgot-password',
    schema: forgotPasswordSchema,
    handler: forgotPasswordHandler
};
