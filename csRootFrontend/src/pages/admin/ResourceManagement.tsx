import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  FileText,
  Eye,
  Star,
  Calendar,
  Loader2,
} from "lucide-react";
import api from "../../utils/axios";

interface Resource {
  _id: string;
  title: string;
  slug: string;
  description: string;
  subject: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

type Filter = "all" | "draft" | "published" | "archived";

const statusStyles = {
  draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  archived: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function ResourceManagement() {
  const navigate = useNavigate();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ApiResponse<Resource[]>>(
        "/resources/admin/get-all-resources",
      );

      setResources(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
      setError("Unable to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const counts = useMemo(
    () => ({
      all: resources.length,
      draft: resources.filter((item) => item.status === "draft").length,
      published: resources.filter((item) => item.status === "published").length,
      archived: resources.filter((item) => item.status === "archived").length,
    }),
    [resources],
  );

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesFilter = filter === "all" || resource.status === filter;

      const searchText = search.toLowerCase();

      const matchesSearch =
        resource.title.toLowerCase().includes(searchText) ||
        resource.subject.toLowerCase().includes(searchText) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchText));

      return matchesFilter && matchesSearch;
    });
  }, [resources, filter, search]);

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Drafts", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <div className="min-h-screen bg-[#080a12] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold text-purple-400">
              CS ROOT / ADMIN
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              Resource Management
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create, organize and manage learning resources.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchResources}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/resources/create")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500"
            >
              <Plus size={17} />
              Create Resource
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Resources", value: counts.all, icon: BookOpen },
            { label: "Drafts", value: counts.draft, icon: FileText },
            { label: "Published", value: counts.published, icon: Eye },
            { label: "Archived", value: counts.archived, icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[#11141e] p-5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-purple-500/10 p-3 text-purple-300">
                  <Icon size={20} />
                </div>

                <p className="text-2xl font-bold">{item.value}</p>
                <p className="mt-1 text-xs text-slate-400">{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Resource list */}
        <section className="rounded-2xl border border-white/10 bg-[#11141e] p-5 md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-semibold">All Resources</h2>
              <p className="mt-1 text-sm text-slate-400">
                View resources and their publication status.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, subject or tag..."
                className="w-full rounded-xl border border-white/10 bg-[#080a12] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  filter === item.value
                    ? "bg-purple-600 font-semibold text-white"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {item.label} ({counts[item.value]})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-purple-300">
              <Loader2 size={26} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
              {error}
              <button
                type="button"
                onClick={fetchResources}
                className="ml-3 underline"
              >
                Retry
              </button>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen size={36} className="mx-auto mb-4 text-slate-500" />
              <h3 className="font-semibold">No resources found</h3>
              <p className="mt-2 text-sm text-slate-400">
                Try another filter or create a new resource.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <div
                  key={resource._id}
                  className="rounded-xl border border-white/10 bg-[#0b0e17] p-5 transition hover:border-purple-500/30"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white">
                          {resource.title}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs capitalize ${
                            statusStyles[resource.status]
                          }`}
                        >
                          {resource.status}
                        </span>

                        {resource.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                            <Star size={13} />
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="mb-3 text-sm text-slate-400">
                        {resource.description || "No description provided."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{resource.subject}</span>
                        <span>•</span>
                        <span>{resource.viewCount || 0} views</span>

                        {resource.publishedAt && (
                          <>
                            <span>•</span>
                            <span>
                              Published{" "}
                              {new Date(
                                resource.publishedAt,
                              ).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {resource.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {resource.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-xs text-slate-500">
                      ID: {resource._id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
