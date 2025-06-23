import * as bcrypt from "bcryptjs";

// Simple encryption/decryption for TOTP secrets
// In production, you should use a more robust encryption solution

export function encryptSecret(secret: string): string {
  // For demo purposes, we'll use base64 encoding
  // In production, use proper encryption like AES-256
  return Buffer.from(secret).toString("base64");
}

export function decryptSecret(encryptedSecret: string): string {
  // For demo purposes, we'll use base64 decoding
  // In production, use proper decryption
  return Buffer.from(encryptedSecret, "base64").toString("utf-8");
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
