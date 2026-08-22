import { FolderKanban, ArrowRight } from "lucide-react";
import ProjectCard from "./ProjectCard.jsx";

/**
 * ProjectSection
 *
 * Section wrapper for the dashboard's project grid. Owns only the
 * heading, "View all" action, empty state, and responsive grid.
 *
 * Props:
 * - projects: Array<{ id: string, ... }>
 *   Shape matches ProjectCard's `project` prop.
 *
 * Usage:
 *   import { PROJECTS } from "../../data/mockData";
 *   <ProjectSection projects={PROJECTS} />
 */
export default function ProjectSection({ projects = [] }) {
  return (
    <section
      aria-labelledby="projects-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h2
          id="projects-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Projects
        </h2>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          aria-label="View all projects"
        >
          View all
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>

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
            Projects you create or get added to will show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
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