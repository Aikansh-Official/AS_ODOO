import express from 'express';
import { query, pool } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  companySignupSchema,
  employeeSignupSchema,
  loginStartSchema,
  otpSchema,
} from '../validators/authSchemas.js';
import {
  comparePassword,
  createInviteCode,
  generateOtp,
  hashOtp,
  hashPassword,
  normalizeEmail,
  safeUser,
  signAuthToken,
} from '../utils/auth.js';
import { config } from '../config/env.js';
import { sendOtpEmail } from '../services/emailService.js';

export const authRouter = express.Router();

async function createOtp(userId, email, purpose) {
  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + config.otpExpiresMinutes * 60 * 1000);

  await query(
    `UPDATE email_otps SET consumed_at = now()
     WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL`,
    [userId, purpose]
  );

  await query(
    `INSERT INTO email_otps (user_id, purpose, otp_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, purpose, otpHash, expiresAt]
  );

  return sendOtpEmail({ to: email, otp, purpose });
}

async function verifyOtpAndReturnUser(email, otp, purpose) {
  const normalizedEmail = normalizeEmail(email);
  const userResult = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
  const user = userResult.rows[0];

  if (!user) {
    const error = new Error('Account not found.');
    error.statusCode = 404;
    throw error;
  }

  const otpResult = await query(
    `SELECT * FROM email_otps
     WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [user.id, purpose]
  );
  const otpRecord = otpResult.rows[0];

  if (!otpRecord || new Date(otpRecord.expires_at).getTime() < Date.now()) {
    const error = new Error('OTP expired. Request a new OTP.');
    error.statusCode = 400;
    throw error;
  }

  if (otpRecord.attempts >= 5) {
    const error = new Error('Too many wrong OTP attempts. Request a new OTP.');
    error.statusCode = 429;
    throw error;
  }

  if (otpRecord.otp_hash !== hashOtp(otp)) {
    await query('UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1', [otpRecord.id]);
    const error = new Error('Wrong OTP. Please check your email and try again.');
    error.statusCode = 400;
    throw error;
  }

  await query('UPDATE email_otps SET consumed_at = now() WHERE id = $1', [otpRecord.id]);
  await query('UPDATE users SET is_email_verified = true, updated_at = now() WHERE id = $1', [user.id]);

  return { ...user, is_email_verified: true };
}

authRouter.post('/register/company', validate(companySignupSchema), asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      await client.query('ROLLBACK');
      const existingUser = existing.rows[0];
      const otpInfo = await createOtp(existingUser.id, existingUser.email, 'signup');
      return res.status(200).json({
        message: otpInfo.delivered ? 'Account already exists. OTP sent to email.' : 'Account already exists. Dev OTP logged in backend console.',
        devOtp: otpInfo.devOtp,
      });
    }

    const passwordHash = await hashPassword(req.body.password);
    const userResult = await client.query(
      `INSERT INTO users (account_type, full_name, email, password_hash)
       VALUES ('company', $1, $2, $3)
       RETURNING *`,
      [req.body.adminName, email, passwordHash]
    );
    const user = userResult.rows[0];
    const inviteCode = createInviteCode(req.body.companyName);

    await client.query(
      `INSERT INTO companies (owner_user_id, company_name, industry, fleet_size, primary_fleet_type, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, req.body.companyName, req.body.industry, req.body.fleetSize, req.body.primaryFleetType, inviteCode]
    );

    await client.query('COMMIT');
    const otpInfo = await createOtp(user.id, user.email, 'signup');

    res.status(201).json({
      message: otpInfo.delivered ? 'Account created. OTP sent to email.' : 'Account created. Dev OTP logged in backend console.',
      devOtp: otpInfo.devOtp,
      inviteCode,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

authRouter.post('/register/employee', validate(employeeSignupSchema), asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      await client.query('ROLLBACK');
      const existingUser = existing.rows[0];
      const otpInfo = await createOtp(existingUser.id, existingUser.email, 'signup');
      return res.status(200).json({
        message: otpInfo.delivered ? 'Account already exists. OTP sent to email.' : 'Account already exists. Dev OTP logged in backend console.',
        devOtp: otpInfo.devOtp,
      });
    }

    const passwordHash = await hashPassword(req.body.password);
    const userResult = await client.query(
      `INSERT INTO users (account_type, full_name, email, password_hash, phone)
       VALUES ('employee', $1, $2, $3, $4)
       RETURNING *`,
      [req.body.fullName, email, passwordHash, req.body.phone]
    );
    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO employee_profiles (user_id, employee_role, employee_code, company_invite_code)
       VALUES ($1, $2, $3, $4)`,
      [user.id, req.body.employeeRole, req.body.employeeCode || null, req.body.companyInviteCode.toUpperCase()]
    );

    await client.query('COMMIT');
    const otpInfo = await createOtp(user.id, user.email, 'signup');

    res.status(201).json({
      message: otpInfo.delivered ? 'Account created. OTP sent to email.' : 'Account created. Dev OTP logged in backend console.',
      devOtp: otpInfo.devOtp,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

authRouter.post('/verify-signup', validate(otpSchema), asyncHandler(async (req, res) => {
  const user = await verifyOtpAndReturnUser(req.body.email, req.body.otp, 'signup');
  res.json({ message: 'Email verified successfully.', token: signAuthToken(user), user: safeUser(user) });
}));

authRouter.post('/login/request-otp', validate(loginStartSchema), asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || !(await comparePassword(req.body.password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const otpInfo = await createOtp(user.id, user.email, 'login');
  res.json({
    message: otpInfo.delivered ? 'OTP sent to email.' : 'Dev OTP logged in backend console.',
    devOtp: otpInfo.devOtp,
  });
}));

authRouter.post('/login/verify-otp', validate(otpSchema), asyncHandler(async (req, res) => {
  const user = await verifyOtpAndReturnUser(req.body.email, req.body.otp, 'login');
  res.json({ message: 'Login successful.', token: signAuthToken(user), user: safeUser(user) });
}));

