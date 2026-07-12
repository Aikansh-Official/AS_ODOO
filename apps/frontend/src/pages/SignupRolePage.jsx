import { motion } from 'framer-motion';
import { ArrowRight, Building2, Truck, LogIn } from 'lucide-react';

export function SignupRolePage({ onNavigate }) {
  const roles = [
    {
      id: 'signupCompany',
      icon: Building2,
      title: 'Sign up as Company',
      description:
        'Register your transport business, manage fleet operations, assign teams, and monitor delivery performance from one control center.',
      primary: true,
    },
    {
      id: 'signupEmployee',
      icon: Truck,
      title: 'Sign up as Employee',
      description:
        'Join your company workspace as a driver, dispatcher, fleet operator, or maintenance staff member with secure employee access.',
      primary: false,
    },
  ];

  return (
    <section className="w-full px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-3xl text-center"
        >
          <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl">
            Join <span className="text-primary">TransitOps</span>
          </h1>
          <p className="mt-5 font-body text-base leading-8 text-on-surface-variant sm:text-lg">
            Choose the account type that matches your work. TransitOps supports both fleet businesses and individual transport team members.
          </p>
        </motion.div>

        <div className="mt-14 grid w-full gap-6 lg:grid-cols-2">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.article
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className={`flex min-h-[320px] flex-col rounded-2xl border bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${
                  role.primary ? 'border-primary/60' : 'border-outline-variant'
                }`}
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-xl ${role.primary ? 'bg-primary/15 text-primary' : 'bg-tertiary/15 text-tertiary'}`}>
                  <Icon className="h-7 w-7" />
                </span>
                <h2 className="mt-8 font-headline text-2xl font-bold tracking-tight text-on-surface">
                  {role.title}
                </h2>
                <p className="mt-4 flex-1 font-body text-sm leading-7 text-on-surface-variant">
                  {role.description}
                </p>
                <button
                  onClick={() => onNavigate(role.id)}
                  className={`mt-8 flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-body text-sm font-semibold transition-all cursor-pointer ${
                    role.primary
                      ? 'border-primary bg-primary text-white shadow-[0_10px_24px_rgba(255,122,0,0.22)] hover:scale-[1.01]'
                      : 'border-outline bg-white text-on-surface hover:border-primary hover:text-primary'
                  }`}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.article>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate('login')}
          className="mt-10 inline-flex items-center gap-2 font-body text-sm font-semibold text-on-surface-variant hover:text-primary cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          Already have an account? Log in here
        </button>
      </div>
    </section>
  );
}