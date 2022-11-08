export async function encrypt(
  token: string,
  salt: Buffer | string,
  key: Buffer | string
): Promise<string> {
  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  // key must be 32 bytes. crypto.randomBytes(32) // buffer.
  const cipher = crypto.createCipheriv(algorithm, key, salt);
  let encrypted = cipher.update(token, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export async function decrypt(
  encryptedData: string,
  salt: Buffer | string,
  key: Buffer | string
): Promise<string> {
  const crypto = await import('node:crypto');
  const algorithm = 'aes-256-cbc';
  const decipher = crypto.createDecipheriv(algorithm, key, salt);
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}
