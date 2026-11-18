"use client";

import { motion } from "framer-motion";
import type { TraceEvent } from "@/lib/types";

interface GraphVisualizerProps {
  trace: TraceEvent[];
  currentStep: number;
  variables: Record<string, unknown>;
}

function extractGraphData(vars: Record<string, unknown>): { nodes: string[]; edges: [string, string][] } | null {
  // Look for adjacency list
  for (const [, v] of Object.entries(vars)) {
    if (v && typeof v === "object" && "_map" in v) {
      const map = (v as { _map: Record<string, unknown> })._map;
      const nodes = Object.keys(map);
      const edges: [string, string][] = [];
      for (const [key, val] of Object.entries(map)) {
        if (val && typeof val === "object" && "_arr" in val) {
          const neighbors = (val as { _arr: (string | number)[] })._arr;
          for (const n of neighbors) {
            edges.push([key, String(n)]);
          }
        }
      }
      if (nodes.length > 0) return { nodes, edges };
    }
  }
  return null;
}

export function GraphVisualizer({ trace, currentStep, variables }: GraphVisualizerProps) {
  const graph = extractGraphData(variables);

  if (!graph) {
    return (
      <div className="text-[var(--muted)] text-[13px] p-4">
        No graph detected. The visualizer will show graphs during debugging.
      </div>
    );
  }

  const { nodes, edges } = graph;
  const nodeRadius = 20;
  const centerX = 250;
  const centerY = 150;
  const radius = 100;

  // Position nodes in a circle
  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    positions[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const currentVal = trace[currentStep]?.vars
    ? Object.values(trace[currentStep].vars).find((v) => typeof v === "string" && nodes.includes(v as string)) as string | undefined
    : undefined;

  return (
    <div className="p-4 overflow-x-auto">
      <svg width={500} height={300}>
        {/* Edges */}
        {edges.map(([from, to], i) => {
          const fromPos = positions[from];
          const toPos = positions[to];
          if (!fromPos || !toPos) return null;
          return (
            <motion.line
              key={`edge-${i}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke="#273247"
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const pos = positions[node];
          const isCurrent = currentVal === node;
          return (
            <motion.g
              key={`node-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill={isCurrent ? "#71717a" : "#111827"}
                stroke={isCurrent ? "#a78bfa" : "#273247"}
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isCurrent ? "#fff" : "#e2e8f0"}
                fontSize={12}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {node}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
