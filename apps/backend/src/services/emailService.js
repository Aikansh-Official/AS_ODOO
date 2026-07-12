import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

function canSendEmail() {
  return Boolean(config.smtp.host && config.smtp.user && config.smtp.pass && config.smtp.from);
}

export async function sendOtpEmail({ to, otp, purpose }) {
  const subject = purpose === 'signup' ? 'Verify your TransitOps account' : 'TransitOps login OTP';
  const text = `Your TransitOps ${purpose} OTP is ${otp}. It expires in ${config.otpExpiresMinutes} minutes.`;

  if (!canSendEmail()) {
    if (config.allowDevOtp) {
      console.log(`[DEV OTP] ${to} ${purpose}: ${otp}`);
      return { delivered: false, devOtp: otp };
    }

    const error = new Error('SMTP email is not configured. Add MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, and MAIL_FROM_ADDRESS in apps/backend/.env, then restart the backend.');
    error.statusCode = 503;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure || config.smtp.port === 465,
    requireTLS: config.smtp.port === 587,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.verify();

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
  });

  return { delivered: true };
}
