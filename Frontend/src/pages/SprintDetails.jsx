import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Plus,
  Target,
  X,
} from "lucide-react";

import { api } from "../api/api";
import TaskCard from "../components/dashboard/TaskCard";

function formatDate(dateString) {
  if (!dateString) return "Date unavailable";

  const dateValue = String(dateString);
  const dateParts = dateValue.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  const date = dateParts
    ? new Date(
        Number(dateParts[1]),
        Number(dateParts[2]) - 1,
        Number(dateParts[3])
      )
    : new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  Active:
    "bg-indigo-50 text-indigo-700 border-indigo-200",
  Upcoming:
    "bg-blue-50 text-blue-700 border-blue-200",
  Completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled:
    "bg-red-50 text-red-700 border-red-200",
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

function StatCard({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon
          className={`h-4 w-4 ${iconClass}`}
        />
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
  if (status === "blocked") return "blocked";
  if (status === "review") return "review";

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

function AddTaskModal({
  tasks,
  onClose,
  onAdd,
  loading,
}) {
  const [selectedTaskId, setSelectedTaskId] =
    useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTaskId) {
      setError("Please select a task.");
      return;
    }

    try {
      setError("");

      await onAdd(selectedTaskId);

      setSelectedTaskId("");
    } catch (error) {
      setError(
        error.message ||
          "Unable to add task to sprint."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="add-task-title"
              className="text-lg font-semibold text-slate-900"
            >
              Add task to sprint
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select an existing task from
              your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          {tasks.length > 0 ? (
            <div>
              <label
                htmlFor="sprint-task"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Task
              </label>

              <select
                id="sprint-task"
                value={selectedTaskId}
                onChange={(event) => {
                  setSelectedTaskId(
                    event.target.value
                  );
                  setError("");
                }}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              >
                <option value="">
                  Select a task
                </option>

                {tasks.map((task) => (
                  <option
                    key={task.id}
                    value={task.id}
                  >
                    {task.id} — {task.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <Circle className="mx-auto h-8 w-8 text-slate-400" />

              <h3 className="mt-3 font-semibold text-slate-900">
                No available tasks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create a task first, then add it
                to this sprint.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !selectedTaskId ||
                tasks.length === 0
              }
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />

              {loading
                ? "Adding..."
                : "Add task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SprintDetails() {
  const { id } = useParams();

  const [sprint, setSprint] =
    useState(null);

  const [allTasks, setAllTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [tasksLoading, setTasksLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    showAddTaskModal,
    setShowAddTaskModal,
  ] = useState(false);

  const loadSprint = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.getSprintById(id);

      setSprint(response.data ?? null);
    } catch (error) {
      console.error(
        "Failed to load sprint:",
        error
      );

      setSprint(null);

      setError(
        error.message ||
          "Unable to load sprint."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadTasks = useCallback(async () => {
    try {
      setTasksLoading(true);

      const response =
        await api.getTasks();

      setAllTasks(response.data ?? []);
    } catch (error) {
      console.error(
        "Failed to load tasks:",
        error
      );
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const timeoutId = setTimeout(() => {
      loadSprint();
      loadTasks();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [id, loadSprint, loadTasks]);

  const sprintTasks = useMemo(
    () => sprint?.tasks ?? [],
    [sprint]
  );

  const availableTasks = useMemo(() => {
    const sprintTaskIds = new Set(
      sprintTasks.map(
        (task) => task.id
      )
    );

    return allTasks.filter(
      (task) =>
        !sprintTaskIds.has(task.id)
    );
  }, [allTasks, sprintTasks]);

  const stats = useMemo(() => {
    const total =
      sprintTasks.length;

    const completed =
      sprintTasks.filter(
        (task) =>
          task.status === "done"
      ).length;

    const inProgress =
      sprintTasks.filter(
        (task) =>
          task.status ===
          "in-progress"
      ).length;

    const remaining =
      total - completed;

    const completionRate = total
      ? Math.round(
          (completed / total) * 100
        )
      : 0;

    return {
      total,
      completed,
      inProgress,
      remaining,
      completionRate,
    };
  }, [sprintTasks]);

  const todoTasks = useMemo(
    () =>
      sprintTasks.filter(
        (task) =>
          task.status === "todo"
      ),
    [sprintTasks]
  );

  const inProgressTasks =
    useMemo(
      () =>
        sprintTasks.filter(
          (task) =>
            task.status ===
            "in-progress"
        ),
      [sprintTasks]
    );

  const reviewTasks = useMemo(
    () =>
      sprintTasks.filter(
        (task) =>
          task.status === "review"
      ),
    [sprintTasks]
  );

  const blockedTasks = useMemo(
    () =>
      sprintTasks.filter(
        (task) =>
          task.status === "blocked"
      ),
    [sprintTasks]
  );

  const doneTasks = useMemo(
    () =>
      sprintTasks.filter(
        (task) =>
          task.status === "done"
      ),
    [sprintTasks]
  );

  const handleAddTask = async (
    taskId
  ) => {
    try {
      setActionLoading(true);

      await api.addTaskToSprint(
        id,
        taskId
      );

      await loadSprint();

      setShowAddTaskModal(false);
    } catch (error) {
      console.error(
        "Failed to add task:",
        error
      );

      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveTask =
    async (taskId) => {
      const confirmed =
        window.confirm(
          "Remove this task from the sprint?"
        );

      if (!confirmed) return;

      try {
        setActionLoading(true);
        setError("");

        await api.removeTaskFromSprint(
          id,
          taskId
        );

        await loadSprint();
      } catch (error) {
        console.error(
          "Failed to remove task:",
          error
        );

        setError(
          error.message ||
            "Unable to remove task from sprint."
        );
      } finally {
        setActionLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Target className="h-6 w-6 animate-pulse text-slate-400" />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Loading sprint...
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Fetching sprint details.
          </p>
        </div>
      </div>
    );
  }

  if (error && !sprint) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Target className="h-6 w-6 text-slate-400" />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Sprint not found
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {error}
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
      key: "review",
      title: "REVIEW",
      tasks: reviewTasks,
      icon: Clock3,
      iconClass: "text-indigo-500",
    },
    {
      key: "blocked",
      title: "BLOCKED",
      tasks: blockedTasks,
      icon: Target,
      iconClass: "text-red-500",
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

              <StatusBadge
                status={sprint.status}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />

                {formatDate(
                  sprint.startDate
                )}{" "}
                –{" "}
                {formatDate(
                  sprint.endDate
                )}
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
                  sprint.status ===
                  "Completed"
                    ? "bg-emerald-500"
                    : "bg-indigo-500"
                }`}
                style={{
                  width: `${stats.completionRate}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {stats.completed} of{" "}
              {stats.total} tasks completed
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Sprint tasks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track the work assigned to this sprint by status.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAddTaskModal(true)
            }
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              tasksLoading ||
              actionLoading
            }
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>

        {error && sprint && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {sprintTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Circle className="mx-auto h-8 w-8 text-slate-400" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No tasks in this sprint
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add tasks to this sprint to
              start tracking progress.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-3">
            {taskGroups.map(
              (group) => {
                const Icon =
                  group.icon;

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
                      {group.tasks.length >
                      0 ? (
                        group.tasks.map(
                          (task) => (
                            <div
                              key={task.id}
                              className="relative"
                            >
                              <TaskCard
                                task={taskForCard(
                                  task
                                )}
                                showActions={
                                  false
                                }
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveTask(
                                    task.id
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                className="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                title="Remove from sprint"
                                aria-label={`Remove ${task.title} from sprint`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )
                        )
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
              }
            )}
          </div>
        )}
      </section>

      {/* Add task modal */}
      {showAddTaskModal && (
        <AddTaskModal
          tasks={availableTasks}
          onClose={() =>
            setShowAddTaskModal(false)
          }
          onAdd={handleAddTask}
          loading={actionLoading}
        />
      )}
    </div>
  );
}