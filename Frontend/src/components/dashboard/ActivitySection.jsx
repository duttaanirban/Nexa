import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  FolderKanban,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

const ACTIVITY_VARIANTS = {
  "task-completed": {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  "project-updated": {
    icon: FolderKanban,
    className: "bg-blue-50 text-blue-700",
  },
  "task-created": {
    icon: PlusCircle,
    className: "bg-violet-50 text-violet-700",
  },
  "task-blocked": {
    icon: AlertCircle,
    className: "bg-red-50 text-red-700",
  },
  "project-progress": {
    icon: TrendingUp,
    className: "bg-amber-50 text-amber-700",
  },
};

const FALLBACK_ACTIVITY = {
  icon: Circle,
  className: "bg-slate-100 text-slate-600",
};

/**
 * ActivitySection
 *
 * Renders a chronological feed of recent dashboard activity.
 *
 * Props:
 * - activities: Array of activity objects
 */
export default function ActivitySection({
  activities = [],
}) {
  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="flex flex-col gap-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2
          id="recent-activity-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Recent activity
        </h2>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          aria-label="View all activity"
        >
          View all
          <ArrowRight
            size={14}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Empty state */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Circle
              size={18}
              className="text-slate-400"
              aria-hidden="true"
            />
          </div>

          <p className="text-sm font-medium text-slate-700">
            No recent activity
          </p>

          <p className="max-w-sm text-sm text-slate-500">
            Updates from your projects and tasks will appear here.
          </p>
        </div>
      ) : (
        /* Activity feed */
        <ol className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {activities.map((activity, index) => {
            const activityVariant =
              ACTIVITY_VARIANTS[activity.type] ??
              FALLBACK_ACTIVITY;

            const ActivityIcon = activityVariant.icon;

            const activityTitle =
              activity.title || "Activity update";

            const isLast =
              index === activities.length - 1;

            return (
              <li
                key={activity.id}
                className={`relative flex gap-3 ${
                  !isLast ? "pb-5" : ""
                }`}
              >
                {/* Timeline connector */}
                {!isLast && (
                  <span
                    className="absolute left-4 top-8 h-[calc(100%-1.5rem)] w-px bg-slate-200"
                    aria-hidden="true"
                  />
                )}

                {/* Activity icon */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activityVariant.className}`}
                  aria-hidden="true"
                >
                  <ActivityIcon size={16} />
                </div>

                {/* Activity content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {activityTitle}
                    </p>

                    <time className="shrink-0 text-xs text-slate-400">
                      {activity.time || "Time unavailable"}
                    </time>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {activity.description ||
                      "No description available"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>
                      Project:{" "}
                      {activity.project || "No project"}
                    </span>

                    <span aria-hidden="true">
                      &bull;
                    </span>

                    <span>
                      By {activity.user || "Unknown user"}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}