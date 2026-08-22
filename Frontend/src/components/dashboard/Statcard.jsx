import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Visual configuration for each supported trend type.
 * The data layer only provides the trend value; this component
 * decides how that value should be presented visually.
 */
const TREND_STYLES = {
  up: {
    icon: TrendingUp,
    badgeClass: "bg-emerald-50 text-emerald-700",
    label: "Trending up",
  },
  down: {
    icon: TrendingDown,
    badgeClass: "bg-red-50 text-red-700",
    label: "Trending down",
  },
  neutral: {
    icon: Minus,
    badgeClass: "bg-slate-100 text-slate-600",
    label: "No change",
  },
};

/**
 * StatCard
 *
 * Renders a single dashboard metric.
 *
 * Props:
 * - stat: {
 *     id: string
 *     label: string
 *     value: string
 *     delta: string
 *     trend: "up" | "down" | "neutral"
 *   }
 *
 * Usage:
 *   <StatCard stat={stat} />
 */
export default function StatCard({ stat }) {
  const {
    label,
    value,
    delta,
    trend = "neutral",
  } = stat;

  const {
    icon: TrendIcon,
    badgeClass,
    label: trendLabel,
  } = TREND_STYLES[trend] ?? TREND_STYLES.neutral;

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
      role="group"
      aria-label={label}
    >
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </span>
      </div>

      <div
        className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}
      >
        <TrendIcon
          size={13}
          aria-hidden="true"
        />

        <span className="sr-only">
          {trendLabel}:{" "}
        </span>

        <span>{delta}</span>
      </div>
    </div>
  );
}