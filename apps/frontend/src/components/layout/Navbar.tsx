import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
];

interface NavbarProps {
  active: string;
  setActive: (id: string) => void;
}

export function Navbar({ active, setActive }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-outline-variant bg-white/90 px-6 py-4 shadow-sm backdrop-blur-md md:px-10">
      <Logo />

      <nav className="hidden items-center gap-1 rounded-full border border-outline-variant bg-surface-container-high p-1 md:flex">
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => setActive(link.id)}
            className="relative rounded-full px-5 py-2 font-body text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface cursor-pointer"
          >
            {active === link.id && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-outline-variant"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative z-10 ${active === link.id ? 'text-on-surface' : ''}`}>
              {link.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex w-[132px] items-center justify-end">
        <button
          onClick={() => setActive('login')}
          className={`rounded-full border px-5 py-2 font-body text-xs font-semibold transition-all cursor-pointer ${
            active === 'login'
              ? 'border-primary bg-primary text-white shadow-[0_8px_20px_rgba(255,122,0,0.18)]'
              : 'border-outline bg-white text-on-surface-variant hover:border-primary hover:text-primary'
          }`}
        >
          Sign In
        </button>
      </div>
    </header>
  );
}