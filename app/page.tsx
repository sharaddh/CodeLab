"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Terminal, CheckCircle, Target, Star, TrendingUp, Cpu } from "lucide-react";
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
    { label: "TOTAL_NODES", value: problems.length, icon: Terminal, cmd: "count --all" },
    { label: "SOLVED", value: solved, icon: CheckCircle, cmd: "grep solved" },
    { label: "REVIEWED", value: reviewed, icon: Target, cmd: "grep reviewed" },
    { label: "STARRED", value: favorites, icon: Star, cmd: "ls favorites/" },
    { label: "TOP_160", value: top160Ids.length, icon: TrendingUp, cmd: "cat curated.list" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 font-mono">
      <div className="mb-6 border border-[var(--border)] bg-[var(--panel)] overflow-hidden relative scanline-sweep">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] text-[var(--muted)] uppercase tracking-widest">
          <span className="text-[#d4d4d8]">*</span><span className="text-[#a1a1aa]">*</span><span className="text-[#71717a]">*</span>
          <span className="ml-2">~/dashboard -- system_readout.sh</span>
        </div>
        <div className="p-5">
          <div className="text-[12px] text-[var(--muted)] mb-1">
            <span className="text-[var(--text)]">user@lc-lab</span>:<span className="text-[var(--muted)]">~</span>$ ./boot_revision_lab --verbose
          </div>
          <h1 className="text-[34px] sm:text-[42px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)] tracking-wider mb-2">
            LEETCODE_REVISION_LAB<span className="cursor-blink"></span>
          </h1>
          <p className="text-[13px] text-[var(--muted)] max-w-[720px] leading-relaxed">
            [OK] Loaded <span className="text-[var(--text)]">{problems.length.toLocaleString()}</span> problem nodes. Subsystems online: editor, compiler bridge, tracer, visualizer.
            Execute practice cycles. Commit patterns to memory.
          </p>
          <div className="mt-3 text-[11px] text-[var(--dim)] flex flex-wrap gap-x-4 gap-y-1">
            <span>uptime: <span className="text-[var(--text)]">stable</span></span>
            <span>companion: <span className="text-[var(--muted)]">{process.env.NEXT_PUBLIC_COMPANION_URL || "localhost:3001"}</span></span>
            <span>mode: <span className="text-[var(--text)]">INTERACTIVE</span></span>
          </div>
        </div>
      </div>

      <div className="mb-2 text-[11px] text-[var(--muted)] uppercase tracking-widest">&gt; system_stats --summary</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="border border-[var(--border)] bg-[var(--panel)] p-3 hover:border-[var(--border-bright)] transition-colors">
            <div className="flex items-center justify-between mb-2 text-[10px] text-[var(--dim)]">
              <span>{s.cmd}</span>
              <s.icon size={14} className="text-[var(--muted)]" />
            </div>
            <div className="text-[28px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)]">{s.value}</div>
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-[0.16em] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-2 text-[11px] text-[var(--muted)] uppercase tracking-widest">&gt; difficulty_matrix --distribution</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "EASY", count: easy, color: "#d4d4d8", href: "/problems?difficulty=Easy" },
          { label: "MEDIUM", count: medium, color: "#a1a1aa", href: "/problems?difficulty=Medium" },
          { label: "HARD", count: hard, color: "#71717a", href: "/problems?difficulty=Hard" },
        ].map((d) => (
          <Link key={d.label} href={d.href} className="border border-[var(--border)] bg-[var(--panel)] p-4 hover:border-[var(--border-bright)] hover:translate-y-[-1px] transition-all block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] tracking-widest" style={{ color: d.color }}>[{d.label}]</span>
              <Cpu size={14} style={{ color: d.color }} />
            </div>
            <div className="text-[34px] leading-none font-[family-name:var(--font-terminal)]" style={{ color: d.color }}>{d.count}</div>
            <div className="mt-2 text-[11px] text-[var(--muted)]">records available</div>
            <div className="mt-3 h-1.5 bg-[#0a0a0c] border border-[var(--border)]">
              <div className="h-full" style={{ width: `${Math.min(100, (d.count / problems.length) * 100)}%`, background: d.color }} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-2 text-[11px] text-[var(--muted)] uppercase tracking-widest">&gt; quick_exec --commands</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/problems", cmd: "./browse_problems.sh", label: "BROWSE_PROBLEMS", desc: "search/filter full dataset" },
          { href: "/companies", cmd: "./companies.sh", label: "COMPANY_INDEX", desc: "group by target org" },
          { href: "/favorites", cmd: "cat ./favorites", label: "FAVORITES", desc: "starred problem set" },
          { href: "/profile", cmd: "./profile --stats", label: "PROFILE", desc: "progress & activity log" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="border border-[var(--border)] bg-[var(--panel)] p-4 hover:border-[var(--border-bright)] hover:bg-[#17171c] transition-all group">
            <div className="text-[11px] text-[var(--dim)] mb-1">{a.cmd}</div>
            <div className="text-[18px] font-[family-name:var(--font-terminal)] text-[var(--text)] tracking-wider group-hover:text-[#ffffff]">{a.label}</div>
            <div className="text-[12px] text-[var(--muted)] mt-1">{a.desc}</div>
            <div className="mt-3 text-[11px] text-[var(--muted)] group-hover:text-[var(--text)]">[ENTER] -&gt;</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
