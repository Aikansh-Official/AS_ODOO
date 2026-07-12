import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldAlert, KeyRound, Send } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Toast } from '../components/common/Toast';
import { authApi, storeSession } from '../services/authApi';
import { passwordHelp, validateLoginInput, validateOtp } from '../services/authValidation';

export function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4500);
  };

  const handleRequestOtp = async () => {
    const validationError = validateLoginInput({ email, password });
    if (validationError) {
      showToast('error', validationError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.requestLoginOtp({ email: email.trim().toLowerCase(), password });
      setOtpSent(true);
      setOtp('');
      showToast('success', result.devOtp ? `OTP generated. Demo OTP: ${result.devOtp}` : 'OTP sent to your email.');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateOtp(otp)) {
      showToast('error', 'OTP must be exactly 6 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.verifyLoginOtp({ email: email.trim().toLowerCase(), otp });
      storeSession(result);
      showToast('success', 'Login successful. Opening dashboard...');
      window.setTimeout(() => onNavigate('dashboard'), 700);
    } catch (error) {
      showToast('error', error.message || 'Wrong OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md px-4 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -15 }}
        transition={{ duration: 0.4 }}
        className="w-full overflow-hidden rounded-2xl border border-outline-variant bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-10"
      >
        <Toast toast={toast} />
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h2 className="mt-6 font-headline text-2xl font-bold tracking-tight text-on-surface">
            Control Center Access
          </h2>
          <p className="mt-2 font-body text-xs text-on-surface-variant">
            Sign in with your password and verify the email OTP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
              <Mail className="h-4.5 w-4.5" />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low pl-11 pr-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low pl-11 pr-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <p className="mt-1.5 font-body text-[11px] leading-5 text-on-surface-variant">{passwordHelp}</p>
          </div>

          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                <KeyRound className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder='Enter 6-digit OTP'
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low pl-11 pr-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <p className="mt-1.5 font-body text-[11px] leading-5 text-on-surface-variant">
              Type any unexpired 6-digit OTP you received by email.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white py-3 font-body text-sm font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Send className="h-4 w-4" />
            {otpSent ? 'Resend OTP' : 'Send OTP'}
          </button>

          <div className="mt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-body text-sm font-semibold text-white shadow-[0_4px_16px_rgba(255,122,0,0.28)] transition-transform hover:scale-[1.02] active:scale-98 cursor-pointer disabled:opacity-55"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Verify OTP & Login
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="rounded-xl border border-outline-variant bg-surface-container-low py-3 font-body text-sm font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono-label text-on-surface-variant/60">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Email OTP Protected Access</span>
        </div>

        <button
          onClick={() => onNavigate('signup')}
          className="mx-auto mt-5 block font-body text-xs font-semibold text-on-surface-variant hover:text-primary cursor-pointer"
        >
          New to TransitOps? Create an account
        </button>
      </motion.div>
    </section>
  );
}
