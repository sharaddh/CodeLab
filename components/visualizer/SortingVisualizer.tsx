"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface SortingVisualizerProps {
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

export function SortingVisualizer({ trace, currentStep, variables }: SortingVisualizerProps) {
  const arr = extractArray(variables);

  if (!arr) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No array detected. Start debugging to see sorting visualizations.
      </div>
    );
  }

  const maxVal = Math.max(...arr, 1);
  const barWidth = Math.min(40, Math.max(10, 700 / arr.length));

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-end gap-0.5" style={{ minHeight: 200 }}>
        {arr.map((val, idx) => {
          const height = (val / maxVal) * 180;
          const isComparing = trace[currentStep]?.vars
            ? Object.values(trace[currentStep].vars).some((v) => v === idx)
            : false;

          return (
            <motion.div
              key={idx}
              layout
              initial={{ height: 0 }}
              animate={{ height: height + 20 }}
              transition={{ duration: 0.15 }}
              className="rounded-t-sm"
              style={{
                width: barWidth,
                backgroundColor: isComparing ? "#71717a" : "#273247",
                minHeight: 20,
              }}
            />
          );
        })}
      </div>
      <div className="flex gap-0.5 mt-1">
        {arr.map((val, idx) => (
          <div
            key={idx}
            className="text-[8px] text-[#475569] font-mono text-center"
            style={{ width: barWidth }}
          >
            {val}
          </div>
        ))}
      </div>
    </div>
  );
}
