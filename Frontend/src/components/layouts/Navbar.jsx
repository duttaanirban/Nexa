import { Menu } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import NotificationMenu from "./NotificationMenu";
import GlobalSearch from "./GlobalSearch";

/**
 * Navbar
 *
 * Props:
 * - onMenuClick: () => void — opens the mobile sidebar drawer.
 *   Pass Sidebar's `isOpen` setter from AppLayout.
 */
export default function Navbar({ onMenuClick = () => {} }) {
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
      {/* Mobile menu trigger */}
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={19} />
      </button>

      {/* Search */}
      <GlobalSearch />

      <div className="flex-1" />

      {/* Notifications */}
      <NotificationMenu />

      {/* Profile */}
      <ProfileMenu />
    </header>
  );
}