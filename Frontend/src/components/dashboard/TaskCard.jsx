import {
  AlertCircle,
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Info,
  MoreVertical,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  TASK_PRIORITIES,
  TASK_STATUS,
} from "../../data/mockData";

const PRIORITY_STYLES = {
  danger: {
    icon: AlertCircle,
    className: "bg-red-50 text-red-700",
    label: "High priority",
  },
  warning: {
    icon: Clock3,
    className: "bg-amber-50 text-amber-700",
    label: "Medium priority",
  },
  neutral: {
    icon: ArrowDown,
    className: "bg-slate-100 text-slate-600",
    label: "Low priority",
  },
};

const STATUS_ICONS = {
  success: CheckCircle2,
  warning: Clock3,
  info: Info,
  danger: XCircle,
  neutral: Circle,
};

/**
 * TaskCard
 *
 * Displays a task and provides CRUD actions through the
 * three-dot menu.
 *
 * Props:
 * - task: task object
 * - onEdit: called when Edit is selected
 * - onDelete: called when Delete is selected
 * - onStatusChange: called when a new status is selected
 */
  export default function TaskCard({
    task = {},
    showActions = false,
    onEdit = () => {},
    onDelete = () => {},
    onStatusChange = () => {},
  }) {
  const {
    id = "No ID",
    title = "Untitled task",
    project = "No project",
    assignee = "NA",
    due = "No due date",
    priority = "Unspecified",
    status,
  } = task;

  const priorityDetails = TASK_PRIORITIES[priority] ?? {
    variant: "neutral",
  };

  const priorityStyle =
    PRIORITY_STYLES[priorityDetails.variant] ??
    PRIORITY_STYLES.neutral;

  const statusDetails = TASK_STATUS[status] ?? {
    label: status || "Unknown status",
    variant: "neutral",
  };

  const StatusIcon =
    STATUS_ICONS[statusDetails.variant] ??
    STATUS_ICONS.neutral;

  const PriorityIcon = priorityStyle.icon;

  return (
    <article
      className="relative min-w-0 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
      aria-labelledby={`task-title-${id}`}
    >
      {/* Task heading */}
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-slate-400">
            {id}
          </p>

          <h3
            id={`task-title-${id}`}
            className="mt-1 break-words text-base font-semibold leading-6 text-slate-900"
          >
            {title}
          </h3>

          <p className="mt-1 break-words text-sm text-slate-500">
            {project}
          </p>
        </div>

        {/* Actions + Status */}
        <div className="flex shrink-0 items-start gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              statusDetails.variant === "success"
                ? "bg-emerald-50 text-emerald-700"
                : statusDetails.variant === "warning"
                  ? "bg-amber-50 text-amber-700"
                  : statusDetails.variant === "info"
                    ? "bg-blue-50 text-blue-700"
                    : statusDetails.variant === "danger"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-600"
            }`}
          >
            <StatusIcon size={13} aria-hidden="true" />
            {statusDetails.label}
          </span>

          {/* Three-dot menu */}
          { showActions && (<details className="relative">
            <summary
              className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label={`Actions for ${title}`}
            >
              <MoreVertical size={17} aria-hidden="true" />
            </summary>

            <div className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
              {/* Edit */}
              <button
                type="button"
                onClick={(event) => {
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");

                  onEdit(task);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Pencil
                  size={15}
                  className="text-slate-500"
                />
                Edit task
              </button>

              {/* Status options */}
              <div className="my-1 border-t border-slate-100" />

              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Change status
              </p>

              {Object.entries(TASK_STATUS).map(
                ([statusValue, statusInfo]) => (
                  <button
                    key={statusValue}
                    type="button"
                    onClick={(event) => {
                      event.currentTarget
                        .closest("details")
                        ?.removeAttribute("open");

                      onStatusChange(
                        task,
                        statusValue
                      );
                    }}
                    className={[
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      status === statusValue
                        ? "bg-slate-100 font-medium text-slate-900"
                        : "text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span>{statusInfo.label}</span>

                    {status === statusValue && (
                      <CheckCircle2
                        size={14}
                        className="text-indigo-600"
                      />
                    )}
                  </button>
                )
              )}

              <div className="my-1 border-t border-slate-100" />

              {/* Delete */}
              <button
                type="button"
                onClick={(event) => {
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");

                  onDelete(task);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete task
              </button>
            </div>
          </details>)}
        </div>
      </div>

      {/* Task metadata */}
      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
        {/* Assignee */}
        <div className="inline-flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700"
            aria-hidden="true"
          >
            {assignee}
          </span>

          <span>{assignee}</span>
        </div>

        {/* Due date */}
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays
            size={15}
            aria-hidden="true"
          />
          <span>{due}</span>
        </span>

        {/* Priority */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${priorityStyle.className}`}
          aria-label={priorityStyle.label}
        >
          <PriorityIcon
            size={13}
            aria-hidden="true"
          />
          <span>{priority}</span>
        </span>
      </div>
    </article>
  );
}