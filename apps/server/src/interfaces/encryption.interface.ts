export interface IEncryptionService {
  encrypt(text: string): string;
  decrypt(hash: string): string;
}
