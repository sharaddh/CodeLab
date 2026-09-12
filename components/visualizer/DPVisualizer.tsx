"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface DPVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function extractDPTable(vars: Record<string, unknown>): number[][] | null {
  for (const [, v] of Object.entries(vars)) {
    if (Array.isArray(v) && v.length > 0) {
      if (Array.isArray(v[0])) {
        return v as number[][];
      }
      if (v.every((x) => typeof x === "number")) {
        // 1D DP
        return [v as number[]];
      }
    }
  }
  return null;
}

export function DPVisualizer({ trace, currentStep, variables }: DPVisualizerProps) {
  const table = extractDPTable(variables);

  if (!table) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No DP table detected. The visualizer will show DP tables during debugging.
      </div>
    );
  }

  const cellSize = Math.min(50, Math.max(30, 500 / (table[0]?.length || 1)));

  return (
    <div className="p-4 overflow-x-auto">
      <div className="inline-block">
        {table.map((row, i) => (
          <div key={i} className="flex gap-0.5 mb-0.5">
            {row.map((val, j) => {
              const isActive = trace[currentStep]?.vars
                ? Object.values(trace[currentStep].vars).some((v) => v === val)
                : false;

              return (
                <motion.div
                  key={`${i}-${j}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1.1 : 1,
                    borderColor: isActive ? "#8b5cf6" : "#273247",
                  }}
                  transition={{ duration: 0.15, delay: (i * row.length + j) * 0.01 }}
                  className="flex items-center justify-center border-2 font-mono text-[11px] font-bold"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: isActive ? "#8b5cf620" : "#111827",
                    color: isActive ? "#a78bfa" : "#e2e8f0",
                  }}
                >
                  {val}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Row/Column labels */}
      <div className="mt-2 flex gap-0.5">
        {table[0]?.map((_, j) => (
          <div
            key={j}
            className="text-[8px] text-[#475569] font-mono text-center"
            style={{ width: cellSize }}
          >
            {j}
          </div>
        ))}
      </div>
    </div>
  );
}
