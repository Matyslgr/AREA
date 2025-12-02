import { IEmailService } from '../interfaces/email.interface';

export class MockEmailAdapter implements IEmailService {
    async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
        console.log('\n==================== PASSWORD RESET EMAIL ====================');
        console.log(`To: ${email}`);
        console.log(`Subject: Password Reset Request`);
        console.log('\n--- Email Content ---');
        console.log(`Hello,`);
        console.log('');
        console.log(`You requested to reset your password. Click the link below to reset it:`);
        console.log('');
        console.log(`${resetUrl}`);
        console.log('');
        console.log(`This link will expire in 1 hour.`);
        console.log('');
        console.log(`If you didn't request this, please ignore this email.`);
        console.log('\n==============================================================\n');
    }
}
