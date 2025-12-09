export interface IEmailService {
    sendPasswordResetEmail(email: string, resetUrl: string): Promise<void>;
}
