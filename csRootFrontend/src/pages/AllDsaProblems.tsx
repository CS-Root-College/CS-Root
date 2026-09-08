import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

interface Problem {
  problemNumber: number;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  tags?: string[];
  isPremium: boolean;
  totalSubmissions: number;
  totalAcceptedSubmissions: number;
  totalSolvedUsers: number;
  acceptanceRate: number;
}

export default function DSAProblems() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;

    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        setRequestError("");

        const response = await api.get("/problems/get-all-dsa-problems");
        const data = response.data;
        const fetched = data?.data ?? data?.problems ?? data;

        if (isMounted) {
          setProblems(Array.isArray(fetched) ? fetched : []);
        }
      } catch (error) {
        if (isMounted) {
          setRequestError(
            error instanceof Error ? error.message : "Network error occurred."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProblems();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      all: problems.length,
      easy: problems.filter((p) => p.difficulty === "easy").length,
      medium: problems.filter((p) => p.difficulty === "medium").length,
      hard: problems.filter((p) => p.difficulty === "hard").length,
    };
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        String(item.problemNumber).includes(search);

      const matchDifficulty =
        activeFilter === "all" ||
        item.difficulty.toLowerCase() === activeFilter.toLowerCase();

      return matchSearch && matchDifficulty;
    });
  }, [problems, search, activeFilter]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#030712] px-4 py-8 text-zinc-100 sm:px-6">
        <div className="absolute top-[-10%] left-[20%] h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-10 w-44 animate-pulse rounded-2xl bg-zinc-800/40" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-zinc-800/30" />
          <div className="flex gap-2 pt-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-20 animate-pulse rounded-xl bg-zinc-800/30"
              />
            ))}
          </div>
          <div className="space-y-3 pt-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl border border-white/[0.04] bg-white/[0.02]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (requestError) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#030712] px-4 text-zinc-100">
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-[100px]" />
        <div className="relative w-full max-w-sm rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-6 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 font-bold">
            !
          </div>
          <h2 className="text-base font-semibold text-white">
            Connection Failed
          </h2>
          <p className="mt-1 text-xs text-zinc-400">{requestError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-white/10 transition active:scale-95 hover:bg-zinc-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]"
        style={{
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
        }}
      />

      <div className="pointer-events-none fixed -top-24 left-1/2 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/20 via-fuchsia-600/15 to-cyan-500/20 blur-[130px]" />
      <div className="pointer-events-none fixed -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-300 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
              DSA Arena
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Code Vault
            </h1>
            <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
              Master algorithms, sharpen syntax, and climb the ranks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-xl">
              <div className="px-2.5 py-1 text-center">
                <span className="block font-mono text-sm font-bold text-emerald-400">
                  {stats.easy}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">
                  Easy
                </span>
              </div>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="px-2.5 py-1 text-center">
                <span className="block font-mono text-sm font-bold text-amber-400">
                  {stats.medium}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">
                  Med
                </span>
              </div>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="px-2.5 py-1 text-center">
                <span className="block font-mono text-sm font-bold text-rose-400">
                  {stats.hard}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">
                  Hard
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-6 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or #number..."
              className="w-full rounded-2xl border border-white/[0.08] bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder-zinc-500 shadow-inner backdrop-blur-xl outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: "all", label: "All", count: stats.all },
              { key: "easy", label: "Easy", count: stats.easy },
              { key: "medium", label: "Medium", count: stats.medium },
              { key: "hard", label: "Hard", count: stats.hard },
            ].map((tab) => {
              const active = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition active:scale-95 ${
                    active
                      ? "bg-white text-zinc-950 shadow-md shadow-white/10"
                      : "border border-white/[0.06] bg-zinc-900/40 text-zinc-400 backdrop-blur-md hover:border-white/[0.12] hover:text-zinc-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active
                        ? "bg-zinc-200 text-zinc-950 font-bold"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2.5">
          {filteredProblems.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.06] bg-zinc-950/40 py-20 text-center backdrop-blur-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-zinc-500">
                #
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-300">
                No challenges found
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Try a different keyword or reset the difficulty tab.
              </p>
            </div>
          ) : (
            filteredProblems.map((problem) => {
              const badgeStyle =
                problem.difficulty === "easy"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : problem.difficulty === "medium"
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]";

              return (
                <div
                  key={problem.slug}
                  onClick={() => navigate(`/practice/dsa/${problem.slug}`)}
                  className="group relative flex cursor-pointer flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-950/50 p-4 shadow-lg shadow-black/40 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-zinc-900/60 active:scale-[0.99] sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] font-mono text-xs font-semibold text-zinc-400 group-hover:border-violet-500/30 group-hover:text-violet-300">
                      {problem.problemNumber}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-200 transition group-hover:text-white sm:text-base">
                          {problem.title}
                        </span>

                        {problem.isPremium && (
                          <span className="rounded-md border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 shadow-sm">
                            PRO
                          </span>
                        )}
                      </div>

                      {problem.tags && problem.tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {problem.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md border border-white/[0.05] bg-white/[0.02] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 sm:border-0 sm:pt-0 sm:justify-end sm:gap-4">
                    <span
                      className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-medium capitalize backdrop-blur-md ${badgeStyle}`}
                    >
                      {problem.difficulty}
                    </span>

                    <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
                      <span>{problem.acceptanceRate}% rate</span>
                      <span className="hidden sm:inline text-zinc-700">•</span>
                      <span className="text-zinc-500">
                        {problem.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}