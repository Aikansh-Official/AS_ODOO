import { CheckCircle2, XCircle, Info } from 'lucide-react';

const variants = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
  },
};

export function Toast({ toast }) {
  if (!toast) return null;

  const variant = variants[toast.type] || variants.info;
  const Icon = variant.icon;

  return (
    <div className={`sticky top-3 z-[80] mb-5 flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${variant.className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}
