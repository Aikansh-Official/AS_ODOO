import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, Mail, ShieldCheck, Truck, Users } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30';
const iconInputClass = `${inputClass} pl-11`;

export function CompanySignupPage({ onNavigate }) {
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
          <div className="h-1 bg-primary" />
          <div className="p-7 sm:p-10">
            <div className="text-center">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Company Registration
              </h1>
              <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-7 text-on-surface-variant sm:text-base">
                Create a TransitOps workspace for your fleet, dispatch teams, vehicles, routes, and operations managers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 grid gap-5">
              <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                Company Name
                <span className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                  <input className={iconInputClass} required placeholder="Enter legal company name" />
                </span>
              </label>

              <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                Business Email
                <span className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                  <input className={iconInputClass} required type="email" placeholder="name@company.com" />
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                  Industry
                  <select className={inputClass} required defaultValue="">
                    <option value="" disabled>Select industry</option>
                    <option>Public Transport</option>
                    <option>Logistics & Delivery</option>
                    <option>School Transport</option>
                    <option>Corporate Shuttle</option>
                    <option>Emergency Fleet</option>
                  </select>
                </label>

                <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                  Fleet Size
                  <select className={inputClass} required defaultValue="">
                    <option value="" disabled>Select size</option>
                    <option>1-10 vehicles</option>
                    <option>11-50 vehicles</option>
                    <option>51-200 vehicles</option>
                    <option>200+ vehicles</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                  Admin Name
                  <span className="relative">
                    <Users className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                    <input className={iconInputClass} required placeholder="Primary admin name" />
                  </span>
                </label>

                <label className="grid gap-2 font-body text-sm font-semibold text-on-surface">
                  Primary Fleet Type
                  <span className="relative">
                    <Truck className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" />
                    <input className={iconInputClass} required placeholder="Buses, trucks, vans" />
                  </span>
                </label>
              </div>

              <label className="mt-1 flex items-start gap-3 font-body text-xs leading-6 text-on-surface-variant">
                <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-outline-variant accent-primary" />
                <span>I agree to TransitOps terms, privacy policy, and responsible use of operational transport data.</span>
              </label>

              <button
                type="submit"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-body text-base font-semibold text-white shadow-[0_10px_24px_rgba(255,122,0,0.22)] transition-transform hover:scale-[1.01] cursor-pointer"
              >
                Create Company Account
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <button
              onClick={() => onNavigate('login')}
              className="mx-auto mt-7 flex items-center gap-2 font-body text-sm font-semibold text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              Already registered? Log in
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}