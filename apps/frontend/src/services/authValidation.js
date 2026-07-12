export const passwordHelp = 'Password must be at least 8 characters with uppercase, lowercase, number, and symbol.';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const nameRegex = /^[A-Za-z][A-Za-z .'-]{1,118}$/;
const companyRegex = /^[A-Za-z0-9][A-Za-z0-9 .&'()-]{1,158}$/;
const phoneRegex = /^\+?[0-9][0-9\s-]{7,18}$/;
const employeeIdRegex = /^[A-Za-z0-9-]{2,40}$/;
const inviteCodeRegex = /^[A-Za-z0-9-]{4,32}$/;

export function validateEmail(email) {
  return emailRegex.test(email.trim());
}

export function validatePassword(password) {
  return passwordRegex.test(password);
}

export function validateOtp(otp) {
  return /^\d{6}$/.test(otp);
}

export function validateLoginInput({ email, password }) {
  if (!validateEmail(email)) return 'Please enter a valid email address.';
  if (!password) return 'Please enter your password.';
  if (!validatePassword(password)) return passwordHelp;
  return '';
}

export function validateCompanySignup(form) {
  if (!companyRegex.test(form.companyName.trim())) return 'Company name must be 2-160 characters and use valid business name characters.';
  if (!validateEmail(form.email)) return 'Please enter a valid business email address.';
  if (!validatePassword(form.password)) return passwordHelp;
  if (!form.industry) return 'Please select an industry.';
  if (!form.fleetSize) return 'Please select a fleet size.';
  if (!nameRegex.test(form.adminName.trim())) return 'Admin name must contain only valid name characters.';
  if (form.primaryFleetType.trim().length < 2) return 'Please enter a valid primary fleet type.';
  return '';
}

export function validateEmployeeSignup(form) {
  if (!nameRegex.test(form.fullName.trim())) return 'Full name must contain only valid name characters.';
  if (!validateEmail(form.email)) return 'Please enter a valid work email address.';
  if (!validatePassword(form.password)) return passwordHelp;
  if (!form.employeeRole) return 'Please select an employee role.';
  if (form.employeeCode && !employeeIdRegex.test(form.employeeCode.trim())) return 'Employee ID can use letters, numbers and hyphens only.';
  if (!phoneRegex.test(form.phone.trim())) return 'Please enter a valid phone number.';
  if (!inviteCodeRegex.test(form.companyInviteCode.trim())) return 'Invite code must be 4-32 letters/numbers.';
  return '';
}
