import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  Settings,
  X,
} from "lucide-react";

/**
 * Sidebar navigation items. `to` matches the routes defined in
 * App.jsx. Dashboard uses `end` (set on the NavLink below) so it's
 * only active on the exact `/` path, not on every nested route.
 */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/", end: true },
  { id: "projects", label: "Projects", icon: FolderKanban, to: "/projects" },
  { id: "tasks", label: "Tasks", icon: ListChecks, to: "/tasks" },
  { id: "team", label: "Team", icon: Users, to: "/team" },
  { id: "settings", label: "Settings", icon: Settings, to: "/settings" },
];

/**
 * Sidebar
 *
 * Props:
 * - isOpen: boolean — controls the mobile drawer's visibility.
 * - onClose: () => void — called when the mobile drawer should close
 *   (backdrop click, nav item selected, or Escape).
 *
 * Behavior:
 * - Below the `lg` breakpoint, renders as a fixed, slide-in drawer
 *   with a backdrop. Above `lg`, renders as a static column and the
 *   drawer chrome (backdrop, close button) is inert.
 */
export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <>
      {/* Backdrop — mobile only, shown when drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col",
          "border-r border-slate-200 bg-white",
          "transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:translate-x-0",
        ].join(" ")}
        aria-label="Sidebar"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
              P
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Pulse
            </span>
          </div>

          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon size={17} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              MK
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-slate-900">
                Mira Kapoor
              </p>
              <p className="truncate text-xs text-slate-500">
                Frontend Lead
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}