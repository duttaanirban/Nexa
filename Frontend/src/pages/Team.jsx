import { useEffect, useMemo, useState } from "react";
import { Search, Users, Mail } from "lucide-react";
import { api } from "../api/api";

/**
 * Team
 *
 * Searchable grid of team members. Fully driven by the `members`
 * prop — no data is imported or fetched here.
 *
 * Props:
 * - members: Array<{
 *     id?: string
 *     name: string
 *     role: string
 *     initials: string
 *     email?: string
 *   }>
 *
 * Usage (e.g. wired up as the `/team` route):
 *   <Team members={members} />
 */
export default function Team() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
  api.getUsers()
    .then((response) => {
      console.log("Users from backend:", response);
      setMembers(response.data);
    })
    .catch((error) => {
      console.error("Users API error:", error);
    });
}, []);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredMembers = useMemo(() => {
    const safeMembers = Array.isArray(members) ? members : [];

    if (normalizedQuery === "") return safeMembers;

    return safeMembers.filter(
      (member) =>
        member.name?.toLowerCase().includes(normalizedQuery) ||
        member.role?.toLowerCase().includes(normalizedQuery) ||
        member.initials?.toLowerCase().includes(normalizedQuery)
    );
  }, [members, normalizedQuery]);

  const hasActiveSearch = normalizedQuery !== "";
  const clearSearch = () => setQuery("");

  const resultCount = filteredMembers.length;
  const resultLabel = `${resultCount} member${resultCount === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Team</h1>
        <p className="mt-1 text-sm text-slate-500">
          See who's working on what across the team.
        </p>
      </div>

      {/* Search */}
      <section aria-label="Search team members" className="flex flex-col gap-4">
        <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30">
          <Search size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search team members..."
            aria-label="Search team members by name, role, or initials"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </section>

      {/* Results */}
      <section aria-label="Team member results" className="flex flex-col gap-4">
        <p className="text-sm text-slate-500" aria-live="polite">
          {resultLabel}
        </p>

        {resultCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Users size={18} className="text-slate-400" aria-hidden="true" />
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
            {filteredMembers.map((member, index) => (
              <div
                key={member.id ?? `${member.name}-${index}`}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {member.name}
                  </p>
                  <p className="truncate text-sm text-slate-500">{member.role}</p>
                  {member.email && (
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-400">
                      <Mail size={12} aria-hidden="true" />
                      {member.email}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}