// --- Problem Data (from static JSON) ---
export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: { name: string }[];
  companies: { name: string }[];
  paidOnly: boolean;
  askedBy: number;
  frequency: number;
}

// Raw detail from details.json (different shape than ProblemDetail)
export interface RawProblemDetail {
  description: string;
  examples: { example_num: number; example_text: string; images: string[] }[];
  constraints: string[];
  hints: string[];
  snippets: Record<string, string>;
  solutionsMarkdown: string;
}

// Normalized detail for the UI
export interface ProblemDetail {
  slug: string;
  description: string;
  examples: Example[];
  constraints: string[];
  hints: string[];
  starterCode: { java?: string; python?: string };
  approaches: Approach[];
  solutionMarkdown?: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Approach {
  name: string;
  intuition: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: { java?: string; python?: string };
  pros: string[];
  cons: string[];
}

// Raw solution from solutions.json
export interface RawSolution {
  slug: string;
  title: string;
  approaches: {
    name: string;
    idea: string;
    time: string;
    space: string;
    python?: string;
    java?: string;
    pros?: string[];
    cons?: string[];
  }[];
}

// --- Visualization ---
export type VisualizationType =
  | "array"
  | "two-pointer"
  | "sliding-window"
  | "binary-search"
  | "sorting"
  | "stack"
  | "queue"
  | "linked-list"
  | "tree"
  | "bst"
  | "graph"
  | "heap"
  | "recursion"
  | "dp-1d"
  | "dp-2d"
  | "backtracking"
  | "union-find"
  | "trie"
  | "interval"
  | "generic";

// --- User Data ---
export type ProblemStatus = "unseen" | "attempted" | "solved" | "reviewed" | "mastered";

export interface Attempt {
  id: string;
  language: "java" | "python";
  code: string;
  result: "passed" | "wrong_answer" | "compile_error" | "runtime_error" | "timeout";
  timestamp: number;
  runtime?: number;
}

export interface RevisionState {
  nextReview: number;
  interval: number;
  confidence: 1 | 2 | 3 | 4 | 5;
  reviewCount: number;
  lastReview?: number;
}

export interface ProblemUserState {
  slug: string;
  code: { java: string; python: string };
  language: "java" | "python";
  notes: string;
  status: ProblemStatus;
  favorite: boolean;
  attempts: Attempt[];
  revision: RevisionState;
}

// --- Execution ---
export interface ExecuteRequest {
  language: "java" | "python";
  code: string;
  input?: string;
}

export interface ExecuteResponse {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface TraceEvent {
  step: number;
  type: "line" | "call" | "return" | "exception";
  line: number;
  fn: string;
  depth: number;
  vars: Record<string, unknown>;
}

export interface DebugResponse {
  ok: boolean;
  events: TraceEvent[];
  stdout: string;
  stderr: string;
}

// --- Company ---
export interface Company {
  name: string;
  problemCount?: number;
}

// --- Stats ---
export interface Stats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  premium: number;
  withCompany: number;
  editorialSolutions: number;
  curatedSolutions: number;
  companies: number;
}
