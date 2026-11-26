import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  BookOpen,
  Layers3,
  ArrowUpRight,
  Clock3,
  UserRound,
  Tag,
  RefreshCw,
  Filter,
  GraduationCap,
  Sparkles,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_PUBLIC_BACKEND || "";

interface Resource {
  _id: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  content: any;
  slug: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
}

const subjectColors: Record<string, string> = {
  "Computer Science": "from-violet-500 to-indigo-500",
  Programming: "from-blue-500 to-cyan-500",
  Mathematics: "from-emerald-500 to-teal-500",
  Physics: "from-orange-500 to-amber-500",
  Chemistry: "from-pink-500 to-rose-500",
  default: "from-purple-500 to-blue-500",
};

const getSubjectColor = (subject: string) =>
  subjectColors[subject] || subjectColors.default;

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("All Subjects");

  const fetchResources = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/resources/get-all-resources`,
        { withCredentials: true }
      );

      setResources(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
      setError("We couldn't load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const subjects = useMemo(() => {
    const uniqueSubjects = [
      ...new Set(resources.map((resource) => resource.subject)),
    ];

    return uniqueSubjects.sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSubject =
        activeSubject === "All Subjects" ||
        resource.subject === activeSubject;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        resource.title?.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.subject?.toLowerCase().includes(query) ||
        resource.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        ) ||
        resource.createdBy?.username?.toLowerCase().includes(query);

      return matchesSubject && matchesSearch;
    });
  }, [resources, search, activeSubject]);

  const groupedResources = useMemo(() => {
    const groups: Record<string, Resource[]> = {};

    filteredResources.forEach((resource) => {
      if (!groups[resource.subject]) {
        groups[resource.subject] = [];
      }

      groups[resource.subject].push(resource);
    });

    return groups;
  }, [filteredResources]);

  const displayedSubjects = Object.keys(groupedResources).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]" />
        <div className="absolute top-[40%] -right-48 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-sm text-violet-300">
            <Sparkles size={15} />
            <span>CS Root Learning Library</span>
          </div>

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Explore the
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {" "}knowledge.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
                Discover notes, study materials and learning resources
                shared by the CS Root community. Everything organized
                around the subjects that matter.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                    <BookOpen size={21} />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {resources.length}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Resources
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    <Layers3 size={21} />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {subjects.length}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Subjects
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="mb-8">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources, topics, tags..."
              className="w-full rounded-2xl border border-white/10 bg-[#111217] py-4 pl-14 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </section>

        {/* Subject Filters */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Filter size={16} />
            Browse by subject
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubject("All Subjects")}
              className={`rounded-xl px-4 py-2.5 text-sm transition ${
                activeSubject === "All Subjects"
                  ? "border border-violet-500/30 bg-violet-500/15 text-violet-300"
                  : "border border-white/5 bg-white/[0.03] text-zinc-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              All Subjects
              <span className="ml-2 opacity-60">
                {resources.length}
              </span>
            </button>

            {subjects.map((subject) => {
              const count = resources.filter(
                (resource) => resource.subject === subject
              ).length;

              return (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  className={`rounded-xl px-4 py-2.5 text-sm transition ${
                    activeSubject === subject
                      ? "border border-violet-500/30 bg-violet-500/15 text-violet-300"
                      : "border border-white/5 bg-white/[0.03] text-zinc-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {subject}
                  <span className="ml-2 opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {activeSubject === "All Subjects"
                ? "All learning resources"
                : activeSubject}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {filteredResources.length} resources found
            </p>
          </div>

          <button
            onClick={fetchResources}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-white/5 bg-[#111217] p-6"
              >
                <div className="mb-5 h-10 w-10 rounded-xl bg-white/5" />
                <div className="mb-3 h-5 w-3/4 rounded bg-white/5" />
                <div className="mb-2 h-3 w-full rounded bg-white/5" />
                <div className="mb-6 h-3 w-2/3 rounded bg-white/5" />
                <div className="h-8 w-1/2 rounded bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center">
            <p className="mb-4 text-sm text-red-400">{error}</p>

            <button
              onClick={fetchResources}
              className="rounded-xl bg-red-500/10 px-5 py-2.5 text-sm text-red-300 transition hover:bg-red-500/20"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredResources.length === 0 && (
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] text-zinc-500">
              <BookOpen size={28} />
            </div>

            <h3 className="text-lg font-semibold">
              {resources.length === 0
                ? "The library is waiting"
                : "No resources found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              {resources.length === 0
                ? "No resources have been published yet. Be the first to contribute knowledge."
                : "Try changing your search or selecting another subject to find what you're looking for."}
            </p>

            {(search || activeSubject !== "All Subjects") && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveSubject("All Subjects");
                }}
                className="mt-6 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Subject Groups */}
        {!loading && !error && displayedSubjects.length > 0 && (
          <div className="space-y-14">
            {displayedSubjects.map((subject) => {
              const subjectResources = groupedResources[subject];

              return (
                <section key={subject}>
                  {/* Subject Header */}
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getSubjectColor(subject)} shadow-lg shadow-black/20`}
                      >
                        <GraduationCap size={23} />
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold tracking-tight">
                          {subject}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          {subjectResources.length}{" "}
                          {subjectResources.length === 1
                            ? "resource"
                            : "resources"}
                        </p>
                      </div>
                    </div>

                    <div className="hidden h-px flex-1 bg-white/[0.05] sm:block" />
                  </div>

                  {/* Resource Cards */}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {subjectResources.map((resource) => (
                      <article
                        key={resource._id}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111217] transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#15151c]"
                      >
                        {/* Accent */}
                        <div
                          className={`h-[2px] w-full bg-gradient-to-r ${getSubjectColor(subject)} opacity-50 transition group-hover:opacity-100`}
                        />

                        <div className="flex flex-1 flex-col p-6">
                          {/* Card top */}
                          <div className="mb-5 flex items-center justify-between">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${getSubjectColor(subject)} bg-opacity-10`}
                            >
                              <BookOpen
                                size={19}
                                className="text-white"
                              />
                            </div>

                            <span className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-500">
                              {subject}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-7 text-zinc-100 transition group-hover:text-violet-300">
                            {resource.title}
                          </h4>

                          {/* Description */}
                          <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-zinc-500">
                            {resource.description ||
                              "Explore this learning resource and expand your knowledge."}
                          </p>

                          {/* Tags */}
                          <div className="mt-5 flex min-h-7 flex-wrap gap-2">
                            {resource.tags?.slice(0, 3).map((tag, index) => (
                              <span
                                key={`${tag}-${index}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400"
                              >
                                <Tag size={11} />
                                {tag}
                              </span>
                            ))}

                            {resource.tags?.length > 3 && (
                              <span className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-500">
                                +{resource.tags.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="my-5 h-px bg-white/[0.05]" />

                          {/* Creator */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-500/10 bg-violet-500/10 text-violet-300">
                                <UserRound size={14} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-zinc-300">
                                  {resource.createdBy?.username ||
                                    "Unknown creator"}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-600">
                              <Clock3 size={12} />
                              {formatDate(resource.createdAt)}
                            </div>
                          </div>

                          {/* Action */}
                          <button
                            onClick={() =>
                              window.location.href = `/resources/${resource.slug}`
                            }
                            className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm font-medium text-zinc-300 transition group-hover:border-violet-500/20 group-hover:bg-violet-500/[0.07] group-hover:text-violet-300"
                          >
                            <span>Explore resource</span>

                            <ArrowUpRight
                              size={17}
                              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-white/[0.05] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <BookOpen size={15} />
              </div>

              <span>
                Powered by <span className="text-zinc-400">CS Root</span>
              </span>
            </div>

            <p className="text-xs text-zinc-700">
              Learn. Share. Grow.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Resources;