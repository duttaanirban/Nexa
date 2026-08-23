import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layouts/Applayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import { PROJECTS, TASKS, TASK_FILTERS, TEAM_MEMBERS } from "./data/mockData";

/**
 * Temporary placeholder for routes that don't have a real page yet.
 * Matches the heading + description pattern used in Dashboard.jsx so
 * the app feels consistent while these pages are built out.
 */
function PagePlaceholder({ title, description }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center text-sm text-slate-500">
        This page hasn't been built yet.
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route
            path="projects"
            element={<Projects projects={PROJECTS} />}
          />
          <Route
            path="tasks"
            element={
              <Tasks
                tasks={TASKS}
                filters={TASK_FILTERS}
              />
            }
          />
          <Route
            path="team"
            element={<Team members={TEAM_MEMBERS} />}
          />
          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}