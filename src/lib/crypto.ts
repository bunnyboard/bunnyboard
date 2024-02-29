import crypto from 'crypto';

export function generateDataHashMD5(plainText: string): string {
  return crypto.createHash('md5').update(plainText).digest('hex');
}
