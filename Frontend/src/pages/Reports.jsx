import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  ListChecks,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";

import { api } from "../api/api";
import ProductivityChart from "../components/dashboard/ProductivityChart";
import ErrorState from "../components/ui/ErrorState";

function StatCard({ icon: Icon, label, value, description, iconClass }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "On track":
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    "In progress":
      "border-amber-200 bg-amber-50 text-amber-700",
    Blocked:
      "border-red-200 bg-red-50 text-red-700",
    Completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ??
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function ProgressBar({ value }) {
  const percentage = Math.min(
    100,
    Math.max(0, Number(value) || 0)
  );

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-indigo-500 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <div className="animate-pulse">
        <div className="h-8 w-32 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-80 rounded bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-xl bg-slate-100" />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-80 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.getProjects(),
      api.getTasks(),
      api.getUsers(),
    ])
      .then(
        ([
          projectsResponse,
          tasksResponse,
          usersResponse,
        ]) => {
          if (cancelled) return;

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
        }
      )
      .catch((error) => {
        if (cancelled) return;

        console.error("Reports API error:", error);
        setApiError(error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statistics = useMemo(() => {
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "done"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const blockedTasks = tasks.filter(
      (task) => task.status === "blocked"
    ).length;

    const completionRate = totalTasks
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    const activeProjects = projects.filter(
      (project) =>
        project.status === "On track" ||
        project.status === "In progress"
    ).length;

    return {
      totalProjects: projects.length,
      activeProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionRate,
    };
  }, [projects, tasks]);

  const productivityData = useMemo(() => {
    const days = [];

    const today = new Date();

    for (let index = 6; index >= 0; index -= 1) {
      const day = new Date(today);

      day.setDate(today.getDate() - index);
      day.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const opened = tasks.filter((task) => {
        if (!task.createdAt) return false;

        const createdAt = new Date(task.createdAt);

        return (
          !Number.isNaN(createdAt.getTime()) &&
          createdAt >= day &&
          createdAt <= dayEnd
        );
      }).length;

      const closed = tasks.filter((task) => {
        if (!task.completedAt) return false;

        const completedAt = new Date(task.completedAt);

        return (
          !Number.isNaN(completedAt.getTime()) &&
          completedAt >= day &&
          completedAt <= dayEnd
        );
      }).length;

      days.push({
        day: day.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        opened,
        closed,
      });
    }

    return days;
  }, [tasks]);

  const projectPerformance = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter(
        (task) =>
          task.project === project.name ||
          task.projectId === project.id
      );

      const total = projectTasks.length;

      const completed = projectTasks.filter(
        (task) => task.status === "done"
      ).length;

      const calculatedProgress = total
        ? Math.round((completed / total) * 100)
        : Number(project.progress) || 0;

      return {
        ...project,
        taskCount: total,
        completedTasks: completed,
        calculatedProgress,
      };
    });
  }, [projects, tasks]);

  const teamPerformance = useMemo(() => {
    return users.map((user) => {
      const assignedTasks = tasks.filter(
        (task) => task.assignee === user.initials
      );

      const completed = assignedTasks.filter(
        (task) => task.status === "done"
      ).length;

      const active = assignedTasks.filter(
        (task) => task.status !== "done"
      ).length;

      const total = assignedTasks.length;

      const completionRate = total
        ? Math.round((completed / total) * 100)
        : 0;

      return {
        ...user,
        total,
        completed,
        active,
        completionRate,
      };
    });
  }, [users, tasks]);

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  if (apiError) {
    const message =
      apiError?.message ||
      "We couldn't load the reports. Please try again.";

    return <ErrorState message={message} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      {/* Header */}
      <header>
        <p className="text-sm font-medium text-indigo-600">
          Nexa Analytics
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Reports
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Understand project progress, team workload, and development
          productivity.
        </p>
      </header>

      {/* Overview */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">
            Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A snapshot of your current workspace.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            icon={FolderKanban}
            label="Total projects"
            value={statistics.totalProjects}
            description={`${statistics.activeProjects} currently active`}
            iconClass="text-indigo-500"
          />

          <StatCard
            icon={ListChecks}
            label="Total tasks"
            value={statistics.totalTasks}
            description={`${statistics.completedTasks} completed`}
            iconClass="text-blue-500"
          />

          <StatCard
            icon={CheckCircle2}
            label="Completion rate"
            value={`${statistics.completionRate}%`}
            description="Tasks completed"
            iconClass="text-emerald-500"
          />

          <StatCard
            icon={AlertTriangle}
            label="Blocked tasks"
            value={statistics.blockedTasks}
            description={
              statistics.blockedTasks > 0
                ? "Needs attention"
                : "No blocked tasks"
            }
            iconClass={
              statistics.blockedTasks > 0
                ? "text-red-500"
                : "text-slate-400"
            }
          />
        </div>
      </section>

      {/* Productivity */}
      <ProductivityChart data={productivityData} />

      {/* Project Performance */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Project performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track completion across your active projects.
          </p>
        </div>

        {projectPerformance.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FolderKanban className="mx-auto h-8 w-8 text-slate-400" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No project data
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Project performance will appear here once projects exist.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {projectPerformance.map((project) => (
              <article
                key={project.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {project.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {project.description ||
                        "No project description available."}
                    </p>
                  </div>

                  <StatusBadge status={project.status} />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Progress
                    </span>

                    <span className="font-semibold text-slate-900">
                      {project.calculatedProgress}%
                    </span>
                  </div>

                  <ProgressBar value={project.calculatedProgress} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Total tasks
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {project.taskCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Completed
                    </p>

                    <p className="mt-1 font-semibold text-emerald-600">
                      {project.completedTasks}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Team Performance */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Team workload
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare assigned work and completion across team members.
          </p>
        </div>

        {teamPerformance.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-400" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No team data
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Team performance will appear here once members are available.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teamPerformance.map((member) => (
              <article
                key={member.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                    {member.initials}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">
                      {member.name}
                    </h3>

                    <p className="truncate text-xs text-slate-500">
                      {member.role || "Team member"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Completion
                  </span>

                  <span className="font-semibold text-slate-900">
                    {member.completionRate}%
                  </span>
                </div>

                <div className="mt-2">
                  <ProgressBar value={member.completionRate} />
                </div>

                <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-100 pt-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {member.total}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Done</p>
                    <p className="mt-1 font-semibold text-emerald-600">
                      {member.completed}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Active</p>
                    <p className="mt-1 font-semibold text-amber-600">
                      {member.active}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Task Status Breakdown */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Task status breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current distribution of work across the workspace.
            </p>
          </div>

          <BarChart3 className="h-5 w-5 text-indigo-500" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                To do
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {
                tasks.filter(
                  (task) => task.status === "todo"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-700">
                In progress
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {statistics.inProgressTasks}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-700">
                Done
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {statistics.completedTasks}
            </p>
          </div>
        </div>
      </section>

      {/* Bottom insight */}
      <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
        <div className="flex gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Workspace insight
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {statistics.totalTasks === 0
                ? "There isn't enough task data to generate a productivity insight yet."
                : statistics.completionRate >= 70
                  ? "Your team is maintaining a strong completion rate. Keep monitoring active and blocked work."
                  : statistics.blockedTasks > 0
                    ? "Some work is blocked. Reviewing blocked tasks may help improve the team's completion rate."
                    : "There is still active work in the workspace. Focus on progressing in-flight tasks toward completion."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}