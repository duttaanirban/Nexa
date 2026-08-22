import {
  PROJECTS,
  RECENT_ACTIVITY,
  STATS,
  TASKS,
  TASK_FILTERS,
} from "../data/mockData";

import ActivitySection from "../components/dashboard/ActivitySection";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import ProjectSection from "../components/dashboard/ProjectSection";
import StatsGrid from "../components/dashboard/Statsgrid.jsx";
import TaskSection from "../components/dashboard/TaskSection";

/**
 * Dashboard
 *
 * Primary landing page for the Developer Productivity Dashboard.
 *
 * Dashboard data is currently supplied by mockData.js.
 * The data source can later be replaced with REST API responses
 * without changing the presentation components.
 */
export default function Dashboard({ loading = false }) {
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Dashboard header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your projects and tasks.
        </p>
      </div>

      {/* Statistics */}
      <StatsGrid stats={STATS} />

      {/* Projects */}
      <ProjectSection projects={PROJECTS} />

      {/* Tasks */}
      <TaskSection
        tasks={TASKS}
        filters={TASK_FILTERS}
      />

      {/* Recent activity */}
      <ActivitySection activities={RECENT_ACTIVITY} />
    </div>
  );
}