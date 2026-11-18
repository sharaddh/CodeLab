"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface LinkedListVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function extractList(vars: Record<string, unknown>): number[] | null {
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

export function LinkedListVisualizer({ trace, currentStep, variables }: LinkedListVisualizerProps) {
  const list = extractList(variables);

  if (!list) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No linked list detected. The visualizer will show linked lists when debugging list-based algorithms.
      </div>
    );
  }

  const nodeWidth = 60;
  const gap = 30;
  const totalWidth = list.length * (nodeWidth + gap);

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-center" style={{ minWidth: totalWidth + 40 }}>
        {list.map((val, idx) => {
          const isCurrent = trace[currentStep]?.vars
            ? Object.values(trace[currentStep].vars).some((v) => v === idx)
            : false;

          return (
            <motion.div
              key={idx}
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              {/* Node */}
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center rounded-lg border-2 font-mono text-[13px] font-bold"
                  style={{
                    width: nodeWidth,
                    height: 36,
                    backgroundColor: isCurrent ? "#71717a20" : "#111827",
                    borderColor: isCurrent ? "#71717a" : "#273247",
                    color: isCurrent ? "#a78bfa" : "#e2e8f0",
                  }}
                >
                  <div className="flex-1 text-center">{val}</div>
                  <div className="w-px h-5 bg-[#273247]" />
                  <div className="w-5" /> {/* Pointer space */}
                </div>
                <div className="text-[9px] text-[#475569] mt-1 font-mono">[{idx}]</div>
              </div>

              {/* Arrow */}
              {idx < list.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 + 0.1 }}
                  className="flex items-center mx-1"
                >
                  <div className="w-6 h-0.5 bg-[#273247]" />
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#273247]" />
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* null terminator */}
        <div className="text-[11px] text-[var(--muted)] font-mono ml-2">null</div>
      </div>
    </div>
  );
}
