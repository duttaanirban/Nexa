import { PROJECTS, STATS, TASKS, TASK_FILTERS, } from "../data/mockData.js";
import StatsGrid from "../components/dashboard/Statsgrid.jsx";
import ProjectSection from "../components/dashboard/ProjectSection";
import TaskSection from "../components/dashboard/TaskSection";

/**
 * Dashboard
 *
 * Primary landing page for the Developer Productivity Dashboard.
 *
 * Dashboard-specific data is currently supplied by mockData.js.
 * The data source can later be replaced with REST API responses
 * without changing the presentation components.
 */
export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your projects and tasks.
        </p>
      </div>

      <StatsGrid stats={STATS} />

      <ProjectSection projects={PROJECTS} />

      {/* Tasks */}
      <TaskSection
        tasks={TASKS}
        filters={TASK_FILTERS}
    />
    </div>
  );
}