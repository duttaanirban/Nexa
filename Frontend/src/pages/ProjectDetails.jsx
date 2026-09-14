import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Circle,
  Info,
  ListChecks,
  Users,
  Sparkles,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Wand2,
  X,
  Check,
} from "lucide-react";
import { api } from "../api/api";

const STATUS_STYLES = {
  "On track": {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  "In progress": {
    icon: Info,
    className: "bg-blue-50 text-blue-700",
  },
  Blocked: {
    icon: XCircle,
    className: "bg-red-50 text-red-700",
  },
  Completed: {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
};

const TASK_STATUS_STYLES = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-50 text-blue-700",
  review: "bg-violet-50 text-violet-700",
  blocked: "bg-red-50 text-red-700",
  done: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

const AI_HEALTH_BADGES = {
  Healthy: {
    icon: ShieldCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "At Risk": {
    icon: ShieldAlert,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Critical: {
    icon: AlertTriangle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Health Analysis state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // AI Task Generation state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateInput, setGenerateInput] = useState("");
  const [generatedSuggestions, setGeneratedSuggestions] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [generateError, setGenerateError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const projectResponse = await api.getProjectById(id);
        const currentProject = projectResponse?.data;

        if (!currentProject) {
          throw new Error("Project not found");
        }

        const tasksResponse = await api.getTasks(
          `?project=${encodeURIComponent(currentProject.name)}`
        );

        if (!isMounted) return;

        setProject(currentProject);
        setTasks(
          Array.isArray(tasksResponse?.data)
            ? tasksResponse.data
            : []
        );
      } catch (err) {
        if (!isMounted) return;

        console.error("Project details API error:", err);
        setError(
          err?.message ||
            "We couldn't load this project. Please try again."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAnalyzeAI = async () => {
    if (aiLoading || !id) return;

    try {
      setAiLoading(true);
      setAiError("");

      const response = await api.analyzeProjectWithAI(id);
      const analysisResult = response?.data || response;

      setAiAnalysis(analysisResult);
    } catch (err) {
      console.error("AI Analysis error:", err);
      setAiError(
        err?.message || "Failed to analyze project. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateTasks = async (e) => {
    e.preventDefault();
    if (!generateInput.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      setGenerateError("");

      const response = await api.generateTasksWithAI(id, generateInput.trim());
      const data = response?.data || response;
      setGeneratedSuggestions(data);

      // Pre-select all generated suggestions by default
      const initialSelection = {};
      (data.tasks || []).forEach((_, idx) => {
        initialSelection[idx] = true;
      });
      setSelectedSuggestions(initialSelection);
    } catch (err) {
      console.error("Task generation error:", err);
      setGenerateError(err?.message || "Failed to generate tasks.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelectSuggestion = (index) => {
    setSelectedSuggestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCreateSelectedTasks = async () => {
    const tasksToCreate = (generatedSuggestions?.tasks || []).filter(
      (_, idx) => selectedSuggestions[idx]
    );

    if (tasksToCreate.length === 0 || isCreatingTasks) return;

    try {
      setIsCreatingTasks(true);
      setGenerateError("");

      for (const task of tasksToCreate) {
        await api.createTask({
          title: task.title,
          project: project.name,
          assignee: "", // <-- Optional assignee
          due: "Upcoming",
          priority: task.priority || "Medium",
          status: "todo",
        });
      }

      setIsGenerateModalOpen(false);
      setGeneratedSuggestions(null);
      setGenerateInput("");

      navigate(`/tasks?project=${encodeURIComponent(project.name)}`);
    } catch (err) {
      console.error("Create selected tasks error:", err);
      setGenerateError(err?.message || "Failed to create selected tasks.");
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "done"
    ).length;

    const active = tasks.length - completed;

    return {
      total: tasks.length,
      completed,
      active,
    };
  }, [tasks]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedSuggestions).filter(Boolean).length;
  }, [selectedSuggestions]);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="mt-8 h-2 w-full animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <Link
          to="/projects"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </Link>

        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <XCircle
            size={22}
            className="mx-auto text-red-500"
            aria-hidden="true"
          />
          <h1 className="mt-3 text-base font-semibold text-slate-900">
            Unable to load project
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {error || "Project not found."}
          </p>
        </div>
      </div>
    );
  }

  const statusStyle =
    STATUS_STYLES[project.status] ?? {
      icon: Circle,
      className: "bg-slate-100 text-slate-600",
    };

  const StatusIcon = statusStyle.icon;
  const progress = Math.min(
    100,
    Math.max(0, Number(project.progress) || 0)
  );

  const HealthBadgeIcon =
    AI_HEALTH_BADGES[aiAnalysis?.health]?.icon || ShieldCheck;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link
        to="/projects"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to Projects
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs text-slate-400">
                {project.id}
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {project.name}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {project.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAnalyzeAI}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>✨ Analyze with Nexa AI</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
              >
                <Wand2 size={14} />
                <span>✨ Generate Tasks with Nexa AI</span>
              </button>

              <Link
                to={`/tasks?project=${encodeURIComponent(project.name)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ListChecks size={14} />
                <span>View All Project Tasks</span>
              </Link>

              <span
                className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ${statusStyle.className}`}
              >
                <StatusIcon size={14} aria-hidden="true" />
                {project.status}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">
                Project progress
              </span>
              <span className="font-semibold text-slate-900">
                {progress}%
              </span>
            </div>

            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`${project.name} progress`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total tasks</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {stats.total}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Active tasks</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {stats.active}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Completed tasks</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Error Alert */}
      {aiError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <XCircle size={16} className="shrink-0 text-red-500" />
            <span>{aiError}</span>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeAI}
            className="font-medium underline hover:text-red-900"
          >
            Try again
          </button>
        </div>
      )}

      {/* AI Health Analysis Result Panel */}
      {aiAnalysis && (
        <section className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Nexa AI Project Analysis
                </h2>
                <p className="text-xs text-slate-500">
                  Automated workspace health & risk insights
                </p>
              </div>
            </div>

            {aiAnalysis.health && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  AI_HEALTH_BADGES[aiAnalysis.health]?.className ||
                  "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <HealthBadgeIcon size={14} />
                Project Health: {aiAnalysis.health}
              </span>
            )}
          </div>

          <div className="mt-5 space-y-5 text-sm">
            {/* Summary */}
            {aiAnalysis.summary && (
              <div>
                <h3 className="font-semibold text-slate-900">Summary</h3>
                <p className="mt-1.5 leading-6 text-slate-600">
                  {aiAnalysis.summary}
                </p>
              </div>
            )}

            {/* Key Risks */}
            {Array.isArray(aiAnalysis.risks) && aiAnalysis.risks.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900">Key Risks</h3>
                <ul className="mt-2 space-y-1.5">
                  {aiAnalysis.risks.map((risk, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-slate-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Next Steps */}
            {Array.isArray(aiAnalysis.recommendations) &&
              aiAnalysis.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Recommended Next Steps
                  </h3>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-slate-600">
                    {aiAnalysis.recommendations.map((step, idx) => (
                      <li key={idx} className="pl-1">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

            {/* Priority Tasks */}
            {Array.isArray(aiAnalysis.priorityTasks) &&
              aiAnalysis.priorityTasks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Priority Tasks
                  </h3>
                  <ol className="mt-2 space-y-2">
                    {aiAnalysis.priorityTasks.map((item, idx) => (
                      <li
                        key={idx}
                        className="rounded-lg border border-slate-200/80 bg-white p-3 text-xs sm:text-sm"
                      >
                        <span className="font-semibold text-slate-900">
                          {idx + 1}. {item.taskId || "Task"}
                        </span>
                        {item.reason && (
                          <span className="text-slate-600">
                            {" "}
                            — {item.reason}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
          </div>
        </section>
      )}

      {/* Team Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Team
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Members assigned to this project
            </p>
          </div>

          <Users
            size={18}
            className="text-slate-400"
            aria-hidden="true"
          />
        </div>

        {project.team?.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.team.map((initials, index) => (
              <div
                key={`${project.id}-${initials}-${index}`}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {initials}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {initials}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            No team members assigned.
          </p>
        )}
      </section>

      {/* Tasks Section */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <ListChecks size={18} aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Project Tasks
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tasks currently associated with this project
            </p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              No tasks for this project
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tasks assigned to this project will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-slate-400">
                    {task.id}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {task.title}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Assignee: {task.assignee}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>Due: {task.due}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      PRIORITY_STYLES[task.priority] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      TASK_STATUS_STYLES[task.status] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Task Generator Modal */}
      {isGenerateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isGenerating && !isCreatingTasks) {
              setIsGenerateModalOpen(false);
              setGeneratedSuggestions(null);
              setGenerateInput("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="generator-title"
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Wand2 size={16} />
                </div>
                <div>
                  <h2 id="generator-title" className="text-lg font-semibold text-slate-900">
                    Nexa AI Task Generator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Describe what needs to be built for {project.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGenerateModalOpen(false);
                  setGeneratedSuggestions(null);
                  setGenerateInput("");
                }}
                disabled={isGenerating || isCreatingTasks}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {generateError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {generateError}
              </div>
            )}

            {/* Requirement Input Form */}
            {!generatedSuggestions && (
              <form onSubmit={handleGenerateTasks} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="requirement-input" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Describe feature or implementation requirement
                  </label>
                  <textarea
                    id="requirement-input"
                    rows={4}
                    value={generateInput}
                    onChange={(e) => setGenerateInput(e.target.value)}
                    placeholder="e.g. Build a checkout flow with payment integration, validation, order confirmation and error handling."
                    disabled={isGenerating}
                    required
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    disabled={isGenerating}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating || !generateInput.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Generating tasks...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Generate Tasks</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Generated Suggestions Selection List */}
            {generatedSuggestions && (
              <div className="mt-5 space-y-4">
                {generatedSuggestions.summary && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {generatedSuggestions.summary}
                  </p>
                )}

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {(generatedSuggestions.tasks || []).map((task, idx) => {
                    const isSelected = Boolean(selectedSuggestions[idx]);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelectSuggestion(idx)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? "border-indigo-300 bg-indigo-50/40"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-900 truncate">
                              {task.title}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                PRIORITY_STYLES[task.priority] || "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          {task.reason && (
                            <p className="mt-1 text-[11px] text-slate-500 leading-normal">
                              {task.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-500">
                    {selectedCount} tasks selected
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGeneratedSuggestions(null)}
                      disabled={isCreatingTasks}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Regenerate
                    </button>

                    <button
                      type="button"
                      onClick={handleCreateSelectedTasks}
                      disabled={selectedCount === 0 || isCreatingTasks}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {isCreatingTasks ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <span>Create Selected Tasks</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}