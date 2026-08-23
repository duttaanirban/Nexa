import { Zap } from "lucide-react";

/**
 * QuickActions
 *
 * Section of shortcut buttons rendered from a supplied `actions`
 * array. Purely presentational — no data is imported, fetched, or
 * hardcoded here, and no navigation is wired up yet.
 *
 * Props:
 * - actions: Array<{
 *     id: string
 *     label: string
 *     icon: React.ComponentType   — a Lucide icon component
 *   }>
 *
 * Usage:
 *   import { QUICK_ACTIONS } from "../../data/mockData";
 *   <QuickActions actions={QUICK_ACTIONS} />
 */
export default function QuickActions({ actions = [] }) {
  return (
    <section
      aria-labelledby="quick-actions-heading"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <h2
        id="quick-actions-heading"
        className="text-sm font-semibold uppercase tracking-wide text-slate-500"
      >
        Quick actions
      </h2>

      {actions.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
            <Zap size={16} className="text-slate-400" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-500">No quick actions available</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                type="button"
                aria-label={action.label}
                className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              >
                {Icon && (
                  <Icon size={20} className="text-slate-500" aria-hidden="true" />
                )}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}