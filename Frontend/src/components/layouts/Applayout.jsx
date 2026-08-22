import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * AppLayout
 *
 * Shell that composes Sidebar + Navbar around page content. Owns the
 * mobile sidebar-open state so Navbar's menu button and Sidebar's
 * backdrop/close button stay in sync.
 *
 * Usage:
 *   <AppLayout>
 *     <Dashboard />
 *   </AppLayout>
 *
 * If you introduce React Router, replace `children` with `<Outlet />`
 * and render <AppLayout /> as a layout route.
 */
export default function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}