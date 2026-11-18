"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface TwoPointerVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function toDisplay(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v && typeof v === "object") {
    const o = v as any;
    if ("_str" in o) return String(o._str);
  }
  try { return JSON.stringify(v); } catch { return String(v); }
}

function extractArray(vars: Record<string, unknown>): { name: string; arr: unknown[] } | null {
  let fallback: { name: string; arr: unknown[] } | null = null;
  for (const [name, v] of Object.entries(vars)) {
    if (Array.isArray(v)) {
      const item = { name, arr: v };
      if (/nums|arr|array|list/i.test(name)) return item;
      if (!fallback) fallback = item;
    }
    if (v && typeof v === "object" && "_arr" in v) {
      const item = { name, arr: (v as any)._arr || [] };
      if (/nums|arr|array|list/i.test(name)) return item;
      if (!fallback) fallback = item;
    }
  }
  return fallback;
}

function extractPointers(vars: Record<string, unknown>): { left?: number; right?: number } {
  const pointers: { left?: number; right?: number } = {};
  for (const [name, val] of Object.entries(vars)) {
    const n = name.toLowerCase();
    if ((n === "left" || n === "l" || n === "start" || n === "i") && typeof val === "number") pointers.left = val;
    if ((n === "right" || n === "r" || n === "end" || n === "j") && typeof val === "number") pointers.right = val;
  }
  return pointers;
}

export function TwoPointerVisualizer({ trace, currentStep, variables }: TwoPointerVisualizerProps) {
  const found = extractArray(variables);
  const pointers = extractPointers(variables);

  if (!found) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No array/list detected. When two pointers move over a list (e.g. left/right, i/j), you’ll see them here.
      </div>
    );
  }

  const arr = found.arr;
  const cellWidth = Math.min(60, Math.max(32, 700 / Math.max(arr.length, 1)));

  return (
    <div className="p-4 overflow-x-auto space-y-3">
      <div className="text-[12px] text-[var(--muted)]">
        <span className="text-white font-semibold">Two pointers</span>: one pointer (L) and another (R) scan the list. Watch which indices they point to at each step.
      </div>
      <div className="flex items-end gap-1">
        {arr.map((val, idx) => {
          const isLeft = pointers.left === idx;
          const isRight = pointers.right === idx;
          const isBetween = pointers.left !== undefined && pointers.right !== undefined &&
            idx > Math.min(pointers.left, pointers.right) && idx < Math.max(pointers.left, pointers.right);

          return (
            <div key={idx} className="flex flex-col items-center">
              <div className="h-6 flex items-center gap-1">
                {isLeft && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-[var(--text)] px-1.5 py-0.5 rounded bg-[var(--text)]/10">L</motion.div>
                )}
                {isRight && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-[var(--amber)] px-1.5 py-0.5 rounded bg-[var(--amber)]/10">R</motion.div>
                )}
              </div>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: isLeft || isRight ? 1.08 : 1,
                  borderColor: isLeft ? "#a1a1aa" : isRight ? "#f59e0b" : isBetween ? "#71717a80" : "#273247",
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded-lg border-2 font-mono text-[12px] font-bold px-1"
                style={{
                  minWidth: cellWidth,
                  height: cellWidth,
                  backgroundColor: isLeft ? "#a1a1aa15" : isRight ? "#f59e0b15" : isBetween ? "#71717a10" : "#111827",
                  color: isLeft ? "#a1a1aa" : isRight ? "#f59e0b" : isBetween ? "#a78bfa" : "#e2e8f0",
                }}
                title={`idx ${idx} = ${toDisplay(val)}`}
              >
                {(() => { const s = toDisplay(val); return s.length > 6 ? s.slice(0,5)+"…" : s; })()}
              </motion.div>
              <div className="text-[9px] text-[#64748b] mt-1 font-mono">idx {idx}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 flex-wrap text-[11px]">
        {pointers.left !== undefined && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#111827] border border-[var(--border)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--text)]" />
            <span className="font-mono text-[var(--text)]">L = index {pointers.left}</span>
            {arr[pointers.left] !== undefined && <span className="text-[var(--muted)]">value {toDisplay(arr[pointers.left])}</span>}
          </div>
        )}
        {pointers.right !== undefined && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#111827] border border-[var(--border)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--amber)]" />
            <span className="font-mono text-[var(--amber)]">R = index {pointers.right}</span>
            {arr[pointers.right] !== undefined && <span className="text-[var(--muted)]">value {toDisplay(arr[pointers.right])}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
