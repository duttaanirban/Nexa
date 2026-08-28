import { useEffect, useState } from "react";

const DEFAULT_PROJECT_OPTIONS = [
  "No default project",
  "Checkout Revamp",
  "Realtime Notifications",
  "Design Tokens",
];

/**
 * Settings
 *
 * Local-only settings page: profile, notifications,
 * workspace, and a danger zone. Every field is controlled React
 * state scoped to this component — nothing is persisted, fetched,
 * or imported from mockData.
 */
export default function Settings() {
  // Profile
  const [fullName, setFullName] = useState("Dummy user");
  const [role, setRole] = useState("Frontend Lead");
  const [email, setEmail] = useState("dummyuser@example.com");
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(false);

  // Workspace
  const [workspaceName, setWorkspaceName] = useState("Pulse");
  const [defaultProject, setDefaultProject] = useState(DEFAULT_PROJECT_OPTIONS[0]);
  const [workspaceSaved, setWorkspaceSaved] = useState(false);

  // Auto-dismiss success messages after a short delay.
  useEffect(() => {
    if (!profileSaved) return;
    const timer = setTimeout(() => setProfileSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [profileSaved]);

  useEffect(() => {
    if (!workspaceSaved) return;
    const timer = setTimeout(() => setWorkspaceSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [workspaceSaved]);

  const handleSaveProfile = (event) => {
    event.preventDefault();
    setProfileSaved(true);
  };

  const handleSaveWorkspace = (event) => {
    event.preventDefault();
    setWorkspaceSaved(true);
  };

  const handleDeleteWorkspace = () => {
    window.confirm(
      "Are you sure you want to delete this workspace? This action cannot be undone."
    );
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and workspace preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your personal account details.
        </p>

        <form onSubmit={handleSaveProfile} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-sm font-medium text-slate-700">
                Role
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:max-w-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              Save changes
            </button>
            {profileSaved && (
              <p role="status" className="text-sm text-emerald-600">
                Changes saved successfully.
              </p>
            )}
          </div>
        </form>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose what you want to be notified about.
        </p>

        <div className="mt-4 flex flex-col divide-y divide-slate-100">
          <div className="flex items-center justify-between gap-4 py-3">
            <label htmlFor="emailNotifications" className="text-sm text-slate-700">
              Email notifications
            </label>
            <input
              id="emailNotifications"
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
              className="peer sr-only"
            />
            <label
              htmlFor="emailNotifications"
              className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-slate-900 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <label htmlFor="taskReminders" className="text-sm text-slate-700">
              Task reminders
            </label>
            <input
              id="taskReminders"
              type="checkbox"
              checked={taskReminders}
              onChange={(event) => setTaskReminders(event.target.checked)}
              className="peer sr-only"
            />
            <label
              htmlFor="taskReminders"
              className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-slate-900 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <label htmlFor="projectUpdates" className="text-sm text-slate-700">
              Project updates
            </label>
            <input
              id="projectUpdates"
              type="checkbox"
              checked={projectUpdates}
              onChange={(event) => setProjectUpdates(event.target.checked)}
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
        <h2 className="text-base font-semibold text-slate-900">Workspace</h2>
        <p className="mt-1 text-sm text-slate-500">
          General settings for your team's workspace.
        </p>

        <form onSubmit={handleSaveWorkspace} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="workspaceName" className="text-sm font-medium text-slate-700">
                Workspace name
              </label>
              <input
                id="workspaceName"
                type="text"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="defaultProject" className="text-sm font-medium text-slate-700">
                Default project
              </label>
              <select
                id="defaultProject"
                value={defaultProject}
                onChange={(event) => setDefaultProject(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
              >
                {DEFAULT_PROJECT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
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
              <p role="status" className="text-sm text-emerald-600">
                Changes saved successfully.
              </p>
            )}
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-500">
          Deleting your workspace removes all projects, tasks, and team
          access. This action cannot be undone.
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