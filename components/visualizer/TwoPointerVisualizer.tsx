"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface TwoPointerVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function extractArray(vars: Record<string, unknown>): number[] | null {
  for (const [, v] of Object.entries(vars)) {
    if (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "number")) {
      return v as number[];
    }
    if (v && typeof v === "object" && "_arr" in v) {
      const arr = (v as { _arr: (number | unknown)[] })._arr;
      const nums = arr.filter((x): x is number => typeof x === "number");
      if (nums.length > 0) return nums;
    }
  }
  return null;
}

function extractPointers(vars: Record<string, unknown>): { left?: number; right?: number } {
  const pointers: { left?: number; right?: number } = {};
  for (const [name, val] of Object.entries(vars)) {
    if (name.toLowerCase() === "left" || name.toLowerCase() === "l" || name.toLowerCase() === "start") {
      if (typeof val === "number") pointers.left = val;
    }
    if (name.toLowerCase() === "right" || name.toLowerCase() === "r" || name.toLowerCase() === "end") {
      if (typeof val === "number") pointers.right = val;
    }
  }
  return pointers;
}

export function TwoPointerVisualizer({ trace, currentStep, variables }: TwoPointerVisualizerProps) {
  const arr = extractArray(variables);
  const pointers = extractPointers(variables);

  if (!arr) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No array detected. The visualizer will show two-pointer algorithms during debugging.
      </div>
    );
  }

  const cellWidth = Math.min(60, Math.max(30, 600 / arr.length));

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-end gap-1 mb-6">
        {arr.map((val, idx) => {
          const isLeft = pointers.left === idx;
          const isRight = pointers.right === idx;
          const isBetween = pointers.left !== undefined && pointers.right !== undefined &&
            idx > pointers.left && idx < pointers.right;

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Pointer labels */}
              <div className="h-6 flex items-center">
                {isLeft && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-[var(--cyan)] px-1.5 py-0.5 rounded bg-[var(--cyan)]/10"
                  >
                    L
                  </motion.div>
                )}
                {isRight && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-[var(--amber)] px-1.5 py-0.5 rounded bg-[var(--amber)]/10"
                  >
                    R
                  </motion.div>
                )}
              </div>
              {/* Cell */}
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: isLeft || isRight ? 1.1 : 1,
                  borderColor: isLeft ? "#22d3ee" : isRight ? "#f59e0b" : isBetween ? "#8b5cf680" : "#273247",
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded-lg border-2 font-mono text-[13px] font-bold"
                style={{
                  width: cellWidth,
                  height: cellWidth,
                  backgroundColor: isLeft ? "#22d3ee15" : isRight ? "#f59e0b15" : isBetween ? "#8b5cf610" : "#111827",
                  color: isLeft ? "#22d3ee" : isRight ? "#f59e0b" : isBetween ? "#a78bfa" : "#e2e8f0",
                }}
              >
                {val}
              </motion.div>
              {/* Index */}
              <div className="text-[9px] text-[#475569] mt-1 font-mono">{idx}</div>
            </div>
          );
        })}
      </div>

      {/* Pointer legend */}
      <div className="flex gap-4 text-[11px]">
        {pointers.left !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--cyan)]" />
            <span className="font-mono text-[var(--cyan)]">left = {pointers.left}</span>
          </div>
        )}
        {pointers.right !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--amber)]" />
            <span className="font-mono text-[var(--amber)]">right = {pointers.right}</span>
          </div>
        )}
      </div>
    </div>
  );
}
