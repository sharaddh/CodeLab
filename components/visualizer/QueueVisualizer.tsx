"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface QueueVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function extractQueue(vars: Record<string, unknown>): number[] | null {
  for (const [name, v] of Object.entries(vars)) {
    if (name.toLowerCase().includes("queue") && Array.isArray(v)) {
      return v as number[];
    }
  }
  for (const [, v] of Object.entries(vars)) {
    if (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "number")) {
      return v as number[];
    }
  }
  return null;
}

export function QueueVisualizer({ trace, currentStep, variables }: QueueVisualizerProps) {
  const queue = extractQueue(variables);

  if (!queue) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No queue detected. The visualizer will show queues during debugging.
      </div>
    );
  }

  const cellWidth = 60;

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-center gap-1" style={{ minWidth: queue.length * (cellWidth + 8) + 80 }}>
        {/* Front label */}
        <div className="text-[10px] text-[var(--cyan)] font-bold mr-1">FRONT →</div>

        {queue.map((val, idx) => {
          const isFront = idx === 0;
          const isRear = idx === queue.length - 1;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="flex items-center justify-center border-2 font-mono text-[13px] font-bold"
              style={{
                width: cellWidth,
                height: 36,
                backgroundColor: isFront ? "#22d3ee15" : isRear ? "#f59e0b15" : "#111827",
                borderColor: isFront ? "#22d3ee" : isRear ? "#f59e0b" : "#273247",
                color: isFront ? "#22d3ee" : isRear ? "#f59e0b" : "#e2e8f0",
              }}
            >
              {val}
            </motion.div>
          );
        })}

        {/* Rear label */}
        <div className="text-[10px] text-[var(--amber)] font-bold ml-1">← REAR</div>
      </div>

      <div className="mt-3 text-[11px] text-[var(--muted)] font-mono text-center">
        Size: {queue.length}
      </div>
    </div>
  );
}
