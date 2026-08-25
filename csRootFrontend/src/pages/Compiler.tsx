import { useState } from "react";
import { Play, Trash2, Terminal, Loader2 } from "lucide-react";

type Language = {
  id: string;
  name: string;
  extension: string;
};

const languages: Language[] = [
  {
    id: "c",
    name: "C",
    extension: "c",
  },
  {
    id: "cpp",
    name: "C++",
    extension: "cpp",
  },
  {
    id: "java",
    name: "Java",
    extension: "java",
  },
  {
    id: "javascript",
    name: "JavaScript",
    extension: "js",
  },
  {
    id: "python",
    name: "Python",
    extension: "py",
  },
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

export function Compiler() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterCode.cpp);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage = event.target.value;

    setLanguage(selectedLanguage);
    setCode(starterCode[selectedLanguage]);
    setOutput("");
    setError("");
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND}/compiler/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            language,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to execute code."
        );
      }

      setOutput(data.output ?? "");
      setError(data.error ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while running the code."
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setOutput("");
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#282A35] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#04AA6D]">
            CS ROOT Compiler
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Write. Run. Experiment.
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
            Write and execute programs in C, C++, Java, JavaScript and
            Python directly from CS ROOT.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#04AA6D]/10 text-[#04AA6D]">
                <Terminal size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Code Editor
                </p>

                <p className="text-xs text-zinc-600">
                  Select a language and start coding
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="h-10 rounded-lg border border-zinc-700 bg-[#1b1d24] px-4 text-sm font-medium text-zinc-200 outline-none transition focus:border-[#04AA6D]"
              >
                {languages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
              >
                <Trash2 size={15} />
                Clear
              </button>

              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#04AA6D] px-5 text-sm font-bold text-white transition hover:bg-[#038c5a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRunning ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Running
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            <div className="min-w-0 border-b border-zinc-800 lg:border-b-0 lg:border-r">
              <div className="flex h-10 items-center border-b border-zinc-800 bg-[#181a20] px-4">
                <span className="text-xs font-medium text-zinc-500">
                  main.{languages.find(
                    (item) => item.id === language
                  )?.extension}
                </span>
              </div>

              <textarea
                value={code}
                onChange={(event) =>
                  setCode(event.target.value)
                }
                spellCheck={false}
                className="min-h-[420px] w-full resize-none bg-[#111318] p-5 font-mono text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-700 sm:min-h-[520px]"
                placeholder="Write your code here..."
              />
            </div>

            <div className="min-w-0 bg-[#0d0f13]">
              <div className="flex h-10 items-center justify-between border-b border-zinc-800 bg-[#181a20] px-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Output
                </span>

                {isRunning && (
                  <span className="text-xs text-[#04AA6D]">
                    Executing...
                  </span>
                )}
              </div>

              <div className="min-h-[420px] overflow-auto p-5 sm:min-h-[520px]">
                {!output && !error && !isRunning && (
                  <div className="flex min-h-[360px] items-center justify-center text-center">
                    <div>
                      <p className="text-sm font-medium text-zinc-500">
                        Program output will appear here
                      </p>

                      <p className="mt-2 text-xs text-zinc-700">
                        Write your code and press Run Code
                      </p>
                    </div>
                  </div>
                )}

                {isRunning && (
                  <div className="flex min-h-[360px] items-center justify-center">
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <Loader2
                        size={18}
                        className="animate-spin text-[#04AA6D]"
                      />
                      Running your program...
                    </div>
                  </div>
                )}

                {output && (
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-zinc-300">
                    {output}
                  </pre>
                )}

                {error && (
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-red-400">
                    {error}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-[#1d1f27] p-4">
            <p className="text-sm font-semibold text-white">
              Multiple Languages
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              C, C++, Java, JavaScript and Python.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1d1f27] p-4">
            <p className="text-sm font-semibold text-white">
              Instant Execution
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Send your program to the CS ROOT execution service.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1d1f27] p-4">
            <p className="text-sm font-semibold text-white">
              Practice While Learning
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Use the compiler while solving CS ROOT problems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}