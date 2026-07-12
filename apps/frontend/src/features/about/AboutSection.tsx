import { motion } from 'framer-motion';

const STATS = [
  { value: '10M+', label: 'Trips Routed', desc: 'Real-time telemetry streams' },
  { value: '42ms', label: 'Avg. Response', desc: 'Global edge computation' },
  { value: '99.98%', label: 'Uptime SLA', desc: 'High-availability corridors' },
];

export function AboutSection() {
  return (
    <section id="about" className="w-full max-w-5xl px-4 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full grid gap-10 md:grid-cols-12 items-center"
      >
        {/* Left Side: Copy */}
        <div className="md:col-span-5 text-left">
          <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Corporate Profile
          </span>
          <h2 className="mt-2 font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Logistics corridors, rebuilt around live data
          </h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-on-surface-variant">
            UrbanFlow fuses live transit networks, cargo telemetry, and distribution signals into a single operational intelligence layer. 
            We turn static shipping charts into adaptive grids, minimizing delivery delays, fuel usage, and routing errors.
          </p>
        </div>

        {/* Right Side: Frosted Glass Stats Cards */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="border border-white/10 bg-white/[0.02] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              <p className="font-mono-label text-2xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="mt-1.5 font-body text-xs font-semibold text-on-surface">
                {stat.label}
              </p>
              <p className="mt-1 font-body text-[10px] text-on-surface-variant">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
