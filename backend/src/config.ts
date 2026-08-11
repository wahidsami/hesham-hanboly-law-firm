import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

export const config = {
  port: Number(process.env.PORT || 3000),
  isDev: process.argv.includes('--dev'),
  databaseUrl: process.env.DATABASE_URL || '',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  sessionDays: Number(process.env.ADMIN_SESSION_DAYS || 7),
  hyperpay: {
    baseUrl: process.env.HYPERPAY_BASE_URL || '',
    accessToken: process.env.HYPERPAY_ACCESS_TOKEN || '',
    entityId: process.env.HYPERPAY_ENTITY_ID || '',
    currency: process.env.HYPERPAY_CURRENCY || 'SAR',
    paymentType: process.env.HYPERPAY_PAYMENT_TYPE || 'DB',
    testMode: process.env.HYPERPAY_TEST_MODE || 'EXTERNAL',
    integrity: process.env.HYPERPAY_INTEGRITY !== 'false',
    threeDs2Enrolled: process.env.HYPERPAY_THREEDS2_ENROLLED !== 'false',
  },
  s3: {
    region: process.env.S3_REGION || '',
    bucket: process.env.S3_BUCKET || '',
    endpoint: process.env.S3_ENDPOINT || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || '',
  },
};
