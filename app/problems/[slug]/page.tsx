"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Star, Play, Bug, CheckCircle2, Lightbulb } from "lucide-react";
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
    const inputMatch = text.match(/Input:\s*([\s\S]*?)(?=Output:|$)/);
    const outputMatch = text.match(/Output:\s*([\s\S]*?)(?=Explanation:|$)/);
    const explanationMatch = text.match(/Explanation:\s*([\s\S]*?)$/);
    return {
      input: inputMatch?.[1]?.trim() || text,
      output: outputMatch?.[1]?.trim() || "",
      explanation: explanationMatch?.[1]?.trim() || undefined,
    };
  });

  const approaches = (solution?.approaches || []).map((a) => ({
    name: a.name,
    intuition: a.idea,
    explanation: a.idea,
    timeComplexity: a.time,
    spaceComplexity: a.space,
    code: { java: a.java, python: a.python },
    pros: a.pros || [],
    cons: a.cons || [],
  }));

  // Try to extract starter code from snippets
  const snippets = raw?.snippets || {};
  let starterCode: { java?: string; python?: string } = {};
  if (snippets.python3) starterCode.python = snippets.python3;
  else if (snippets.python) starterCode.python = snippets.python;
  if (snippets.java) starterCode.java = snippets.java;

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
  const { isDebugging, trace, currentStep, setTrace, nextStep, prevStep, stopDebugging, restart } = useDebuggerStore();
  const { bottomPanel, setBottomPanel } = useUIStore();

  const [mounted, setMounted] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [consoleError, setConsoleError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isDebugRun, setIsDebugRun] = useState(false);
  const [showHints, setShowHints] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [activeApproach, setActiveApproach] = useState(0);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  // Load saved code
  useEffect(() => {
    if (!mounted || !slug) return;
    const state = getUserState(slug);
    if (state.code.java) { setCode("java", state.code.java); }
    if (state.code.python) { setCode("python", state.code.python); }
    if (state.language) { setLanguage(state.language); }
    if (state.notes) { setNotes(state.notes); }
    if (!state.code.java && detail?.starterCode?.java) {
      setCode("java", detail.starterCode.java);
    }
    if (!state.code.python && detail?.starterCode?.python) {
      setCode("python", detail.starterCode.python);
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

  const handleRun = useCallback(async () => {
    if (!currentCode || isRunning) return;
    setIsRunning(true);
    setConsoleOutput("");
    setConsoleError("");
    setBottomPanel("console");
    try {
      const res = await fetch("http://localhost:3001/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: currentCode, input: testInput }),
      });
      const data = await res.json();
      setConsoleOutput(data.stdout || "");
      setConsoleError(data.stderr || "");
    } catch {
      setConsoleError("Could not connect to companion server. Make sure it's running on port 3001.\n\nStart it with: npm run companion");
    } finally {
      setIsRunning(false);
    }
  }, [currentCode, language, testInput, isRunning, setBottomPanel]);

  const handleDebug = useCallback(async () => {
    if (!currentCode || isDebugRun) return;
    setIsDebugRun(true);
    setBottomPanel("debugger");
    try {
      const res = await fetch("http://localhost:3001/api/debug/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: currentCode, input: testInput }),
      });
      const data = await res.json();
      if (data.ok && data.events?.length) {
        setTrace(data.events as TraceEvent[]);
      } else {
        setConsoleError(data.stderr || "Debug failed");
      }
    } catch {
      setConsoleError("Could not connect to companion server.");
    } finally {
      setIsDebugRun(false);
    }
  }, [currentCode, language, testInput, isDebugRun, setTrace, setBottomPanel]);

  const handleSaveNotes = useCallback(() => {
    if (slug) updateUserState(slug, { notes });
  }, [slug, notes, updateUserState]);

  if (!problem) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="text-[var(--muted)]">
          Problem not found.{" "}
          <button onClick={() => router.push("/problems")} className="text-[var(--violet)] underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const currentEvent = isDebugging && trace[currentStep] ? trace[currentStep] : null;

  return (
    <div className="h-[calc(100vh-52px)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 h-[44px] bg-[#0d1117] border-b border-[var(--border)] flex-shrink-0">
        <button onClick={() => router.push("/problems")} className="text-[var(--muted)] hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <span className="font-bold text-[14px]">#{problem.id}</span>
        <span className="text-[14px] font-semibold text-white">{problem.title}</span>
        <span
          className={cn(
            "text-[11px] font-bold px-2.5 py-1 rounded-full border",
            difficultyBg(problem.difficulty),
            problem.difficulty === "Easy"
              ? "text-emerald-400"
              : problem.difficulty === "Medium"
              ? "text-amber-400"
              : "text-red-400"
          )}
        >
          {problem.difficulty}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex border border-[var(--border)] rounded-lg overflow-hidden">
            {(["java", "python"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-semibold transition-colors capitalize",
                  language === lang
                    ? "bg-[var(--violet)] text-white"
                    : "bg-[#111827] text-[var(--muted)] hover:text-white"
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          <a
            href={`https://leetcode.com/problems/${slug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-[var(--muted)] hover:text-white"
          >
            <ExternalLink size={13} /> LeetCode
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
                  ? "text-[var(--amber)] fill-[var(--amber)]"
                  : "text-[var(--muted)]"
              }
            />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold bg-[var(--green)] text-[#070a11] rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Play size={13} /> {isRunning ? "Running..." : "Run"}
          </button>

          <button
            onClick={handleDebug}
            disabled={isDebugRun}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold bg-[var(--amber)] text-[#070a11] rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Bug size={13} /> {isDebugRun ? "Starting..." : "Debug"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel — Problem */}
        <div className="w-[45%] min-w-[320px] border-r border-[var(--border)] overflow-y-auto bg-[#0a0f1a]">
          <div className="p-5">
            {/* Description */}
            <div className="mb-5">
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[var(--violet)] mb-2">
                Description
              </div>
              <div className="text-[13.5px] text-[#cbd5e1] leading-[1.75] whitespace-pre-wrap">
                {detail?.description || "No description available."}
              </div>
            </div>

            {/* Examples */}
            {detail?.examples && detail.examples.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[var(--violet)] mb-2">
                  Examples
                </div>
                {detail.examples.map((ex, i) => (
                  <div key={i} className="border border-[var(--border)] rounded-lg p-3.5 mb-2.5 bg-[#111827]">
                    <div className="text-[12px] font-bold text-white mb-1.5">Example {i + 1}</div>
                    <div className="text-[12px] font-mono">
                      <div className="text-[var(--cyan)]">Input: {ex.input}</div>
                      <div className="text-[var(--green)]">Output: {ex.output}</div>
                      {ex.explanation && (
                        <div className="text-[var(--muted)] mt-1">Explanation: {ex.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {detail?.constraints && detail.constraints.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[var(--violet)] mb-2">
                  Constraints
                </div>
                <ul className="list-disc list-inside text-[13px] text-[#94a3b8] space-y-1">
                  {detail.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints */}
            {detail?.hints && detail.hints.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[var(--violet)] mb-2">
                  Hints
                </div>
                {detail.hints.map((h, i) => (
                  <div key={i} className="mb-2">
                    {showHints.includes(i) ? (
                      <div className="text-[13px] text-[#cbd5e1] p-3 bg-[#111827] border border-[var(--border)] rounded-lg">
                        <Lightbulb size={14} className="text-[var(--amber)] inline mr-1.5" />
                        {h}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowHints([...showHints, i])}
                        className="text-[13px] text-[var(--violet)] hover:underline"
                      >
                        Show Hint {i + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Approaches */}
            {detail?.approaches && detail.approaches.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[var(--violet)] mb-2">
                  Approaches
                </div>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {detail.approaches.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveApproach(i)}
                      className={cn(
                        "px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-colors",
                        activeApproach === i
                          ? "bg-[var(--violet)]/15 text-[var(--violet)] border-[var(--violet)]/40"
                          : "bg-[#111827] text-[var(--muted)] border-[var(--border)] hover:text-white"
                      )}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
                {detail.approaches[activeApproach] && (
                  <div className="border border-[var(--border)] rounded-lg p-4 bg-[#111827]">
                    <div className="text-[14px] font-bold text-white mb-2">
                      {detail.approaches[activeApproach].name}
                    </div>
                    <div className="text-[13px] text-[#cbd5e1] leading-relaxed mb-3">
                      {detail.approaches[activeApproach].intuition}
                    </div>
                    <div className="flex gap-4 text-[12px] font-mono mb-3">
                      <span className="text-[var(--amber)]">
                        Time: {detail.approaches[activeApproach].timeComplexity}
                      </span>
                      <span className="text-[var(--cyan)]">
                        Space: {detail.approaches[activeApproach].spaceComplexity}
                      </span>
                    </div>
                    {detail.approaches[activeApproach].code?.[language] && (
                      <pre className="text-[12px] font-mono text-[#94a3b8] bg-[#0a0f1a] p-3 rounded-lg overflow-x-auto">
                        {detail.approaches[activeApproach].code[language]}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Solution Markdown */}
            {detail?.solutionMarkdown && (
              <div className="mb-5">
                <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[var(--violet)] mb-2">
                  Editorial Solution
                </div>
                <div className="text-[13px] text-[#94a3b8] p-3 bg-[#111827] border border-[var(--border)] rounded-lg whitespace-pre-wrap">
                  {detail.solutionMarkdown}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <Editor
            height="100%"
            language={language === "java" ? "java" : "python"}
            theme="vs-dark"
            value={currentCode}
            onChange={handleCodeChange}
            options={{
              fontSize,
              minimap: { enabled: true },
              padding: { top: 12 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
            }}
          />
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="h-[250px] border-t border-[var(--border)] bg-[#0a0f1a] flex flex-col flex-shrink-0">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 h-[36px] bg-[#0d1117] border-b border-[var(--border)] flex-shrink-0">
          {(["tests", "console", "debugger", "visualizer", "notes", "attempts"] as BottomTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setBottomPanel(tab)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors capitalize",
                  bottomPanel === tab
                    ? "bg-[var(--violet)]/15 text-[var(--violet)]"
                    : "text-[var(--muted)] hover:text-white"
                )}
              >
                {tab}
              </button>
            )
          )}
          {isDebugging && (
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={restart} className="px-2 py-1 text-[11px] text-[var(--muted)] hover:text-white" title="Restart">
                ↻
              </button>
              <button onClick={prevStep} className="px-2 py-1 text-[11px] text-[var(--muted)] hover:text-white" title="Previous">
                ◀
              </button>
              <span className="text-[11px] font-mono text-[var(--muted)]">
                {currentStep + 1}/{trace.length}
              </span>
              <button onClick={nextStep} className="px-2 py-1 text-[11px] text-[var(--muted)] hover:text-white" title="Next">
                ▶
              </button>
              <button onClick={stopDebugging} className="px-2 py-1 text-[11px] text-red-400 hover:text-red-300" title="Stop">
                ⏹
              </button>
            </div>
          )}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto p-3">
          {bottomPanel === "tests" && (
            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Test input (stdin)..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-[13px] font-mono bg-[#111827] border border-[var(--border)] rounded-lg text-white outline-none focus:border-[var(--violet)]/50"
                />
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="px-3 py-2 text-[12px] font-bold bg-[var(--green)] text-[#070a11] rounded-lg disabled:opacity-50"
                >
                  {isRunning ? "Running..." : "Run Test"}
                </button>
              </div>
              <div className="text-[12px] text-[var(--muted)]">
                Enter input for stdin and click Run Test. For arrays, enter each element on a new line.
              </div>
            </div>
          )}

          {bottomPanel === "console" && (
            <div className="font-mono text-[12px]">
              {consoleOutput && (
                <div className="text-[var(--green)] whitespace-pre-wrap">{consoleOutput}</div>
              )}
              {consoleError && (
                <div className="text-red-400 whitespace-pre-wrap">{consoleError}</div>
              )}
              {!consoleOutput && !consoleError && (
                <div className="text-[var(--muted)]">Run your code to see output here.</div>
              )}
            </div>
          )}

          {bottomPanel === "debugger" && (
            <div className="font-mono text-[12px]">
              {currentEvent ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-[var(--violet)] uppercase tracking-wider mb-1">
                      Current Line
                    </div>
                    <div className="text-white">
                      Line {currentEvent.line} in {currentEvent.fn}
                    </div>
                    <div className="text-[11px] font-bold text-[var(--violet)] uppercase tracking-wider mt-3 mb-1">
                      Variables
                    </div>
                    <div className="space-y-1">
                      {Object.entries(currentEvent.vars || {}).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-[var(--amber)]">{k}:</span>
                          <span className="text-white">{JSON.stringify(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[var(--violet)] uppercase tracking-wider mb-1">
                      Call Stack
                    </div>
                    <div className="text-white">depth: {currentEvent.depth}</div>
                  </div>
                </div>
              ) : (
                <div className="text-[var(--muted)]">
                  {isDebugging
                    ? "Trace loaded. Use controls to step through."
                    : "Click Debug to start tracing your code."}
                </div>
              )}
            </div>
          )}

          {bottomPanel === "visualizer" && (
            <div className="text-[var(--muted)] text-[13px]">
              {currentEvent ? (
                <VisualizerPanel
                  trace={trace}
                  currentStep={currentStep}
                  variables={currentEvent.vars}
                />
              ) : (
                <div>Start debugging to see algorithm visualizations.</div>
              )}
            </div>
          )}

          {bottomPanel === "notes" && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Write your notes about this problem..."
              className="w-full h-full bg-transparent text-[13px] text-[#cbd5e1] outline-none resize-none placeholder:text-[#475569]"
            />
          )}

          {bottomPanel === "attempts" && (
            <div className="text-[var(--muted)] text-[13px]">
              {mounted && getUserState(slug).attempts.length === 0 ? (
                <div>No attempts yet. Run your code to track attempts.</div>
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
                        a.result === "passed" ? "text-[var(--green)]" : "text-red-400"
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
