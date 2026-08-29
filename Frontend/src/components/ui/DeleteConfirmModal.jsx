import { AlertTriangle, X } from "lucide-react";

export default function DeleteConfirmModal({
  open = false,
  title = "Delete item?",
  itemName = "",
  description = "This action cannot be undone.",
  isDeleting = false,
  onCancel = () => {},
  onConfirm = () => {},
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isDeleting
        ) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle
              size={20}
              className="text-red-600"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="delete-confirm-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              {itemName && (
                <span className="font-medium text-slate-700">
                  "{itemName}"
                </span>
              )}
              ? {description}
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close delete confirmation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex min-w-[105px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}