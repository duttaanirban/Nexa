import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layouts/Applayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import { TASK_FILTERS } from "./data/mockData";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="projects"
            element={<Projects />}
          />

          <Route
            path="projects/:projectId"
            element={<ProjectDetails />}
          />

          <Route
            path="tasks"
            element={
              <Tasks filters={TASK_FILTERS} />
            }
          />

          <Route
            path="team"
            element={<Team />}
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
