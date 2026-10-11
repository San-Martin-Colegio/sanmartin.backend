import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ValueTransformer } from 'typeorm';

const PREFIX = 'enc:v1:';

function encryptionKey(): Buffer | null {
  const configured = process.env.DATA_ENCRYPTION_KEY;
  if (!configured) return null;
  const key = Buffer.from(configured, 'base64');
  if (key.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY debe representar exactamente 32 bytes.');
  }
  return key;
}

export const encryptedTextTransformer: ValueTransformer = {
  to(value?: string | null): string | null | undefined {
    if (!value || value.startsWith(PREFIX)) return value;
    const key = encryptionKey();
    if (!key) return value;

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${PREFIX}${Buffer.concat([iv, tag, ciphertext]).toString('base64')}`;
  },

  from(value?: string | null): string | null | undefined {
    if (!value || !value.startsWith(PREFIX)) return value;
    const key = encryptionKey();
    if (!key) {
      throw new Error('No se puede descifrar el dato: falta DATA_ENCRYPTION_KEY.');
    }

    const payload = Buffer.from(value.slice(PREFIX.length), 'base64');
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const ciphertext = payload.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  },
};
