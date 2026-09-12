"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Target, TrendingUp, Clock } from "lucide-react";
import problemsData from "@/data/problems.json";
import { useProblemStore } from "@/lib/stores/problem-store";
import type { Problem } from "@/lib/types";

const allProblems = problemsData as Problem[];

interface RevisionItem {
  slug: string;
  problem: Problem;
  nextReview: number;
  confidence: number;
}

export function RevisionDashboard() {
  const { userStates, loadFromStorage } = useProblemStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  if (!mounted) return null;

  const now = Date.now();
  const revisionItems: RevisionItem[] = [];

  for (const [slug, state] of Object.entries(userStates)) {
    if (state.revision?.nextReview && state.revision.nextReview > 0) {
      const problem = allProblems.find((p) => p.slug === slug);
      if (problem) {
        revisionItems.push({
          slug,
          problem,
          nextReview: state.revision.nextReview,
          confidence: state.revision.confidence,
        });
      }
    }
  }

  const dueToday = revisionItems.filter((item) => item.nextReview <= now);
  const dueSoon = revisionItems.filter((item) => item.nextReview > now && item.nextReview <= now + 7 * 24 * 60 * 60 * 1000);

  if (revisionItems.length === 0) {
    return (
      <div className="border border-[var(--border)] rounded-xl bg-[var(--panel)] p-5">
        <h3 className="text-[14px] font-bold mb-2 flex items-center gap-2">
          <Calendar size={16} className="text-[var(--violet)]" /> Revision Queue
        </h3>
        <p className="text-[13px] text-[var(--muted)]">
          No problems scheduled for revision. Mark problems as reviewed to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border)] rounded-xl bg-[var(--panel)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-[14px] font-bold flex items-center gap-2">
          <Calendar size={16} className="text-[var(--violet)]" /> Revision Queue
        </h3>
      </div>

      {dueToday.length > 0 && (
        <div className="px-4 py-2 bg-[var(--amber)]/5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--amber)]">
            <Target size={14} /> {dueToday.length} problem{dueToday.length !== 1 ? "s" : ""} due today
          </div>
        </div>
      )}

      <div className="divide-y divide-[var(--border)]">
        {dueToday.slice(0, 5).map((item) => (
          <Link
            key={item.slug}
            href={`/problems/${item.slug}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#111827] transition-colors"
          >
            <span className="text-[12px] font-mono text-[#64748b] w-[40px]">{item.problem.id}</span>
            <span className="text-[13px] text-white flex-1">{item.problem.title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--amber)]/15 text-[var(--amber)] font-semibold">
              Due
            </span>
          </Link>
        ))}
      </div>

      {dueSoon.length > 0 && (
        <>
          <div className="px-4 py-2 bg-[#111827]">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--muted)]">
              <Clock size={14} /> {dueSoon.length} due this week
            </div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {dueSoon.slice(0, 3).map((item) => (
              <Link
                key={item.slug}
                href={`/problems/${item.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#111827] transition-colors"
              >
                <span className="text-[12px] font-mono text-[#64748b] w-[40px]">{item.problem.id}</span>
                <span className="text-[13px] text-white flex-1">{item.problem.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--violet)]/15 text-[var(--violet)] font-semibold">
                  {item.confidence}/5
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      <Link
        href="/problems?status=reviewed"
        className="block px-4 py-2.5 text-center text-[12px] text-[var(--violet)] hover:bg-[#111827] transition-colors font-semibold"
      >
        View all →
      </Link>
    </div>
  );
}
