import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layouts/Applayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import ProjectDetails from "./pages/ProjectDetails.jsx"
import { TASK_FILTERS } from "./data/mockData";
import { CurrentUserProvider } from "./context/CurrentUserContext.jsx";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import Sprints from "./pages/Sprints";
import SprintDetails from "./pages/SprintDetails";

export default function App() {
  return (
    <AuthProvider>
    <CurrentUserProvider>
      <BrowserRouter>
        <Routes>

        {/* Public */}
        <Route path="/login" element={<Auth />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />

            <Route
              path="projects"
              element={<Projects />}
            />
            <Route
              path="projects/:id"
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

            <Route path="sprints" element={<Sprints />} />
            <Route path="sprints/:id" element={<SprintDetails />} />
          </Route>
        </Route>

      </Routes>
      </BrowserRouter>
    </CurrentUserProvider>
    </AuthProvider>
  );
}