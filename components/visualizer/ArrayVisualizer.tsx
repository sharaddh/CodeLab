"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface ArrayVisualizerProps {
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
    const o = v as Record<string, any>;
    if ("_str" in o) return String(o._str);
    if ("_ref" in o) return `ref`;
  }
  try { return JSON.stringify(v); } catch { return String(v); }
}

function extractArray(vars: Record<string, unknown>): { name: string; arr: unknown[] } | null {
  let fallback: { name: string; arr: unknown[] } | null = null;
  for (const [name, v] of Object.entries(vars)) {
    if (Array.isArray(v) && v.length >= 0) {
      const item = { name, arr: v as unknown[] };
      if (/nums|arr|array|list|values|digits|chars|s\b|str/i.test(name)) return item;
      if (!fallback) fallback = item;
    }
    if (v && typeof v === "object" && "_arr" in v && Array.isArray((v as { _arr: unknown[] })._arr)) {
      const item = { name, arr: (v as { _arr: unknown[] })._arr };
      if (/nums|arr|array|list|values|digits|chars|s\b|str/i.test(name)) return item;
      if (!fallback) fallback = item;
    }
  }
  return fallback;
}

function extractPointers(vars: Record<string, unknown>): Record<string, number> {
  const pointers: Record<string, number> = {};
  const pointerNames = ["left", "right", "mid", "i", "j", "slow", "fast", "start", "end", "low", "high", "l", "r", "m", "k", "p", "q"];
  for (const [name, val] of Object.entries(vars)) {
    if (pointerNames.includes(name.toLowerCase()) && typeof val === "number") {
      pointers[name] = val;
    }
  }
  return pointers;
}

const POINTER_COLORS = ["#e4e4e7", "#a1a1aa", "#71717a", "#d4d4d8", "#52525b", "#fafafa"];

export function ArrayVisualizer({ trace, currentStep, variables }: ArrayVisualizerProps) {
  const found = extractArray(variables);
  const pointers = extractPointers(variables);

  if (!found) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No list/array detected at this step. If your code uses a list variable, it will appear here as it changes.
      </div>
    );
  }

  const arr = found.arr;
  const cellWidth = Math.min(64, Math.max(34, 700 / Math.max(arr.length, 1)));
  const totalWidth = arr.length * (cellWidth + 4) + 40;

  return (
    <div className="p-4 overflow-x-auto space-y-3">
      <div className="text-[12px] text-[var(--muted)]">
        Showing <span className="font-mono text-[var(--text)]">{found.name}</span> — each box is one element. Number under box is its <b>index</b>. Colored labels show pointer/index variables.
      </div>
      <div className="flex items-end gap-1" style={{ minWidth: totalWidth }}>
        {arr.map((val, idx) => {
          const pointerAtThisIndex = Object.entries(pointers).find(([, v]) => v === idx);
          const pointerName = pointerAtThisIndex ? pointerAtThisIndex[0] : undefined;
          const pointerColorIdx = pointerName
            ? Object.keys(pointers).indexOf(pointerName) % POINTER_COLORS.length
            : 0;
          const pointerColor = POINTER_COLORS[pointerColorIdx];
          const label = toDisplay(val);

          return (
            <div key={idx} className="flex flex-col items-center">
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
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: pointerAtThisIndex ? 1.08 : 1,
                  borderColor: pointerAtThisIndex ? pointerColor : "#273247",
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded-lg border-2 font-mono text-[12px] font-bold px-1 text-center"
                style={{
                  minWidth: cellWidth,
                  height: cellWidth,
                  backgroundColor: pointerAtThisIndex ? `${pointerColor}15` : "#111827",
                  color: pointerAtThisIndex ? pointerColor : "#e2e8f0",
                }}
                title={`index ${idx} = ${label}`}
              >
                {label.length > 6 ? label.slice(0, 5) + "…" : label}
              </motion.div>
              <div className="text-[9px] text-[#64748b] mt-1 font-mono">idx {idx}</div>
            </div>
          );
        })}
      </div>

      {Object.keys(pointers).length > 0 ? (
        <div className="flex gap-3 flex-wrap">
          {Object.entries(pointers).map(([name, idx], i) => (
            <div key={name} className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-[#111827] border border-[var(--border)]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: POINTER_COLORS[i % POINTER_COLORS.length] }} />
              <span className="font-mono" style={{ color: POINTER_COLORS[i % POINTER_COLORS.length] }}>{name}</span>
              <span className="text-[var(--muted)]">points to index</span>
              <span className="font-mono text-[var(--text)]">{idx}</span>
              {arr[idx] !== undefined && <span className="text-[var(--muted)]">(value: <span className="text-[var(--text)] font-mono">{toDisplay(arr[idx])}</span>)</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-[var(--muted)]">No pointer/index variables detected yet (common ones: i, j, left, right, mid).</div>
      )}

      <div className="text-[12px] text-[var(--muted)] font-mono">
        Step {currentStep + 1} of {trace.length} | length: {arr.length}
      </div>
    </div>
  );
}
