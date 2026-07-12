// Logistics themed background atmosphere
export function BackgroundScene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute left-1/2 top-[-10%] h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="absolute bottom-[-20%] left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full bg-tertiary/5 blur-[160px]" />

      <svg
        className="absolute bottom-0 left-0 h-[45%] w-full opacity-40"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="roadline-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="roadline-white" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {Array.from({ length: 9 }).map((_, i) => {
          const originX = 500 + (i - 4) * 14;
          const endX = (i / 8) * 1000;
          const stroke = i % 2 === 0 ? 'url(#roadline-blue)' : 'url(#roadline-white)';
          return (
            <line
              key={i}
              x1={originX}
              y1={0}
              x2={endX}
              y2={400}
              stroke={stroke}
              strokeWidth={i === 4 ? 2 : 1.2}
            />
          );
        })}
      </svg>
    </div>
  );
}
