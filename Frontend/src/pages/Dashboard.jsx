import { LayoutDashboard } from "lucide-react";

/**
 * Dashboard (placeholder)
 *
 * Rendered inside AppLayout. Content, cards, and widgets get built
 * out in a later pass — this just confirms the shell renders and
 * gives the page a title/region to build into.
 */
export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your projects and tasks.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <LayoutDashboard size={18} className="text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700">
          Dashboard content coming soon
        </p>
        <p className="max-w-sm text-sm text-slate-500">
          This page is wired up inside the app shell — stats, project
          cards, and the task list will go here.
        </p>
      </div>
    </div>
  );
}