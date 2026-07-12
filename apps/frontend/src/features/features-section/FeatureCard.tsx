import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Navigation, Radar, Clock, TrainFront, BellRing, AlertTriangle, CheckCircle } from 'lucide-react';
import type { FeatureItem } from '../../lib/features-data';

export function FeatureCard({ icon: Icon, title, description }: FeatureItem) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-8 w-full items-stretch min-h-[360px]">
      {/* Left Column: Text & Meta Details */}
      <div className="md:col-span-5 flex flex-col justify-center text-left">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>

        <h3 className="mt-6 font-headline text-2xl font-bold tracking-tight text-on-surface">
          {title}
        </h3>
        
        <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant">
          {description}
        </p>

        {/* Decorative logistics tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="text-[10px] font-mono-label px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-on-surface-variant">
            Logistics Layer v4.0
          </span>
          <span className="text-[10px] font-mono-label px-2.5 py-1 rounded-full bg-primary/10 border border-primary/10 text-primary">
            Active Optimization
          </span>
        </div>
      </div>

      {/* Right Column: Beautiful Framer Motion Animations */}
      <div className="md:col-span-7 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden min-h-[220px] md:min-h-full relative shadow-inner">
        {/* Grid lines inside container for technical look */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        <div className="w-full h-full flex items-center justify-center p-6 relative z-10">
          <FeatureVisualizer title={title} />
        </div>
      </div>
    </div>
  );
}

/* Feature Visualizer Router */
function FeatureVisualizer({ title }: { title: string }) {
  switch (title) {
    case 'Real-Time Routing':
      return <RealTimeRoutingVisual />;
    case 'Live Traffic Intelligence':
      return <LiveTrafficVisual />;
    case 'Predictive ETA':
      return <PredictiveETAVisual />;
    case 'Multi-Modal Transit':
      return <MultiModalVisual />;
    case 'Smart Alerts':
      return <SmartAlertsVisual />;
    case 'Analytics Dashboard':
      return <AnalyticsVisual />;
    default:
      return <div className="text-on-surface-variant font-mono-label text-xs">Awaiting Telemetry...</div>;
  }
}

/* 1. Real-Time Routing Visual: Path deviation around a blocked route */
function RealTimeRoutingVisual() {
  const [routeBlocked, setRouteBlocked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRouteBlocked(prev => !prev);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[280px]">
      <div className="w-full aspect-[2/1] relative border border-white/5 rounded-xl bg-surface-dim/40 overflow-hidden">
        {/* Nodes */}
        <div className="absolute left-[10%] top-[50%] -translate-y-1/2 w-3 h-3 rounded-full bg-secondary border-2 border-background z-20" />
        <div className="absolute right-[10%] top-[50%] -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background z-20" />
        
        {/* Path SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 140">
          {/* Main Original Path (Blocked) */}
          <motion.path
            d="M 28 70 L 140 70 L 252 70"
            fill="none"
            stroke={routeBlocked ? "var(--color-error)" : "var(--color-primary)"}
            strokeWidth="3"
            strokeDasharray={routeBlocked ? "4 4" : "0"}
            animate={{ stroke: routeBlocked ? "#f43f5e" : "#3b82f6" }}
            transition={{ duration: 0.5 }}
          />

          {/* Rerouted path */}
          {routeBlocked && (
            <motion.path
              d="M 28 70 Q 140 -10, 252 70"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}

          {/* Animated vehicle dot */}
          <motion.circle
            r="5"
            fill="#ffffff"
            shadow-lg="true"
            animate={
              routeBlocked
                ? {
                    x: [28, 90, 140, 190, 252],
                    y: [70, 40, 30, 40, 70],
                  }
                : {
                    x: [28, 140, 252],
                    y: [70, 70, 70],
                  }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>

        {/* Hazard block indicator */}
        <AnimatePresence>
          {routeBlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute left-[125px] top-[50px] w-6 h-6 rounded-md bg-error flex items-center justify-center text-white"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between w-full text-[11px] font-mono-label text-on-surface-variant">
        <span>A: Hub West</span>
        <span className={routeBlocked ? "text-error font-semibold" : "text-primary"}>
          {routeBlocked ? "Rerouting Active" : "Optimal Path"}
        </span>
        <span>B: Dock Express</span>
      </div>
    </div>
  );
}

/* 2. Live Traffic Intelligence: Sweeping radar screen */
function LiveTrafficVisual() {
  return (
    <div className="relative w-40 h-40 rounded-full border border-white/10 bg-surface-container-lowest flex items-center justify-center overflow-hidden">
      {/* Radar rings */}
      <div className="absolute w-32 h-32 rounded-full border border-white/5" />
      <div className="absolute w-24 h-24 rounded-full border border-white/5" />
      <div className="absolute w-16 h-16 rounded-full border border-white/5" />
      <div className="absolute w-8 h-8 rounded-full border border-white/5" />

      {/* Grid cross lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-white/5" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-full w-px bg-white/5" />
      </div>

      {/* Sweeper arm */}
      <motion.div
        className="absolute inset-0 origin-center bg-gradient-to-tr from-transparent via-transparent to-primary/25 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulsing traffic blips */}
      <div className="absolute top-[25%] left-[30%] w-2 h-2 rounded-full bg-primary animate-pulse" />
      <div className="absolute bottom-[35%] right-[25%] w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:1s]" />
      <div className="absolute top-[60%] left-[65%] w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse [animation-delay:2s]" />
      <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 rounded-full bg-error animate-pulse [animation-delay:1.5s]" />

      <Radar className="w-6 h-6 text-primary/40 relative z-10" />
    </div>
  );
}

/* 3. Predictive ETA: Live count down countdown and transit progress slider */
function PredictiveETAVisual() {
  const [eta, setEta] = useState(24);

  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => (prev === 24 ? 22 : prev === 22 ? 23 : 24));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[260px] flex flex-col gap-4">
      {/* Frosted details dashboard card */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono-label text-on-surface-variant block uppercase tracking-wider">Predictive ETA</span>
            <span className="text-sm font-semibold text-on-surface">Transit Route A</span>
          </div>
        </div>
        <div className="text-right">
          <motion.span
            key={eta}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold font-mono-label text-primary block"
          >
            {eta}m
          </motion.span>
          <span className="text-[9px] font-mono-label text-emerald-400">Live Calibration</span>
        </div>
      </div>

      {/* Map line progress slider */}
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1 bg-white/5 rounded-full" />
        <motion.div 
          className="absolute left-0 h-1 bg-primary rounded-full"
          animate={{ width: ["15%", "85%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-white border border-primary flex items-center justify-center shadow-lg"
          animate={{ left: ["15%", "85%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </div>
    </div>
  );
}

/* 4. Multi-Modal Transit: Mode highlights and routes */
function MultiModalVisual() {
  const [activeMode, setActiveMode] = useState(0);
  const modes = [
    { icon: Navigation, name: 'Logistics Fleet', time: '14 min', cost: 'Optimal' },
    { icon: TrainFront, name: 'Cargo Rail', time: '38 min', cost: 'Economical' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMode(prev => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[260px] flex flex-col gap-2.5">
      {modes.map((mode, idx) => {
        const IsActive = activeMode === idx;
        const MIcon = mode.icon;
        return (
          <motion.div
            key={idx}
            animate={{
              backgroundColor: IsActive ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.0)",
              borderColor: IsActive ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.03)",
            }}
            className={`p-3 rounded-xl border flex items-center justify-between text-left transition-colors`}
          >
            <div className="flex items-center gap-3">
              <span className={`h-8 w-8 rounded-lg flex items-center justify-center ${IsActive ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-on-surface-variant'}`}>
                <MIcon className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-semibold text-on-surface block">{mode.name}</span>
                <span className="text-[10px] font-mono-label text-on-surface-variant">{mode.cost}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${IsActive ? 'text-primary' : 'text-on-surface-variant'}`}>{mode.time}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* 5. Smart Alerts: Popover delay warning layout */
function SmartAlertsVisual() {
  return (
    <div className="w-full max-w-[280px] relative">
      <motion.div
        initial={{ y: 5, opacity: 0.8 }}
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="p-5 rounded-2xl bg-surface-low border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-md relative"
      >
        {/* Glow behind warning */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-error/5 blur-md" />

        <div className="flex gap-4.5">
          <span className="h-10 w-10 shrink-0 rounded-xl bg-error/15 text-error border border-error/20 flex items-center justify-center animate-pulse">
            <BellRing className="w-5 h-5" />
          </span>
          <div className="text-left flex-1">
            <span className="text-xs font-semibold text-on-surface block">Congestion Warning</span>
            <span className="text-[10px] font-mono-label text-on-surface-variant block mt-0.5">Route A-12 Delay • +12m ETA</span>
            <div className="mt-3.5 flex gap-2">
              <button className="text-[9px] font-mono-label px-2.5 py-1.5 rounded-lg bg-primary text-white border border-primary/20 flex items-center gap-1 cursor-pointer">
                <Navigation className="w-2.5 h-2.5" />
                Reroute (-8m)
              </button>
              <button className="text-[9px] font-mono-label px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-on-surface-variant hover:bg-white/10 cursor-pointer">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* 6. Analytics Dashboard: Miniature pulsing chart */
function AnalyticsVisual() {
  const bars = [
    { height: "45%" },
    { height: "70%" },
    { height: "55%" },
    { height: "90%" },
    { height: "60%" },
    { height: "80%" },
  ];

  return (
    <div className="w-full max-w-[240px] flex flex-col gap-4">
      {/* Visual Analytics Bar Chart */}
      <div className="h-28 flex items-end gap-2.5 justify-center border-b border-white/10 pb-1 relative">
        {bars.map((bar, idx) => (
          <motion.div
            key={idx}
            className="w-5 rounded-t-sm bg-gradient-to-t from-primary/30 to-primary relative group overflow-hidden"
            initial={{ height: "10%" }}
            animate={{ height: bar.height }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: idx * 0.15,
            }}
          >
            {/* Gloss shine inside bar */}
            <div className="absolute inset-0 bg-white/10 w-full h-[50%]" />
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono-label text-on-surface-variant">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-primary" /> Delivery Efficiency
        </span>
        <span className="text-primary font-semibold">98.4%</span>
      </div>
    </div>
  );
}
