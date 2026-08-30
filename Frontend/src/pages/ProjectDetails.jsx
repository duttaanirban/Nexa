import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Circle,
  Info,
  ListChecks,
  Users,
} from "lucide-react";
import { api } from "../api/api";

const STATUS_STYLES = {
  "On track": {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  "In progress": {
    icon: Info,
    className: "bg-blue-50 text-blue-700",
  },
  Blocked: {
    icon: XCircle,
    className: "bg-red-50 text-red-700",
  },
  Completed: {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
};

const TASK_STATUS_STYLES = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-50 text-blue-700",
  review: "bg-violet-50 text-violet-700",
  blocked: "bg-red-50 text-red-700",
  done: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const projectResponse = await api.getProjectById(projectId);
        const currentProject = projectResponse?.data;

        if (!currentProject) {
          throw new Error("Project not found");
        }

        const tasksResponse = await api.getTasks(
          `?project=${encodeURIComponent(currentProject.name)}`
        );

        if (!isMounted) return;

        setProject(currentProject);
        setTasks(
          Array.isArray(tasksResponse?.data)
            ? tasksResponse.data
            : []
        );
      } catch (err) {
        if (!isMounted) return;

        console.error("Project details API error:", err);
        setError(
          err?.message ||
            "We couldn't load this project. Please try again."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "done"
    ).length;

    const active = tasks.length - completed;

    return {
      total: tasks.length,
      completed,
      active,
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="mt-8 h-2 w-full animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <Link
          to="/projects"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </Link>

        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <XCircle
            size={22}
            className="mx-auto text-red-500"
            aria-hidden="true"
          />
          <h1 className="mt-3 text-base font-semibold text-slate-900">
            Unable to load project
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {error || "Project not found."}
          </p>
        </div>
      </div>
    );
  }

  const statusStyle =
    STATUS_STYLES[project.status] ?? {
      icon: Circle,
      className: "bg-slate-100 text-slate-600",
    };

  const StatusIcon = statusStyle.icon;
  const progress = Math.min(
    100,
    Math.max(0, Number(project.progress) || 0)
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link
        to="/projects"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to Projects
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs text-slate-400">
                {project.id}
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {project.name}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {project.description}
              </p>
            </div>

            <span
              className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ${statusStyle.className}`}
            >
              <StatusIcon size={14} aria-hidden="true" />
              {project.status}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">
                Project progress
              </span>
              <span className="font-semibold text-slate-900">
                {progress}%
              </span>
            </div>

            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`${project.name} progress`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total tasks</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {stats.total}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Active tasks</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {stats.active}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Completed tasks</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Team
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Members assigned to this project
            </p>
          </div>

          <Users
            size={18}
            className="text-slate-400"
            aria-hidden="true"
          />
        </div>

        {project.team?.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.team.map((initials, index) => (
              <div
                key={`${project.id}-${initials}-${index}`}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {initials}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {initials}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            No team members assigned.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <ListChecks size={18} aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Project Tasks
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tasks currently associated with this project
            </p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              No tasks for this project
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tasks assigned to this project will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-slate-400">
                    {task.id}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {task.title}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Assignee: {task.assignee}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>Due: {task.due}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      PRIORITY_STYLES[task.priority] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      TASK_STATUS_STYLES[task.status] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
