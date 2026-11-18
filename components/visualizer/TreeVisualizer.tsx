"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface TreeNode {
  val: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

interface TreeVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function findTreeNodes(vars: Record<string, unknown>): (number | null)[] | null {
  // Look for arrays that could be tree level-order traversal
  for (const [, v] of Object.entries(vars)) {
    if (Array.isArray(v) && v.length > 0) {
      return v as (number | null)[];
    }
    if (v && typeof v === "object" && "_arr" in v) {
      const arr = (v as { _arr: unknown[] })._arr;
      return arr as (number | null)[];
    }
  }
  return null;
}

function buildTreeFromLevelOrder(arr: (number | null)[]): { x: number; y: number; val: number; parent?: { x: number; y: number } }[] {
  if (!arr || arr.length === 0 || arr[0] === null) return [];

  const nodes: { x: number; y: number; val: number; parent?: { x: number; y: number } }[] = [];
  const nodePositions: { x: number; y: number }[] = [];

  // BFS to build positions
  const queue: { idx: number; x: number; y: number; parentIdx?: number }[] = [
    { idx: 0, x: 0, y: 0 }
  ];

  let minX = 0, maxX = 0;

  while (queue.length > 0) {
    const { idx, x, y, parentIdx } = queue.shift()!;
    if (idx >= arr.length || arr[idx] === null) continue;

    const parentPos = parentIdx !== undefined ? nodePositions[parentIdx] : undefined;
    nodes.push({ x, y, val: arr[idx]!, parent: parentPos });
    nodePositions[idx] = { x, y };

    const leftIdx = 2 * idx + 1;
    const rightIdx = 2 * idx + 2;
    const spread = Math.pow(2, Math.max(0, 2 - Math.floor(Math.log2(y + 1))));

    if (leftIdx < arr.length && arr[leftIdx] !== null) {
      queue.push({ idx: leftIdx, x: x - spread, y: y + 1, parentIdx: idx });
      minX = Math.min(minX, x - spread);
    }
    if (rightIdx < arr.length && arr[rightIdx] !== null) {
      queue.push({ idx: rightIdx, x: x + spread, y: y + 1, parentIdx: idx });
      maxX = Math.max(maxX, x + spread);
    }
  }

  return nodes;
}

export function TreeVisualizer({ trace, currentStep, variables }: TreeVisualizerProps) {
  const arr = findTreeNodes(variables);

  if (!arr || arr.length === 0) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No tree data detected. The visualizer will show trees when debugging tree-based algorithms.
      </div>
    );
  }

  const nodes = buildTreeFromLevelOrder(arr);
  const nodeR = 20;
  const levelHeight = 60;
  const baseX = 300;
  const baseY = 40;

  // Find current node (if any pointer is referencing a value)
  const currentVal = trace[currentStep]?.vars
    ? Object.values(trace[currentStep].vars).find((v) => typeof v === "number" && arr.includes(v as number)) as number | undefined
    : undefined;

  return (
    <div className="p-4 overflow-x-auto">
      <svg width={600} height={Math.max(200, nodes.length > 0 ? Math.max(...nodes.map((n) => n.y)) * levelHeight + baseY + 60 : 200)}>
        {/* Edges */}
        {nodes.map((node, i) =>
          node.parent ? (
            <motion.line
              key={`edge-${i}`}
              x1={baseX + node.parent.x * 40}
              y1={baseY + node.parent.y * levelHeight + nodeR}
              x2={baseX + node.x * 40}
              y2={baseY + node.y * levelHeight - nodeR}
              stroke="#273247"
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          ) : null
        )}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const isCurrent = currentVal !== undefined && node.val === currentVal;
          return (
            <motion.g
              key={`node-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <circle
                cx={baseX + node.x * 40}
                cy={baseY + node.y * levelHeight}
                r={nodeR}
                fill={isCurrent ? "#71717a" : "#111827"}
                stroke={isCurrent ? "#a78bfa" : "#273247"}
                strokeWidth={2}
              />
              <text
                x={baseX + node.x * 40}
                y={baseY + node.y * levelHeight}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isCurrent ? "#fff" : "#e2e8f0"}
                fontSize={12}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {node.val}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
