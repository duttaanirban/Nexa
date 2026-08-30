import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
  Info,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const VARIANT_STYLES = {
  success: {
    icon: CheckCircle2,
    badgeClass: "bg-emerald-50 text-emerald-700",
    barClass: "bg-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: "bg-amber-50 text-amber-700",
    barClass: "bg-amber-500",
  },
  danger: {
    icon: XCircle,
    badgeClass: "bg-red-50 text-red-700",
    barClass: "bg-red-500",
  },
  info: {
    icon: Info,
    badgeClass: "bg-blue-50 text-blue-700",
    barClass: "bg-blue-500",
  },
  neutral: {
    icon: Circle,
    badgeClass: "bg-slate-100 text-slate-600",
    barClass: "bg-slate-400",
  },
};

export default function ProjectCard({
  project,
  showActions = false,
  onEdit = () => {},
  onDelete = () => {},
}) {
  const navigate = useNavigate();

  const {
    id,
    name,
    description,
    progress,
    status,
    variant = "neutral",
    team = [],
  } = project;

  const {
    icon: StatusIcon,
    badgeClass,
    barClass,
  } = VARIANT_STYLES[variant] ?? VARIANT_STYLES.neutral;

  const clampedProgress = Math.min(
    100,
    Math.max(0, Number(progress) || 0)
  );

  const openProject = () => {
    navigate(`/projects/${id}`);
  };

  return (
    <div
      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
      role="link"
      tabIndex={0}
      aria-label={`View ${name} project details`}
      onClick={openProject}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProject();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-slate-400">{id}</p>
          <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
            {name}
          </h3>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}
          >
            <StatusIcon size={13} aria-hidden="true" />
            {status}
          </span>

          {showActions && (
            <details
              className="relative"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <summary
                className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                aria-label={`Actions for ${name}`}
              >
                <MoreVertical size={17} aria-hidden="true" />
              </summary>

              <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.currentTarget
                      .closest("details")
                      ?.removeAttribute("open");
                    onEdit(project);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Pencil size={15} className="text-slate-500" />
                  Edit project
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.currentTarget
                      .closest("details")
                      ?.removeAttribute("open");
                    onDelete(project);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Delete project
                </button>
              </div>
            </details>
          )}
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Progress</span>
          <span className="font-semibold text-slate-900">
            {clampedProgress}%
          </span>
        </div>

        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={`${name} progress`}
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full ${barClass}`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      {team.length > 0 && (
        <div
          className="mt-4 flex -space-x-2"
          role="group"
          aria-label="Team members"
        >
          {team.map((initials, index) => (
            <div
              key={`${id}-${initials}-${index}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold text-slate-700"
            >
              {initials}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
