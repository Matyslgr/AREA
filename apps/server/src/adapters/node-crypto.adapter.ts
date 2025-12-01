import crypto from 'crypto';
import { IEncryptionService } from '../interfaces/encryption.interface';

export class NodeCryptoAdapter implements IEncryptionService {
  private algorithm = 'aes-256-ctr';

  private secretKey = process.env.ENCRYPTION_KEY;

  constructor() {
    if (!this.secretKey) {
      throw new Error('ENCRYPTION_KEY is missing in .env');
    }
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey!, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(hash: string): string {
    const [ivHex, contentHex] = hash.split(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.secretKey!, 'hex'),
      Buffer.from(ivHex, 'hex')
    );
    const decrypted = Buffer.concat([decipher.update(Buffer.from(contentHex, 'hex')), decipher.final()]);

    return decrypted.toString();
  }
}