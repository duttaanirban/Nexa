import { NavLink } from "react-router-dom";
import {
  MoreHorizontal,
  X,
} from "lucide-react";

import {
  CURRENT_USER,
  NAV_ITEMS,
  QUICK_ACTIONS,
} from "../../data/mockData";

/**
 * Sidebar
 *
 * Props:
 * - isOpen: boolean — controls the mobile drawer's visibility.
 * - onClose: () => void — closes the mobile drawer.
 */
export default function Sidebar({
  isOpen = false,
  onClose = () => {},
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex h-screen w-[min(280px,calc(100vw-1rem))] shrink-0 flex-col",
          "border-r border-white/20 bg-slate-950/95 shadow-xl shadow-slate-950/20 backdrop-blur-xl",
          "transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
        ].join(" ")}
        aria-label="Sidebar"
      >
        {/* Logo / header */}
        <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-base font-semibold text-white shadow-lg shadow-indigo-950/30">
              P
            </div>

            <div>
              <p className="text-base font-semibold tracking-tight text-white">Pulse</p>
              <p className="text-[11px] text-slate-400">Dev Productivity</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
          aria-label="Primary"
        >
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Workspace
          </p>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/30"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  <Icon
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                  <span className="flex-1">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Shortcuts */}
          <p className="px-3 pb-2 pt-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Shortcuts
          </p>

          <div className="space-y-1">
            {QUICK_ACTIONS
              .filter(
                (item) => item.section === "shortcut"
              )
              .map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={onClose}
                    className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-indigo-500/20 hover:text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    {item.label}
                  </button>
                );
              })}
          </div>
        </nav>

        {/* Current user */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/10">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-400/20 text-xs font-semibold text-indigo-200">
              {CURRENT_USER.initials}
            </div>

            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-white">
                {CURRENT_USER.name}
              </p>

              <p className="truncate text-xs text-slate-400">
                {CURRENT_USER.role}
              </p>
            </div>

            <button
              type="button"
              className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Open profile options"
            >
              <MoreHorizontal
                size={18}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}