"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface SlidingWindowVisualizerProps {
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

function extractWindow(vars: Record<string, unknown>): { start?: number; end?: number; windowSize?: number } {
  const window: { start?: number; end?: number; windowSize?: number } = {};
  for (const [name, val] of Object.entries(vars)) {
    const n = name.toLowerCase();
    if ((n === "start" || n === "left" || n === "l") && typeof val === "number") window.start = val;
    if ((n === "end" || n === "right" || n === "r") && typeof val === "number") window.end = val;
    if ((n === "window" || n === "k" || n === "size") && typeof val === "number") window.windowSize = val;
  }
  return window;
}

export function SlidingWindowVisualizer({ trace, currentStep, variables }: SlidingWindowVisualizerProps) {
  const arr = extractArray(variables);
  const window = extractWindow(variables);

  if (!arr) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No array detected. The visualizer will show sliding window algorithms during debugging.
      </div>
    );
  }

  const cellWidth = Math.min(60, Math.max(30, 600 / arr.length));
  const windowStart = window.start ?? 0;
  const windowEnd = window.end ?? Math.min((window.windowSize ?? 3) - 1, arr.length - 1);

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-end gap-1 mb-6">
        {arr.map((val, idx) => {
          const inWindow = idx >= windowStart && idx <= windowEnd;

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Window bracket */}
              <div className="h-6 flex items-center">
                {idx === windowStart && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-[var(--muted)]"
                  >
                    ┌
                  </motion.div>
                )}
                {inWindow && idx > windowStart && idx < windowEnd && (
                  <div className="text-[10px] text-[var(--muted)]/50">─</div>
                )}
                {idx === windowEnd && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-[var(--muted)]"
                  >
                    ┐
                  </motion.div>
                )}
              </div>
              {/* Cell */}
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: inWindow ? 1.1 : 1,
                  borderColor: inWindow ? "#71717a" : "#273247",
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded-lg border-2 font-mono text-[13px] font-bold"
                style={{
                  width: cellWidth,
                  height: cellWidth,
                  backgroundColor: inWindow ? "#71717a15" : "#111827",
                  color: inWindow ? "#a78bfa" : "#e2e8f0",
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

      {/* Window info */}
      <div className="flex gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[var(--muted)]">window = [{windowStart}..{windowEnd}]</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[var(--muted)]">size = {windowEnd - windowStart + 1}</span>
        </div>
        {windowStart !== undefined && windowEnd !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[var(--amber)]">
              sum = {arr.slice(windowStart, windowEnd + 1).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
