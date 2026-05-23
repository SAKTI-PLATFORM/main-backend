import * as argon2 from 'argon2';

export class PasswordHasher {
  static async hash(plainPassword: string): Promise<string> {
    return await argon2.hash(plainPassword);
  }

  static async verify(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
  }
}
