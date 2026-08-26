import {
  QUICK_ACTIONS,
  TASK_FILTERS,
  RECENT_ACTIVITY,
  VELOCITY_CHART_DATA,
} from "../data/mockData";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { api } from "../api/api";

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
 * Projects, tasks, and users are loaded from the backend API.
 * Productivity, recent activity, and quick actions currently remain
 * presentation data until corresponding backend endpoints are added.
 */
export default function Dashboard({
  loading = false,
  error = null,
}) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getProjects(),
      api.getTasks(),
      api.getUsers(),
    ])
      .then(([projectsResponse, tasksResponse, usersResponse]) => {
        setProjects(projectsResponse.data);
        setTasks(tasksResponse.data);
        setUsers(usersResponse.data);
      })
      .catch((error) => {
        console.error("Dashboard API error:", error);
      });
  }, []);

  const stats = useMemo(() => {
    const activeProjects = projects.filter(
      (project) =>
        project.status === "On track" ||
        project.status === "In progress"
    ).length;

    const completedTasks = tasks.filter(
      (task) => task.status === "done"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const overdueTasks = tasks.filter(
      (task) => task.due === "Overdue"
    ).length;

    return [
      {
        id: "active-projects",
        label: "Active projects",
        value: String(activeProjects).padStart(2, "0"),
        delta: "from current projects",
        trend: "up",
      },
      {
        id: "completed",
        label: "Tasks completed",
        value: String(completedTasks),
        delta: "currently completed",
        trend: "up",
      },
      {
        id: "in-progress",
        label: "In progress",
        value: String(inProgressTasks),
        delta: "currently active",
        trend: "neutral",
      },
      {
        id: "overdue",
        label: "Overdue",
        value: String(overdueTasks).padStart(2, "0"),
        delta:
          overdueTasks > 0
            ? "needs attention"
            : "none",
        trend:
          overdueTasks > 0
            ? "down"
            : "neutral",
      },
    ];
  }, [projects, tasks]);

  const teamWorkload = useMemo(() => {
  return users.map((user) => {
    const assignedTasks = tasks.filter(
      (task) => task.assignee === user.initials
    );

    const activeTasks = assignedTasks.filter(
      (task) => task.status !== "done"
    ).length;

    const workload =
      assignedTasks.length === 0
        ? 0
        : Math.min(
            100,
            Math.round((activeTasks / assignedTasks.length) * 100)
          );

    return {
      ...user,
      workload,
    };
  });
}, [users, tasks]);

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

          <ChevronDown
            size={16}
            className="text-slate-400"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* KPI cards */}
      <StatsGrid stats={stats} />

      {/* Analytics */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">

        <ProductivityChart
          data={VELOCITY_CHART_DATA}
        />

        <ActivitySection
          activities={RECENT_ACTIVITY}
        />

      </div>

      {/* Projects + Team */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <ProjectSection
          projects={projects}
        />

        <TeamWorkload members={teamWorkload} />

      </div>

      {/* Quick actions */}
      <QuickActions
        actions={QUICK_ACTIONS}
      />

      {/* Tasks */}
      <TaskSection
        tasks={tasks}
        filters={TASK_FILTERS}
      />

    </div>
  );
}