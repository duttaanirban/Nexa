import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FolderKanban,
  ListChecks,
  Compass,
} from "lucide-react";

import { NAV_ITEMS } from "../../data/mockData";
import { api } from "../../api/api";

/**
 * GlobalSearch
 *
 * Searches pages from NAV_ITEMS and projects/tasks from the backend API.
 *
 * Backend sources:
 * - GET /api/projects
 * - GET /api/tasks
 */
export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getProjects(),
      api.getTasks(),
    ])
      .then(([projectsResponse, tasksResponse]) => {
        setProjects(
          Array.isArray(projectsResponse.data)
            ? projectsResponse.data
            : []
        );

        setTasks(
          Array.isArray(tasksResponse.data)
            ? tasksResponse.data
            : []
        );
      })
      .catch((error) => {
        console.error("Global search API error:", error);
      });
  }, []);

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const isOpen = trimmedQuery.length > 0;

  const groups = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    /* -----------------------------------------------------------
       Pages
    ----------------------------------------------------------- */

    const matchedPages = NAV_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery)
    ).map((item) => ({
      resultId: `page-${item.id}`,
      icon: item.icon ?? Compass,
      primary: item.label,
      secondary: null,
      onSelect: () => navigate(item.href),
    }));

    /* -----------------------------------------------------------
       Projects
    ----------------------------------------------------------- */

    const matchedProjects = projects
      .filter(
        (project) =>
          project.id?.toLowerCase().includes(normalizedQuery) ||
          project.name?.toLowerCase().includes(normalizedQuery) ||
          project.description
            ?.toLowerCase()
            .includes(normalizedQuery)
      )
      .map((project) => ({
        resultId: `project-${project.id}`,
        icon: FolderKanban,
        primary: project.name,
        secondary: project.id,
        onSelect: () => navigate("/projects"),
      }));

    /* -----------------------------------------------------------
       Tasks
    ----------------------------------------------------------- */

    const matchedTasks = tasks
      .filter(
        (task) =>
          task.id?.toLowerCase().includes(normalizedQuery) ||
          task.title?.toLowerCase().includes(normalizedQuery) ||
          task.project?.toLowerCase().includes(normalizedQuery) ||
          task.assignee?.toLowerCase().includes(normalizedQuery)
      )
      .map((task) => ({
        resultId: `task-${task.id}`,
        icon: ListChecks,
        primary: task.title,
        secondary: `${task.id} · ${task.project}`,
        onSelect: () => navigate("/tasks"),
      }));

    return [
      {
        label: "Pages",
        results: matchedPages,
      },
      {
        label: "Projects",
        results: matchedProjects,
      },
      {
        label: "Tasks",
        results: matchedTasks,
      },
    ].filter((group) => group.results.length > 0);
  }, [normalizedQuery, navigate, projects, tasks]);

  const flatResults = useMemo(
    () => groups.flatMap((group) => group.results),
    [groups]
  );

  const hasResults = flatResults.length > 0;

  const activeIndex = hasResults
    ? Math.min(
        Math.max(highlightedIndex, 0),
        flatResults.length - 1
      )
    : -1;

  const activeResult =
    activeIndex >= 0
      ? flatResults[activeIndex]
      : undefined;

  const selectResult = (result) => {
    if (!result) return;

    result.onSelect();
    setQuery("");
    setHighlightedIndex(-1);
  };

  const handleChange = (event) => {
    const value = event.target.value;

    setQuery(value);
    setHighlightedIndex(
      value.trim() ? 0 : -1
    );
  };

  const handleKeyDown = (event) => {
    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (flatResults.length === 0) return;

      setHighlightedIndex(
        (current) =>
          (current + 1) % flatResults.length
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();

      if (flatResults.length === 0) return;

      setHighlightedIndex(
        (current) =>
          (current - 1 + flatResults.length) %
          flatResults.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectResult(activeResult);
    } else if (event.key === "Escape") {
      event.preventDefault();

      setQuery("");
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search input */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30">
        <Search
          size={15}
          className="shrink-0 text-slate-400"
          aria-hidden="true"
        />

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search…"
          aria-label="Search projects, tasks, and pages"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="global-search-listbox"
          aria-activedescendant={
            activeResult
              ? activeResult.resultId
              : undefined
          }
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Search results */}
      {isOpen && (
        <div
          id="global-search-listbox"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          {!hasResults ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              No results for &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <p className="px-2.5 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.label}
                </p>

                {group.results.map((result) => {
                  const Icon = result.icon;

                  const index =
                    flatResults.indexOf(result);

                  const isHighlighted =
                    index === highlightedIndex;

                  return (
                    <button
                      key={result.resultId}
                      id={result.resultId}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseEnter={() =>
                        setHighlightedIndex(index)
                      }
                      onClick={() =>
                        selectResult(result)
                      }
                      className={[
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                        isHighlighted
                          ? "bg-slate-100"
                          : "hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <Icon
                          size={14}
                          className="text-slate-500"
                          aria-hidden="true"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {result.primary}
                        </span>

                        {result.secondary && (
                          <span className="block truncate text-xs text-slate-500">
                            {result.secondary}
                          </span>
                        )}
                      </span>

                      <span
                        className={`text-xs text-slate-400 ${
                          isHighlighted
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                        aria-hidden="true"
                      >
                        ↵
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}