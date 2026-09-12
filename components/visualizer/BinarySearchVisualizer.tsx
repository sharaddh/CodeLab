"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface BinarySearchVisualizerProps {
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

function extractPointers(vars: Record<string, unknown>): { left?: number; right?: number; mid?: number; target?: number } {
  const pointers: { left?: number; right?: number; mid?: number; target?: number } = {};
  for (const [name, val] of Object.entries(vars)) {
    const n = name.toLowerCase();
    if ((n === "left" || n === "l" || n === "low") && typeof val === "number") pointers.left = val;
    if ((n === "right" || n === "r" || n === "high") && typeof val === "number") pointers.right = val;
    if ((n === "mid" || n === "m") && typeof val === "number") pointers.mid = val;
    if (n === "target" && typeof val === "number") pointers.target = val;
  }
  return pointers;
}

export function BinarySearchVisualizer({ trace, currentStep, variables }: BinarySearchVisualizerProps) {
  const arr = extractArray(variables);
  const pointers = extractPointers(variables);

  if (!arr) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No array detected. The visualizer will show binary search during debugging.
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
          const isMid = pointers.mid === idx;
          const inRange = pointers.left !== undefined && pointers.right !== undefined &&
            idx >= pointers.left && idx <= pointers.right;

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Pointer labels */}
              <div className="h-8 flex flex-col items-center">
                {isMid && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-[var(--violet)] px-1.5 py-0.5 rounded bg-[var(--violet)]/10"
                  >
                    MID
                  </motion.div>
                )}
                {isLeft && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-[var(--cyan)] px-1.5 py-0.5 rounded bg-[var(--cyan)]/10"
                  >
                    L
                  </motion.div>
                )}
                {isRight && !isMid && (
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
                  scale: isMid ? 1.15 : 1,
                  borderColor: isMid ? "#8b5cf6" : isLeft ? "#22d3ee" : isRight ? "#f59e0b" : inRange ? "#8b5cf640" : "#273247",
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded-lg border-2 font-mono text-[13px] font-bold"
                style={{
                  width: cellWidth,
                  height: cellWidth,
                  backgroundColor: isMid ? "#8b5cf620" : inRange ? "#111827" : "#0a0f1a",
                  color: isMid ? "#a78bfa" : inRange ? "#e2e8f0" : "#475569",
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

      {/* Decision logic */}
      {pointers.mid !== undefined && pointers.target !== undefined && arr[pointers.mid] !== undefined && (
        <div className="mt-3 p-3 bg-[#111827] border border-[var(--border)] rounded-lg text-[12px] font-mono">
          <span className="text-[var(--muted)]">nums[mid] = </span>
          <span className="text-[var(--violet)] font-bold">{arr[pointers.mid]}</span>
          <span className="text-[var(--muted)]">, target = </span>
          <span className="text-[var(--amber)] font-bold">{pointers.target}</span>
          <span className="text-[var(--muted)]"> → </span>
          {arr[pointers.mid] < pointers.target ? (
            <span className="text-[var(--cyan)]">{arr[pointers.mid]} &lt; {pointers.target} → move left = mid + 1</span>
          ) : arr[pointers.mid] > pointers.target ? (
            <span className="text-[var(--amber)]">{arr[pointers.mid]} &gt; {pointers.target} → move right = mid - 1</span>
          ) : (
            <span className="text-[var(--green)]">Found! Return mid</span>
          )}
        </div>
      )}

      {/* Pointer legend */}
      <div className="flex gap-3 flex-wrap mt-2 text-[11px]">
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
        {pointers.mid !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--violet)]" />
            <span className="font-mono text-[var(--violet)]">mid = {pointers.mid}</span>
          </div>
        )}
      </div>
    </div>
  );
}
