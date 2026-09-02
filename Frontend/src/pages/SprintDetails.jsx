import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Target,
} from "lucide-react";

import { SPRINTS, getSprintStats } from "../data/sprintData";
import TaskCard from "../components/dashboard/TaskCard";

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  Active: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status] ??
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, iconClass }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        {label}
      </div>

      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function mapTaskStatus(status) {
  if (status === "done") return "done";
  if (status === "in-progress") return "in-progress";
  return "todo";
}

function taskForCard(task) {
  return {
    id: task.id,
    title: task.title,
    project: task.project ?? "Sprint work",
    assignee: task.assignee ?? "NA",
    due: task.due ?? "No due date",
    priority: task.priority ?? "Low",
    status: mapTaskStatus(task.status),
  };
}

export default function SprintDetails() {
  const { id } = useParams();

  const sprint = useMemo(
    () => SPRINTS.find((item) => item.id === id),
    [id]
  );

  if (!sprint) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Target className="h-6 w-6 text-slate-400" />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Sprint not found
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            The sprint you're looking for doesn't exist.
          </p>

          <Link
            to="/sprints"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sprints
          </Link>
        </div>
      </div>
    );
  }

  const stats = getSprintStats(sprint);

  const todoTasks = sprint.tasks.filter(
    (task) => task.status === "todo"
  );

  const inProgressTasks = sprint.tasks.filter(
    (task) => task.status === "in-progress"
  );

  const doneTasks = sprint.tasks.filter(
    (task) => task.status === "done"
  );

  const taskGroups = [
    {
      key: "todo",
      title: "TODO",
      tasks: todoTasks,
      icon: Circle,
      iconClass: "text-slate-400",
    },
    {
      key: "in-progress",
      title: "IN PROGRESS",
      tasks: inProgressTasks,
      icon: Clock3,
      iconClass: "text-amber-500",
    },
    {
      key: "done",
      title: "DONE",
      tasks: doneTasks,
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/sprints"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sprints
      </Link>

      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {sprint.name}
              </h1>

              <StatusBadge status={sprint.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(sprint.startDate)} –{" "}
                {formatDate(sprint.endDate)}
              </span>
            </div>

            {sprint.goal && (
              <div className="mt-5 flex max-w-2xl gap-3 rounded-xl bg-slate-50 p-4">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Sprint goal
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {sprint.goal}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full shrink-0 sm:w-64">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Progress
              </span>

              <span className="font-semibold text-indigo-600">
                {stats.completionRate}%
              </span>
            </div>

            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  sprint.status === "Completed"
                    ? "bg-emerald-500"
                    : "bg-indigo-500"
                }`}
                style={{
                  width: `${stats.completionRate}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Sprint statistics
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={Target}
            label="Total tasks"
            value={stats.total}
            iconClass="text-indigo-500"
          />

          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completed}
            iconClass="text-emerald-500"
          />

          <StatCard
            icon={Clock3}
            label="In progress"
            value={stats.inProgress}
            iconClass="text-amber-500"
          />

          <StatCard
            icon={Circle}
            label="Remaining"
            value={stats.remaining}
            iconClass="text-slate-400"
          />
        </div>
      </section>

      {/* Tasks */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Sprint tasks
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track the work assigned to this sprint by status.
          </p>
        </div>

        {sprint.tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Circle className="mx-auto h-8 w-8 text-slate-400" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No tasks in this sprint
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add tasks to this sprint to start tracking progress.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-3">
            {taskGroups.map((group) => {
              const Icon = group.icon;

              return (
                <div
                  key={group.key}
                  className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${group.iconClass}`}
                      />

                      <h3 className="text-xs font-semibold tracking-wide text-slate-700">
                        {group.title}
                      </h3>
                    </div>

                    <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-500 shadow-sm">
                      {group.tasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.tasks.length > 0 ? (
                      group.tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={taskForCard(task)}
                          showActions={false}
                        />
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                        <p className="text-xs text-slate-400">
                          No tasks
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}