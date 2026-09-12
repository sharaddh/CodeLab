"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface ArrayVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function extractArray(vars: Record<string, unknown>): number[] | null {
  for (const [, v] of Object.entries(vars)) {
    if (Array.isArray(v) && v.every((x) => typeof x === "number")) {
      return v as number[];
    }
    if (v && typeof v === "object" && "_arr" in v && Array.isArray((v as { _arr: unknown[] })._arr)) {
      const arr = (v as { _arr: (number | { _str: string })[] })._arr;
      const nums = arr.map((x) => (typeof x === "number" ? x : null)).filter((x): x is number => x !== null);
      if (nums.length > 0) return nums;
    }
  }
  return null;
}

function extractPointers(vars: Record<string, unknown>): Record<string, number> {
  const pointers: Record<string, number> = {};
  const pointerNames = ["left", "right", "mid", "i", "j", "slow", "fast", "start", "end", "low", "high", "l", "r", "m"];
  for (const [name, val] of Object.entries(vars)) {
    if (pointerNames.includes(name.toLowerCase()) && typeof val === "number") {
      pointers[name] = val;
    }
  }
  return pointers;
}

const POINTER_COLORS = ["#8b5cf6", "#22d3ee", "#f59e0b", "#f87171", "#4ade80", "#ec4899"];

export function ArrayVisualizer({ trace, currentStep, variables }: ArrayVisualizerProps) {
  const arr = extractArray(variables);
  const pointers = extractPointers(variables);

  if (!arr) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No array detected in variables. The visualizer will show arrays when debugging code that uses them.
      </div>
    );
  }

  const cellWidth = Math.min(60, Math.max(30, 600 / arr.length));
  const totalWidth = arr.length * (cellWidth + 4) + 40;

  return (
    <div className="p-4 overflow-x-auto">
      {/* Array */}
      <div className="flex items-end gap-1 mb-6" style={{ minWidth: totalWidth }}>
        {arr.map((val, idx) => {
          const pointerAtThisIndex = Object.entries(pointers).find(([, v]) => v === idx);
          const pointerName = pointerAtThisIndex?.[0];
          const pointerColorIdx = pointerName
            ? Object.keys(pointers).indexOf(pointerName) % POINTER_COLORS.length
            : 0;
          const pointerColor = POINTER_COLORS[pointerColorIdx];

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Pointer label */}
              {pointerName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-bold mb-1 px-1.5 py-0.5 rounded"
                  style={{ color: pointerColor, backgroundColor: `${pointerColor}20` }}
                >
                  {pointerName}
                </motion.div>
              )}
              {/* Cell */}
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: pointerAtThisIndex ? 1.1 : 1,
                  borderColor: pointerAtThisIndex ? pointerColor : "#273247",
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded-lg border-2 font-mono text-[13px] font-bold"
                style={{
                  width: cellWidth,
                  height: cellWidth,
                  backgroundColor: pointerAtThisIndex ? `${pointerColor}15` : "#111827",
                  color: pointerAtThisIndex ? pointerColor : "#e2e8f0",
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
      {Object.keys(pointers).length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {Object.entries(pointers).map(([name, idx], i) => (
            <div key={name} className="flex items-center gap-1.5 text-[11px]">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: POINTER_COLORS[i % POINTER_COLORS.length] }}
              />
              <span className="font-mono" style={{ color: POINTER_COLORS[i % POINTER_COLORS.length] }}>
                {name}
              </span>
              <span className="text-[var(--muted)]">= {idx}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step info */}
      <div className="mt-4 text-[12px] text-[var(--muted)] font-mono">
        Step {currentStep + 1} of {trace.length} | Array length: {arr.length}
      </div>
    </div>
  );
}
