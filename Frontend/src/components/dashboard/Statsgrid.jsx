import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const ICONS = {
  "active-projects": FolderKanban,
  completed: CheckCircle2,
  "in-progress": Clock3,
  overdue: AlertCircle,
};

const STYLES = {
  up: {
    icon: "bg-indigo-50 text-indigo-600",
    trend: "bg-emerald-50 text-emerald-600",
    line: "bg-indigo-500",
  },
  neutral: {
    icon: "bg-amber-50 text-amber-600",
    trend: "bg-slate-100 text-slate-600",
    line: "bg-amber-400",
  },
  down: {
    icon: "bg-red-50 text-red-600",
    trend: "bg-red-50 text-red-600",
    line: "bg-red-500",
  },
};

const TREND_ICONS = {
  up: TrendingUp,
  neutral: Minus,
  down: TrendingDown,
};

export default function StatsGrid({ stats = [] }) {
  return (
    <section
      aria-label="Dashboard statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = ICONS[stat.id] ?? FolderKanban;
        const TrendIcon = TREND_ICONS[stat.trend] ?? Minus;
        const style = STYLES[stat.trend] ?? STYLES.neutral;

        return (
          <article
            key={stat.id}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}
              >
                <Icon size={20} strokeWidth={2} />
              </div>

              <div className="flex h-10 items-end gap-1">
                {[30, 45, 35, 60, 50, 72, 65].map((height, index) => (
                  <span
                    key={index}
                    className={`w-1 rounded-full ${style.line}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              {stat.label}
            </p>

            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold tracking-tight text-slate-950">
                {stat.value}
              </p>

              <span
                className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${style.trend}`}
              >
                <TrendIcon size={12} />
                {stat.delta}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              vs last period
            </p>
          </article>
        );
      })}
    </section>
  );
}