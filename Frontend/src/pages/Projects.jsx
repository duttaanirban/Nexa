import { useMemo, useState, useEffect } from "react";
import { Search, FolderKanban, Plus } from "lucide-react";
import ProjectCard from "../components/dashboard/ProjectCard";
import { api } from "../api/api";

const STATUS_FILTERS = [
  "All",
  "On track",
  "In progress",
  "Blocked",
];

export default function Projects() {
  const [projects, setProjects] = useState([]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    progress: 0,
    status: "On track",
    team: "",
  });

  const loadProjects = () => {
    setIsLoading(true);

    api.getProjects()
      .then((response) => {
        setProjects(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      })
      .catch((error) => {
        console.error("Projects API error:", error);
        setActionError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus =
        statusFilter === "All" ||
        project.status === statusFilter;

      const matchesQuery =
        normalizedQuery === "" ||
        project.id?.toLowerCase().includes(normalizedQuery) ||
        project.name?.toLowerCase().includes(normalizedQuery) ||
        project.description
          ?.toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [projects, statusFilter, normalizedQuery]);

  const hasActiveFilters =
    normalizedQuery !== "" ||
    statusFilter !== "All";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
  };

  const resultCount = filteredProjects.length;

  const resultLabel = `${resultCount} project${
    resultCount === 1 ? "" : "s"
  }`;

  const openCreateForm = () => {
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
      progress: 0,
      status: "On track",
      team: "",
    });

    setActionError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name || "",
      description: project.description || "",
      progress: project.progress ?? 0,
      status: project.status || "On track",
      team: Array.isArray(project.team)
        ? project.team.join(", ")
        : "",
    });

    setActionError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setActionError(null);

    const projectData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      progress: Math.min(
        100,
        Math.max(0, Number(formData.progress) || 0)
      ),
      status: formData.status,
      team: formData.team
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean),
    };

    if (!projectData.name || !projectData.description) {
      setActionError(
        "Project name and description are required."
      );
      return;
    }

    try {
      if (editingProject) {
        await api.updateProject(
          editingProject.id,
          projectData
        );
      } else {
        await api.createProject(projectData);
      }

      closeForm();
      loadProjects();
    } catch (error) {
      console.error("Project save error:", error);
      setActionError(
        error.message || "Failed to save project."
      );
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);

    try {
      await api.deleteProject(project.id);

      setProjects((current) =>
        current.filter(
          (item) => item.id !== project.id
        )
      );
    } catch (error) {
      console.error("Project delete error:", error);

      setActionError(
        error.message || "Failed to delete project."
      );
    }
  };

  return (
    <main className="flex min-w-0 flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Browse and manage all projects in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <Plus size={16} aria-hidden="true" />
          New project
        </button>
      </div>

      {/* Error */}
      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      {/* Search + filters */}
      <section
        aria-label="Search and filter projects"
        className="flex flex-col gap-4"
      >
        <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30">
          <Search
            size={15}
            className="shrink-0 text-slate-400"
            aria-hidden="true"
          />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
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
            const isActive =
              statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(status)
                }
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
      <section
        aria-label="Project results"
        className="flex flex-col gap-4"
      >
        <p
          className="text-sm text-slate-500"
          aria-live="polite"
        >
          {isLoading
            ? "Loading projects..."
            : resultLabel}
        </p>

        {resultCount === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <FolderKanban
                size={18}
                className="text-slate-400"
                aria-hidden="true"
              />
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
              <ProjectCard
                key={project.id}
                project={project}
                showActions
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create / Edit modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-form-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
            <div className="mb-5">
              <h2
                id="project-form-title"
                className="text-lg font-semibold text-slate-900"
              >
                {editingProject
                  ? "Edit project"
                  : "Create project"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingProject
                  ? "Update the project details."
                  : "Add a new project to your workspace."}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Project name
                </span>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="e.g. Mobile App Revamp"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Description
                </span>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="What is this project about?"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Progress
                  </span>

                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={handleFormChange}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Status
                  </span>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option>On track</option>
                    <option>In progress</option>
                    <option>Blocked</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Team members
                </span>

                <input
                  name="team"
                  value={formData.team}
                  onChange={handleFormChange}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="AK, RS, MN"
                />

                <span className="text-xs text-slate-400">
                  Separate initials with commas.
                </span>
              </label>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  {editingProject
                    ? "Save changes"
                    : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}