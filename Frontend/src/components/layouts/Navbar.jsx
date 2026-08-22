import { Menu, Search, Bell } from "lucide-react";

/**
 * Navbar
 *
 * Props:
 * - onMenuClick: () => void — opens the mobile sidebar drawer.
 *   Pass Sidebar's `isOpen` setter from AppLayout.
 */
export default function Navbar({ onMenuClick = () => {} }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
      {/* Mobile menu trigger */}
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={19} />
      </button>

      {/* Search */}
      <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <Search size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search…"
          aria-label="Search"
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        type="button"
        className="relative rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        aria-label="View notifications"
      >
        <Bell size={17} />
        <span
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500"
          aria-hidden="true"
        />
      </button>

      {/* Profile */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        aria-label="Open account menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          MK
        </div>
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">
          Mira Kapoor
        </span>
      </button>
    </header>
  );
}