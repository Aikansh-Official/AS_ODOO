import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Building2, IdCard, KeyRound, ShieldAlert, LogOut,
  Camera, Phone, MapPin, FileText, Truck, Shield, AlertTriangle, Save,
  HeartPulse, Droplet, BadgeCheck, RefreshCcw, UserRound,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Toast } from '../components/common/Toast';
import { isLicenseExpired } from '../data/mockData';
import {
  DEMO_COMPANY_CODE, portalLogin, saveDriverProfile, fetchDriver,
} from '../services/fleetStore';

const inputClass =
  'w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30';
const iconInputClass = `${inputClass} pl-11`;

const MAX_PHOTO_BYTES = 1_500_000; // ~1.5MB, keeps localStorage happy

export function EmployeePortal({ onNavigate }) {
  const [stage, setStage] = useState('gate'); // 'gate' | 'portal'
  const [driver, setDriver] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4200);
  };

  const handleAuthed = (record) => {
    setDriver(record);
    setStage('portal');
  };

  const handleLogout = () => {
    setDriver(null);
    setStage('gate');
    onNavigate('home');
  };

  return (
    <section className="w-full px-4 py-4">
      <Toast toast={toast} />
      <AnimatePresence mode="wait">
        {stage === 'gate' ? (
          <GateCard key="gate" onNavigate={onNavigate} onAuthed={handleAuthed} showToast={showToast} />
        ) : (
          <PortalDashboard key="portal" driver={driver} setDriver={setDriver} onLogout={handleLogout} showToast={showToast} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Stage 1: Company-code gate + employee login ───

function GateCard({ onNavigate, onAuthed, showToast }) {
  const [companyCode, setCompanyCode] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const record = await portalLogin(companyCode, employeeCode);
      onAuthed(record);
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="h-1 bg-primary" />
      <div className="p-8 md:p-10">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h2 className="mt-6 font-headline text-2xl font-bold tracking-tight text-on-surface">
            Driver Portal Access
          </h2>
          <p className="mt-2 font-body text-xs text-on-surface-variant">
            Enter the company code shared by your company and your employee code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                <Building2 className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                required
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                placeholder="Company Code"
                className={iconInputClass}
              />
            </div>
            <p className="mt-1.5 font-body text-[11px] leading-5 text-on-surface-variant">
              Demo company code: <span className="font-mono-label font-semibold text-primary">{DEMO_COMPANY_CODE}</span>
            </p>
          </div>

          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                <IdCard className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                placeholder="Employee Code (e.g. DRV-001)"
                className={iconInputClass}
              />
            </div>
            <p className="mt-1.5 font-body text-[11px] leading-5 text-on-surface-variant">
              Your employee code is issued by your fleet incharge.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-body text-sm font-semibold text-white shadow-[0_4px_16px_rgba(255,122,0,0.28)] transition-transform hover:scale-[1.02] active:scale-98 cursor-pointer disabled:opacity-55"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                Enter Portal
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
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono-label text-on-surface-variant/60">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Company-Verified Driver Access</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stage 2: Driver dashboard ───

function PortalDashboard({ driver, setDriver, onLogout, showToast }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    phone: driver.phone || '',
    address: driver.address || '',
    aadhar: driver.aadhar || '',
    emergencyContact: driver.emergencyContact || '',
    bloodGroup: driver.bloodGroup || '',
  });
  const [saving, setSaving] = useState(false);

  const expired = isLicenseExpired(driver);

  // Refresh from the backend so an assignment made by the incharge shows up
  // (e.g. when returning to the tab).
  const refresh = useCallback(async () => {
    try {
      const latest = await fetchDriver(driver.id);
      if (latest) setDriver(latest);
    } catch {
      // Non-fatal: keep the currently shown data.
    }
  }, [driver.id, setDriver]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please choose an image file.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      showToast('error', 'Image is too large. Please pick one under 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await saveDriverProfile(driver.id, { photo: reader.result });
        setDriver(updated);
        showToast('success', 'Profile photo updated.');
      } catch (error) {
        showToast('error', error.message);
      }
    };
    reader.onerror = () => showToast('error', 'Could not read that image.');
    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (form.aadhar && !/^\d{12}$/.test(form.aadhar.replace(/\s/g, ''))) {
      showToast('error', 'Aadhaar number must be 12 digits.');
      return;
    }
    setSaving(true);
    try {
      const updated = await saveDriverProfile(driver.id, {
        phone: form.phone,
        address: form.address,
        aadhar: form.aadhar,
        emergencyContact: form.emergencyContact,
        bloodGroup: form.bloodGroup,
      });
      setDriver(updated);
      showToast('success', 'Your details were saved.');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = driver.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const safetyColor = driver.safetyScore >= 80 ? 'text-tertiary' : driver.safetyScore >= 60 ? 'text-amber-600' : 'text-error';
  const safetyBar = driver.safetyScore >= 80 ? 'bg-tertiary' : driver.safetyScore >= 60 ? 'bg-amber-500' : 'bg-error';
  const statusMap = {
    'Available': 'bg-tertiary/10 text-tertiary',
    'On Trip': 'bg-primary/10 text-primary',
    'Off Duty': 'bg-outline/20 text-on-surface-variant',
    'Suspended': 'bg-error/10 text-error',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-4xl"
    >
      {/* Top bar */}
      <div className="mb-5 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-3 py-2 font-body text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 px-3 py-2 font-body text-xs font-semibold text-error transition-colors hover:bg-error/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>

      {/* Profile header */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="h-1.5 bg-primary" />
        <div className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
          <div className="relative shrink-0">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-high">
              {driver.photo ? (
                <img src={driver.photo} alt={driver.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-headline text-3xl font-bold text-on-surface-variant">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_16px_rgba(255,122,0,0.35)] transition-transform hover:scale-105 cursor-pointer"
              title="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">{driver.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-mono-label text-[11px] font-semibold text-on-surface-variant">
                <IdCard className="h-3.5 w-3.5" /> {driver.id}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-body text-[11px] font-semibold text-on-surface-variant">
                <Truck className="h-3.5 w-3.5" /> Driver
              </span>
              <span className={`rounded-full px-3 py-1 font-body text-[11px] font-bold ${statusMap[driver.status] || statusMap['Available']}`}>
                {driver.status.toUpperCase()}
              </span>
            </div>
            <p className="font-body text-xs text-on-surface-variant">
              Tap the camera to update your profile photo.
            </p>
          </div>
        </div>
      </div>

      {/* Assigned vehicle — read-only, set by incharge */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-headline text-base font-bold text-on-surface">Assigned Vehicle</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-mono-label text-[10px] font-semibold text-on-surface-variant">
            <BadgeCheck className="h-3.5 w-3.5" /> Read-only
          </span>
        </div>
        <div className="p-6">
          {driver.assignedVehicle ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InfoCard label="Vehicle" value={driver.assignedVehicle.name} />
              <InfoCard label="Vehicle ID" value={driver.assignedVehicle.id} />
              <InfoCard
                label="Registration"
                value={driver.assignedVehicle.licenseNumber || '—'}
                sub={driver.assignedVehicle.type ? `${driver.assignedVehicle.type} vehicle` : undefined}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low py-8 text-center">
              <Truck className="mb-2 h-9 w-9 text-on-surface-variant opacity-40" />
              <span className="font-body text-sm font-semibold text-on-surface-variant">No vehicle assigned yet</span>
              <span className="mt-1 font-body text-xs text-on-surface-variant/70">Your fleet incharge will assign a vehicle here.</span>
            </div>
          )}
          <p className="mt-4 flex items-center gap-2 font-body text-[11px] text-on-surface-variant">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            This field can only be changed by your owner/incharge from the control center. Hit Refresh to pull the latest assignment.
          </p>
        </div>
      </div>

      {/* Driver / license info — read-only */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 border-b border-outline-variant px-6 py-4">
          <Shield className="h-4.5 w-4.5 text-primary" />
          <h2 className="font-headline text-base font-bold text-on-surface">Driver Credentials</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard label="License Number" value={driver.licenseNumber} />
            <InfoCard label="License Category" value={`Category ${driver.licenseCategory}`} />
            <InfoCard label="License Expiry" value={driver.licenseExpiry} badge={expired ? 'EXPIRED' : null} />
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <span className="font-body text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Safety Score</span>
              <div className="flex items-center gap-3">
                <span className={`font-headline text-2xl font-bold ${safetyColor}`}>{driver.safetyScore}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-outline/15">
                  <div className={`h-full rounded-full ${safetyBar}`} style={{ width: `${driver.safetyScore}%` }} />
                </div>
              </div>
            </div>
          </div>
          {expired && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-error/15 bg-error/5 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-error" />
              <span className="font-body text-xs font-semibold text-error">
                Your license expired on {driver.licenseExpiry}. You cannot be assigned to trips until it is renewed.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Editable contact & documents */}
      <form
        onSubmit={handleSave}
        className="mt-5 overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      >
        <div className="flex items-center gap-2 border-b border-outline-variant px-6 py-4">
          <UserRound className="h-4.5 w-4.5 text-primary" />
          <h2 className="font-headline text-base font-bold text-on-surface">Contact & Documents</h2>
          <span className="ml-auto font-body text-[11px] text-on-surface-variant">Editable by you</span>
        </div>
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <Field label="Phone Number" icon={Phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className={iconInputClass}
            />
          </Field>

          <Field label="Aadhaar Number" icon={FileText}>
            <input
              type="text"
              inputMode="numeric"
              value={form.aadhar}
              onChange={(e) => setForm({ ...form, aadhar: e.target.value.replace(/[^\d\s]/g, '').slice(0, 14) })}
              placeholder="1234 5678 9012"
              className={iconInputClass}
            />
          </Field>

          <Field label="Address" icon={MapPin} full>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="House / street, city, state, PIN"
              className={`${iconInputClass} resize-none`}
            />
          </Field>

          <Field label="Emergency Contact" icon={HeartPulse}>
            <input
              type="tel"
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              placeholder="Next-of-kin phone number"
              className={iconInputClass}
            />
          </Field>

          <Field label="Blood Group" icon={Droplet}>
            <select
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              className={iconInputClass}
            >
              <option value="">Select blood group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-body text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,122,0,0.22)] transition-transform hover:scale-[1.01] cursor-pointer disabled:opacity-55 sm:w-auto sm:px-8"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Details
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4 mb-4 flex items-center justify-center gap-2 font-mono-label text-[10px] text-on-surface-variant/60">
        <KeyRound className="h-3.5 w-3.5" />
        <span>TransitOps Driver Portal • Session held locally on this device</span>
      </div>
    </motion.div>
  );
}

function Field({ label, icon: Icon, children, full }) {
  return (
    <label className={`grid gap-2 font-body text-sm font-semibold text-on-surface ${full ? 'sm:col-span-2' : ''}`}>
      {label}
      <span className="relative">
        <Icon className="absolute left-4 top-3.5 h-4.5 w-4.5 -translate-y-0 text-on-surface-variant" />
        {children}
      </span>
    </label>
  );
}

function InfoCard({ label, value, badge, sub }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-4">
      <span className="font-body text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-body text-sm font-bold text-on-surface">{value}</span>
        {badge && <span className="rounded-full bg-error/10 px-2 py-0.5 font-body text-[9px] font-bold text-error">{badge}</span>}
      </div>
      {sub && <span className="font-body text-[11px] text-on-surface-variant">{sub}</span>}
    </div>
  );
}
