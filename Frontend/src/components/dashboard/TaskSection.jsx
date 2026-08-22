import { useState } from "react";
import { Search, ArrowRight, ListChecks } from "lucide-react";
import TaskCard from "./TaskCard";

/**
 * TaskSection
 *
 * Dashboard section for displaying, searching, and filtering tasks.
 *
 * Props:
 * - tasks: Array of task objects
 * - filters: Array<{ value: string, label: string }>
 */
export default function TaskSection({
  tasks = [],
  filters = [],
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      selectedFilter === "all" ||
      task.status === selectedFilter;

    const searchableText = [
      task.title,
      task.project,
      task.id,
      task.assignee,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matchesFilter &&
      searchableText.includes(normalizedQuery)
    );
  });

  return (
    <section
      aria-labelledby="tasks-heading"
      className="flex flex-col gap-4"
    >
      {/* Section header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="tasks-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Tasks
          </h2>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            aria-label="View all tasks"
          >
            View all
            <ArrowRight
              size={14}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Search */}
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">
            Search tasks
          </span>

          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label="Task filters"
        >
          {filters.map((filter) => {
            const isSelected =
              filter.value === selectedFilter;

            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  setSelectedFilter(filter.value)
                }
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Task list / empty state */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <ListChecks
              size={18}
              className="text-slate-400"
              aria-hidden="true"
            />
          </div>

          <p className="text-sm font-medium text-slate-700">
            {tasks.length === 0
              ? "No tasks yet"
              : "No matching tasks"}
          </p>

          <p className="max-w-sm text-sm text-slate-500">
            {tasks.length === 0
              ? "Tasks will appear here when they are added."
              : "Try a different search term or task filter."}
          </p>
        </div>
      )}
    </section>
  );
}