import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Code2,
  Copy,
  FileText,
  GripHorizontal,
  GripVertical,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Terminal,
  Timer,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axios";

type Difficulty = "easy" | "medium" | "hard";

type Example = {
  input: string;
  output: string;
  explanation?: string;
};

type TestCase = {
  input: string;
  expectedOutput: string;
};

type Problem = {
  _id: string;
  problemNumber: number;
  title: string;
  slug: string;
  problemStatement: string;
  description?: string;
  difficulty: Difficulty;
  points: number;
  constraints: string[];
  examples: Example[];
  testCases: TestCase[];
  tags?: string[];
  timeLimit: number;
  memoryLimit: number;
  isPremium: boolean;
  isMain: boolean;
  totalSubmissions: number;
  totalAcceptedSubmissions: number;
  totalSolvedUsers: number;
};

type Language = {
  id: string;
  name: string;
  monacoLang: string;
};

type CompilerResult = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status?: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
};

const languages: Language[] = [
  { id: "cpp", name: "C++", monacoLang: "cpp" },
  { id: "c", name: "C", monacoLang: "c" },
  { id: "java", name: "Java", monacoLang: "java" },
  { id: "python", name: "Python", monacoLang: "python" },
  { id: "javascript", name: "JS", monacoLang: "javascript" },
];

type ResizeMode = "horizontal" | "vertical" | null;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function DSAProblem() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [compilerResult, setCompilerResult] = useState<CompilerResult | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bottomTab, setBottomTab] = useState<"input" | "cases" | "output">("input");
  const [mobileTab, setMobileTab] = useState<"problem" | "code" | "console">("problem");

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [leftWidth, setLeftWidth] = useState(44);
  const [bottomHeight, setBottomHeight] = useState(38);
  const [resizeMode, setResizeMode] = useState<ResizeMode>(null);

  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(13);

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const editorPaneRef = useRef<HTMLDivElement | null>(null);

  const selectedLanguage = useMemo(
    () => languages.find((item) => item.id === language) ?? languages[0],
    [language]
  );

  useEffect(() => {
    let mounted = true;

    const fetchProblem = async () => {
      if (!slug) {
        setRequestError("Problem slug is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setRequestError("");

      try {
        const response = await api.get(`/problems/get-dsa-problem/${slug}`, {
          withCredentials: true,
        });
        const data = response.data;
        const fetchedProblem = data?.data ?? data?.problem ?? data;

        if (mounted) {
          setProblem(fetchedProblem);
        }
      } catch (error) {
        if (mounted) {
          setRequestError(
            error instanceof Error ? error.message : "Failed to load problem."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProblem();

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!resizeMode) return;

      if (resizeMode === "horizontal" && workspaceRef.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        const nextWidth = ((event.clientX - rect.left) / rect.width) * 100;
        if (nextWidth >= 25 && nextWidth <= 70) {
          setLeftWidth(nextWidth);
        }
      }

      if (resizeMode === "vertical" && editorPaneRef.current) {
        const rect = editorPaneRef.current.getBoundingClientRect();
        const nextHeight = ((rect.bottom - event.clientY) / rect.height) * 100;
        if (nextHeight >= 18 && nextHeight <= 65) {
          setBottomHeight(nextHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setResizeMode(null);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    if (resizeMode) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizeMode]);

  const handleRun = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    setCompilerResult(null);
    setBottomTab("output");
    setMobileTab("console");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND}/compiler/execute`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            code,
            stdin: customInput,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Execution failed.");
      }

      setCompilerResult(data?.data?.result ?? data?.result ?? null);
    } catch (error) {
      setCompilerResult({
        stdout: null,
        stderr: error instanceof Error ? error.message : "Execution failed.",
        compile_output: null,
        message: null,
        status: { id: 11, description: "Runtime Error" },
        time: null,
        memory: null,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem || !code.trim()) return;

    setIsSubmitting(true);
    setBottomTab("output");
    setMobileTab("console");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND}/problems/submit/${problem.slug}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Submission failed.");
      }

      setCompilerResult(
        data?.data?.result ?? data?.result ?? {
          stdout: data?.message ?? "Solved successfully.",
          stderr: null,
          compile_output: null,
          message: null,
          time: null,
          memory: null,
        }
      );
    } catch (error) {
      setCompilerResult({
        stdout: null,
        stderr: error instanceof Error ? error.message : "Error submitting code.",
        compile_output: null,
        message: null,
        time: null,
        memory: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    setCode("");
    setCompilerResult(null);
    setCustomInput("");
    setBottomTab("input");
  }, []);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const toggleFullscreen = async () => {
    if (!workspaceRef.current) return;
    if (!document.fullscreenElement) {
      await workspaceRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#030712] text-zinc-300">
        <div className="absolute h-64 w-64 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="relative flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-zinc-950/70 px-6 py-4 shadow-2xl backdrop-blur-2xl">
          <Loader2 size={18} className="animate-spin text-violet-400" />
          <span className="text-sm font-medium tracking-tight text-zinc-200">
            Entering arena...
          </span>
        </div>
      </div>
    );
  }

  if (requestError || !problem) {
    return (
      <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#030712] px-4 text-zinc-100">
        <div className="absolute h-72 w-72 rounded-full bg-rose-500/10 blur-[110px]" />
        <div className="relative w-full max-w-sm rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-6 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 font-bold">
            !
          </div>
          <h2 className="text-base font-semibold">Problem not found</h2>
          <p className="mt-1 text-xs text-zinc-400">
            {requestError || "This problem is currently unavailable."}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-white/10 transition active:scale-95 hover:bg-zinc-200"
          >
            <ArrowLeft size={14} /> Back to Problems
          </button>
        </div>
      </div>
    );
  }

  const output =
    compilerResult?.stdout ||
    compilerResult?.stderr ||
    compilerResult?.compile_output ||
    compilerResult?.message ||
    compilerResult?.status?.description ||
    "";

  const isOutputError =
    !!compilerResult?.stderr ||
    !!compilerResult?.compile_output ||
    (compilerResult?.status?.id !== undefined && compilerResult.status.id >= 6);

  const difficultyTheme =
    problem.difficulty === "easy"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : problem.difficulty === "medium"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <div
      ref={workspaceRef}
      className={`relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#030712] font-sans antialiased text-zinc-200 select-none ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]"
        style={{
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 70%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none fixed -top-20 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[130px]" />

      {/* Top Navbar */}
      <header className="relative z-10 flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-zinc-950/70 px-3 backdrop-blur-2xl">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
            title="Back"
          >
            <ArrowLeft size={15} />
          </button>

          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] font-mono text-xs font-semibold text-violet-300">
            {problem.problemNumber}
          </span>

          <h2 className="truncate text-xs font-semibold tracking-tight text-white sm:text-sm">
            {problem.title}
          </h2>

          <span
            className={`hidden rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize sm:inline-block ${difficultyTheme}`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs sm:flex">
            <Timer size={13} className="text-zinc-500" />
            <span className="font-mono font-medium text-zinc-300">
              {formatTime(elapsedSeconds)}
            </span>
            <button
              type="button"
              onClick={() => setIsTimerRunning((v) => !v)}
              className="border-l border-white/[0.08] pl-1.5 text-[10px] text-zinc-500 hover:text-zinc-200"
            >
              {isTimerRunning ? "Pause" : "Play"}
            </button>
          </div>

          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning || isSubmitting || !code.trim()}
              className="flex h-8 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.09] hover:text-white active:scale-95 disabled:opacity-40"
            >
              {isRunning ? (
                <Loader2 size={13} className="animate-spin text-zinc-400" />
              ) : (
                <Play size={12} className="fill-current text-zinc-300" />
              )}
              <span>Run</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting || !code.trim()}
              className="flex h-8 items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-semibold text-zinc-950 shadow-md shadow-white/10 transition hover:bg-zinc-200 active:scale-95 disabled:opacity-40"
            >
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              <span>Submit</span>
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Settings2 size={14} />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-white/[0.08] bg-zinc-950/90 p-3.5 shadow-2xl backdrop-blur-2xl">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Font Size
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setFontSize((s) => Math.max(11, s - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-xs font-bold hover:bg-white/[0.09]"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs text-white">{fontSize}px</span>
                  <button
                    type="button"
                    onClick={() => setFontSize((s) => Math.min(20, s + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-xs font-bold hover:bg-white/[0.09]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white sm:flex"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Mobile Switcher Tab Bar */}
      <div className="relative z-10 flex shrink-0 items-center justify-around border-b border-white/[0.06] bg-zinc-950/40 p-1.5 backdrop-blur-xl lg:hidden">
        {[
          { id: "problem", label: "Problem", icon: FileText },
          { id: "code", label: "Code", icon: Code2 },
          { id: "console", label: "Console", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id as typeof mobileTab)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-white/[0.08] text-white shadow-inner"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Area */}
      <main className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        
        {/* Left Pane: Problem Description */}
        <section
          style={{ width: `${leftWidth}%` }}
          className={`min-h-0 flex-col border-r border-white/[0.06] bg-zinc-950/30 select-text lg:flex ${
            mobileTab === "problem" ? "flex w-full" : "hidden"
          }`}
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${difficultyTheme}`}
                >
                  {problem.difficulty}
                </span>

                <span className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-mono text-zinc-400">
                  <Sparkles size={11} className="text-amber-400" />
                  {problem.points} pts
                </span>

                {problem.isPremium && (
                  <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    PRO
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                {problem.title}
              </h1>

              {problem.tags && problem.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Statement
              </span>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-300 sm:text-sm">
                {problem.problemStatement}
              </p>
            </div>

            {problem.description && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Note
                </span>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 sm:text-sm">
                  {problem.description}
                </p>
              </div>
            )}

            {problem.examples && problem.examples.length > 0 && (
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Examples
                </span>
                <div className="space-y-3">
                  {problem.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 sm:p-4"
                    >
                      <div className="mb-2 text-[11px] font-semibold text-zinc-400">
                        Example {i + 1}
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="rounded-xl border border-white/[0.04] bg-zinc-950/60 p-2">
                          <span className="text-[10px] uppercase text-zinc-500 block mb-0.5">
                            Input
                          </span>
                          <span className="text-zinc-200">{ex.input}</span>
                        </div>
                        <div className="rounded-xl border border-white/[0.04] bg-zinc-950/60 p-2">
                          <span className="text-[10px] uppercase text-zinc-500 block mb-0.5">
                            Output
                          </span>
                          <span className="text-emerald-400">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <p className="pt-1 font-sans text-xs text-zinc-400">
                            <span className="font-medium text-zinc-300">
                              Why:{" "}
                            </span>
                            {ex.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {problem.constraints && problem.constraints.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Constraints
                </span>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1.5 font-mono text-xs text-zinc-400">
                  {problem.constraints.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-violet-400" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Horizontal Desktop Resizer */}
        <div
          onMouseDown={() => {
            setResizeMode("horizontal");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          className="hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-zinc-950 transition-colors hover:bg-violet-500/80 active:bg-violet-600 lg:flex"
        >
          <GripVertical size={10} className="text-zinc-700" />
        </div>

        {/* Right Pane: Code Editor + Testing Terminal */}
        <section
          ref={editorPaneRef}
          className={`min-w-0 min-h-0 flex-1 flex-col bg-[#05070e] lg:flex ${
            mobileTab === "code" || mobileTab === "console" ? "flex w-full" : "hidden"
          }`}
        >
          {/* Editor Header */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] bg-zinc-950/60 px-3">
            <div className="relative flex items-center">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setCompilerResult(null);
                }}
                disabled={isRunning || isSubmitting}
                className="h-7 cursor-pointer appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] pl-3 pr-7 text-xs font-medium text-zinc-200 outline-none transition hover:bg-white/[0.08]"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id} className="bg-zinc-950 text-white">
                    {l.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2 text-zinc-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                disabled={isRunning || isSubmitting}
                className="flex h-7 items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                title="Reset workspace"
              >
                <RotateCcw size={11} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning || isSubmitting || !code.trim()}
                className="flex h-7 items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.1] lg:hidden"
              >
                {isRunning ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Play size={11} />
                )}
                <span>Run</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting || !code.trim()}
                className="flex h-7 items-center gap-1 rounded-xl bg-white px-3 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 lg:hidden"
              >
                {isSubmitting ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Send size={11} />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div
            className={`relative min-h-0 flex-1 select-text overflow-hidden ${
              mobileTab === "console" ? "hidden lg:block" : "block"
            }`}
          >
            <Editor
              height="100%"
              theme="vs-dark"
              language={selectedLanguage.monacoLang}
              value={code}
              onChange={(val) => setCode(val ?? "")}
              options={{
                fontSize,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
                insertSpaces: true,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'JetBrains Mono', monospace",
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
                lineNumbersMinChars: 3,
              }}
            />
          </div>

          {/* Vertical Desktop Resizer */}
          <div
            onMouseDown={() => {
              setResizeMode("vertical");
              document.body.style.cursor = "row-resize";
              document.body.style.userSelect = "none";
            }}
            className="hidden h-1.5 shrink-0 cursor-row-resize items-center justify-center bg-zinc-950 transition-colors hover:bg-violet-500/80 active:bg-violet-600 lg:flex"
          >
            <GripHorizontal size={12} className="text-zinc-700" />
          </div>

          {/* Console / Testing Area */}
          <div
            style={{ height: `${bottomHeight}%` }}
            className={`min-h-0 shrink-0 flex-col border-t border-white/[0.06] bg-zinc-950/70 backdrop-blur-2xl lg:flex ${
              mobileTab === "console" ? "flex h-full" : "hidden"
            }`}
          >
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] px-3">
              <div className="flex h-full items-center gap-1">
                {[
                  { id: "input", label: "Input" },
                  { id: "cases", label: "Cases" },
                  { id: "output", label: "Output" },
                ].map((t) => {
                  const active = bottomTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBottomTab(t.id as typeof bottomTab)}
                      className={`flex h-full items-center border-b-2 px-3 text-xs font-medium transition ${
                        active
                          ? "border-violet-500 text-white"
                          : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {output && (
                <button
                  type="button"
                  onClick={() => handleCopy(output)}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 transition hover:text-zinc-300"
                >
                  {copied ? (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 select-text">
              {bottomTab === "input" && (
                <div className="h-full flex flex-col">
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    spellCheck={false}
                    placeholder="Provide standard input (stdin)..."
                    className="h-full w-full resize-none rounded-xl border border-white/[0.06] bg-zinc-900/30 p-3 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/50"
                  />
                </div>
              )}

              {bottomTab === "cases" && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {problem.testCases.map((tc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomInput(tc.input);
                        setBottomTab("input");
                      }}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition hover:border-violet-500/30 hover:bg-white/[0.04]"
                    >
                      <div className="mb-1 text-[10px] font-semibold text-zinc-500">
                        Case {idx + 1}
                      </div>
                      <pre className="font-mono text-xs text-zinc-300 truncate">
                        {tc.input}
                      </pre>
                    </button>
                  ))}
                </div>
              )}

              {bottomTab === "output" && (
                <div className="h-full">
                  {!output && !isRunning && !isSubmitting ? (
                    <div className="flex h-full flex-col items-center justify-center text-zinc-600">
                      <Terminal size={20} className="mb-1 opacity-50" />
                      <p className="text-xs">Run your code to preview output</p>
                    </div>
                  ) : isRunning || isSubmitting ? (
                    <div className="flex h-full items-center justify-center gap-2 text-xs text-zinc-400">
                      <Loader2 size={15} className="animate-spin text-violet-400" />
                      <span>
                        {isSubmitting ? "Judging solution..." : "Running snippet..."}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isOutputError
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {isOutputError ? "Failed" : "Passed"}
                        </span>
                        {compilerResult?.status?.description && (
                          <span className="text-xs text-zinc-400">
                            {compilerResult.status.description}
                          </span>
                        )}
                      </div>

                      <pre
                        className={`rounded-xl p-3 font-mono text-xs leading-relaxed overflow-x-auto ${
                          isOutputError
                            ? "border border-rose-500/20 bg-rose-500/5 text-rose-300"
                            : "border border-white/[0.06] bg-white/[0.02] text-zinc-200"
                        }`}
                      >
                        {output}
                      </pre>

                      {compilerResult && (
                        <div className="flex gap-4 font-mono text-[11px] text-zinc-500">
                          <span>
                            Time:{" "}
                            <span className="text-zinc-300">
                              {compilerResult.time ?? "0.00"}s
                            </span>
                          </span>
                          <span>
                            Memory:{" "}
                            <span className="text-zinc-300">
                              {compilerResult.memory ? `${compilerResult.memory} KB` : "0 KB"}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Desktop Minimal Footer Bar */}
      <footer className="hidden h-7 shrink-0 items-center justify-between border-t border-white/[0.06] bg-zinc-950/80 px-4 text-[11px] text-zinc-500 sm:flex">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Zap size={11} className="text-amber-400" />
            Limit: {problem.timeLimit}ms / {problem.memoryLimit}MB
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{problem.totalSolvedUsers} solved</span>
          <span>{problem.totalSubmissions} submissions</span>
        </div>
      </footer>
    </div>
  );
}