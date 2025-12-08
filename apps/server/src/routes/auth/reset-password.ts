import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { resetPasswordSchema } from './reset-password.schema';
import { prisma } from '../../lib/prisma';
interface ResetPasswordBody {
    token: string;
    password: string;
}

export async function resetPasswordHandler(
    request: FastifyRequest<{ Body: ResetPasswordBody }>,
    reply: FastifyReply
) {
    const { token, password } = request.body;

    try {
        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true }
        });

        // Validate token exists
        if (!resetToken) {
            return reply.status(400).send({
                error: 'Invalid or expired reset token'
            });
        }

        // Check if token is already used
        if (resetToken.used) {
            return reply.status(400).send({
                error: 'This reset token has already been used'
            });
        }

        // Check if token is expired
        if (new Date() > resetToken.expires_at) {
            return reply.status(400).send({
                error: 'This reset token has expired'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.user_id },
                data: { password: hashedPassword }
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used: true }
            })
        ]);

        return reply.status(200).send({
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
    }
}

export const resetPasswordRoute = {
    method: 'POST' as const,
    url: '/auth/reset-password',
    schema: resetPasswordSchema,
    handler: resetPasswordHandler
};
