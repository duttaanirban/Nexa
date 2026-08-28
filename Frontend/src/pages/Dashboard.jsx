import {
  QUICK_ACTIONS,
  TASK_FILTERS,
  VELOCITY_CHART_DATA,
} from "../data/mockData";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
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
  const [activities, setActivities] = useState([]);

  const [dateRange, setDateRange] = useState("This week");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getProjects(),
      api.getTasks(),
      api.getUsers(),
      api.getActivity(),
    ])
      .then(
      ([
        projectsResponse,
        tasksResponse,
        usersResponse,
        activitiesResponse,
      ]) => {
        setProjects(projectsResponse.data);
        setTasks(tasksResponse.data);
        setUsers(usersResponse.data);
        setActivities(
          Array.isArray(activitiesResponse.data)
            ? activitiesResponse.data
            : []
        );
      })
      .catch((error) => {
        console.error("Dashboard API error:", error);
        setApiError(error);
      })
      .finally(() => {
        setIsLoading(false);
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
              Math.round(
                (activeTasks / assignedTasks.length) * 100
              )
            );

      return {
        ...user,
        workload,
      };
    });
  }, [users, tasks]);

  if (loading || isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || apiError) {
    const currentError = error || apiError;

    const errorMessage =
      typeof currentError === "string"
        ? currentError
        : currentError?.message ||
          "We couldn't load the dashboard. Please try again.";

    return <ErrorState message={errorMessage} />;
  }

  const getDateRange = (range) => {
    const today = new Date();

    if (range === "Today") {
      return {
        start: today,
        end: today,
      };
    }

    const day = today.getDay();

    const startOfCurrentWeek = new Date(today);

    startOfCurrentWeek.setDate(
      today.getDate() - day + 1
    );

    if (range === "Last week") {
      startOfCurrentWeek.setDate(
        startOfCurrentWeek.getDate() - 7
      );
    }

    const end = new Date(startOfCurrentWeek);

    end.setDate(
      startOfCurrentWeek.getDate() + 6
    );

    return {
      start: startOfCurrentWeek,
      end,
    };
  };

  const formatDateRange = (range) => {
    const { start, end } = getDateRange(range);

    const format = (date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    if (range === "Today") {
      return format(start);
    }

    return `${format(start)} – ${format(end)}`;
  };

  const displayedDateRange =
    formatDateRange(dateRange);

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

        {/* Date selector */}
        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setIsDateMenuOpen((open) => !open)
            }
            aria-haspopup="menu"
            aria-expanded={isDateMenuOpen}
            className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{displayedDateRange}</span>

            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${
                isDateMenuOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {isDateMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              {[
                "Today",
                "This week",
                "Last week",
              ].map((range) => (
                <button
                  key={range}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDateRange(range);
                    setIsDateMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span>{range}</span>

                  {dateRange === range && (
                    <Check
                      size={15}
                      className="text-indigo-600"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* KPI cards */}
      <StatsGrid stats={stats} />

      {/* Analytics */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">

        <ProductivityChart
          data={VELOCITY_CHART_DATA}
        />

        <ActivitySection
          activities={activities}
        />

      </div>

      {/* Projects + Team */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <ProjectSection
          projects={projects}
        />

        <TeamWorkload
          members={teamWorkload}
        />

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