import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * AppLayout
 *
 * Shared layout route. Composes Sidebar + Navbar around whatever
 * child route matched via <Outlet />. Owns the mobile sidebar-open
 * state so Navbar's menu button and Sidebar's backdrop/close button
 * stay in sync.
 *
 * Usage (in App.jsx):
 *   <Route element={<AppLayout />}>
 *     <Route index element={<Dashboard />} />
 *     <Route path="projects" element={<Projects />} />
 *   </Route>
 */
export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}