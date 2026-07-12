import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mailFromAddress = process.env.SMTP_FROM_ADDRESS || process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || process.env.MAIL_USERNAME;
const mailFromName = process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || 'TransitOps';
const formattedFrom = mailFromAddress ? `${mailFromName} <${mailFromAddress}>` : undefined;

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
  otpPepper: process.env.OTP_PEPPER || 'dev-otp-pepper-change-me',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowDevOtp: process.env.ALLOW_DEV_OTP === 'true',
  smtp: {
    mailer: process.env.MAIL_MAILER || 'smtp',
    host: process.env.SMTP_HOST || process.env.MAIL_HOST,
    port: Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587),
    secure: String(process.env.SMTP_SECURE || process.env.MAIL_SECURE || '').toLowerCase() === 'true',
    user: process.env.SMTP_USER || process.env.MAIL_USERNAME,
    pass: process.env.SMTP_PASS || process.env.MAIL_PASSWORD,
    from: process.env.SMTP_FROM || formattedFrom,
  },
};

if (!config.databaseUrl) {
  console.warn('DATABASE_URL is not set. Auth routes need PostgreSQL before they can be used.');
}
