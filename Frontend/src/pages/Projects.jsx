import { useMemo, useState } from "react";
import { Search, FolderKanban } from "lucide-react";
import ProjectCard from "../components/dashboard/ProjectCard";

const STATUS_FILTERS = ["All", "On track", "In progress", "Blocked"];

/**
 * Projects
 *
 * Searchable, filterable projects page. Fully driven by the
 * `projects` prop — no data is imported or fetched here, and
 * ProjectCard's own markup/styling is reused as-is.
 *
 * Props:
 * - projects: Array — same shape ProjectCard expects (id, name,
 *   description, progress, status, variant, team).
 *
 * Usage (e.g. wired up as the `/projects` route):
 *   import { PROJECTS } from "../data/mockData";
 *   <Projects projects={PROJECTS} />
 */
export default function Projects({ projects = [] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      const matchesQuery =
        normalizedQuery === "" ||
        project.id?.toLowerCase().includes(normalizedQuery) ||
        project.name?.toLowerCase().includes(normalizedQuery) ||
        project.description?.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [projects, statusFilter, normalizedQuery]);

  const hasActiveFilters = normalizedQuery !== "" || statusFilter !== "All";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
  };

  const resultCount = filteredProjects.length;
  const resultLabel = `${resultCount} project${resultCount === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse and manage all projects in one place.
        </p>
      </div>

      {/* Search + filters */}
      <section aria-label="Search and filter projects" className="flex flex-col gap-4">
        <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30">
          <Search size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            aria-label="Search projects by ID, name, or description"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div
          role="group"
          aria-label="Filter projects by status"
          className="flex flex-wrap items-center gap-1.5"
        >
          {STATUS_FILTERS.map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                aria-pressed={isActive}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {status}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <section aria-label="Project results" className="flex flex-col gap-4">
        <p className="text-sm text-slate-500" aria-live="polite">
          {resultLabel}
        </p>

        {resultCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <FolderKanban size={18} className="text-slate-400" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              No projects found
            </h2>
            <p className="max-w-sm text-sm text-slate-500">
              Try changing your search or filter.
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}