import { useState } from "react";
import {
  Play,
  Trash2,
  Terminal,
  Loader2,
  Copy,
  Check,
  Code2,
  ArrowDownToLine,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LoginRequiredModal } from "../components/LoginRequiredModal";

type Language = {
  id: string;
  name: string;
  extension: string;
};

type CompilerResult = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  exit_code: number | null;
  exit_signal: number | null;
  status?: {
    id: number;
    description: string;
  };
  time: string | null;
  wall_time: string | null;
  memory: number | null;
};

const languages: Language[] = [
  { id: "c", name: "C", extension: "c" },
  { id: "cpp", name: "C++", extension: "cpp" },
  { id: "java", name: "Java", extension: "java" },
  { id: "javascript", name: "JavaScript", extension: "js" },
  { id: "python", name: "Python", extension: "py" },
];

const starterCode: Record<string, string> = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, CS ROOT!");
    return 0;
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CS ROOT!";
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CS ROOT!");
    }
}`,
  javascript: `console.log("Hello, CS ROOT!");`,
  python: `print("Hello, CS ROOT!")`,
};

type ActiveMobileTab = "editor" | "input" | "output";

export function Compiler() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterCode.cpp);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<CompilerResult | null>(null);
  const [requestError, setRequestError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<ActiveMobileTab>("editor");

  const selectedLanguage = languages.find((item) => item.id === language);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguageId = event.target.value;
    setLanguage(selectedLanguageId);
    setCode(starterCode[selectedLanguageId]);
    setStdin("");
    setResult(null);
    setRequestError("");
    setCopied(false);
  };

  const handleRun = async () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!code.trim()) {
      setRequestError("Please write some code first.");
      setMobileTab("output");
      return;
    }

    setIsRunning(true);
    setResult(null);
    setRequestError("");
    setCopied(false);
    setMobileTab("output");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND}/compiler/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ language, code, stdin }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setShowLoginModal(true);
          return;
        }
        throw new Error(data?.message || "Failed to execute code.");
      }

      setResult(data?.data?.result ?? data?.result ?? null);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Something went wrong while running the code."
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setStdin("");
    setResult(null);
    setRequestError("");
    setCopied(false);
  };

  const handleReset = () => {
    setCode(starterCode[language]);
    setStdin("");
    setResult(null);
    setRequestError("");
    setCopied(false);
  };

  const getOutput = () => {
    if (!result) return "";
    return (
      result.stdout ||
      result.stderr ||
      result.compile_output ||
      result.message ||
      result.status?.description ||
      ""
    );
  };

  const output = getOutput();

  const outputIsError =
    !!result?.stderr ||
    !!result?.compile_output ||
    !!result?.message ||
    (result?.status?.id !== undefined &&
      result.status.id >= 6 &&
      result.status.id <= 14);

  const handleCopyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {/* 
        h-[calc(100dvh-4rem)]: matches dynamic viewport height minus standard 4rem (h-16) navbar.
        If your navbar is h-14 (3.5rem), simply change to h-[calc(100dvh-3.5rem)].
      */}
      <div className="flex h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden bg-[#181a20] text-white">
        
        {/* Compiler Top Control Header */}
        <header className="flex h-13 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#111318] px-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#04AA6D]/15 text-[#04AA6D]">
              <Terminal size={15} />
            </div>
            <span className="text-xs font-semibold text-zinc-300">
              IDE & Runner
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={isRunning}
              className="h-8 rounded-lg border border-zinc-700 bg-[#1b1d24] px-2.5 text-xs font-medium text-zinc-200 outline-none transition focus:border-[#04AA6D] disabled:opacity-50 sm:text-sm"
            >
              {languages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleReset}
              disabled={isRunning}
              title="Reset Code"
              className="flex h-8 items-center justify-center rounded-lg border border-zinc-700 px-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              <RotateCcw size={13} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isRunning}
              title="Clear Editor"
              className="flex h-8 items-center justify-center rounded-lg border border-zinc-700 px-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              <Trash2 size={13} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning || authLoading}
              className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#04AA6D] px-3.5 text-xs font-bold text-white transition hover:bg-[#038c5a] disabled:opacity-60 sm:px-4 sm:text-sm"
            >
              {isRunning ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Running</span>
                </>
              ) : (
                <>
                  <Play size={13} />
                  <span>Run</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Mobile View Tab Bar */}
        <div className="flex h-9 shrink-0 border-b border-zinc-800 bg-[#14161d] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-medium border-b-2 transition ${
              mobileTab === "editor"
                ? "border-[#04AA6D] text-white bg-[#1a1d26]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 size={13} />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("input")}
            className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-medium border-b-2 transition ${
              mobileTab === "input"
                ? "border-[#04AA6D] text-white bg-[#1a1d26]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ArrowDownToLine size={13} />
            Input
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("output")}
            className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-medium border-b-2 transition ${
              mobileTab === "output"
                ? "border-[#04AA6D] text-white bg-[#1a1d26]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Terminal size={13} />
            Output
          </button>
        </div>

        {/* Main Work Area */}
        <main className="grid min-h-0 flex-1 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Left: Code Editor */}
          <section
            className={`flex h-full flex-col border-b border-zinc-800 lg:border-b-0 lg:border-r ${
              mobileTab === "editor" ? "flex" : "hidden lg:flex"
            }`}
          >
            <div className="flex h-8 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#16181f] px-4">
              <span className="font-mono text-xs text-zinc-400">
                main.{selectedLanguage?.extension}
              </span>
              <span className="text-[11px] text-zinc-500">
                {selectedLanguage?.name}
              </span>
            </div>

            <div className="relative min-h-0 flex-1 bg-[#111318]">
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                disabled={isRunning}
                className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-700 disabled:opacity-70"
                placeholder="Write your code here..."
              />
            </div>
          </section>

          {/* Right: Input and Output Panels */}
          <section
            className={`grid h-full grid-rows-[35%_65%] bg-[#0d0f13] ${
              mobileTab !== "editor" ? "grid" : "hidden lg:grid"
            }`}
          >
            {/* Input (stdin) */}
            <div
              className={`flex flex-col border-b border-zinc-800 ${
                mobileTab === "input" ? "flex" : "hidden lg:flex"
              }`}
            >
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#16181f] px-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Custom Input (stdin)
                </span>
              </div>

              <textarea
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                disabled={isRunning}
                spellCheck={false}
                placeholder="Enter standard input..."
                className="h-full w-full resize-none bg-transparent p-3 font-mono text-xs leading-5 text-zinc-300 outline-none placeholder:text-zinc-700"
              />
            </div>

            {/* Output (stdout / stderr) */}
            <div
              className={`flex min-h-0 flex-col ${
                mobileTab === "output" ? "flex" : "hidden lg:flex"
              }`}
            >
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#16181f] px-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Terminal Output
                  </span>
                  {output && !isRunning && (
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-semibold ${
                        outputIsError
                          ? "bg-red-950/50 text-red-400 border border-red-900/50"
                          : "bg-[#04AA6D]/20 text-[#04AA6D] border border-[#04AA6D]/30"
                      }`}
                    >
                      {outputIsError ? "Error" : "Success"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isRunning && (
                    <span className="flex items-center gap-1.5 text-xs text-[#04AA6D]">
                      <Loader2 size={11} className="animate-spin" />
                      Running...
                    </span>
                  )}

                  {output && !isRunning && (
                    <button
                      type="button"
                      onClick={handleCopyOutput}
                      className="inline-flex items-center gap-1 text-xs text-zinc-400 transition hover:text-white"
                    >
                      {copied ? (
                        <>
                          <Check size={11} className="text-[#04AA6D]" />
                          <span className="text-[#04AA6D]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Output */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-xs">
                {!output && !requestError && !isRunning && (
                  <div className="flex h-full flex-col items-center justify-center text-center text-zinc-600">
                    <Terminal size={20} className="mb-2 opacity-40" />
                    <p className="text-xs">Program output will appear here</p>
                  </div>
                )}

                {isRunning && (
                  <div className="flex h-full items-center justify-center gap-2 text-zinc-500">
                    <Loader2 size={14} className="animate-spin text-[#04AA6D]" />
                    <span>Executing code...</span>
                  </div>
                )}

                {requestError && !isRunning && (
                  <pre className="whitespace-pre-wrap leading-5 text-red-400">
                    {requestError}
                  </pre>
                )}

                {output && !isRunning && (
                  <div className="flex flex-col justify-between">
                    <pre
                      className={`whitespace-pre-wrap leading-5 ${
                        outputIsError ? "text-red-400" : "text-zinc-200"
                      }`}
                    >
                      {output}
                    </pre>

                    {result && (
                      <div className="mt-4 flex flex-wrap gap-4 border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-500">
                        <span>
                          Time:{" "}
                          <strong className="text-zinc-300 font-mono">
                            {result.time ?? "-"}s
                          </strong>
                        </span>
                        <span>
                          Memory:{" "}
                          <strong className="text-zinc-300 font-mono">
                            {result.memory ? `${result.memory} KB` : "-"}
                          </strong>
                        </span>
                        <span>
                          Exit Code:{" "}
                          <strong className="text-zinc-300 font-mono">
                            {result.exit_code ?? "-"}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login to use the compiler"
        description="Create an account or login to CS ROOT to write, execute and experiment with code."
      />
    </>
  );
}