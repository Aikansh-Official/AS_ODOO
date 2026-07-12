import { z } from 'zod';

const nameRegex = /^[A-Za-z][A-Za-z .'-]{1,118}$/;
const companyRegex = /^[A-Za-z0-9][A-Za-z0-9 .&'()-]{1,158}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const phoneRegex = /^\+?[0-9][0-9\s-]{7,18}$/;
const employeeIdRegex = /^[A-Za-z0-9-]{2,40}$/;
const inviteCodeRegex = /^[A-Z0-9-]{4,32}$/i;

export const companySignupSchema = z.object({
  companyName: z.string().trim().regex(companyRegex, 'Company name can use letters, numbers, spaces, &, apostrophes, parentheses, dots and hyphens.'),
  adminName: z.string().trim().regex(nameRegex, 'Admin name must be 2-120 characters and contain valid name characters only.'),
  email: z.string().trim().email('Enter a valid business email.').max(255),
  password: z.string().regex(passwordRegex, 'Password must be 8+ chars with uppercase, lowercase, number, and symbol.'),
  industry: z.string().trim().min(2).max(80),
  fleetSize: z.string().trim().min(1).max(40),
  primaryFleetType: z.string().trim().min(2).max(80),
});

export const employeeSignupSchema = z.object({
  fullName: z.string().trim().regex(nameRegex, 'Full name must be 2-120 characters and contain valid name characters only.'),
  email: z.string().trim().email('Enter a valid work email.').max(255),
  password: z.string().regex(passwordRegex, 'Password must be 8+ chars with uppercase, lowercase, number, and symbol.'),
  phone: z.string().trim().regex(phoneRegex, 'Enter a valid phone number.'),
  employeeRole: z.string().trim().min(2).max(80),
  employeeCode: z.string().trim().optional().or(z.literal('')).refine((value) => !value || employeeIdRegex.test(value), 'Employee ID can use letters, numbers and hyphens only.'),
  companyInviteCode: z.string().trim().regex(inviteCodeRegex, 'Invite code must be 4-32 letters/numbers.'),
});

export const loginStartSchema = z.object({
  email: z.string().trim().email('Enter a valid email.').max(255),
  password: z.string().min(1, 'Password is required.'),
});

export const otpSchema = z.object({
  email: z.string().trim().email('Enter a valid email.').max(255),
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be exactly 6 digits.'),
});
