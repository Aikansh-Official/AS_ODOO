import { Logo } from '../common/Logo';

export function Footer() {
  return (
    <footer className="z-10 border-t border-outline-variant bg-white px-6 py-4 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">
        <Logo />
        <p className="font-body text-xs text-on-surface-variant">
          &copy; {new Date().getFullYear()} TransitOps. All rights reserved.
        </p>
      </div>
    </footer>
  );
}