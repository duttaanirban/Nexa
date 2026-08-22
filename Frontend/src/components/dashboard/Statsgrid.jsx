import StatCard from "./Statcard.jsx"

/**
 * StatsGrid
 *
 * Renders a responsive grid of StatCard components from a `stats`
 * array. No data lives here — purely a layout + mapping wrapper
 * around StatCard.
 *
 * Props:
 * - stats: Array<{
 *     id: string
 *     label: string
 *     value: string
 *     delta: string
 *     trend: "up" | "down" | "neutral"
 *   }>
 *
 * Usage:
 *   import { STATS } from "../data/mockData";
 *   <StatsGrid stats={STATS} />
 */
export default function StatsGrid({ stats = [] }) {
  if (stats.length === 0) return null;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      role="group"
      aria-label="Key statistics"
    >
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}