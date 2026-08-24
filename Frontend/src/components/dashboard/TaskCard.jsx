import {
  AlertCircle,
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Info,
  XCircle,
} from "lucide-react";
import {
  TASK_PRIORITIES,
  TASK_STATUS,
} from "../../data/mockData";

/**
 * Maps priority variants to their visual treatment.
 * The priority data itself remains in mockData.js.
 */
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

/**
 * Maps status variants to icons.
 * Colors and labels come from TASK_STATUS in mockData.js.
 */
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
 * Renders one task summary using only the supplied task data.
 *
 * Props:
 * - task: {
 *     id: string
 *     title: string
 *     project: string
 *     assignee: string
 *     due: string
 *     priority: string
 *     status: string
 *   }
 */
export default function TaskCard({ task = {} }) {
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
    STATUS_ICONS[statusDetails.variant] ?? STATUS_ICONS.neutral;

  const PriorityIcon = priorityStyle.icon;

  return (
    <article
      className="min-w-0 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
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

        {/* Status */}
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
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
          <CalendarDays size={15} aria-hidden="true" />
          <span>{due}</span>
        </span>

        {/* Priority */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${priorityStyle.className}`}
          aria-label={priorityStyle.label}
        >
          <PriorityIcon size={13} aria-hidden="true" />
          <span>{priority}</span>
        </span>
      </div>
    </article>
  );
}