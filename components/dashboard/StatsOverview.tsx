"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Target, Flame, TrendingUp } from "lucide-react";
import problemsData from "@/data/problems.json";
import { useProblemStore } from "@/lib/stores/problem-store";
import type { Problem } from "@/lib/types";

const allProblems = problemsData as Problem[];

export function StatsOverview() {
  const { userStates, loadFromStorage } = useProblemStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  if (!mounted) return null;

  const states = Object.values(userStates);
  const solved = states.filter((s) => ["solved", "reviewed", "mastered"].includes(s.status)).length;
  const reviewed = states.filter((s) => ["reviewed", "mastered"].includes(s.status)).length;
  const favorites = states.filter((s) => s.favorite).length;

  const easy = allProblems.filter((p) => p.difficulty === "Easy").length;
  const medium = allProblems.filter((p) => p.difficulty === "Medium").length;
  const hard = allProblems.filter((p) => p.difficulty === "Hard").length;

  const easySolved = states.filter((s) => {
    const p = allProblems.find((q) => q.slug === s.slug);
    return p?.difficulty === "Easy" && ["solved", "reviewed", "mastered"].includes(s.status);
  }).length;

  const mediumSolved = states.filter((s) => {
    const p = allProblems.find((q) => q.slug === s.slug);
    return p?.difficulty === "Medium" && ["solved", "reviewed", "mastered"].includes(s.status);
  }).length;

  const hardSolved = states.filter((s) => {
    const p = allProblems.find((q) => q.slug === s.slug);
    return p?.difficulty === "Hard" && ["solved", "reviewed", "mastered"].includes(s.status);
  }).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Solved", value: solved, total: allProblems.length, icon: CheckCircle, color: "text-[var(--green)]" },
        { label: "Reviewed", value: reviewed, total: solved, icon: Target, color: "text-[var(--cyan)]" },
        { label: "Favorites", value: favorites, total: null, icon: Flame, color: "text-[var(--amber)]" },
        { label: "Progress", value: Math.round(((easySolved + mediumSolved + hardSolved) / allProblems.length) * 100), total: null, icon: TrendingUp, color: "text-[var(--violet)]", suffix: "%" },
      ].map((s) => (
        <div key={s.label} className="border border-[var(--border)] bg-[var(--panel)] rounded-xl p-4">
          <s.icon size={18} className={s.color} />
          <div className="text-[20px] font-bold font-mono mt-1.5">
            {s.value}{s.suffix || ""}
          </div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">
            {s.label}
          </div>
          {s.total !== null && (
            <div className="text-[10px] text-[#475569] font-mono mt-0.5">
              / {s.total}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
