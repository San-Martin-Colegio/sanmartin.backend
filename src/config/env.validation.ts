const INSECURE_SECRETS = new Set([
  'your_super_secret_jwt_key',
  'smp_super_secret_jwt_key_2026_xYz',
  'changeme',
]);

export function validateEnvironment(config: Record<string, unknown>) {
  const environment = String(config.NODE_ENV || 'development');
  const jwtSecret = String(config.JWT_SECRET || '');

  if (jwtSecret.length < 32 || INSECURE_SECRETS.has(jwtSecret)) {
    throw new Error('JWT_SECRET debe ser aleatorio y tener al menos 32 caracteres.');
  }

  if (environment === 'production') {
    if (!String(config.CORS_ORIGINS || '').trim()) {
      throw new Error('CORS_ORIGINS es obligatorio en producción.');
    }
    if (String(config.DB_SYNC || 'false') === 'true') {
      throw new Error('DB_SYNC debe ser false en producción; usa migraciones versionadas.');
    }
  }

  const encryptionKey = String(config.DATA_ENCRYPTION_KEY || '');
  if (encryptionKey) {
    let decoded: Buffer;
    try {
      decoded = Buffer.from(encryptionKey, 'base64');
    } catch {
      throw new Error('DATA_ENCRYPTION_KEY debe estar codificada en Base64.');
    }
    if (decoded.length !== 32) {
      throw new Error('DATA_ENCRYPTION_KEY debe representar exactamente 32 bytes.');
    }
  } else if (environment === 'production') {
    throw new Error('DATA_ENCRYPTION_KEY es obligatoria en producción.');
  }

  return config;
}
