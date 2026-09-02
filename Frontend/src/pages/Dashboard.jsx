import {
  QUICK_ACTIONS,
  TASK_FILTERS,
} from "../data/mockData";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
 * Projects, tasks, users, and activity are loaded from the backend API.
 * Productivity chart data is calculated from task createdAt/completedAt
 * timestamps.
 */
export default function Dashboard({
  loading = false,
  error = null,
}) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);

  const [dateRange, setDateRange] = useState("This week");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  /*
   * Load dashboard data
   */
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
          setProjects(
            Array.isArray(projectsResponse.data)
              ? projectsResponse.data
              : []
          );

          setTasks(
            Array.isArray(tasksResponse.data)
              ? tasksResponse.data
              : []
          );

          setUsers(
            Array.isArray(usersResponse.data)
              ? usersResponse.data
              : []
          );

          setActivities(
            Array.isArray(activitiesResponse.data)
              ? activitiesResponse.data
              : []
          );
        }
      )
      .catch((error) => {
        console.error("Dashboard API error:", error);
        setApiError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /*
   * Get the selected date range.
   */
  const getDateRange = (range) => {
    const today = new Date();

    /*
     * Normalize the current date to the beginning of the day.
     */
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (range === "Today") {
      return {
        start: startOfToday,
        end: startOfToday,
      };
    }

    /*
     * JavaScript:
     * Sunday = 0
     * Monday = 1
     * ...
     *
     * Convert it so Monday becomes the start of the week.
     */
    const day = startOfToday.getDay();

    const daysFromMonday =
      day === 0 ? 6 : day - 1;

    const startOfWeek = new Date(startOfToday);

    startOfWeek.setDate(
      startOfToday.getDate() - daysFromMonday
    );

    if (range === "Last week") {
      startOfWeek.setDate(
        startOfWeek.getDate() - 7
      );
    }

    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(
      startOfWeek.getDate() + 6
    );

    return {
      start: startOfWeek,
      end: endOfWeek,
    };
  };


  /*
   * Dashboard statistics
   */
  const stats = useMemo(() => {
    const { start, end } = getDateRange(dateRange);

    const startTime = new Date(start);
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date(end);
    endTime.setHours(23, 59, 59, 999);

    const tasksInRange = tasks.filter((task) => {
      if (!task.createdAt) return false;

      const createdAt = new Date(task.createdAt);

      return (
        !Number.isNaN(createdAt.getTime()) &&
        createdAt >= startTime &&
        createdAt <= endTime
      );
    });

    const activeProjects = projects.filter(
      (project) =>
        project.status === "On track" ||
        project.status === "In progress"
    ).length;

    const completedTasks = tasksInRange.filter(
      (task) => task.status === "done"
    ).length;

    const inProgressTasks = tasksInRange.filter(
      (task) => task.status === "in-progress"
    ).length;

    const overdueTasks = tasksInRange.filter(
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
  }, [projects, tasks, dateRange]);

  /*
   * Team workload
   */
  const teamWorkload = useMemo(() => {
  return users.map((user) => {
    const assignedTasks = tasks.filter(
      (task) => task.assignee === user.initials
    );

    let workload = 0;

    assignedTasks.forEach((task) => {
      // Completed tasks do not contribute to current workload.
      if (task.status === "done") {
        return;
      }

      // Every active task contributes 20%.
      workload += 20;

      // High-priority tasks add extra pressure.
      if (task.priority === "High") {
        workload += 10;
      }

      // Blocked tasks need additional attention.
      if (task.status === "blocked") {
        workload += 15;
      }

      // Overdue tasks need additional attention.
      if (task.due === "Overdue") {
        workload += 15;
      }
    });

    // Keep workload between 0 and 100.
    workload = Math.min(
      100,
      Math.max(0, workload)
    );

    return {
      ...user,
      workload,
    };
  });
}, [users, tasks]);


  /*
   * Generate real productivity chart data from tasks.
   *
   * opened = task.createdAt
   * closed = task.completedAt
   */
  const productivityData = useMemo(() => {
    const { start, end } =
      getDateRange(dateRange);

    const startTime = new Date(start);
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date(end);
    endTime.setHours(23, 59, 59, 999);

    /*
     * Create the days that will appear on the chart.
     */
    const days = [];

    const currentDay = new Date(startTime);

    while (currentDay <= endTime) {
      days.push(new Date(currentDay));

      currentDay.setDate(
        currentDay.getDate() + 1
      );
    }

    /*
     * Count created and completed tasks for each day.
     */
    return days.map((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const opened = tasks.filter((task) => {
        if (!task.createdAt) return false;

        const createdAt = new Date(
          task.createdAt
        );

        return (
          !Number.isNaN(createdAt.getTime()) &&
          createdAt >= dayStart &&
          createdAt <= dayEnd
        );
      }).length;

      const closed = tasks.filter((task) => {
        if (!task.completedAt) return false;

        const completedAt = new Date(
          task.completedAt
        );

        return (
          !Number.isNaN(completedAt.getTime()) &&
          completedAt >= dayStart &&
          completedAt <= dayEnd
        );
      }).length;

      return {
        day:
          dateRange === "Today"
            ? day.toLocaleDateString("en-US", {
                weekday: "short",
              })
            : day.toLocaleDateString("en-US", {
                weekday: "short",
              }),
        opened,
        closed,
      };
    });
  }, [tasks, dateRange]);

  /*
   * Format selected date range for the header.
   */
  const formatDateRange = (range) => {
    const { start, end } =
      getDateRange(range);

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

  /*
   * Loading state
   */
  if (loading || isLoading) {
    return <DashboardSkeleton />;
  }

  /*
   * Error state
   */
  if (error || apiError) {
    const currentError =
      error || apiError;

    const errorMessage =
      typeof currentError === "string"
        ? currentError
        : currentError?.message ||
          "We couldn't load the dashboard. Please try again.";

    return (
      <ErrorState
        message={errorMessage}
      />
    );
  }

  const handleQuickAction = (action) => {
  switch (action.id) {
    case "backlog":
      navigate("/tasks?status=todo");
      break;

    case "sprints":
      navigate("/sprints");
      break;

    case "reports":
      console.log("Reports feature coming soon");
      break;

    case "plugins":
      console.log("Plugins feature coming soon");
      break;

    case "alerts":
      console.log("Alerts feature coming soon");
      break;

    default:
      console.warn(
        `No action configured for shortcut: ${action.id}`
      );
  }
};

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
              setIsDateMenuOpen(
                (open) => !open
              )
            }
            aria-haspopup="menu"
            aria-expanded={
              isDateMenuOpen
            }
            className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>
              {displayedDateRange}
            </span>

            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${
                isDateMenuOpen
                  ? "rotate-180"
                  : ""
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
                    setIsDateMenuOpen(
                      false
                    );
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
          data={productivityData}
        />

        <ActivitySection
          activities={activities.filter((activity) => {
            if (!activity.timestamp) return false;

            const { start, end } = getDateRange(dateRange);
            const activityTime = new Date(activity.timestamp);

            const startTime = new Date(start);
            startTime.setHours(0, 0, 0, 0);

            const endTime = new Date(end);
            endTime.setHours(23, 59, 59, 999);

            return (
              !Number.isNaN(activityTime.getTime()) &&
              activityTime >= startTime &&
              activityTime <= endTime
            );
          })}
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
        actions={QUICK_ACTIONS.map((action) => ({
          ...action,
          onClick: () => handleQuickAction(action),
        }))}
      />

      {/* Tasks */}
      <TaskSection
        tasks={tasks.filter((task) => {
          if (!task.createdAt) return false;

          const { start, end } = getDateRange(dateRange);
          const taskTime = new Date(task.createdAt);

          const startTime = new Date(start);
          startTime.setHours(0, 0, 0, 0);

          const endTime = new Date(end);
          endTime.setHours(23, 59, 59, 999);

          return (
            !Number.isNaN(taskTime.getTime()) &&
            taskTime >= startTime &&
            taskTime <= endTime
          );
        })}
        filters={TASK_FILTERS}
      />

    </div>
  );
}