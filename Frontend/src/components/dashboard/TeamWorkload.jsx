import { Users } from "lucide-react";

export default function TeamWorkload({ members = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Team Workload
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current workload across the team
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Users size={17} />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {members.map((member) => {
          const workload = Math.min(
            100,
            Math.max(0, Number(member.workload) || 0)
          );

          return (
            <div
              key={member.id}
              className="flex items-start gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {member.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {member.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {member.role}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {workload}%
                  </span>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${workload}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          No team workload data available.
        </div>
      )}
    </section>
  );
}