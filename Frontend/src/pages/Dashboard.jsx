import {
  PROJECTS,
  QUICK_ACTIONS,
  RECENT_ACTIVITY,
  STATS,
  TASKS,
  TASK_FILTERS,
  VELOCITY_CHART_DATA,
} from "../data/mockData";
import { ChevronDown } from "lucide-react";

import ActivitySection from "../components/dashboard/ActivitySection";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import ErrorState from "../components/ui/ErrorState";
import ProductivityChart from "../components/dashboard/ProductivityChart";
import ProjectSection from "../components/dashboard/ProjectSection";
import QuickActions from "../components/dashboard/QuickActions";
import StatsGrid from "../components/dashboard/Statsgrid";
import TaskSection from "../components/dashboard/TaskSection";
import TeamWorkload from "../components/dashboard/TeamWorkload";

/**
 * Dashboard
 *
 * Primary landing page for the Developer Productivity Dashboard.
 *
 * Dashboard data is currently supplied by mockData.js.
 * The data source can later be replaced with REST API responses
 * without changing the presentation components.
 */
export default function Dashboard({
  loading = false,
  error = null,
}) {
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.message ||
          "We couldn't load the dashboard. Please try again.";

    return <ErrorState message={errorMessage} />;
  }

  return (
  <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
    {/* Header */}
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Pulse Workspace
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Welcome back, Mira. Here's what's happening with your team today.
        </p>
      </div>

      <button
        type="button"
        className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <span>May 12 – May 18, 2025</span>
        <ChevronDown size={16} className="text-slate-400" aria-hidden="true" />
      </button>
    </div>

    {/* KPI cards */}
    <StatsGrid stats={STATS} />

    {/* Analytics */}
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <ProductivityChart data={VELOCITY_CHART_DATA} />

      <ActivitySection activities={RECENT_ACTIVITY} />
    </div>

    {/* Projects + Team */}
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <ProjectSection projects={PROJECTS} />

      <TeamWorkload />
    </div>

    {/* Quick actions */}
    <QuickActions actions={QUICK_ACTIONS} />

    {/* Tasks */}
    <TaskSection
      tasks={TASKS}
      filters={TASK_FILTERS}
    />
  </div>
);
}