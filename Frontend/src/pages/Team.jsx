import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Mail,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { api } from "../api/api";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import Toast from "../components/ui/Toast";

const EMPTY_FORM = {
  name: "",
  role: "",
  initials: "",
  email: "",
};

export default function Team() {
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deletingMember, setDeletingMember] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
  });

  /* ------------------------------------------------------------
     Toast
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
     Load members
  ------------------------------------------------------------ */

  const loadTeamData = async () => {
    try {
      setApiError(null);

      const [usersResponse, tasksResponse] = await Promise.all([
        api.getUsers(),
        api.getTasks(),
      ]);

      setMembers(
        Array.isArray(usersResponse.data)
          ? usersResponse.data
          : []
      );

      setTasks(
        Array.isArray(tasksResponse.data)
          ? tasksResponse.data
          : []
      );
    } catch (error) {
      console.error("Team API error:", error);

      setApiError(
        error?.message ||
          "We couldn't load the team data."
      );
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      await loadTeamData();

      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  /* ------------------------------------------------------------
     Search
  ------------------------------------------------------------ */

  const normalizedQuery = query
    .trim()
    .toLowerCase();

  const filteredMembers = useMemo(() => {
    const safeMembers = Array.isArray(members)
      ? members
      : [];

    if (normalizedQuery === "") {
      return safeMembers;
    }

    return safeMembers.filter(
      (member) =>
        member.name
          ?.toLowerCase()
          .includes(normalizedQuery) ||
        member.role
          ?.toLowerCase()
          .includes(normalizedQuery) ||
        member.initials
          ?.toLowerCase()
          .includes(normalizedQuery) ||
        member.email
          ?.toLowerCase()
          .includes(normalizedQuery)
    );
  }, [members, normalizedQuery]);

  /* ------------------------------------------------------------
     Create / Edit form
  ------------------------------------------------------------ */

  const openCreateForm = () => {
    setEditingMember(null);
    setForm(EMPTY_FORM);
    setApiError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (member) => {
    setEditingMember(member);

    setForm({
      name: member.name || "",
      role: member.role || "",
      initials: member.initials || "",
      email: member.email || "",
    });

    setApiError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;

    setIsFormOpen(false);
    setEditingMember(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.role.trim() ||
      !form.initials.trim() ||
      !form.email.trim()
    ) {
      setApiError(
        "Name, role, initials, and email are required."
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);

      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        initials: form.initials.trim().toUpperCase(),
        email: form.email.trim(),
      };

      if (editingMember) {
        await api.updateUser(
          editingMember.id,
          payload
        );

        showToast("Team member updated successfully.");
      } else {
        await api.createUser(payload);

        showToast("Team member created successfully.");
      }

      await loadTeamData();

      setIsFormOpen(false);
      setEditingMember(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error(
        "Team member save error:",
        error
      );

      setApiError(
        error?.message ||
          "We couldn't save the team member."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------
     Delete
  ------------------------------------------------------------ */

  const requestDelete = (member) => {
    setApiError(null);
    setDeletingMember(member);
  };

  const cancelDelete = () => {
    if (isDeleting) return;

    setDeletingMember(null);
  };

  const confirmDelete = async () => {
    if (!deletingMember || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setApiError(null);

      await api.deleteUser(deletingMember.id);

      setMembers((current) =>
        current.filter(
          (member) =>
            member.id !== deletingMember.id
        )
      );

      setDeletingMember(null);

      showToast("Team member deleted successfully.");
    } catch (error) {
      console.error(
        "Team member delete error:",
        error
      );

      setApiError(
        error?.message ||
          "We couldn't delete the team member."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------
     Workload
  ------------------------------------------------------------ */

  const getMemberStats = (member) => {
    const assignedTasks = tasks.filter(
      (task) => task.assignee === member.initials
    );

    const completedTasks = assignedTasks.filter(
      (task) => task.status === "done"
    ).length;

    const activeTasks = assignedTasks.filter(
      (task) => task.status !== "done"
    ).length;

    const blockedTasks = assignedTasks.filter(
      (task) => task.status === "blocked"
    ).length;

    const workload =
      assignedTasks.length === 0
        ? 0
        : Math.min(
            100,
            Math.round(
              (activeTasks / assignedTasks.length) * 100
            )
          );

    return {
      assignedTasks: assignedTasks.length,
      completedTasks,
      activeTasks,
      blockedTasks,
      workload,
    };
  };

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */

  const hasActiveSearch = normalizedQuery !== "";

  const clearSearch = () => {
    setQuery("");
  };

  const resultCount = filteredMembers.length;

  const resultLabel = `${resultCount} member${
    resultCount === 1 ? "" : "s"
  }`;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Team
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Loading team members...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Team
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            See who's working on what across the team.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <Plus size={16} />
          Add member
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

      {/* Search */}
      <section
        aria-label="Search team members"
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
            placeholder="Search team members..."
            aria-label="Search team members by name, role, initials, or email"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </section>

      {/* Results */}
      <section
        aria-label="Team member results"
        className="flex flex-col gap-4"
      >
        <p
          className="text-sm text-slate-500"
          aria-live="polite"
        >
          {resultLabel}
        </p>

        {resultCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Users
                size={18}
                className="text-slate-400"
                aria-hidden="true"
              />
            </div>

            <h2 className="text-sm font-semibold text-slate-900">
              No team members found
            </h2>

            <p className="max-w-sm text-sm text-slate-500">
              Try changing your search.
            </p>

            {hasActiveSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map(
              (member, index) => (
                <div
                  key={
                    member.id ??
                    `${member.name}-${index}`
                  }
                  className="relative flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {member.initials}
                  </div>

                  {/* Member details */}
                  <div className="min-w-0 flex-1 pr-7">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {member.name}
                    </p>

                    <p className="truncate text-sm text-slate-500">
                      {member.role}
                    </p>

                    {member.email && (
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-400">
                        <Mail
                          size={12}
                          aria-hidden="true"
                        />

                        {member.email}
                      </p>
                    )}

                    {(() => {
                      const stats = getMemberStats(member);

                      return (
                        <div className="mt-4">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-slate-500">
                              Workload
                            </span>
                            <span className="font-medium text-slate-700">
                              {stats.workload}%
                            </span>
                          </div>

                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all"
                              style={{
                                width: `${stats.workload}%`,
                              }}
                            />
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="rounded-lg bg-slate-50 px-2 py-2">
                              <p className="text-[11px] text-slate-500">
                                Assigned
                              </p>
                              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                                {stats.assignedTasks}
                              </p>
                            </div>

                            <div className="rounded-lg bg-slate-50 px-2 py-2">
                              <p className="text-[11px] text-slate-500">
                                Active
                              </p>
                              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                                {stats.activeTasks}
                              </p>
                            </div>

                            <div className="rounded-lg bg-slate-50 px-2 py-2">
                              <p className="text-[11px] text-slate-500">
                                Done
                              </p>
                              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                                {stats.completedTasks}
                              </p>
                            </div>
                          </div>

                          {stats.blockedTasks > 0 && (
                            <p className="mt-2 text-xs font-medium text-red-600">
                              {stats.blockedTasks} blocked task
                              {stats.blockedTasks === 1 ? "" : "s"}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action menu */}
                  <details className="absolute right-3 top-3">
                    <summary
                      className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      aria-label={`Actions for ${member.name}`}
                    >
                      <MoreVertical
                        size={17}
                        aria-hidden="true"
                      />
                    </summary>

                    <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.currentTarget
                            .closest("details")
                            ?.removeAttribute(
                              "open"
                            );

                          openEditForm(member);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Pencil
                          size={15}
                          className="text-slate-500"
                        />

                        Edit member
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.currentTarget
                            .closest("details")
                            ?.removeAttribute(
                              "open"
                            );

                          requestDelete(member);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={15} />

                        Delete member
                      </button>
                    </div>
                  </details>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Create / Edit modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
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
            aria-labelledby="member-form-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="member-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editingMember
                    ? "Edit team member"
                    : "Add team member"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingMember
                    ? "Update the member details."
                    : "Add a new member to your team."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close member form"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="member-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Name
                </label>

                <input
                  id="member-name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Enter full name"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                />
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="member-role"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Role
                </label>

                <input
                  id="member-role"
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  placeholder="e.g. Frontend Developer"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                />
              </div>

              {/* Initials */}
              <div>
                <label
                  htmlFor="member-initials"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Initials
                </label>

                <input
                  id="member-initials"
                  name="initials"
                  value={form.initials}
                  onChange={handleFormChange}
                  placeholder="e.g. AK"
                  maxLength={3}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="member-email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="member-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="name@example.com"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                />
              </div>

              {/* Form actions */}
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
                    : editingMember
                      ? "Save changes"
                      : "Add member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <DeleteConfirmModal
        open={Boolean(deletingMember)}
        title="Delete team member?"
        itemName={deletingMember?.name}
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
    </div>
  );
}