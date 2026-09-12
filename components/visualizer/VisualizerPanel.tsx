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

function detectVisualizationType(variables: Record<string, unknown>): string {
  const keys = Object.keys(variables).map((k) => k.toLowerCase());

  // Check for tree-related variables
  if (keys.some((k) => k.includes("root") || k.includes("node"))) {
    return "tree";
  }

  // Check for linked list
  if (keys.some((k) => k.includes("head") || k.includes("list"))) {
    return "linked-list";
  }

  // Check for binary search pointers
  if (keys.includes("left") && keys.includes("right") && keys.includes("mid")) {
    return "binary-search";
  }

  // Check for two pointers
  if (keys.includes("left") && keys.includes("right")) {
    return "two-pointer";
  }

  // Check for sliding window
  if (keys.includes("start") || keys.includes("window")) {
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

  // Check for DP table (2D array)
  for (const [, v] of Object.entries(variables)) {
    if (Array.isArray(v) && v.length > 0 && Array.isArray(v[0])) {
      return "dp";
    }
  }

  // Default to array if any array variable exists
  for (const [, v] of Object.entries(variables)) {
    if (Array.isArray(v) && v.length > 0) {
      return "array";
    }
    if (v && typeof v === "object" && "_arr" in v) {
      return "array";
    }
  }

  return "generic";
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
      default:
        return <ArrayVisualizer trace={trace} currentStep={currentStep} variables={currentVars} />;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[11px] font-bold text-[var(--violet)] uppercase tracking-wider">
          {type.replace("-", " ")} Visualization
        </div>
        <div className="text-[10px] text-[var(--muted)] font-mono">
          Auto-detected from variables
        </div>
      </div>
      {renderVisualizer()}
    </div>
  );
}
