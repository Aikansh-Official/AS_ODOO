import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, IdCard, Mail, Phone, UserRound } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30';
const iconInputClass = `${inputClass} pl-11`;

export function EmployeeSignupPage({ onNavigate }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onNavigate('login');
  };

  return (
    <section className="w-full px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => onNavigate('signup')}
          className="mb-8 inline-flex items-center gap-2 font-body text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to role selection
        </button>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
        >
          <div className="h-1 bg-tertiary" />
          <div className="p-7 sm:p-10">
            <div className="text-center">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Employee Registration
              </h1>
              <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-7 text-on-surface-variant sm:text-base">
                Join your transport organization as a driver, dispatcher, route planner, or fleet operations employee.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 grid gap-5">
              <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                Full Name
                <span className="relative">
                  <UserRound className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                  <input className={iconInputClass} required placeholder="Enter your full name" />
                </span>
              </label>

              <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                Work Email
                <span className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                  <input className={iconInputClass} required type="email" placeholder="employee@company.com" />
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                  Employee Role
                  <span className="relative">
                    <BriefcaseBusiness className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                    <select className={iconInputClass} required defaultValue="">
                      <option value="" disabled>Select role</option>
                      <option>Driver</option>
                      <option>Dispatcher</option>
                      <option>Fleet Manager</option>
                      <option>Maintenance Staff</option>
                      <option>Operations Analyst</option>
                    </select>
                  </span>
                </label>

                <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                  Employee ID
                  <span className="relative">
                    <IdCard className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                    <input className={iconInputClass} placeholder="Optional staff ID" />
                  </span>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                  Phone Number
                  <span className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                    <input className={iconInputClass} required type="tel" placeholder="+91 98765 43210" />
                  </span>
                </label>

                <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                  Company Invite Code
                  <span className="relative">
                    <BadgeCheck className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                    <input className={iconInputClass} required placeholder="Invite or company code" />
                  </span>
                </label>
              </div>

              <label className="mt-1 flex items-start gap-3 font-body text-xs leading-6 text-on-surface-variant">
                <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-outline-variant accent-primary" />
                <span>I confirm that my information is accurate and I am authorized to join this company workspace.</span>
              </label>

              <button
                type="submit"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-body text-base font-semibold text-white shadow-[0_10px_24px_rgba(255,122,0,0.22)] transition-transform hover:scale-[1.01] cursor-pointer"
              >
                Create Employee Account
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <button
              onClick={() => onNavigate('login')}
              className="mx-auto mt-7 flex font-body text-sm font-semibold text-on-surface-variant hover:text-primary cursor-pointer"
            >
              Already have employee access? Log in
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}