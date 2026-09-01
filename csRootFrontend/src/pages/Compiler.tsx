import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
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
  Sparkles,
  Save,
  HelpCircle,
  X,
  Keyboard,
  Sliders,
  Database,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LoginRequiredModal } from "../components/LoginRequiredModal";

type Language = {
  id: string;
  name: string;
  extension: string;
  monacoLang: string;
  path: string;
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
  { id: "cpp", name: "C++", extension: "cpp", monacoLang: "cpp", path: "main.cpp" },
  { id: "c", name: "C", extension: "c", monacoLang: "c", path: "main.c" },
  { id: "java", name: "Java", extension: "java", monacoLang: "java", path: "Main.java" },
  { id: "python", name: "Python", extension: "py", monacoLang: "python", path: "main.py" },
  { id: "javascript", name: "JavaScript", extension: "js", monacoLang: "javascript", path: "main.js" },
];

const starterCode: Record<string, string> = {
  cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    cout << "Hello, CS ROOT!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, CS ROOT!\\n");
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CS ROOT!");
    }
}`,
  python: `def main():
    print("Hello, CS ROOT!")

if __name__ == "__main__":
    main()`,
  javascript: `console.log("Hello, CS ROOT!");`,
};

type ActiveMobileTab = "editor" | "input" | "output";

const STORAGE_KEY = "csroot_ide_saved_code";

export function Compiler() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterCode.cpp);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<CompilerResult | null>(null);
  const [requestError, setRequestError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mobileTab, setMobileTab] = useState<ActiveMobileTab>("editor");

  const [leftWidth, setLeftWidth] = useState(60);
  const [inputHeight, setInputHeight] = useState(35);

  const isDraggingHorizontal = useRef(false);
  const isDraggingVertical = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rightPaneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.code !== undefined) setCode(parsed.code);
        if (parsed.stdin !== undefined) setStdin(parsed.stdin);
      } catch {}
    }
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language, code, stdin })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [language, code, stdin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingHorizontal.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftWidth(newWidth);
      }
    }
    if (isDraggingVertical.current && rightPaneRef.current) {
      const paneRect = rightPaneRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - paneRect.top) / paneRect.height) * 100;
      if (newHeight >= 15 && newHeight <= 85) {
        setInputHeight(newHeight);
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingHorizontal.current = false;
    isDraggingVertical.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const selectedLanguage = languages.find((item) => item.id === language);

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTextExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      allowJs: true,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.registerCompletionItemProvider("cpp", {
      triggerCharacters: ["#", "<", ":", ">", "."],
      provideCompletionItems: (model: any, position: any) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const textUntilPosition = lineContent.substring(0, position.column - 1);
        const match = textUntilPosition.match(/#\w*$/);

        let replaceRange;
        if (match) {
          replaceRange = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - match[0].length,
            endColumn: position.column,
          };
        } else {
          const word = model.getWordUntilPosition(position);
          replaceRange = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
        }

        const suggestions = [
          {
            label: "#include <iostream>",
            filterText: "#include",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <iostream>",
            detail: "Include I/O stream header",
            range: replaceRange,
          },
          {
            label: "#include <vector>",
            filterText: "#include",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <vector>",
            detail: "Include vector header",
            range: replaceRange,
          },
          {
            label: "#include <string>",
            filterText: "#include",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <string>",
            detail: "Include string header",
            range: replaceRange,
          },
          {
            label: "#include <algorithm>",
            filterText: "#include",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <algorithm>",
            detail: "Include algorithm header",
            range: replaceRange,
          },
          {
            label: "#define",
            filterText: "#define",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#define ${1:NAME} ${2:VALUE}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "Macro definition",
            range: replaceRange,
          },
          {
            label: "cout",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "cout << ${1:\"Hello\"} << endl;",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "std::cout << ... << endl;",
            range: replaceRange,
          },
          {
            label: "cin",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "cin >> ${1:variable};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "std::cin >> ...;",
            range: replaceRange,
          },
          {
            label: "for",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t${3}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "for loop",
            range: replaceRange,
          },
          {
            label: "vector",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "vector<${1:int}> ${2:vec};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "std::vector<T>",
            range: replaceRange,
          },
        ];

        return { suggestions };
      },
    });

    monaco.languages.registerCompletionItemProvider("c", {
      triggerCharacters: ["#", "<", "."],
      provideCompletionItems: (model: any, position: any) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const textUntilPosition = lineContent.substring(0, position.column - 1);
        const match = textUntilPosition.match(/#\w*$/);

        let replaceRange;
        if (match) {
          replaceRange = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - match[0].length,
            endColumn: position.column,
          };
        } else {
          const word = model.getWordUntilPosition(position);
          replaceRange = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
        }

        const suggestions = [
          {
            label: "#include <stdio.h>",
            filterText: "#include",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <stdio.h>",
            detail: "Standard I/O header",
            range: replaceRange,
          },
          {
            label: "#include <stdlib.h>",
            filterText: "#include",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <stdlib.h>",
            detail: "Standard Library header",
            range: replaceRange,
          },
          {
            label: "#include <string.h>",
            filterText: "#include",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <string.h>",
            detail: "String manipulation header",
            range: replaceRange,
          },
          {
            label: "printf",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "printf(\"${1:%s}\\n\", ${2});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "printf formatted output",
            range: replaceRange,
          },
          {
            label: "scanf",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "scanf(\"${1:%d}\", &${2:var});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "scanf formatted input",
            range: replaceRange,
          },
          {
            label: "main",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "int main() {\n\t${1}\n\treturn 0;\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "main function boiler",
            range: replaceRange,
          },
        ];

        return { suggestions };
      },
    });

    monaco.languages.registerCompletionItemProvider("python", {
      triggerCharacters: [".", " "],
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "print",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "print(${1:\"Hello\"})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "print(...)",
            range,
          },
          {
            label: "def",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "def ${1:function_name}(${2:args}):\n\t${3:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "def func():",
            range,
          },
          {
            label: "ifmain",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "if __name__ == '__main__':\n\t${1:main()}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "Main Entry Point",
            range,
          },
          {
            label: "for",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for ${1:i} in range(${2:n}):\n\t${3:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "for range loop",
            range,
          },
        ];

        return { suggestions };
      },
    });

    monaco.languages.registerCompletionItemProvider("java", {
      triggerCharacters: [".", " "],
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "sout",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "System.out.println(${1:\"Hello\"});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "System.out.println",
            range,
          },
          {
            label: "psvm",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "public static void main(String[] args) {\n\t${1}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "main method signature",
            range,
          },
        ];

        return { suggestions };
      },
    });
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguageId = event.target.value;
    setLanguage(selectedLanguageId);
    setCode(starterCode[selectedLanguageId] || "");
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
    localStorage.removeItem(STORAGE_KEY);
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
      <div className="flex h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden bg-[#1e1e1e] font-sans text-[#cccccc] antialiased">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-[#2b2b2b] bg-[#181818] px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#007acc]/15 text-[#007acc]">
              <Code2 size={15} />
            </div>
            <span className="text-[13px] font-semibold tracking-wide text-zinc-200">
              CS ROOT <span className="text-[#007acc]">IDE</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex items-center">
              <select
                value={language}
                onChange={handleLanguageChange}
                disabled={isRunning}
                className="h-7 cursor-pointer appearance-none rounded border border-[#3c3c3c] bg-[#252526] pl-2.5 pr-7 text-xs font-medium text-[#cccccc] shadow-sm outline-none transition hover:border-[#4d4d4d] focus:border-[#007acc] disabled:opacity-50"
              >
                {languages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 text-[#858585]">
                ▾
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              title="How to Use CS ROOT IDE"
              className="flex h-7 items-center justify-center rounded border border-[#3c3c3c] bg-[#252526] px-2.5 text-xs text-[#cccccc] shadow-sm transition hover:bg-[#2e2e2f] hover:text-[#007acc]"
            >
              <HelpCircle size={13} className="sm:mr-1.5" />
              <span className="hidden sm:inline">How to Use</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isRunning}
              title="Save Code (Ctrl+S)"
              className="flex h-7 items-center justify-center rounded border border-[#3c3c3c] bg-[#252526] px-2.5 text-xs text-[#cccccc] shadow-sm transition hover:bg-[#2e2e2f] hover:text-white disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check size={12} className="text-[#89d185] sm:mr-1.5" />
                  <span className="hidden sm:inline text-[#89d185]">Saved</span>
                </>
              ) : (
                <>
                  <Save size={12} className="sm:mr-1.5" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isRunning}
              title="Reset Code & Clear Storage"
              className="flex h-7 items-center justify-center rounded border border-[#3c3c3c] bg-[#252526] px-2.5 text-xs text-[#cccccc] shadow-sm transition hover:bg-[#2e2e2f] hover:text-white disabled:opacity-50"
            >
              <RotateCcw size={12} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isRunning}
              title="Clear Editor"
              className="flex h-7 items-center justify-center rounded border border-[#3c3c3c] bg-[#252526] px-2.5 text-xs text-[#cccccc] shadow-sm transition hover:bg-[#2e2e2f] hover:text-white disabled:opacity-50"
            >
              <Trash2 size={12} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning || authLoading}
              className="flex h-7 items-center justify-center gap-1.5 rounded bg-[#0e639c] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1177bb] active:scale-[0.98] disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Running</span>
                </>
              ) : (
                <>
                  <Play size={12} className="fill-white" />
                  <span>Run</span>
                </>
              )}
            </button>
          </div>
        </header>

        <div className="flex h-9 shrink-0 border-b border-[#2b2b2b] bg-[#252526] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-medium border-b-2 transition ${
              mobileTab === "editor"
                ? "border-[#007acc] text-white bg-[#1e1e1e]"
                : "border-transparent text-[#858585] hover:text-[#cccccc]"
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
                ? "border-[#007acc] text-white bg-[#1e1e1e]"
                : "border-transparent text-[#858585] hover:text-[#cccccc]"
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
                ? "border-[#007acc] text-white bg-[#1e1e1e]"
                : "border-transparent text-[#858585] hover:text-[#cccccc]"
            }`}
          >
            <Terminal size={13} />
            Terminal
          </button>
        </div>

        <main ref={containerRef} className="relative flex min-h-0 flex-1 overflow-hidden">
          <section
            style={{ width: `${leftWidth}%` }}
            className={`h-full flex-col border-b border-[#2b2b2b] lg:border-b-0 ${
              mobileTab === "editor" ? "flex w-full lg:w-auto" : "hidden lg:flex"
            }`}
          >
            <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#252526] bg-[#181818] px-2">
              <div className="flex h-full items-center gap-2 border-t-2 border-[#007acc] bg-[#1e1e1e] px-3 font-mono text-xs text-white">
                <span className="text-[#007acc]">{"</>"}</span>
                <span>{selectedLanguage?.path}</span>
              </div>
              <div className="flex items-center gap-2 pr-2 text-[11px] text-[#6e6e6e]">
                <Sparkles size={11} className="text-[#007acc]" />
                <span>IntelliSense Active</span>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 bg-[#1e1e1e]">
              <Editor
                height="100%"
                theme="vs-dark"
                path={selectedLanguage?.path}
                language={selectedLanguage?.monacoLang || "cpp"}
                value={code}
                beforeMount={handleEditorWillMount}
                onChange={(value) => setCode(value ?? "")}
                options={{
                  tabSize: 4,
                  insertSpaces: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  readOnly: isRunning,
                  padding: { top: 8, bottom: 8 },
                  fontFamily: "'Cascadia Code', Consolas, 'Fira Code', monospace",
                  fontLigatures: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  renderLineHighlight: "all",
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                  },
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: {
                    other: true,
                    comments: true,
                    strings: true,
                  },
                  parameterHints: {
                    enabled: true,
                    cycle: true,
                  },
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showFunctions: true,
                    showVariables: true,
                    showClasses: true,
                    showModules: true,
                    showProperties: true,
                    showWords: true,
                    preview: true,
                    shareSuggestSelections: true,
                  },
                  acceptSuggestionOnEnter: "on",
                  wordBasedSuggestions: "allDocuments",
                }}
              />
            </div>
          </section>

          <div
            onMouseDown={() => {
              isDraggingHorizontal.current = true;
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            className="hidden lg:block w-1.5 cursor-col-resize bg-[#2b2b2b] hover:bg-[#007acc] transition-colors z-10 select-none"
          />

          <section
            ref={rightPaneRef}
            style={{ width: `${100 - leftWidth}%` }}
            className={`h-full flex-col bg-[#181818] ${
              mobileTab !== "editor" ? "flex w-full lg:w-auto" : "hidden lg:flex"
            }`}
          >
            <div
              style={{ height: `${inputHeight}%` }}
              className={`flex flex-col border-b border-[#2b2b2b] ${
                mobileTab === "input" ? "flex h-full lg:h-auto" : "hidden lg:flex"
              }`}
            >
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#2b2b2b] bg-[#181818] px-3">
                <span className="text-[11px] font-semibold tracking-wider text-[#999999]">
                  STANDARD INPUT (STDIN)
                </span>
              </div>

              <textarea
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                disabled={isRunning}
                spellCheck={false}
                placeholder="Pass custom inputs to program here..."
                className="h-full w-full resize-none bg-[#1e1e1e] p-3 font-mono text-xs leading-5 text-[#cccccc] outline-none placeholder:text-[#555555]"
              />
            </div>

            <div
              onMouseDown={() => {
                isDraggingVertical.current = true;
                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";
              }}
              className="hidden lg:block h-1.5 cursor-row-resize bg-[#2b2b2b] hover:bg-[#007acc] transition-colors z-10 select-none"
            />

            <div
              style={{ height: `${100 - inputHeight}%` }}
              className={`flex min-h-0 flex-1 flex-col bg-[#1e1e1e] ${
                mobileTab === "output" ? "flex h-full lg:h-auto" : "hidden lg:flex"
              }`}
            >
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#2b2b2b] bg-[#181818] px-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-wider text-[#999999]">
                    OUTPUT TERMINAL
                  </span>
                  {output && !isRunning && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                        outputIsError
                          ? "bg-[#5a1d1d] text-[#f48771]"
                          : "bg-[#1d4f2b] text-[#89d185]"
                      }`}
                    >
                      {outputIsError ? "Failed" : "Success"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isRunning && (
                    <span className="flex items-center gap-1.5 text-xs text-[#007acc]">
                      <Loader2 size={11} className="animate-spin" />
                      Executing...
                    </span>
                  )}

                  {output && !isRunning && (
                    <button
                      type="button"
                      onClick={handleCopyOutput}
                      className="inline-flex items-center gap-1 text-xs text-[#858585] transition hover:text-white"
                    >
                      {copied ? (
                        <>
                          <Check size={11} className="text-[#89d185]" />
                          <span className="text-[#89d185]">Copied</span>
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

              <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-xs">
                {!output && !requestError && !isRunning && (
                  <div className="flex h-full flex-col items-center justify-center text-center text-[#555555]">
                    <Terminal size={22} className="mb-2 opacity-30" />
                    <p className="text-xs">Program output will display here</p>
                  </div>
                )}

                {isRunning && (
                  <div className="flex h-full items-center justify-center gap-2 text-[#858585]">
                    <Loader2 size={14} className="animate-spin text-[#007acc]" />
                    <span>Running executable...</span>
                  </div>
                )}

                {requestError && !isRunning && (
                  <pre className="whitespace-pre-wrap leading-5 text-[#f48771]">
                    {requestError}
                  </pre>
                )}

                {output && !isRunning && (
                  <div className="flex flex-col justify-between">
                    <pre
                      className={`whitespace-pre-wrap leading-5 ${
                        outputIsError ? "text-[#f48771]" : "text-[#cccccc]"
                      }`}
                    >
                      {output}
                    </pre>

                    {result && (
                      <div className="mt-4 flex flex-wrap gap-4 border-t border-[#2b2b2b] pt-2 text-[10px] text-[#858585]">
                        <span>
                          Time:{" "}
                          <strong className="font-mono text-[#cccccc]">
                            {result.time ?? "-"}s
                          </strong>
                        </span>
                        <span>
                          Memory:{" "}
                          <strong className="font-mono text-[#cccccc]">
                            {result.memory ? `${result.memory} KB` : "-"}
                          </strong>
                        </span>
                        <span>
                          Exit Code:{" "}
                          <strong className="font-mono text-[#cccccc]">
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

      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm antialiased">
          <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2b2b2b] bg-[#181818] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#007acc]/15 text-[#007acc]">
                  <HelpCircle size={15} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  How to Use CS ROOT IDE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded p-1 text-[#858585] transition hover:bg-[#252526] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs text-[#cccccc]">
              <div className="flex items-start gap-3 rounded-md border border-[#2b2b2b] bg-[#252526]/50 p-3">
                <div className="mt-0.5 rounded bg-[#007acc]/20 p-1.5 text-[#007acc]">
                  <Code2 size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200">1. Select Language & Code</h4>
                  <p className="mt-0.5 text-[#999999]">
                    Choose from C++, C, Java, Python, or JavaScript from the top dropdown. Monaco editor provides IntelliSense suggestions and syntax highlighting.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-[#2b2b2b] bg-[#252526]/50 p-3">
                <div className="mt-0.5 rounded bg-[#007acc]/20 p-1.5 text-[#007acc]">
                  <ArrowDownToLine size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200">2. Provide Custom Inputs (stdin)</h4>
                  <p className="mt-0.5 text-[#999999]">
                    If your program uses interactive inputs (like <code className="rounded bg-[#181818] px-1 py-0.5 font-mono text-[#89d185]">cin</code>, <code className="rounded bg-[#181818] px-1 py-0.5 font-mono text-[#89d185]">scanf</code>, or <code className="rounded bg-[#181818] px-1 py-0.5 font-mono text-[#89d185]">input()</code>), write them in the STDIN area before execution.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-[#2b2b2b] bg-[#252526]/50 p-3">
                <div className="mt-0.5 rounded bg-[#007acc]/20 p-1.5 text-[#007acc]">
                  <Play size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200">3. Run & View Output</h4>
                  <p className="mt-0.5 text-[#999999]">
                    Click <strong className="text-white">Run</strong> to send code to the compiler. The terminal displays real-time results, execution time, memory usage, and exit codes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-[#2b2b2b] bg-[#252526]/50 p-3">
                <div className="mt-0.5 rounded bg-[#007acc]/20 p-1.5 text-[#007acc]">
                  <Database size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200">4. Auto-Save & Local Storage</h4>
                  <p className="mt-0.5 text-[#999999]">
                    Press <kbd className="rounded bg-[#181818] px-1.5 py-0.5 font-mono text-[11px] text-[#007acc] border border-[#3c3c3c]">Ctrl + S</kbd> or click <strong className="text-white">Save</strong> to save your current work locally. Clicking <strong className="text-white">Reset</strong> wipes saved storage and restores default templates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-[#2b2b2b] bg-[#252526]/50 p-3">
                <div className="mt-0.5 rounded bg-[#007acc]/20 p-1.5 text-[#007acc]">
                  <Sliders size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200">5. Resizable Panels</h4>
                  <p className="mt-0.5 text-[#999999]">
                    Drag the divider bars between the code editor, standard input, and terminal output to customize pane sizes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#2b2b2b] bg-[#181818] p-3">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded bg-[#0e639c] px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-[#1177bb]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login to use the compiler"
        description="Create an account or login to CS ROOT to write, execute and experiment with code."
      />
    </>
  );
}