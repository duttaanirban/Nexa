import { useMemo, useState } from "react";
import { Search, ListChecks } from "lucide-react";
import TaskCard from "../components/dashboard/TaskCard";

const PRIORITY_FILTERS = [
  { value: "all", label: "All priorities" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

/**
 * Tasks
 *
 * Searchable, filterable tasks page. Fully driven by the `tasks` and
 * `filters` props — no data is imported or fetched here, and
 * TaskCard's own markup/styling is reused as-is.
 *
 * Props:
 * - tasks: Array — same shape TaskCard expects (id, title, project,
 *   assignee, due, priority, status).
 * - filters: Array<{ value: string, label: string }> — status filter
 *   options, e.g. { value: "all", label: "All" },
 *   { value: "in-progress", label: "In progress" }.
 *
 * Usage (e.g. wired up as the `/tasks` route):
 *   import { TASKS, TASK_FILTERS } from "../data/mockData";
 *   <Tasks tasks={TASKS} filters={TASK_FILTERS} />
 */
export default function Tasks({ tasks = [], filters = [] }) {
  const safeFilters = Array.isArray(filters) ? filters : [];

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    return safeTasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      const matchesQuery =
        normalizedQuery === "" ||
        task.id?.toLowerCase().includes(normalizedQuery) ||
        task.title?.toLowerCase().includes(normalizedQuery) ||
        task.project?.toLowerCase().includes(normalizedQuery) ||
        task.assignee?.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesPriority && matchesQuery;
    });
  }, [tasks, statusFilter, priorityFilter, normalizedQuery]);

  const hasActiveFilters =
    normalizedQuery !== "" || statusFilter !== "all" || priorityFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const resultCount = filteredTasks.length;
  const resultLabel = `${resultCount} task${resultCount === 1 ? "" : "s"}`;

  return (
    <main className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and organize tasks across your projects.
        </p>
      </div>

      {/* Search + filters */}
      <section aria-label="Search and filter tasks" className="flex flex-col gap-4">
        <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30">
          <Search size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks by ID, title, project, or assignee"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {safeFilters.length > 0 && (
          <div
            role="group"
            aria-label="Filter tasks by status"
            className="flex flex-wrap items-center gap-1.5"
          >
            {safeFilters.map((filter) => {
              const isActive = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  aria-pressed={isActive}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}

        <div
          role="group"
          aria-label="Filter tasks by priority"
          className="flex flex-wrap items-center gap-1.5"
        >
          {PRIORITY_FILTERS.map((filter) => {
            const isActive = priorityFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setPriorityFilter(filter.value)}
                aria-pressed={isActive}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <section aria-label="Task results" className="flex flex-col gap-4">
        <p className="text-sm text-slate-500" aria-live="polite">
          {resultLabel}
        </p>

        {resultCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <ListChecks size={18} className="text-slate-400" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              No tasks found
            </h2>
            <p className="max-w-sm text-sm text-slate-500">
              Try changing your search or filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                Clear search &amp; filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}