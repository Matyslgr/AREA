import crypto from 'crypto';
import { IRandomGenerator } from '../interfaces/random.interface';

export class CryptoRandomAdapter implements IRandomGenerator {
  generate(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
