"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Star, Play, Pause, Bug, CheckCircle2, Lightbulb, SkipBack, SkipForward, RotateCcw, Square } from "lucide-react";
import Editor from "@monaco-editor/react";
import problemsData from "@/data/problems.json";
import detailsData from "@/data/details.json";
import solutionsData from "@/data/solutions.json";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useProblemStore } from "@/lib/stores/problem-store";
import { useDebuggerStore } from "@/lib/stores/debugger-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn, difficultyBg } from "@/lib/utils";
import { VisualizerPanel } from "@/components/visualizer/VisualizerPanel";
import type { Problem, RawProblemDetail, RawSolution, ProblemDetail, TraceEvent } from "@/lib/types";

function formatSlimValue(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.map(formatSlimValue).join(", ")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, any>;
    if ("error" in o && typeof o.error === "string" && Object.keys(o).length <= 2) return String(o.error);
    if ("_arr" in o) return `[${(o._arr || []).map(formatSlimValue).join(", ")}]`;
    if ("_set" in o) return `{${(o._set || []).map(formatSlimValue).join(", ")}}`;
    if ("_map" in o) {
      const entries = Object.entries(o._map || {}).map(([k, val]) => `${k}: ${formatSlimValue(val)}`);
      return `{${entries.join(", ")}}`;
    }
    if ("_str" in o) return String(o._str);
    if ("_ref" in o) return `<ref ${o._ref}>`;
    if ("_obj" in o) {
      const inner = Object.entries(o._obj || {}).map(([k, val]) => `${k}: ${formatSlimValue(val)}`).join(", ");
      return `${o._type || "object"}{${inner}}`;
    }
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
}

function slimArrayItems(v: unknown): unknown[] | null {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object" && "_arr" in (v as any)) return (v as any)._arr || [];
  return null;
}

const allProblems = problemsData as Problem[];
const allRawDetails = detailsData as Record<string, RawProblemDetail>;
const allRawSolutions = solutionsData as RawSolution[];
const solutionMap = new Map(allRawSolutions.map((s) => [s.slug, s]));

// Normalize detail data
function normalizeDetail(slug: string): ProblemDetail | null {
  const raw = allRawDetails[slug];
  const solution = solutionMap.get(slug);
  const problem = allProblems.find((p) => p.slug === slug);

  if (!raw && !solution && !problem) return null;

  const examples = (raw?.examples || []).map((ex) => {
    const text = ex.example_text || "";
    const inputMatch = text.match(/Input:\s*([\s\S]*)(?=Output:|$)/);
    const outputMatch = text.match(/Output:\s*([\s\S]*)(?=Explanation:|$)/);
    const explanationMatch = text.match(/Explanation:\s*([\s\S]*)$/);
    return {
      input: inputMatch?.[1].trim() || text,
      output: outputMatch?.[1].trim() || "",
      explanation: explanationMatch?.[1].trim() || undefined,
    };
  });

  const approaches = (solution?.approaches || []).map((a) => ({
    name: a.name,
    intuition: a.idea,
    explanation: a.idea,
    timeComplexity: a.time,
    spaceComplexity: a.space,
    code: { java: a.java, python: a.python, cpp: a.cpp },
    pros: a.pros || [],
    cons: a.cons || [],
  }));

  // Try to extract starter code from snippets
  const snippets = raw?.snippets || {};
  let starterCode: { java: string; python: string; cpp: string } = { java: "", python: "", cpp: "" };
  if (snippets.python3) starterCode.python = snippets.python3;
  else if (snippets.python) starterCode.python = snippets.python;
  if (snippets.java) starterCode.java = snippets.java;
  if (snippets.cpp) starterCode.cpp = snippets.cpp;

  return {
    slug,
    description: raw?.description || "",
    examples,
    constraints: raw?.constraints || [],
    hints: raw?.hints || [],
    starterCode,
    approaches,
    solutionMarkdown: raw?.solutionsMarkdown,
  };
}

type BottomTab = "tests" | "console" | "debugger" | "visualizer" | "notes" | "attempts";

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const problem = allProblems.find((p) => p.slug === slug);
  const detail = useMemo(() => normalizeDetail(slug), [slug]);

  const { language, code, setLanguage, setCode, fontSize } = useEditorStore();
  const { getUserState, updateUserState, loadFromStorage } = useProblemStore();
  const { isDebugging, trace, currentStep, isPlaying, speed, setTrace, nextStep, prevStep, setPlaying, setSpeed, stopDebugging, restart } = useDebuggerStore();
  const { bottomPanel, setBottomPanel } = useUIStore();

  const [mounted, setMounted] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [consoleError, setConsoleError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isDebugRun, setIsDebugRun] = useState(false);
  const [debugNotice, setDebugNotice] = useState("");
  const [showHINTS, setShowHINTS] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [activeApproach, setActiveApproach] = useState(0);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any>(null);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  // Load saved code
  useEffect(() => {
    if (!mounted || !slug || !detail) return;
    const state = getUserState(slug);
    if (state.code.java) { setCode("java", state.code.java); }
    if (state.code.python) { setCode("python", state.code.python); }
    if (state.code.cpp) { setCode("cpp", state.code.cpp); }
    if (state.language) { setLanguage(state.language); }
    if (state.notes) { setNotes(state.notes); }
    if (!state.code.java && detail.starterCode.java) {
      setCode("java", detail.starterCode.java);
    }
    if (!state.code.python && detail.starterCode.python) {
      setCode("python", detail.starterCode.python);
    }
    if (!state.code.cpp && detail.starterCode.cpp) {
      setCode("cpp", detail.starterCode.cpp);
    }
  }, [mounted, slug, detail, getUserState, setCode, setLanguage]);

  const currentCode = code[language];

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!value || !slug) return;
      setCode(language, value);
      updateUserState(slug, { code: { ...getUserState(slug).code, [language]: value } });
    },
    [slug, language, setCode, updateUserState, getUserState]
  );

  const COMPANION_URL = process.env.NEXT_PUBLIC_COMPANION_URL || "http://localhost:3001";

  const handleRun = useCallback(async () => {
    if (!currentCode || isRunning) return;
    setIsRunning(true);
    setConsoleOutput("");
    setConsoleError("");
    setBottomPanel("console");
    try {
      const res = await fetch(`${COMPANION_URL}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: currentCode, input: testInput }),
      });
      const data = await res.json();
      setConsoleOutput(data.stdout || "");
      setConsoleError(data.stderr || "");
    } catch {
      setConsoleError(`[ERR] companion_offline @ ${COMPANION_URL}\n> start: npm run companion (local) or set NEXT_PUBLIC_COMPANION_URL`);
    } finally {
      setIsRunning(false);
    }
  }, [currentCode, language, testInput, isRunning, setBottomPanel]);

  const handleDebug = useCallback(async () => {
    if (!currentCode || isDebugRun) return;
    setDebugNotice("");
    if (language !== "python") {
      stopDebugging();
      setDebugNotice("[INFO] trace_engine: python_only. switch language=python for line-step debugger/variable watch.");
      setBottomPanel("debugger");
      return;
    }
    setIsDebugRun(true);
    setBottomPanel("debugger");
    try {
      const res = await fetch(`${COMPANION_URL}/api/debug/trace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: currentCode, input: testInput }),
      });
      const data = await res.json();
      if (data.ok && data.events.length) {
        setTrace(data.events as TraceEvent[]);
      } else {
        setDebugNotice(data.stderr || "[ERR] trace_failed. ensure code executes without fatal errors.");
        stopDebugging();
      }
    } catch {
      setDebugNotice(`[ERR] companion_offline @ ${COMPANION_URL} (set NEXT_PUBLIC_COMPANION_URL or run companion locally)`);
      stopDebugging();
    } finally {
      setIsDebugRun(false);
    }
  }, [currentCode, language, testInput, isDebugRun, setTrace, setBottomPanel, stopDebugging, COMPANION_URL]);

  useEffect(() => {
    if (!isPlaying || !isDebugging) return;
    const id = setInterval(() => {
      const st = useDebuggerStore.getState();
      if (st.currentStep >= st.trace.length - 1) { st.setPlaying(false); return; }
      st.nextStep();
    }, Math.max(120, 900 / Math.max(speed, 0.25)));
    return () => clearInterval(id);
  }, [isPlaying, isDebugging, speed]);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    if (isDebugging && trace[currentStep] && trace[currentStep].line > 0) {
      const line = trace[currentStep].line;
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], [
        {
          range: new monaco.Range(line, 1, line, 1),
          options: { isWholeLine: true, className: "debug-current-line", glyphMarginClassName: "debug-current-glyph" },
        },
      ]);
      editor.revealLineInCenter(line);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], []);
    }
  }, [isDebugging, trace, currentStep]);

  const handleSaveNotes = useCallback(() => {
    if (slug) updateUserState(slug, { notes });
  }, [slug, notes, updateUserState]);

  if (!problem || !detail) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8 font-mono">
        <div className="text-[var(--muted)]">
          [ERR] problem_not_found. 
          <button onClick={() => router.push("/problems")} className="text-[var(--text)] underline">
            cd ..
          </button>
        </div>
      </div>
    );
  }

  const currentEvent = isDebugging && trace[currentStep] ? trace[currentStep] : null;

  return (
    <div className="h-[calc(100vh-76px)] flex flex-col font-mono bg-[#080809]">
      {/* Top Bar */}
      <div className="flex items-center gap-2 px-3 h-[40px] bg-[#0f0f12] border-b border-[var(--border)] flex-shrink-0 text-[12px]">
        <button onClick={() => router.push("/problems")} className="text-[var(--muted)] hover:text-[#ffffff]">
          <ArrowLeft size={18} />
        </button>
        <span className="font-bold text-[14px] font-mono">#{problem.id}</span>
        <span className="text-[14px] font-semibold text-[var(--text)] font-mono">{problem.title}</span>
        <span
          className={cn(
            "text-[11px] font-bold px-2.5 py-1 rounded-[2px] border",
            difficultyBg(problem.difficulty),
            problem.difficulty === "Easy"
              ? "text-[#d4d4d8]"
              : problem.difficulty === "Medium"
              ? "text-[#a1a1aa]"
              : "text-[#a1a1aa]"
          )}
        >
          {problem.difficulty}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex border border-[var(--border)] rounded-[2px] overflow-hidden">
            {(["java", "python", "cpp"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  language === lang
                    ? "bg-[#e5e5e7] text-[#050505]"
                    : "bg-[#0f0f12] text-[var(--muted)] hover:text-[#ffffff]"
                )}
              >
                {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>

          <a
            href={`https://leetcode.com/problems/${slug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-[var(--muted)] hover:text-[#ffffff]"
          >
            <ExternalLink size={13} /> leetcode
          </a>

          <button
            onClick={() =>
              mounted && updateUserState(slug, { favorite: !getUserState(slug).favorite })
            }
            className="p-1.5"
          >
            <Star
              size={16}
              className={
                mounted && getUserState(slug).favorite
                  ? "text-[#d4d4d8] fill-[#d4d4d8]"
                  : "text-[var(--muted)]"
              }
            />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold bg-[#e5e5e7] text-[#050505] rounded-[2px] hover:opacity-90 disabled:opacity-50"
          >
            <Play size={13} /> {isRunning ? "EXEC..." : "RUN"}
          </button>

          <button
            onClick={handleDebug}
            disabled={isDebugRun}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold bg-[#e5e5e7] text-[#050505] rounded-[2px] hover:opacity-90 disabled:opacity-50"
          >
            <Bug size={13} /> {isDebugRun ? "TRACE..." : "DEBUG"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel â€” Problem */}
        <div className="w-[45%] min-w-[320px] border-r border-[var(--border)] overflow-y-auto bg-[#080809]">
          <div className="p-5">
            {/* DESCRIPTION */}
            <div className="mb-5">
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text)] mb-2 flex items-center gap-2 before:content-['>'] before:text-[var(--amber)]">
                DESCRIPTION
              </div>
              <div className="text-[13px] text-[var(--text)] leading-[1.7] whitespace-pre-wrap">
                {detail.description || "[NO_DATA] description unavailable."}
              </div>
            </div>

            {/* EXAMPLES */}
            {detail.examples && detail.examples.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text)] mb-2 flex items-center gap-2 before:content-['>'] before:text-[var(--amber)]">
                  EXAMPLES
                </div>
                {detail.examples.map((ex, i) => (
                  <div key={i} className="border border-[var(--border)] rounded-[2px] p-3.5 mb-2.5 bg-[#0f0f12]">
                    <div className="text-[12px] font-bold text-[var(--text)] mb-1.5">example_{i + 1}</div>
                    <div className="text-[12px] font-mono">
                      <div className="text-[var(--text)]">Input: {ex.input}</div>
                      <div className="text-[var(--text)]">Output: {ex.output}</div>
                      {ex.explanation && (
                        <div className="text-[var(--muted)] mt-1">Explanation: {ex.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CONSTRAINTS */}
            {detail.constraints && detail.constraints.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text)] mb-2 flex items-center gap-2 before:content-['>'] before:text-[var(--amber)]">
                  CONSTRAINTS
                </div>
                <ul className="list-disc list-inside text-[13px] text-[var(--muted)] space-y-1">
                  {detail.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* HINTS */}
            {detail.hints && detail.hints.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text)] mb-2 flex items-center gap-2 before:content-['>'] before:text-[var(--amber)]">
                  HINTS
                </div>
                {detail.hints.map((h, i) => (
                  <div key={i} className="mb-2">
                    {showHINTS.includes(i) ? (
                      <div className="text-[13px] text-[var(--text)] p-3 bg-[#0f0f12] border border-[var(--border)] rounded-[2px]">
                        <Lightbulb size={14} className="text-[var(--amber)] inline mr-1.5" />
                        {h}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowHINTS([...showHINTS, i])}
                        className="text-[13px] text-[var(--text)] hover:text-[var(--text)] underline decoration-[rgba(255,255,255,0.24)]"
                      >
                        show_hint {i + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* APPROACHES */}
            {detail.approaches && detail.approaches.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text)] mb-2 flex items-center gap-2 before:content-['>'] before:text-[var(--amber)]">
                  APPROACHES
                </div>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {detail.approaches.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveApproach(i)}
                      className={cn(
                        "px-3 py-1.5 text-[12px] font-semibold rounded-[2px] border transition-colors",
                        activeApproach === i
                          ? "bg-[rgba(255,255,255,0.07)] text-[var(--text)] border-[rgba(255,255,255,0.25)]"
                          : "bg-[#0f0f12] text-[var(--muted)] border-[var(--border)] hover:text-[#ffffff]"
                      )}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
                {detail.approaches[activeApproach] && (
                  <div className="border border-[var(--border)] rounded-[2px] p-4 bg-[#0f0f12]">
                    <div className="text-[14px] font-bold text-[var(--text)] mb-2">
                      {detail.approaches[activeApproach].name}
                    </div>
                    <div className="text-[13px] text-[var(--text)] leading-relaxed mb-3">
                      {detail.approaches[activeApproach].intuition}
                    </div>
                    <div className="flex gap-4 text-[12px] font-mono mb-3">
                      <span className="text-[var(--amber)]">
                        Time: {detail.approaches[activeApproach].timeComplexity}
                      </span>
                      <span className="text-[var(--text)]">
                        Space: {detail.approaches[activeApproach].spaceComplexity}
                      </span>
                    </div>
                    {detail.approaches[activeApproach].code[language] && (
                      <pre className="text-[12px] font-mono text-[var(--muted)] bg-[#080809] p-3 rounded-[2px] overflow-x-auto">
                        {detail.approaches[activeApproach].code[language]}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Solution Markdown */}
            {detail.solutionMarkdown && (
              <div className="mb-5">
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text)] mb-2 flex items-center gap-2 before:content-['>'] before:text-[var(--amber)]">
                  EDITORIAL_SOLUTION
                </div>
                <div className="text-[13px] text-[var(--muted)] p-3 bg-[#0f0f12] border border-[var(--border)] rounded-[2px] whitespace-pre-wrap">
                  {detail.solutionMarkdown}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel â€” Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#080809] border-l border-[var(--border)]">
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            theme="vs-dark"
            value={currentCode}
            onChange={handleCodeChange}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
            }}
            options={{
              fontSize,
              minimap: { enabled: true },
              padding: { top: 12 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              glyphMargin: true,
            }}
          />
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="h-[320px] border-t border-[var(--border)] bg-[#080809] flex flex-col flex-shrink-0">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-2 h-[34px] bg-[#0f0f12] border-b border-[var(--border)] flex-shrink-0">
          {(["tests", "console", "debugger", "visualizer", "notes", "attempts"] as BottomTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setBottomPanel(tab)}
                className={cn(
                  "px-3 py-1 text-[11px] font-semibold rounded-[2px] transition-colors uppercase tracking-widest",
                  bottomPanel === tab
                    ? "bg-[rgba(255,255,255,0.07)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:text-[#ffffff]"
                )}
              >
                {tab}
              </button>
            )
          )}
          {isDebugging && (
            <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <span className="font-mono">Step {currentStep + 1}/{trace.length}</span>
              <button onClick={stopDebugging} className="px-2 py-1 rounded text-[#a1a1aa] hover:bg-red-500/10" title="Stop debug">KILL</button>
            </div>
          )}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto p-3 bg-[#080809]">
          {bottomPanel === "tests" && (
            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="stdin_buffer..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-[13px] font-mono bg-[#0f0f12] border border-[var(--border)] rounded-[2px] text-[var(--text)] outline-none focus:border-[var(--border-bright)]"
                />
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="px-3 py-2 text-[12px] font-bold bg-[#e5e5e7] text-[#050505] rounded-[2px] disabled:opacity-50"
                >
                  {isRunning ? "EXEC..." : "RUN"}
                </button>
              </div>
              <div className="text-[12px] text-[var(--muted)]">
                &gt; provide stdin buffer for execution. programs using input()/Scanner/cin read from here.
              </div>
            </div>
          )}

          {bottomPanel === "console" && (
            <div className="font-mono text-[12px]">
              {consoleOutput && (
                <div className="text-[var(--text)] whitespace-pre-wrap">{consoleOutput}</div>
              )}
              {consoleError && (
                <div className="text-[#a1a1aa] whitespace-pre-wrap mt-1">{consoleError}</div>
              )}
              {!consoleOutput && !consoleError && (
                <div className="text-[var(--muted)]">&gt; stdout/stderr empty. execute `run` to capture output.</div>
              )}
            </div>
          )}

          {bottomPanel === "debugger" && (
            <div className="text-[12px] h-full">
              {!isDebugging && !trace.length ? (
                <div className="space-y-3">
                  <div className="text-[13px] font-semibold text-[var(--text)]">TRACE_DEBUGGER // step_exec</div>
                  <div className="text-[var(--muted)] leading-relaxed">
                    &gt; press <span className="text-[var(--text)] font-semibold">DEBUG</span> to execute with line-level trace capture. inspect current line, locals, and delta per step.
                  </div>
                  <div className="p-3 rounded-[2px] border border-[var(--border)] bg-[#0f0f12] text-[var(--muted)] space-y-1">
                    <div>- engine: <span className="text-[var(--text)]">python tracer</span> (supported)</div>
                    <div>- ui: active source line highlighted in editor</div>
                    <div>- controls: play/step/prev/restart/speed</div>
                  </div>
                  {debugNotice && (
                    <div className="p-3 rounded-[2px] border border-[var(--border-bright)] bg-[rgba(255,255,255,0.04)] text-[#d4d4d8] whitespace-pre-wrap">{debugNotice}</div>
                  )}
                </div>
              ) : (
                (() => {
                  const ev = trace[currentStep];
                  const codeLines = (currentCode || "").split("\n");
                  const lineNo = ev.line || 0;
                  const start = Math.max(1, lineNo - 2);
                  const end = Math.min(codeLines.length, lineNo + 2);
                  const prevEv = currentStep > 0 ? trace[currentStep - 1] : null;
                  const currVars = ev.vars || {};
                  const prevVars = prevEv?.vars || {};
                  const changedKeys = Object.keys(currVars).filter((k) => JSON.stringify(currVars[k]) !== JSON.stringify(prevVars[k]));
                  const isErrorEvent = !!(ev && ((ev as any).error || ev.type === "exception" || (currVars as any).error));
                  return (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 p-2 rounded-[2px] border border-[var(--border)] bg-[#0f0f12]">
                        <button onClick={restart} className="p-1.5 rounded hover:bg-white/10 text-[var(--muted)] hover:text-[#ffffff]" title="restart trace"><RotateCcw size={14} /></button>
                        <button onClick={prevStep} disabled={currentStep <= 0} className="p-1.5 rounded hover:bg-white/10 text-[var(--muted)] hover:text-[#ffffff] disabled:opacity-30" title="step back"><SkipBack size={14} /></button>
                        <button onClick={() => setPlaying(!isPlaying)} disabled={!trace.length || currentStep >= trace.length - 1} className="px-2.5 py-1.5 rounded bg-[#e5e5e7] text-[var(--text)] text-[11px] font-bold flex items-center gap-1 disabled:opacity-40" title="play/pause">
                          {isPlaying ? <Pause size={12} /> : <Play size={12} />} {isPlaying ? "PAUSE" : "PLAY"}
                        </button>
                        <button onClick={nextStep} disabled={currentStep >= trace.length - 1} className="p-1.5 rounded hover:bg-white/10 text-[var(--muted)] hover:text-[#ffffff] disabled:opacity-30" title="step forward"><SkipForward size={14} /></button>
                        <button onClick={stopDebugging} className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.08)] text-[#a1a1aa]" title="kill trace"><Square size={14} /></button>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-[var(--muted)]">Speed</span>
                          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-[#080809] border border-[var(--border)] rounded px-2 py-1 text-[var(--text)] text-[11px]">
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                          </select>
                        </div>
                        <div className="ml-auto font-mono text-[var(--muted)]">Step {Math.min(currentStep + 1, trace.length)} / {trace.length}</div>
                      </div>

                      <div className="w-full h-1.5 bg-[#0f0f12] rounded overflow-hidden">
                        <div className="h-full bg-[#e5e5e7]" style={{ width: `${trace.length ? ((currentStep + 1) / trace.length) * 100 : 0}%` }} />
                      </div>

                      {debugNotice && !ev && (
                        <div className="p-3 rounded-[2px] border border-[var(--border-bright)] bg-[rgba(255,255,255,0.04)] text-[#d4d4d8] whitespace-pre-wrap">{debugNotice}</div>
                      )}

                      {ev && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <div className="p-3 rounded-[2px] border border-[var(--border)] bg-[#0f0f12]">
                              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text)] mb-1">EXEC_STATE</div>
                              <div className="text-[var(--text)] text-[13px] font-semibold">
                                {isErrorEvent ? "[EXCEPTION] trace interrupted" : lineNo > 0 ? `Running line ${lineNo} in ${ev.fn || "<module>"}` : `Step ${currentStep + 1}`}
                              </div>
                              <div className="text-[var(--muted)] mt-1">
                                {isErrorEvent ? "> inspect error payload, patch source, re-run trace."
                                  : ev.type === "return" ? "event=return -- unwinding to caller frame."
                                  : ev.type === "call" ? "event=call -- entering new frame."
                                  : "event=line -- statement executed; diff locals vs previous step."}
                              </div>
                              {changedKeys.length > 0 && (
                                <div className="mt-2 text-[11px] text-[var(--text)]">delta: {changedKeys.join(", ")}</div>
                              )}
                            </div>

                            <div className="p-3 rounded-[2px] border border-[var(--border)] bg-[#0f0f12]">
                              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text)] mb-2">SOURCE_CONTEXT</div>
                              {lineNo > 0 ? (
                                <div className="font-mono text-[12px] space-y-0.5">
                                  {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((ln) => (
                                    <div key={ln} className={cn("px-2 py-0.5 rounded flex gap-2", ln === lineNo ? "bg-[rgba(255,255,255,0.11)] text-[var(--text)]" : "text-[var(--muted)]")}>
                                      <span className="w-8 text-right text-[var(--dim)] select-none">{ln}</span>
                                      <span className="whitespace-pre">{codeLines[ln - 1] ?? ""}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[var(--muted)]">[no line metadata]</div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="p-3 rounded-[2px] border border-[var(--border)] bg-[#0f0f12]">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text)]">LOCALS_WATCH</div>
                                <div className="text-[11px] text-[var(--muted)]">stack_depth={ev.depth ?? 0}</div>
                              </div>
                              {isErrorEvent && (currVars as any).error ? (
                                <div className="text-[#d4d4d8] whitespace-pre-wrap font-mono">{String((currVars as any).error)}</div>
                              ) : Object.keys(currVars).length ? (
                                <div className="space-y-1.5 max-h-[220px] overflow-auto pr-1">
                                  {Object.entries(currVars).map(([k, v]) => (
                                    <div key={k} className={cn("rounded px-2 py-1.5 border", changedKeys.includes(k) ? "border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.04)]" : "border-[var(--border)] bg-[#080809]")}>
                                      <div className="flex items-start gap-2">
                                        <span className="text-[var(--text)] font-mono font-semibold">{k}</span>
                                        <span className="text-[#e2e8f0] font-mono break-all">{formatSlimValue(v)}</span>
                                      </div>
                                      {slimArrayItems(v) && (
                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                          {(slimArrayItems(v) || []).slice(0, 24).map((item, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--border)] bg-[#0f0f12] text-[10px] font-mono">
                                              <span className="text-[var(--dim)]">{i}:</span>
                                              <span className="text-[var(--text)]">{formatSlimValue(item)}</span>
                                            </span>
                                          ))}
                                          {(slimArrayItems(v) || []).length > 24 && <span className="text-[10px] text-[var(--muted)]"></span>}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[var(--muted)]">[empty] no locals captured</div>
                              )}
                            </div>

                            <div className="p-3 rounded-[2px] border border-[var(--border)] bg-[#0f0f12]">
                              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text)] mb-1">READ_ME</div>
                              <div className="text-[var(--muted)] space-y-1">
                                <div>- line: last executed source line</div>
                                <div>- vars: post-step values (delta highlighted)</div>
                                <div>- arrays: rendered as index:value cells</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {bottomPanel === "visualizer" && (
            <div className="text-[13px] h-full">
              {isDebugging && trace[currentStep] ? (
                <div className="space-y-3">
                  <VisualizerPanel
                    trace={trace}
                    currentStep={currentStep}
                    variables={trace[currentStep].vars || {}}
                  />
                  <div className="p-3 rounded-[2px] border border-[var(--border)] bg-[#0f0f12]">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text)] mb-2">LOCALS_DUMP</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(trace[currentStep].vars || {}).map(([k, v]) => (
                        <div key={k} className="rounded border border-[var(--border)] bg-[#080809] p-2">
                          <div className="text-[var(--text)] font-mono text-[12px] font-semibold mb-1">{k}</div>
                          <div className="text-[var(--text)] font-mono text-[12px] break-all">{formatSlimValue(v)}</div>
                        </div>
                      ))}
                      {Object.keys(trace[currentStep].vars || {}).length === 0 && (
                        <div className="text-[var(--muted)]">[empty]</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-[var(--muted)]">
                  <div className="text-[var(--text)] font-semibold">ALGO_VISUALIZER</div>
                  <div>&gt; run <span className="text-[var(--text)]">DEBUG</span> (python) to stream trace into structure visualizers.</div>
                  {debugNotice && <div className="p-3 rounded-[2px] border border-[var(--border-bright)] bg-[rgba(255,255,255,0.04)] text-[#d4d4d8] whitespace-pre-wrap">{debugNotice}</div>}
                </div>
              )}
            </div>
          )}

          {bottomPanel === "notes" && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="# notes.md -- scratchpad / approach / pitfalls..."
              className="w-full h-full bg-transparent text-[13px] text-[var(--text)] outline-none resize-none placeholder:text-[var(--dim)]"
            />
          )}

          {bottomPanel === "attempts" && (
            <div className="text-[var(--muted)] text-[13px]">
              {mounted && getUserState(slug).attempts.length === 0 ? (
                <div>[EMPTY] no attempt records. run code to append history.</div>
              ) : (
                mounted &&
                getUserState(slug).attempts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 py-1.5 border-b border-[var(--border)]"
                  >
                    <span
                      className={cn(
                        "text-[11px] font-bold",
                        a.result === "passed" ? "text-[var(--text)]" : "text-[#a1a1aa]"
                      )}
                    >
                      {a.result}
                    </span>
                    <span className="text-[11px] text-[var(--muted)]">{a.language}</span>
                    <span className="text-[11px] text-[var(--muted)] font-mono">
                      {new Date(a.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
