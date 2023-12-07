import crypto from 'crypto';

export function createDataKeyHash(plainText: string): string {
  return crypto.createHash('md5').update(plainText).digest('hex');
}
