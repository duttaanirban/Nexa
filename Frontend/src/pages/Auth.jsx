import { useState } from "react";
import { Activity } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState("login");

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl sm:min-h-[calc(100vh-3rem)]">
        
        {/* Left branding panel */}
        <section className="hidden w-1/2 flex-col justify-between bg-indigo-600 p-10 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                <Activity size={21} />
              </div>

              <span className="text-xl font-semibold text-white">
                Pulse
              </span>
            </div>

            <div className="mt-28 max-w-md">
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Ship better, together.
              </h1>

              <p className="mt-4 text-lg leading-7 text-indigo-100">
                Track projects, tasks and team velocity in
                one calm workspace.
              </p>
            </div>

            {/* Velocity card */}
            <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Velocity
                </span>

                <span className="text-sm text-indigo-100">
                  This week
                </span>
              </div>

              <div className="mt-6 flex h-20 items-end justify-between gap-2">
                {[32, 48, 68, 42, 56].map((height, index) => (
                  <div
                    key={index}
                    className={`w-full rounded-t ${
                      index === 2
                        ? "bg-white"
                        : "bg-indigo-300/70"
                    }`}
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>

              <div className="mt-5 flex -space-x-2">
                {["MK", "AK", "RS"].map((initials) => (
                  <div
                    key={initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white text-[11px] font-semibold text-indigo-600"
                  >
                    {initials}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-indigo-100">
            Trusted by product teams shipping every week.
          </p>
        </section>

        {/* Right authentication panel */}
        <section className="flex w-full flex-col justify-center bg-slate-900 px-6 py-10 sm:px-10 lg:w-1/2">
          
          <div className="mx-auto w-full max-w-md">
            
            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Activity size={18} />
              </div>

              <span className="text-lg font-semibold text-white">
                Pulse
              </span>
            </div>

            {/* Mode switch */}
            <div className="grid grid-cols-2 rounded-xl bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isLogin
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  !isLogin
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create account
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-white">
                {isLogin
                  ? "Welcome back"
                  : "Create your account"}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {isLogin
                  ? "Log in to continue to your workspace."
                  : "Create an account to start using Pulse."}
              </p>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              {!isLogin && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Mira Kapoor"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete={
                    isLogin
                      ? "current-password"
                      : "new-password"
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {isLogin ? "Log in" : "Create account"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-400">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  setMode(isLogin ? "register" : "login")
                }
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                {isLogin ? "Create one" : "Log in"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}