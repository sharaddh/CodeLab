"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface StackVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function extractStack(vars: Record<string, unknown>): number[] | null {
  for (const [name, v] of Object.entries(vars)) {
    if (name.toLowerCase().includes("stack") && Array.isArray(v)) {
      return v as number[];
    }
    if (v && typeof v === "object" && "_arr" in v) {
      const arr = (v as { _arr: (number | unknown)[] })._arr;
      const nums = arr.filter((x): x is number => typeof x === "number");
      if (nums.length > 0) return nums;
    }
  }
  // Fallback: check for arrays that look like stacks
  for (const [, v] of Object.entries(vars)) {
    if (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "number")) {
      return v as number[];
    }
  }
  return null;
}

export function StackVisualizer({ trace, currentStep, variables }: StackVisualizerProps) {
  const stack = extractStack(variables);

  if (!stack) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No stack detected. The visualizer will show stacks during debugging.
      </div>
    );
  }

  const cellWidth = 80;
  const cellHeight = 36;

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex flex-col-reverse items-center" style={{ minWidth: cellWidth + 40 }}>
        {/* Stack base */}
        <div
          className="rounded-b-lg border-2 border-t-0 border-[#273247]"
          style={{ width: cellWidth + 20, height: 8, backgroundColor: "#1e293b" }}
        />

        {/* Stack elements */}
        {stack.map((val, idx) => {
          const isTop = idx === stack.length - 1;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="flex items-center justify-center border-2 font-mono text-[13px] font-bold"
              style={{
                width: cellWidth,
                height: cellHeight,
                backgroundColor: isTop ? "#8b5cf620" : "#111827",
                borderColor: isTop ? "#8b5cf6" : "#273247",
                color: isTop ? "#a78bfa" : "#e2e8f0",
              }}
            >
              {val}
            </motion.div>
          );
        })}

        {/* Top label */}
        {stack.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-[var(--amber)] font-bold mt-1"
          >
            ← TOP
          </motion.div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-[var(--muted)] font-mono text-center">
        Size: {stack.length}
      </div>
    </div>
  );
}
