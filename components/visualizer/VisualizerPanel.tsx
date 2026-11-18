"use client";

import type { TraceEvent } from "@/lib/types";
import { ArrayVisualizer } from "./ArrayVisualizer";
import { TreeVisualizer } from "./TreeVisualizer";
import { LinkedListVisualizer } from "./LinkedListVisualizer";
import { SortingVisualizer } from "./SortingVisualizer";
import { StackVisualizer } from "./StackVisualizer";
import { QueueVisualizer } from "./QueueVisualizer";
import { DPVisualizer } from "./DPVisualizer";
import { GraphVisualizer } from "./GraphVisualizer";
import { TwoPointerVisualizer } from "./TwoPointerVisualizer";
import { SlidingWindowVisualizer } from "./SlidingWindowVisualizer";
import { BinarySearchVisualizer } from "./BinarySearchVisualizer";

interface VisualizerPanelProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
  visualizationType?: string;
}

function isArrayLike(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  return !!(v && typeof v === "object" && "_arr" in (v as Record<string, unknown>));
}

function isArrayOfArraysLike(v: unknown): boolean {
  if (Array.isArray(v) && v.length > 0) return v.every((x) => Array.isArray(x) || (x && typeof x === "object" && "_arr" in (x as any)));
  if (v && typeof v === "object" && "_arr" in (v as any)) {
    const arr = (v as any)._arr || [];
    return Array.isArray(arr) && arr.length > 0 && arr.every((x: any) => Array.isArray(x) || (x && typeof x === "object" && "_arr" in x));
  }
  return false;
}

function detectVisualizationType(variables: Record<string, unknown>): string {
  const keys = Object.keys(variables).map((k) => k.toLowerCase());

  // Check for tree-related variables
  if (keys.some((k) => k.includes("root") || k.includes("node"))) {
    return "tree";
  }

  // Check for linked list
  if (keys.some((k) => k.includes("head") || k.includes("listnode"))) {
    return "linked-list";
  }

  // Check for binary search pointers
  if (keys.includes("mid") && (keys.includes("left") || keys.includes("low")) && (keys.includes("right") || keys.includes("high"))) {
    return "binary-search";
  }

  // Check for two pointers
  if ((keys.includes("left") && keys.includes("right")) || (keys.includes("i") && keys.includes("j")) || (keys.includes("l") && keys.includes("r"))) {
    return "two-pointer";
  }

  // Check for sliding window
  if (keys.includes("start") || keys.includes("window") || keys.includes("windowstart")) {
    return "sliding-window";
  }

  // Check for stack
  if (keys.some((k) => k.includes("stack"))) {
    return "stack";
  }

  // Check for queue
  if (keys.some((k) => k.includes("queue"))) {
    return "queue";
  }

  // Check for graph (adjacency list)
  for (const [, v] of Object.entries(variables)) {
    if (v && typeof v === "object" && "_map" in v) {
      return "graph";
    }
  }

  // Check for DP table (2D array / matrix-like)
  for (const [, v] of Object.entries(variables)) {
    if (isArrayOfArraysLike(v)) {
      return "dp";
    }
  }

  // Default to array if any array variable exists
  for (const [, v] of Object.entries(variables)) {
    if (isArrayLike(v)) {
      return "array";
    }
  }

  return "generic";
}

function explainViz(type: string, vars: Record<string, unknown>): string {
  const keys = Object.keys(vars);
  if (type === "binary-search") return "Binary search checks the middle element, then discards half the range. Watch left, mid, right move.";
  if (type === "two-pointer") return "Two pointers move from different positions to scan or compare elements efficiently. Watch pointer indices change.";
  if (type === "array") return "Array view shows values by index. Highlighted indices are pointer variables (like i, j, left, right).";
  if (type === "dp") return "DP table shows stored subproblem results. Each cell/value is built from previous steps.";
  if (type === "tree") return "Tree view shows node relationships. Use steps to follow which node is being visited/processed.";
  if (type === "stack" || type === "queue") return "This view shows items being added/removed over time. Step forward to see push/pop or enqueue/dequeue effects.";
  if (type === "graph") return "Graph view shows connections between nodes. Step through to follow traversal updates.";
  if (type === "linked-list") return "Linked list view shows node values in order and pointer movement between nodes.";
  return keys.length ? "Showing a beginner-friendly snapshot of current variables. Step through to see how values change." : "No variables detected yet at this step.";
}

export function VisualizerPanel({ trace, currentStep, variables, visualizationType }: VisualizerPanelProps) {
  const type = visualizationType || detectVisualizationType(variables);
  const currentVars = trace[currentStep]?.vars || variables;

  const renderVisualizer = () => {
    switch (type) {
      case "binary-search":
        return <BinarySearchVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "two-pointer":
        return <TwoPointerVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "sliding-window":
        return <SlidingWindowVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "sorting":
        return <SortingVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "stack":
        return <StackVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "queue":
        return <QueueVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "tree":
      case "bst":
        return <TreeVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "linked-list":
        return <LinkedListVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "graph":
        return <GraphVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "dp":
        return <DPVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      case "array":
        return <ArrayVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
      default:
        return (
          <div className="p-4 rounded-lg border border-[var(--border)] bg-[#111827] text-[13px] text-[var(--muted)] space-y-2">
            <div className="text-white font-semibold">Beginner mode</div>
            <div>No specialized diagram for this step yet, but you can still learn from the variable values below as they change line by line.</div>
            {Object.keys(currentVars).length === 0 && <div>No variables captured at this step.</div>}
          </div>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
          {type.replace("-", " ")} Visualization
        </div>
        <div className="text-[10px] text-[var(--muted)] font-mono">
          Auto-detected from variables
        </div>
      </div>
      <div className="mb-3 p-2.5 rounded-lg border border-[var(--border)] bg-[#111827] text-[12px] text-[var(--muted)]">
        {explainViz(type, currentVars)}
      </div>
      {renderVisualizer()}
    </div>
  );
}
