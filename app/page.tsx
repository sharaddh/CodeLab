"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Code2, CheckCircle, Flame, Target, TrendingUp } from "lucide-react";
import problemsData from "@/data/problems.json";
import solutionsData from "@/data/solutions.json";
import type { Problem } from "@/lib/types";
import { useProblemStore } from "@/lib/stores/problem-store";

const problems = problemsData as Problem[];
const top160Slugs = new Set(solutionsData.map((s: { slug: string }) => s.slug));
const top160Ids = problems.filter((p) => top160Slugs.has(p.slug)).map((p) => p.id);

export default function DashboardPage() {
  const { userStates, loadFromStorage } = useProblemStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  const reviewed = mounted
    ? Object.values(userStates).filter((s) => s.status === "reviewed" || s.status === "mastered").length
    : 0;
  const solved = mounted
    ? Object.values(userStates).filter((s) => s.status === "solved" || s.status === "reviewed" || s.status === "mastered").length
    : 0;
  const favorites = mounted
    ? Object.values(userStates).filter((s) => s.favorite).length
    : 0;

  const easy = problems.filter((p) => p.difficulty === "Easy").length;
  const medium = problems.filter((p) => p.difficulty === "Medium").length;
  const hard = problems.filter((p) => p.difficulty === "Hard").length;

  const stats = [
    { label: "Total Problems", value: problems.length, icon: Code2, color: "text-[var(--violet)]" },
    { label: "Solved", value: solved, icon: CheckCircle, color: "text-[var(--green)]" },
    { label: "Reviewed", value: reviewed, icon: Target, color: "text-[var(--cyan)]" },
    { label: "Favorites", value: favorites, icon: Flame, color: "text-[var(--amber)]" },
    { label: "Top 160", value: top160Ids.length, icon: TrendingUp, color: "text-orange-400" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[var(--amber)] mb-1">
          Welcome back
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight">
          LeetCode Revision Lab
        </h1>
        <p className="text-[var(--muted)] text-[14px] mt-1.5 max-w-[600px] leading-relaxed">
          Your personal DSA learning companion. Browse {problems.length.toLocaleString()} problems,
          write code, debug step-by-step, and visualize algorithms.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-[var(--border)] bg-[var(--panel)] rounded-xl p-4"
          >
            <s.icon size={20} className={s.color} />
            <div className="text-[22px] font-bold font-mono mt-2">{s.value}</div>
            <div className="text-[11px] text-[var(--muted)] uppercase tracking-wider font-semibold">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Easy", count: easy, color: "border-emerald-500/30 bg-emerald-500/5", textColor: "text-emerald-400" },
          { label: "Medium", count: medium, color: "border-amber-500/30 bg-amber-500/5", textColor: "text-amber-400" },
          { label: "Hard", count: hard, color: "border-red-500/30 bg-red-500/5", textColor: "text-red-400" },
        ].map((d) => (
          <Link
            key={d.label}
            href={`/problems?difficulty=${d.label}`}
            className={`border ${d.color} rounded-xl p-5 text-center transition-transform hover:scale-[1.02]`}
          >
            <div className={`text-[28px] font-bold font-mono ${d.textColor}`}>{d.count}</div>
            <div className="text-[12px] text-[var(--muted)] uppercase tracking-wider font-semibold">
              {d.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/problems", label: "Browse Problems", desc: "Search and filter all problems" },
          { href: "/companies", label: "By Company", desc: "Browse problems by company" },
          { href: "/favorites", label: "Favorites", desc: "Your starred problems" },
          { href: "/profile", label: "Profile", desc: "View your progress" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="border border-[var(--border)] bg-[var(--panel)] rounded-xl p-5 hover:border-[var(--violet)]/50 transition-all hover:translate-y-[-2px]"
          >
            <div className="text-[15px] font-bold text-white">{a.label}</div>
            <div className="text-[13px] text-[var(--muted)] mt-1">{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
