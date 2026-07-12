import { Waypoints } from 'lucide-react';

// Placeholder mark — swap for the final brand logo asset when it's ready.
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-error text-surface">
        <Waypoints className="h-4.5 w-4.5" strokeWidth={2.5} />
      </span>
      <span className="font-headline text-lg font-bold tracking-tight text-on-surface">
        UrbanFlow
      </span>
    </div>
  );
}
