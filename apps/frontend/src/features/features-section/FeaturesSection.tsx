import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FEATURES } from '../../lib/features-data';
import { FeatureCard } from './FeatureCard';

export function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const activeFeature = FEATURES[activeIndex];

  const navigateTo = (newIndex: number) => {
    const dir = newIndex > activeIndex ? 1 : -1;
    setActiveIndex(newIndex);
    setPage([newIndex, dir]);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % FEATURES.length;
    navigateTo(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + FEATURES.length) % FEATURES.length;
    navigateTo(prevIdx);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <section id="features" className="w-full max-w-5xl flex flex-col items-center justify-center px-4 py-4">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Operations Center
        </span>
        <h2 className="mt-1 font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Core Logistics Intelligence
        </h2>
      </div>

      {/* Horizontal Tabs Selection bar */}
      <div className="w-full overflow-x-auto flex gap-1.5 justify-start md:justify-center p-1.5 bg-surface-container-low rounded-xl border border-outline-variant mb-6 max-w-4xl scrollbar-none whitespace-nowrap shadow-sm">
        {FEATURES.map((feature, idx) => {
          const isActive = idx === activeIndex;
          const FIcon = feature.icon;
          return (
            <button
              key={feature.title}
              onClick={() => navigateTo(idx)}
              className={`relative px-4 py-2 font-body text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer z-10 ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-feature-tab"
                  className="absolute inset-0 rounded-lg bg-white border border-primary/30 shadow-md"
                  style={{ boxShadow: '0 2px 8px rgba(255,122,0,0.15)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <FIcon className={`relative h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
              <span className="relative">{feature.title}</span>
            </button>
          );
        })}
      </div>

      {/* Central Carousel Layout */}
      <div className="relative w-full max-w-4xl flex items-center justify-center">
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          className="absolute left-[-20px] md:left-[-54px] z-20 flex h-10 w-10 items-center justify-center rounded-full border border-outline bg-white text-on-surface-variant transition-all hover:text-primary hover:border-primary active:scale-95 cursor-pointer shadow-md"
          aria-label="Previous Feature"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Feature Card Wrapper (Frosted Glass) */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 md:p-10 shadow-[0_16px_40px_rgba(15,23,42,0.08)] min-h-[380px] flex items-center">
          <div className="w-full">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full"
              >
                <FeatureCard {...activeFeature} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          className="absolute right-[-20px] md:right-[-54px] z-20 flex h-10 w-10 items-center justify-center rounded-full border border-outline bg-white text-on-surface-variant transition-all hover:text-primary hover:border-primary active:scale-95 cursor-pointer shadow-md"
          aria-label="Next Feature"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Pagination dots */}
      <div className="flex gap-2.5 mt-6 z-10">
        {FEATURES.map((_, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              onClick={() => navigateTo(idx)}
              className="group p-1.5 focus:outline-none cursor-pointer"
              aria-label={`Go to feature ${idx + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive ? 'w-6 bg-primary' : 'w-2 bg-outline group-hover:bg-on-surface-variant'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
