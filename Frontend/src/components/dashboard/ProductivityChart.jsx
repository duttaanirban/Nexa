import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Extracts finite numeric values for a given field, dropping any
 * entry where the value is missing, non-numeric, or NaN.
 */
function getValidNumbers(data, field) {
  return data
    .map((entry) => Number(entry?.[field]))
    .filter((value) => Number.isFinite(value));
}

/**
 * Rounds to 1 decimal place for display; returns 0 for an empty set
 * instead of dividing by zero.
 */
function average(values) {
  if (values.length === 0) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-slate-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-1.5 text-slate-600">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          {entry.name}: <span className="font-medium text-slate-900">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * ProductivityChart
 *
 * Presentational analytics card: opened vs. closed task counts over
 * time, plus a derived summary row. Fully driven by the `data` prop
 * — no data is imported, fetched, or hardcoded here.
 *
 * Props:
 * - data: Array<{ day: string, opened: number, closed: number }>
 *
 * Usage:
 *   import { VELOCITY_CHART_DATA } from "../../data/mockdata";
 *   <ProductivityChart data={VELOCITY_CHART_DATA} />
 */
export default function ProductivityChart({ data = [] }) {
  const hasData = Array.isArray(data) && data.length > 0;

  const openedValues = hasData ? getValidNumbers(data, "opened") : [];
  const closedValues = hasData ? getValidNumbers(data, "closed") : [];

  const totalOpened = sum(openedValues);
  const totalClosed = sum(closedValues);
  const avgOpened = average(openedValues);
  const avgClosed = average(closedValues);

  return (
    <section
      aria-labelledby="productivity-chart-heading"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="productivity-chart-heading" className="text-base font-semibold text-slate-900">
            Productivity
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Opened vs closed tasks</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {data.length}
        </span>
      </div>

      {!hasData ? (
        <div className="mt-4 flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 text-center sm:h-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
            <BarChart3 size={16} className="text-slate-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-700">No productivity data yet</p>
          <p className="max-w-xs text-xs text-slate-500">
            Opened and closed task counts will appear here once available.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 h-64 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={32}
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 12, color: "#64748B" }}
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  name="Opened"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  name="Closed"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">Avg opened/day</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">{avgOpened}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Avg closed/day</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">{avgClosed}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Total opened</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">{totalOpened}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Total closed</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">{totalClosed}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}