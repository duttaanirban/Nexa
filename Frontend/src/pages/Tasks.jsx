import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, ListChecks, X } from "lucide-react";

import TaskCard from "../components/dashboard/TaskCard";
import { api } from "../api/api";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import Toast from "../components/ui/Toast";

const PRIORITY_FILTERS = [
  { value: "all", label: "All priorities" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const EMPTY_FORM = {
  title: "",
  project: "",
  assignee: "",
  due: "",
  priority: "Medium",
  status: "todo",
};

export default function Tasks({ filters = [] }) {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );

  const isBacklogView =
  searchParams.get("status") === "todo";
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({
    open: false,
    message: "",
  });

  const safeFilters = Array.isArray(filters) ? filters : [];

  /* ------------------------------------------------------------
     Toast helpers
  ------------------------------------------------------------ */

  const showToast = (message) => {
    setToast({
      open: true,
      message,
    });

    setTimeout(() => {
      setToast({
        open: false,
        message: "",
      });
    }, 3000);
  };

  const closeToast = () => {
    setToast({
      open: false,
      message: "",
    });
  };

  /* ------------------------------------------------------------
     Load tasks, users and projects
  ------------------------------------------------------------ */

  const loadTasks = async () => {
    try {
      setApiError(null);

      const response = await api.getTasks();

      setTasks(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Tasks API error:", error);

      setApiError(
        error?.message ||
          "We couldn't load the tasks."
      );
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setApiError(null);

      try {
        const [
          tasksResponse,
          usersResponse,
          projectsResponse,
        ] = await Promise.all([
          api.getTasks(),
          api.getUsers(),
          api.getProjects(),
        ]);

        setTasks(
          Array.isArray(tasksResponse.data)
            ? tasksResponse.data
            : []
        );

        setUsers(
          Array.isArray(usersResponse.data)
            ? usersResponse.data
            : []
        );

        setProjects(
          Array.isArray(projectsResponse.data)
            ? projectsResponse.data
            : []
        );
      } catch (error) {
        console.error(
          "Tasks page API error:",
          error
        );

        setApiError(
          error?.message ||
            "We couldn't load the tasks."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  /* ------------------------------------------------------------
     Filtering
  ------------------------------------------------------------ */

  const normalizedQuery = query
    .trim()
    .toLowerCase();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      const matchesProject =
        projectFilter === "all" ||
        task.project === projectFilter;

      const matchesAssignee =
        assigneeFilter === "all" ||
        task.assignee === assigneeFilter;

      const matchesQuery =
        normalizedQuery === "" ||
        task.id
          ?.toLowerCase()
          .includes(normalizedQuery) ||
        task.title
          ?.toLowerCase()
          .includes(normalizedQuery) ||
        task.project
          ?.toLowerCase()
          .includes(normalizedQuery) ||
        task.assignee
          ?.toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesStatus &&
        matchesPriority &&
        matchesProject &&
        matchesAssignee &&
        matchesQuery
      );
    });
  }, [
    tasks,
    statusFilter,
    priorityFilter,
    projectFilter,
    assigneeFilter,
    normalizedQuery,
  ]);

  const hasActiveFilters =
    normalizedQuery !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    projectFilter !== "all" ||
    assigneeFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setProjectFilter("all");
    setAssigneeFilter("all");
  };

  /* ------------------------------------------------------------
     Form helpers
  ------------------------------------------------------------ */

  const openCreateForm = () => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setApiError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      project: task.project || "",
      assignee: task.assignee || "",
      due: task.due || "",
      priority: task.priority || "Medium",
      status: task.status || "todo",
    });

    setApiError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;

    setIsFormOpen(false);
    setEditingTask(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* ------------------------------------------------------------
     Create / Update
  ------------------------------------------------------------ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setApiError("Task title is required.");
      return;
    }

    if (!form.project.trim()) {
      setApiError("Project is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);

      if (editingTask) {
        await api.updateTask(
          editingTask.id,
          {
            ...form,
            title: form.title.trim(),
            project: form.project.trim(),
            assignee: form.assignee.trim(),
            due: form.due.trim(),
          }
        );

        showToast("Task updated successfully.");
      } else {
        await api.createTask({
          ...form,
          title: form.title.trim(),
          project: form.project.trim(),
          assignee: form.assignee.trim(),
          due: form.due.trim(),
        });

        showToast("Task created successfully.");
      }

      await loadTasks();

      setIsFormOpen(false);
      setEditingTask(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error(
        "Task save error:",
        error
      );

      setApiError(
        error?.message ||
          "We couldn't save the task."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------
     Status update
  ------------------------------------------------------------ */

  const handleStatusChange = async (
    task,
    status
  ) => {
    if (task.status === status) return;

    try {
      setApiError(null);

      await api.updateTaskStatus(
        task.id,
        status
      );

      await loadTasks();

      showToast(
        "Task status updated successfully."
      );
    } catch (error) {
      console.error(
        "Task status update error:",
        error
      );

      setApiError(
        error?.message ||
          "We couldn't update the task status."
      );
    }
  };

  /* ------------------------------------------------------------
     Delete
  ------------------------------------------------------------ */

  const requestDelete = (task) => {
    setApiError(null);
    setDeletingTask(task);
  };

  const cancelDelete = () => {
    if (isDeleting) return;

    setDeletingTask(null);
  };

  const confirmDelete = async () => {
    if (!deletingTask || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setApiError(null);

      await api.deleteTask(deletingTask.id);

      setTasks((current) =>
        current.filter(
          (task) =>
            task.id !== deletingTask.id
        )
      );

      setDeletingTask(null);

      showToast("Task deleted successfully.");
    } catch (error) {
      console.error(
        "Task delete error:",
        error
      );

      setApiError(
        error?.message ||
          "We couldn't delete the task."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */

  const resultCount = filteredTasks.length;

  const resultLabel = `${resultCount} task${
    resultCount === 1 ? "" : "s"
  }`;

  if (isLoading) {
    return (
      <main className="flex min-w-0 flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Loading tasks...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isBacklogView ? "Backlog" : "Tasks"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isBacklogView
              ? "Unscheduled tasks waiting to be pulled into a sprint."
              : "Track and organize tasks across your projects."}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <Plus size={16} />
          Create task
        </button>
      </div>

      {/* API error */}
      {apiError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{apiError}</span>

          <button
            type="button"
            onClick={() => setApiError(null)}
            className="rounded p-1 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Search + filters */}
      <section
        aria-label="Search and filter tasks"
        className="flex min-w-0 flex-col gap-4"
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
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Status filters */}
        {safeFilters.length > 0 && (
          <div
            role="group"
            aria-label="Filter tasks by status"
            className="flex flex-wrap items-center gap-1.5"
          >
            {safeFilters.map((filter) => {
              const isActive =
                statusFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      filter.value
                    )
                  }
                  aria-pressed={isActive}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
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

        {/* Priority filters */}
        <div
          role="group"
          aria-label="Filter tasks by priority"
          className="flex flex-wrap items-center gap-1.5"
        >
          {PRIORITY_FILTERS.map((filter) => {
            const isActive =
              priorityFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  setPriorityFilter(
                    filter.value
                  )
                }
                aria-pressed={isActive}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
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

        {/* Project + assignee filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            aria-label="Filter tasks by project"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.name}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            aria-label="Filter tasks by assignee"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.initials}>
                {user.name} ({user.initials})
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Clear all filters
          </button>
        )}
      </section>

      {/* Results */}
      <section
        aria-label="Task results"
        className="flex min-w-0 flex-col gap-4"
      >
        <p
          className="text-sm text-slate-500"
          aria-live="polite"
        >
          {hasActiveFilters
            ? `${resultLabel} of ${tasks.length} total`
            : resultLabel}
        </p>

        {resultCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <ListChecks
                size={18}
                className="text-slate-400"
              />
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
                className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear search &amp; filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showActions={true}
                onEdit={openEditForm}
                onDelete={requestDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create / Edit modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="task-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editingTask
                    ? "Edit task"
                    : "Create task"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingTask
                    ? "Update the task details."
                    : "Add a new task to your workspace."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close task form"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              {/* Title */}
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Title
                </label>

                <input
                  id="task-title"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Enter task title"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                />
              </div>

              {/* Project */}
              <div>
                <label
                  htmlFor="task-project"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Project
                </label>

                <select
                  id="task-project"
                  name="project"
                  value={form.project}
                  onChange={handleFormChange}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                >
                  <option value="">
                    Select project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.name}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label
                  htmlFor="task-assignee"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Assignee
                </label>

                <select
                  id="task-assignee"
                  name="assignee"
                  value={form.assignee}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                >
                  <option value="">
                    Unassigned
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.initials}
                    >
                      {user.name} ({user.initials})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due */}
              <div>
                <label
                  htmlFor="task-due"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Due
                </label>

                <input
                  id="task-due"
                  name="due"
                  value={form.due}
                  onChange={handleFormChange}
                  placeholder="e.g. Tomorrow"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Priority */}
                <div>
                  <label
                    htmlFor="task-priority"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Priority
                  </label>

                  <select
                    id="task-priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                  >
                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="task-status"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Status
                  </label>

                  <select
                    id="task-status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                  >
                    {safeFilters
                      .filter(
                        (filter) =>
                          filter.value !==
                          "all"
                      )
                      .map((filter) => (
                        <option
                          key={filter.value}
                          value={filter.value}
                        >
                          {filter.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingTask
                      ? "Save changes"
                      : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <DeleteConfirmModal
        open={Boolean(deletingTask)}
        title="Delete task?"
        itemName={deletingTask?.title}
        description="This action cannot be undone."
        isDeleting={isDeleting}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {/* Success toast */}
      <Toast
        open={toast.open}
        message={toast.message}
        onClose={closeToast}
      />
    </main>
  );
}