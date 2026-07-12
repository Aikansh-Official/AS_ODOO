import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <section
      id="home"
      className="w-full flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] px-6 py-14 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_24px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl sm:px-12 md:py-20"
      >
        {/* Logistics radial glow in background of card */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_65%)] opacity-10" />

        <h1 className="relative font-headline text-4xl font-bold leading-tight tracking-tight text-on-surface sm:text-5xl md:text-6xl">
          Be one with the city,
          <br />
          <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
            not the chaos
          </span>
        </h1>

        <p className="relative mx-auto mt-6 max-w-xl font-body text-base text-on-surface-variant sm:text-lg">
          Experience urban navigation reimagined with real-time logistics intelligence.
        </p>

        <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => onNavigate('features')}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-tertiary px-7 py-3.5 font-body text-sm font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-transform hover:scale-[1.03] cursor-pointer"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="rounded-full border border-white/10 bg-white/5 px-7 py-3.5 font-body text-sm font-semibold text-on-surface backdrop-blur-md transition-colors hover:bg-white/10 cursor-pointer"
          >
            Learn More
          </button>
        </div>
      </motion.div>
    </section>
  );
}
