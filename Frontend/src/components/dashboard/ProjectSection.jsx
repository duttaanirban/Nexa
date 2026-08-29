import { useState } from "react";
import { FolderKanban, ArrowRight } from "lucide-react";
import ProjectCard from "./ProjectCard.jsx";

/**
 * ProjectSection
 *
 * Dashboard project section.
 *
 * Dashboard behavior:
 * - Shows the latest 3 projects by default.
 * - "View all" expands the complete project list.
 * - "View less" collapses it back to 3 projects.
 *
 * The dedicated Projects page continues to show all projects.
 */
export default function ProjectSection({
  projects = [],
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleProjects = showAll
    ? projects
    : projects.slice(0, 3);

  const hasMoreProjects = projects.length > 3;

  return (
    <section
      aria-labelledby="projects-heading"
      className="flex flex-col gap-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2
          id="projects-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Projects
        </h2>

        {hasMoreProjects && (
          <button
            type="button"
            onClick={() =>
              setShowAll((current) => !current)
            }
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            aria-expanded={showAll}
            aria-label={
              showAll
                ? "View fewer projects"
                : "View all projects"
            }
          >
            {showAll ? "View less" : "View all"}

            <ArrowRight
              size={14}
              aria-hidden="true"
              className={`transition-transform ${
                showAll ? "-rotate-90" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <FolderKanban
              size={18}
              className="text-slate-400"
              aria-hidden="true"
            />
          </div>

          <p className="text-sm font-medium text-slate-700">
            No projects yet
          </p>

          <p className="max-w-sm text-sm text-slate-500">
            Projects you create or get added to will
            show up here.
          </p>
        </div>
      ) : (
        /* Project grid */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      )}
    </section>
  );
}