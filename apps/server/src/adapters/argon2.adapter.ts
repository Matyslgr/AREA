import * as argon2 from 'argon2';
import { IPasswordHasher } from '../interfaces/hasher.interface';

export class Argon2Adapter implements IPasswordHasher {
  private options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,         // 3 iterations
    parallelism: 1,
  };

  async hash(password: string): Promise<string> {
    return argon2.hash(password, this.options);
  }

  async verify(hash: string, plainTextPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainTextPassword);
    } catch (error) {
      // In case of internal error (corrupted hash...), return false for security
      return false;
    }
  }
}
