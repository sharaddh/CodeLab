"use client";

import { useEffect, useState } from "react";
import problemsData from "@/data/problems.json";
import { useProblemStore } from "@/lib/stores/problem-store";
import type { Problem } from "@/lib/types";

const allProblems = problemsData as Problem[];

export default function ProfilePage() {
  const { userStates, loadFromStorage } = useProblemStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  const states = mounted ? Object.values(userStates) : [];
  const solved = states.filter((s) => ["solved", "reviewed", "mastered"].includes(s.status)).length;
  const reviewed = states.filter((s) => ["reviewed", "mastered"].includes(s.status)).length;
  const mastered = states.filter((s) => s.status === "mastered").length;
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
    <div className="max-w-[1100px] mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-extrabold">Profile</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Solved", value: solved },
          { label: "Reviewed", value: reviewed },
          { label: "Mastered", value: mastered },
          { label: "Favorites", value: favorites },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--border)] bg-[var(--panel)] rounded-xl p-5">
            <div className="text-[28px] font-bold font-mono">{s.value}</div>
            <div className="text-[11px] text-[var(--muted)] uppercase tracking-wider font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Rings */}
      <div className="mb-8">
        <h2 className="text-[16px] font-bold mb-4">Difficulty Progress</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Easy", solved: easySolved, total: easy, color: "#4ade80" },
            { label: "Medium", solved: mediumSolved, total: medium, color: "#fbbf24" },
            { label: "Hard", solved: hardSolved, total: hard, color: "#f87171" },
          ].map((d) => (
            <div key={d.label} className="border border-[var(--border)] bg-[var(--panel)] rounded-xl p-5 text-center">
              <svg className="w-20 h-20 mx-auto mb-3" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="8"
                  strokeDasharray={`${(d.total > 0 ? d.solved / d.total : 0) * 251} 251`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="50" textAnchor="middle" dy="0.35em" className="fill-white text-[18px] font-bold font-mono">
                  {d.solved}/{d.total}
                </text>
              </svg>
              <div className="text-[13px] font-bold" style={{ color: d.color }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Distribution */}
      <div>
        <h2 className="text-[16px] font-bold mb-4">Recent Activity</h2>
        <div className="border border-[var(--border)] rounded-xl bg-[#0a0f1a]">
          {states.length === 0 ? (
            <div className="p-6 text-center text-[var(--muted)] text-[13px]">No activity yet. Start solving problems!</div>
          ) : (
            states
              .sort((a, b) => {
                const aAttempt = a.attempts.length > 0 ? Math.max(...a.attempts.map((x) => x.timestamp)) : 0;
                const bAttempt = b.attempts.length > 0 ? Math.max(...b.attempts.map((x) => x.timestamp)) : 0;
                return bAttempt - aAttempt;
              })
              .slice(0, 10)
              .map((s) => {
                const p = allProblems.find((q) => q.slug === s.slug);
                if (!p) return null;
                return (
                  <div key={s.slug} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1a2332] last:border-b-0">
                    <span className="text-[12px] font-mono text-[#64748b] w-[40px]">{p.id}</span>
                    <span className="text-[13px] font-semibold text-white flex-1">{p.title}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--violet)]/15 text-[var(--violet)] capitalize">{s.status}</span>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
