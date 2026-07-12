import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashOtp(otp) {
  return crypto.createHash('sha256').update(`${otp}:${config.otpPepper}`).digest('hex');
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, accountType: user.account_type },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function createInviteCode(companyName) {
  const prefix = companyName.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'TRANS';
  return `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export function safeUser(user) {
  return {
    id: user.id,
    accountType: user.account_type,
    fullName: user.full_name,
    email: user.email,
    isEmailVerified: user.is_email_verified,
  };
}
