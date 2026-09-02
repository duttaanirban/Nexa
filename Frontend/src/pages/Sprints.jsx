import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  MoreHorizontal,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import ProductivityChart from "../components/dashboard/ProductivityChart";

import {
  SPRINTS,
  VELOCITY_CHART_DATA,
  getSprintStats,
} from "../data/sprintData";

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDaysRemaining(endDate) {
  const today = new Date();
  const end = new Date(`${endDate}T23:59:59`);

  const difference = end.getTime() - today.getTime();

  if (difference <= 0) return 0;

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

const STATUS_STYLES = {
  Active: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  Upcoming: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  Completed: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Cancelled: {
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

function StatusBadge({ status }) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.Upcoming;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {status}
    </span>
  );
}

function StatItem({ icon: Icon, label, value, iconClass = "text-indigo-500" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        {label}
      </div>

      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function CreateSprintModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    goal: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Sprint name is required.");
      return;
    }

    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }

    if (!form.endDate) {
      setError("End date is required.");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("End date cannot be before the start date.");
      return;
    }

    onCreate({
      id: `SPR-${Date.now()}`,
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      status: "Upcoming",
      goal: form.goal.trim(),
      tasks: [],
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-sprint-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="create-sprint-title"
              className="text-lg font-semibold text-slate-900"
            >
              Create sprint
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set up a new development sprint.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="sprint-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Sprint name
            </label>

            <input
              id="sprint-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Sprint 13"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sprint-start"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Start date
              </label>

              <input
                id="sprint-start"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="sprint-end"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                End date
              </label>

              <input
                id="sprint-end"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="sprint-goal"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Goal <span className="font-normal text-slate-400">(optional)</span>
            </label>

            <textarea
              id="sprint-goal"
              name="goal"
              value={form.goal}
              onChange={handleChange}
              rows={3}
              placeholder="What should the team accomplish?"
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Create sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SprintCard({ sprint, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const stats = getSprintStats(sprint);

  return (
    <article className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to={`/sprints/${sprint.id}`}
            className="text-base font-semibold text-slate-900 hover:text-indigo-600"
          >
            {sprint.name}
          </Link>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" />
            {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={`${sprint.name} actions`}
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
              <Link
                to={`/sprints/${sprint.id}`}
                className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                View sprint
              </Link>

              <button
                type="button"
                className="flex w-full rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(sprint);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete sprint
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <StatusBadge status={sprint.status} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">Completion</span>
          <span className="font-semibold text-slate-900">
            {stats.completionRate}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${
              sprint.status === "Completed"
                ? "bg-emerald-500"
                : "bg-indigo-500"
            }`}
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-100 pt-4">
        <div className="pr-3">
          <p className="text-xs text-slate-500">Tasks</p>
          <p className="mt-1 font-semibold text-slate-900">{stats.total}</p>
        </div>

        <div className="px-3">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="mt-1 font-semibold text-emerald-600">
            {stats.completed}
          </p>
        </div>

        <div className="pl-3">
          <p className="text-xs text-slate-500">Velocity</p>
          <p className="mt-1 font-semibold text-slate-900">
            {stats.completed}/{stats.total}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Sprints() {
  const [sprints, setSprints] = useState(SPRINTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteSprint, setDeleteSprint] = useState(null);

  const currentSprint = useMemo(
    () => sprints.find((sprint) => sprint.status === "Active"),
    [sprints]
  );

  const currentStats = getSprintStats(currentSprint);

  const handleCreateSprint = (sprint) => {
    setSprints((current) => [sprint, ...current]);
  };

  const handleDeleteSprint = () => {
    if (!deleteSprint) return;

    setSprints((current) =>
      current.filter((sprint) => sprint.id !== deleteSprint.id)
    );

    setDeleteSprint(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sprints
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Plan, track, and review your team's development sprints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New sprint
        </button>
      </div>

      {/* Current Sprint */}
      {currentSprint ? (
        <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-indigo-50/40 px-5 py-4 sm:px-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Current sprint
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {currentSprint.name}
                </h2>
              </div>

              <StatusBadge status={currentSprint.status} />
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" />
                {formatDate(currentSprint.startDate)} –{" "}
                {formatDate(currentSprint.endDate)}
              </div>

              {currentSprint.goal && (
                <div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-4">
                  <Target className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Sprint goal
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {currentSprint.goal}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Progress
                  </span>

                  <span className="text-sm font-semibold text-indigo-600">
                    {currentStats.completionRate}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{
                      width: `${currentStats.completionRate}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {currentStats.completed} of {currentStats.total} tasks
                  completed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              <StatItem
                icon={CheckCircle2}
                label="Completed"
                value={currentStats.completed}
                iconClass="text-emerald-500"
              />

              <StatItem
                icon={Clock3}
                label="In progress"
                value={currentStats.inProgress}
                iconClass="text-amber-500"
              />

              <StatItem
                icon={Circle}
                label="Remaining"
                value={currentStats.remaining}
                iconClass="text-slate-400"
              />

              <StatItem
                icon={CalendarDays}
                label="Days left"
                value={getDaysRemaining(currentSprint.endDate)}
                iconClass="text-indigo-500"
              />
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Target className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 font-semibold text-slate-900">
            No active sprint
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a sprint to start planning your team's work.
          </p>
        </div>
      )}

      {/* Current Sprint Stats */}
      {currentSprint && (
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Sprint statistics
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatItem
              icon={Target}
              label="Total tasks"
              value={currentStats.total}
            />

            <StatItem
              icon={CheckCircle2}
              label="Completed"
              value={currentStats.completed}
              iconClass="text-emerald-500"
            />

            <StatItem
              icon={TrendingUp}
              label="In progress"
              value={currentStats.inProgress}
              iconClass="text-amber-500"
            />

            <StatItem
              icon={Circle}
              label="Remaining"
              value={currentStats.remaining}
              iconClass="text-slate-400"
            />

            <StatItem
              icon={CheckCircle2}
              label="Completion"
              value={`${currentStats.completionRate}%`}
              iconClass="text-indigo-500"
            />
          </div>
        </section>
      )}

      {/* Sprint Velocity */}
      <ProductivityChart data={VELOCITY_CHART_DATA} />

      {/* All Sprints */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All sprints
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review current and previous development cycles.
            </p>
          </div>
        </div>

        {sprints.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {sprints.map((sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                onDelete={setDeleteSprint}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 font-semibold text-slate-900">
              No sprints yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your first sprint to get started.
            </p>
          </div>
        )}
      </section>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSprintModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSprint}
        />
      )}

      {/* Delete Confirmation */}
      {deleteSprint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={() => setDeleteSprint(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-sprint-title"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            <h2
              id="delete-sprint-title"
              className="mt-4 text-lg font-semibold text-slate-900"
            >
              Delete {deleteSprint.name}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will remove the sprint from this local sprint list. This
              action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteSprint(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteSprint}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete sprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}