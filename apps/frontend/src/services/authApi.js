const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (_error) {
    throw new Error('Backend is not reachable. Start apps/backend with DATABASE_URL, then try sending OTP again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = Array.isArray(data.errors) && data.errors.length
      ? data.errors.map((error) => error.message).join(' ')
      : data.message;
    throw new Error(validationMessage || 'Request failed. Please try again.');
  }

  return data;
}

export const authApi = {
  registerCompany(payload) {
    return request('/auth/register/company', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  registerEmployee(payload) {
    return request('/auth/register/employee', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifySignup(payload) {
    return request('/auth/verify-signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  requestLoginOtp(payload) {
    return request('/auth/login/request-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifyLoginOtp(payload) {
    return request('/auth/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export function storeSession({ token, user }) {
  localStorage.setItem('transitops_token', token);
  localStorage.setItem('transitops_user', JSON.stringify(user));
}
