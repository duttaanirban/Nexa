import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
}) {
  return (
    <section
      role="alert"
      aria-labelledby="error-state-title"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
        <AlertTriangle size={20} aria-hidden="true" />
      </div>

      <div>
        <h2
          id="error-state-title"
          className="text-sm font-semibold text-slate-800"
        >
          {title}
        </h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      </div>

      {typeof onRetry === "function" && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <RefreshCw size={15} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </section>
  );
}
