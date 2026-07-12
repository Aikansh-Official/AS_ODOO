import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About Us' },
];

interface NavbarProps {
  active: string;
  setActive: (id: string) => void;
}

export function Navbar({ active, setActive }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
      <Logo />

      <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-surface-container-low/50 p-1.5 backdrop-blur-xl md:flex">
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => setActive(link.id)}
            className="relative rounded-full px-5 py-2 font-body text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface cursor-pointer"
          >
            {active === link.id && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full bg-on-surface"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative z-10 ${active === link.id ? 'text-surface' : ''}`}>
              {link.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="hidden w-[132px] md:block" aria-hidden />
    </header>
  );
}
