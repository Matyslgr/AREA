import nodemailer from 'nodemailer';
import { IEmailService } from '../interfaces/email.interface';

export class NodemailerEmailAdapter implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configure SMTP transporter using environment variables
        const config = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };

        console.log('📧 Configuring SMTP with:', {
            host: config.host,
            port: config.port,
            secure: config.secure,
            user: config.auth.user,
            hasPassword: !!config.auth.pass,
        });

        this.transporter = nodemailer.createTransport(config);
    }

    async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
        console.log('📨 Attempting to send password reset email to:', email);

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@area.com',
                to: email,
                subject: 'Password Reset Request',
                html: this.generatePasswordResetEmailHTML(resetUrl),
                text: this.generatePasswordResetEmailText(resetUrl),
            };

            console.log('📬 Email options:', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject,
            });

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent successfully!');
            console.log('   Message ID:', info.messageId);
            console.log('   Response:', info.response);
        } catch (error) {
            console.error('❌ Error sending password reset email:');
            console.error('   Error message:', error instanceof Error ? error.message : error);
            console.error('   Error details:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    private generatePasswordResetEmailHTML(resetUrl: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h1 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Password Reset Request</h1>
                                        <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                            Hello,
                                        </p>
                                        <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                            We received a request to reset your password. Click the button below to create a new password:
                                        </p>
                                        <table role="presentation" style="margin: 30px 0;">
                                            <tr>
                                                <td style="border-radius: 4px; background-color: #007bff;">
                                                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                                                        Reset Password
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                            Or copy and paste this link into your browser:
                                        </p>
                                        <p style="margin: 0 0 20px 0; color: #007bff; font-size: 14px; word-break: break-all;">
                                            ${resetUrl}
                                        </p>
                                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">
                                            <strong>This link will expire in 1 hour.</strong>
                                        </p>
                                        <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.5;">
                                            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
                                        <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                                            This is an automated message, please do not reply to this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    }

    private generatePasswordResetEmailText(resetUrl: string): string {
        return `
Password Reset Request

Hello,

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

---
This is an automated message, please do not reply to this email.
        `.trim();
    }
}
