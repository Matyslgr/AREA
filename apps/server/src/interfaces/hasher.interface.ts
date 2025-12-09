export interface IPasswordHasher {
  /**
   * Convert a plain text password into a hashed version
   * @param password - The plain text password
   * @returns The hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Verify a plain text password against a hashed version
   * @param hash - The hashed password
   * @param plainTextPassword - The plain text password to verify
   * @returns True if the password matches the hash, false otherwise
   */
  verify(hash: string, plainTextPassword: string): Promise<boolean>;
}
