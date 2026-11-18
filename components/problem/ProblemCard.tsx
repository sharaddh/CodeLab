"use client";

import Link from "next/link";
import { Star, CheckCircle, Clock, Circle } from "lucide-react";
import type { Problem, ProblemUserState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProblemCardProps {
  problem: Problem;
  userState?: ProblemUserState;
  index?: number;
}

const difficultyColor = {
  Easy: "text-[var(--green)]",
  Medium: "text-[var(--amber)]",
  Hard: "text-[var(--red)]",
};

const difficultyBg = {
  Easy: "bg-[var(--green)]/10",
  Medium: "bg-[var(--amber)]/10",
  Hard: "bg-[var(--red)]/10",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  solved: CheckCircle,
  reviewed: CheckCircle,
  mastered: CheckCircle,
  attempted: Clock,
};

const statusColors: Record<string, string> = {
  solved: "text-[var(--green)]",
  reviewed: "text-[var(--text)]",
  mastered: "text-[var(--muted)]",
  attempted: "text-[var(--amber)]",
};

export function ProblemCard({ problem, userState, index }: ProblemCardProps) {
  const status = userState?.status;
  const StatusIcon = status ? statusIcons[status] : Circle;
  const statusColor = status ? statusColors[status] : "text-[#374151]";

  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#111827] transition-colors group"
    >
      {/* Number */}
      <span className="text-[12px] font-mono text-[#475569] w-[36px] flex-shrink-0">
        {index !== undefined ? index + 1 : problem.id}
      </span>

      {/* Status */}
      <StatusIcon size={16} className={cn("flex-shrink-0", statusColor)} />

      {/* Title */}
      <span className="text-[13px] text-[var(--text)] group-hover:text-white truncate flex-1">
        {problem.title}
      </span>

      {/* Topics */}
      {problem.topics && problem.topics.length > 0 && (
        <div className="hidden sm:flex items-center gap-1 max-w-[120px] overflow-hidden">
          {problem.topics.slice(0, 2).map((t) => (
            <span
              key={t.name}
              className="text-[9px] px-1 py-0.5 rounded bg-[var(--border)] text-[var(--muted)] truncate"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Difficulty */}
      <span
        className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0",
          difficultyBg[problem.difficulty],
          difficultyColor[problem.difficulty]
        )}
      >
        {problem.difficulty}
      </span>

      {/* Favorite */}
      {userState?.favorite && (
        <Star size={14} className="text-[var(--amber)] fill-[var(--amber)] flex-shrink-0" />
      )}
    </Link>
  );
}
