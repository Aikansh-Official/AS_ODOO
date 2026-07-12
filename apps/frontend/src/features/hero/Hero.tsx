import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <section
      id="home"
      className="relative flex w-full items-center justify-center px-4"
    >
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CBD5E133_1px,transparent_1px),linear-gradient(to_bottom,#CBD5E133_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-outline-variant bg-white px-6 py-14 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:px-12 md:py-20"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary" />

        <h1 className="relative font-headline text-4xl font-bold leading-tight tracking-tight text-on-surface sm:text-5xl md:text-6xl">
          Be one with the city,
          <br />
          <span className="text-primary">
            not the chaos
          </span>
        </h1>

        <p className="relative mx-auto mt-6 max-w-xl font-body text-base leading-8 text-on-surface-variant sm:text-lg">
          Experience urban navigation reimagined with real-time logistics intelligence.
        </p>

        <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => onNavigate('signup')}
            className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-body text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,122,0,0.22)] transition-transform hover:scale-[1.03] cursor-pointer"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-full border border-outline bg-white px-7 py-3.5 font-body text-sm font-semibold text-on-surface shadow-sm transition-colors hover:border-primary hover:text-primary cursor-pointer"
          >
            Learn More
          </button>
        </div>
      </motion.div>
    </section>
  );
}