import { Logo } from '../common/Logo';

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-4 md:px-10 z-10 bg-background/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">
        <Logo />
        <p className="font-body text-xs text-on-surface-variant">
          &copy; {new Date().getFullYear()} UrbanFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
