import { CheckCircle2, X } from "lucide-react";

export default function Toast({
  open = false,
  message = "Changes saved successfully.",
  onClose = () => {},
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2
          size={17}
          className="text-emerald-600"
          aria-hidden="true"
        />
      </div>

      <p className="min-w-0 flex-1 text-sm font-medium text-slate-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}