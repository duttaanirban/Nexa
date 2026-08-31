import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/api";
import { useCurrentUser } from "../context/useCurrentUser";

const DEFAULT_PROJECT_OPTIONS = [
  "No default project",
  "Checkout Revamp",
  "Realtime Notifications",
  "Design Tokens",
];

export default function Settings() {
  // Profile
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [initials, setInitials] = useState("");

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(false);

  // Workspace
  const [workspaceName, setWorkspaceName] = useState("Pulse");
  const [defaultProject, setDefaultProject] = useState(
    DEFAULT_PROJECT_OPTIONS[0]
  );
  const [workspaceSaved, setWorkspaceSaved] = useState(false);

  const [searchParams] = useSearchParams();

  const section = searchParams.get("section");
  const profileSectionRef = useRef(null);
  const accountSectionRef = useRef(null);

  const { user: currentUser,
  loading: currentUserLoading,
  updateCurrentUser, } = useCurrentUser();

  /*
   * Load current profile
   */
  useEffect(() => {
  if (currentUserLoading) {
    setProfileLoading(true);
    return;
  }

  if (!currentUser) {
    setProfileLoading(false);
    setProfileError("Unable to load the current user.");
    return;
  }

  setProfileLoading(false);
  setProfileError(null);

  setFullName(currentUser.name || "");
  setRole(currentUser.role || "");
  setEmail(currentUser.email || "");
  setDepartment(currentUser.department || "");
  setPhone(currentUser.phone || "");
  setBio(currentUser.bio || "");
  setInitials(currentUser.initials || "");
}, [currentUser, currentUserLoading]);

/*
 * Scroll to requested settings section
 */
useEffect(() => {
  if (section === "profile") {
    profileSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (section === "account") {
    accountSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, [section]);

  /*
   * Auto-dismiss profile success message
   */
  useEffect(() => {
    if (!profileSaved) return;

    const timer = setTimeout(
      () => setProfileSaved(false),
      2500
    );

    return () => clearTimeout(timer);
  }, [profileSaved]);

  /*
   * Auto-dismiss workspace success message
   */
  useEffect(() => {
    if (!workspaceSaved) return;

    const timer = setTimeout(
      () => setWorkspaceSaved(false),
      2500
    );

    return () => clearTimeout(timer);
  }, [workspaceSaved]);

  /*
   * Save profile
   */
  const handleSaveProfile = async (event) => {
    event.preventDefault();
    
    if (!currentUser?.id) {
      setProfileError("Unable to identify the current user.");
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError(null);
      setProfileSaved(false);

      const response = await api.updateUser(
        currentUser.id,
        {
          name: fullName.trim(),
          role: role.trim(),
          email: email.trim(),
          initials: initials.trim(),
          department: department.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
        }
      );

      const updatedUser = response.data?.data ?? response.data;
      updateCurrentUser(updatedUser);

      setFullName(updatedUser.name || "");
      setRole(updatedUser.role || "");
      setEmail(updatedUser.email || "");
      setInitials(updatedUser.initials || "");
      setDepartment(
        updatedUser.department || ""
      );
      setPhone(updatedUser.phone || "");
      setBio(updatedUser.bio || "");

      setProfileSaved(true);
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setProfileError(
        error.message ||
          "Unable to save profile changes."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  /*
   * Save workspace
   */
  const handleSaveWorkspace = (event) => {
    event.preventDefault();
    setWorkspaceSaved(true);
  };

  /*
   * Delete workspace
   */
  const handleDeleteWorkspace = () => {
    window.confirm(
      "Are you sure you want to delete this workspace? This action cannot be undone."
    );
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and workspace preferences.
        </p>
      </div>

      {/* Profile */}
      <section
        ref={profileSectionRef}
        className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >

        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your personal account details.
          </p>
        </div>

        {profileLoading ? (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ) : (
          <>
            {/* Profile identity */}
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-base font-semibold text-indigo-700">
                {initials || "?"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">
                  {fullName || "Unnamed user"}
                </p>

                <p className="truncate text-sm text-slate-500">
                  {role || "No role specified"}
                </p>
              </div>
            </div>

            {profileError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {profileError}
              </div>
            )}

            <form
              onSubmit={handleSaveProfile}
              className="mt-6 flex flex-col gap-4"
            >
              {/* Name + Role */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="role"
                    className="text-sm font-medium text-slate-700"
                  >
                    Role
                  </label>

                  <input
                    id="role"
                    type="text"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Email + Department */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="department"
                    className="text-sm font-medium text-slate-700"
                  >
                    Department
                  </label>

                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(event) =>
                      setDepartment(event.target.value)
                    }
                    placeholder="e.g. Engineering"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Phone + Initials */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-slate-700"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="initials"
                    className="text-sm font-medium text-slate-700"
                  >
                    Initials
                  </label>

                  <input
                    id="initials"
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(event) =>
                      setInitials(
                        event.target.value
                          .toUpperCase()
                          .slice(0, 3)
                      )
                    }
                    placeholder="MK"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-slate-700"
                >
                  Bio
                </label>

                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(event) =>
                    setBio(event.target.value)
                  }
                  placeholder="Tell your team a little about yourself..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                />
              </div>

              {/* Save */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  {profileSaving
                    ? "Saving..."
                    : "Save changes"}
                </button>

                {profileSaved && (
                  <p
                    role="status"
                    className="text-sm text-emerald-600"
                  >
                    Changes saved successfully.
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </section>

      {/* Notifications */}
      <section
        ref={accountSectionRef}
        className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 className="text-base font-semibold text-slate-900">
          Notifications
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose what you want to be notified about.
        </p>

        <div className="mt-4 flex flex-col divide-y divide-slate-100">

          <div className="flex items-center justify-between gap-4 py-3">
            <label
              htmlFor="emailNotifications"
              className="text-sm text-slate-700"
            >
              Email notifications
            </label>

            <input
              id="emailNotifications"
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) =>
                setEmailNotifications(
                  event.target.checked
                )
              }
              className="peer sr-only"
            />

            <label
              htmlFor="emailNotifications"
              className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-slate-900 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <label
              htmlFor="taskReminders"
              className="text-sm text-slate-700"
            >
              Task reminders
            </label>

            <input
              id="taskReminders"
              type="checkbox"
              checked={taskReminders}
              onChange={(event) =>
                setTaskReminders(
                  event.target.checked
                )
              }
              className="peer sr-only"
            />

            <label
              htmlFor="taskReminders"
              className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-slate-900 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <label
              htmlFor="projectUpdates"
              className="text-sm text-slate-700"
            >
              Project updates
            </label>

            <input
              id="projectUpdates"
              type="checkbox"
              checked={projectUpdates}
              onChange={(event) =>
                setProjectUpdates(
                  event.target.checked
                )
              }
              className="peer sr-only"
            />

            <label
              htmlFor="projectUpdates"
              className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-slate-900 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2"
            />
          </div>

        </div>
      </section>

      {/* Workspace */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

        <h2 className="text-base font-semibold text-slate-900">
          Workspace
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          General settings for your team's workspace.
        </p>

        <form
          onSubmit={handleSaveWorkspace}
          className="mt-4 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="workspaceName"
                className="text-sm font-medium text-slate-700"
              >
                Workspace name
              </label>

              <input
                id="workspaceName"
                type="text"
                value={workspaceName}
                onChange={(event) =>
                  setWorkspaceName(
                    event.target.value
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="defaultProject"
                className="text-sm font-medium text-slate-700"
              >
                Default project
              </label>

              <select
                id="defaultProject"
                value={defaultProject}
                onChange={(event) =>
                  setDefaultProject(
                    event.target.value
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
              >
                {DEFAULT_PROJECT_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              Save workspace
            </button>

            {workspaceSaved && (
              <p
                role="status"
                className="text-sm text-emerald-600"
              >
                Changes saved successfully.
              </p>
            )}
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-200 bg-white p-4 shadow-sm sm:p-6">

        <h2 className="text-base font-semibold text-red-700">
          Danger zone
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Deleting your workspace removes all projects,
          tasks, and team access. This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={handleDeleteWorkspace}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        >
          Delete workspace
        </button>
      </section>

    </main>
  );
}