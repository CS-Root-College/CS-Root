import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Code2,
  Clock,
  HardDrive,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../utils/axios";

type SubmissionStatus =
  | "accepted"
  | "wrong_answer"
  | "compilation_error"
  | "runtime_error"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "pending";

type AllSubmission = {
  _id: string;
  problemId: {
    _id: string;
    title: string;
    slug: string;
    difficulty: "easy" | "medium" | "hard";
  };
  language: string;
  status: SubmissionStatus;
  verdict: boolean;
  executionTime: number;
  memoryUsed: number;
  testsPassed: number;
  totalTests: number;
  createdAt: string;
};

type SubmissionDetail = {
  _id: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  verdict: boolean;
  executionTime: number;
  memoryUsed: number;
  testsPassed: number;
  totalTests: number;
  failedTestCase?: {
    input: string;
    expected: string;
    actual: string;
  };
  createdAt: string;
  problemId: {
    title: string;
    slug: string;
    difficulty: "easy" | "medium" | "hard";
  };
};

const getStatusStyle = (status: SubmissionStatus) => {
  const styles: Record<SubmissionStatus, { badge: string; label: string }> = {
    accepted: {
      badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      label: "Accepted",
    },
    wrong_answer: {
      badge: "bg-rose-500/10 border-rose-500/30 text-rose-300",
      label: "Wrong Answer",
    },
    compilation_error: {
      badge: "bg-orange-500/10 border-orange-500/30 text-orange-300",
      label: "Compile Error",
    },
    runtime_error: {
      badge: "bg-orange-500/10 border-orange-500/30 text-orange-300",
      label: "Runtime Error",
    },
    time_limit_exceeded: {
      badge: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      label: "Time Limit",
    },
    memory_limit_exceeded: {
      badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
      label: "Memory Limit",
    },
    pending: {
      badge: "bg-zinc-500/10 border-zinc-500/30 text-zinc-300",
      label: "Pending",
    },
  };
  return styles[status] || styles.pending;
};

const getDifficultyStyle = (difficulty: string) => {
  const styles: Record<string, string> = {
    easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };
  return styles[difficulty] || styles.medium;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

function DetailModal({
  submission,
  isOpen,
  onClose,
}: {
  submission: SubmissionDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !submission) return null;

  const isAccepted = submission.verdict;
  const diffColor = getDifficultyStyle(submission.problemId.difficulty);
  const statusStyle = getStatusStyle(submission.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-zinc-950/95 shadow-2xl backdrop-blur-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`h-1 ${isAccepted ? "bg-emerald-500" : "bg-rose-500"}`}
        />

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold ${statusStyle.badge}`}
                >
                  {isAccepted ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  {statusStyle.label}
                </div>
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold capitalize ${diffColor}`}
                >
                  {submission.problemId.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white truncate">
                {submission.problemId.title}
              </h2>
              <p className="text-xs text-zinc-500 mt-2">
                {formatDate(submission.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  Language
                </p>
                <p className="text-sm font-bold text-zinc-300 capitalize">
                  {submission.language}
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  Tests
                </p>
                <p
                  className={`text-sm font-bold ${
                    isAccepted ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {submission.testsPassed}/{submission.totalTests}
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  Time
                </p>
                <p className="text-sm font-mono font-bold text-zinc-300">
                  {submission.executionTime}ms
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  Memory
                </p>
                <p className="text-sm font-mono font-bold text-zinc-300">
                  {submission.memoryUsed}MB
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-sm font-semibold text-white mb-3">Code</p>
              <pre className="bg-zinc-950/60 rounded-lg p-3 overflow-x-auto font-mono text-xs text-zinc-300 border border-white/[0.04] max-h-96 leading-relaxed">
                {submission.code}
              </pre>
            </div>

            {submission.failedTestCase && !isAccepted && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
                <p className="text-sm font-semibold text-rose-300">
                  Failed Test
                </p>
                <div className="space-y-2">
                  <div className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-3">
                    <p className="text-[10px] text-rose-600/80 uppercase font-semibold mb-1">
                      Input
                    </p>
                    <p className="text-xs text-rose-200 break-all font-mono">
                      {submission.failedTestCase.input}
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-3">
                    <p className="text-[10px] text-rose-600/80 uppercase font-semibold mb-1">
                      Expected
                    </p>
                    <p className="text-xs text-emerald-300 break-all font-mono">
                      {submission.failedTestCase.expected}
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-3">
                    <p className="text-[10px] text-rose-600/80 uppercase font-semibold mb-1">
                      Actual
                    </p>
                    <p className="text-xs text-rose-300 break-all font-mono">
                      {submission.failedTestCase.actual}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({
  submission,
  onClick,
}: {
  submission: AllSubmission;
  onClick: () => void;
}) {
  const statusStyle = getStatusStyle(submission.status);
  const diffColor = getDifficultyStyle(submission.problemId.difficulty);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:bg-white/[0.05] hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${statusStyle.badge}`}
            >
              {submission.verdict ? (
                <CheckCircle2 size={13} />
              ) : (
                <AlertCircle size={13} />
              )}
              <span className="hidden sm:inline">{statusStyle.label}</span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white truncate">
                {submission.problemId.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${diffColor}`}
                >
                  {submission.problemId.difficulty}
                </span>
                <span className="text-xs text-zinc-500">
                  {submission.testsPassed}/{submission.totalTests} tests
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap sm:justify-end">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Code2 size={13} className="text-zinc-600" />
            <span className="capitalize">{submission.language}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
            <Clock size={13} className="text-zinc-600" />
            <span>{submission.executionTime}ms</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
            <HardDrive size={13} className="text-zinc-600" />
            <span>{submission.memoryUsed}MB</span>
          </div>

          <div className="text-zinc-500 whitespace-nowrap ml-auto sm:ml-0">
            {formatDate(submission.createdAt)}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AllSubmissionsPage() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<AllSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      setError("");
      loadingDetail;

      try {
        const response = await api.get(
          `/problems/get-all-dsa-submissions?page=${page}`,
          { withCredentials: true }
        );

        const data = response.data?.data;
        if (data?.submissions) {
          setSubmissions(data.submissions);
          setTotalPages(data?.pagination?.total || 1);
        } else {
          setSubmissions([]);
          setTotalPages(1);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch submissions";
        setError(message);
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [page]);

  const handleViewDetail = useCallback(async (submissionId: string) => {
    setLoadingDetail(true);
    try {
      const response = await api.get(`/problems/submission/${submissionId}`, {
        withCredentials: true,
      });
      const data = response.data?.data;
      if (data) {
        setSelectedSubmission(data);
        setShowDetail(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load submission details"
      );
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const statusMatch =
        filterStatus === "all" || sub.status === filterStatus;
      const queryMatch =
        searchQuery === "" ||
        sub.problemId.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        sub.language.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && queryMatch;
    });
  }, [submissions, filterStatus, searchQuery]);

  const allStatuses: (SubmissionStatus | "all")[] = [
    "all",
    "accepted",
    "wrong_answer",
    "compilation_error",
    "runtime_error",
    "time_limit_exceeded",
    "memory_limit_exceeded",
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#030712]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      <div className="pointer-events-none fixed -top-40 left-1/2 h-80 w-96 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />

      <DetailModal
        submission={selectedSubmission}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedSubmission(null);
        }}
      />

      <div className="relative z-10">
        <header className="border-b border-white/[0.06] bg-zinc-950/50 backdrop-blur-2xl sticky top-0">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white mb-4"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Submissions</h1>
              <p className="text-sm text-zinc-500 mt-1">
                All your code submissions across problems
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300 flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search problems or language..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as typeof filterStatus);
                setPage(1);
              }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-200 outline-none transition cursor-pointer hover:bg-white/[0.05] focus:border-violet-500/50"
            >
              {allStatuses.map((status) => (
                <option key={status} value={status} className="bg-zinc-950">
                  {status === "all"
                    ? "All Status"
                    : getStatusStyle(status as SubmissionStatus).label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && submissions.length === 0 ? (
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <Loader2 size={32} className="mx-auto mb-4 animate-spin text-violet-400" />
                <p className="text-sm text-zinc-400">
                  Loading your submissions...
                </p>
              </div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
              <BookOpen size={40} className="mx-auto mb-4 text-zinc-700" />
              <p className="text-zinc-400">
                {submissions.length === 0
                  ? "No submissions yet. Start solving problems!"
                  : "No submissions match your filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((submission) => (
                <SubmissionCard
                  key={submission._id}
                  submission={submission}
                  onClick={() => handleViewDetail(submission._id)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(7, totalPages) },
                  (_, i) => {
                    if (totalPages <= 7) return i + 1;
                    if (page <= 4) return i + 1;
                    if (page >= totalPages - 3) return totalPages - 6 + i;
                    return page - 3 + i;
                  }
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-9 min-w-9 rounded-lg border font-medium text-sm transition ${
                      page === pageNum
                        ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                        : "border-white/[0.06] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}