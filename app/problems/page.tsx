"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Crown, CheckCheck, CheckCircle2 } from "lucide-react";
import { useFilteredProblems, useTopics, useProblems, isCurated } from "@/lib/hooks/use-problems";
import { useProblemStore } from "@/lib/stores/problem-store";
import { cn, difficultyBg, formatNumber } from "@/lib/utils";
import type { ProblemStatus } from "@/lib/types";

const ITEMS_PER_PAGE = 300;

export default function ProblemsPage() {
  const router = useRouter();
  const { companies } = useProblems();
  const topics = useTopics();
  const { userStates, loadFromStorage, updateUserState } = useProblemStore();
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [company, setCompany] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("id");
  const [premium, setPremium] = useState(false);
  const [shownCount, setShownCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  const filters = {
    q,
    difficulty,
    topic,
    company,
    status,
    sort,
    premium,
    userStates: mounted ? userStates : {},
  };

  const filtered = useFilteredProblems(filters);
  const shown = filtered.slice(0, shownCount);

  const toggleReview = useCallback(
    (slug: string) => {
      const state = userStates[slug];
      const newStatus: ProblemStatus =
        state?.status === "reviewed" || state?.status === "mastered"
          ? "unseen"
          : "reviewed";
      updateUserState(slug, { status: newStatus });
    },
    [userStates, updateUserState]
  );

  const reviewedCount = mounted
    ? Object.values(userStates).filter(
        (s) => s.status === "reviewed" || s.status === "mastered"
      ).length
    : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      {/* Toolbar */}
      <div className="sticky top-[52px] z-10 flex gap-2 flex-wrap items-center p-2.5 bg-[#0d1117]/90 border border-[var(--border)] backdrop-blur-xl rounded-xl mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search id, title, topic or company..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setShownCount(ITEMS_PER_PAGE); }}
            className="w-full pl-10 pr-3 py-2.5 border border-[var(--border)] rounded-lg bg-[#0a0f1a] text-white text-[13px] outline-none focus:border-[var(--violet)]/50"
          />
        </div>

        {/* Filters */}
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setShownCount(ITEMS_PER_PAGE); }}
          className="px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[#0a0f1a] text-white text-[13px] max-w-[160px]"
        >
          <option value="all">All difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={topic}
          onChange={(e) => { setTopic(e.target.value); setShownCount(ITEMS_PER_PAGE); }}
          className="px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[#0a0f1a] text-white text-[13px] max-w-[160px]"
        >
          <option value="all">All topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={company}
          onChange={(e) => { setCompany(e.target.value); setShownCount(ITEMS_PER_PAGE); }}
          className="px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[#0a0f1a] text-white text-[13px] max-w-[160px]"
        >
          <option value="all">All companies</option>
          {companies.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setShownCount(ITEMS_PER_PAGE); }}
          className="px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[#0a0f1a] text-white text-[13px]"
        >
          <option value="all">Status: All</option>
          <option value="reviewed">Reviewed</option>
          <option value="not">Not reviewed</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[#0a0f1a] text-white text-[13px]"
        >
          <option value="id">Sort: ID</option>
          <option value="freq">Sort: Frequency</option>
        </select>

        <button
          onClick={() => { setPremium(!premium); setShownCount(ITEMS_PER_PAGE); }}
          className={cn(
            "px-3 py-2.5 rounded-lg border text-[13px] font-medium transition-colors",
            premium
              ? "bg-[var(--amber)]/10 text-[var(--amber)] border-[var(--amber)]/50"
              : "bg-[#0a0f1a] text-[var(--muted)] border-[var(--border)] hover:text-white"
          )}
        >
          Premium
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-2 flex-wrap mb-4">
        <div className="border border-[var(--border)] bg-[var(--panel)] rounded-xl px-3.5 py-2.5">
          <div className="text-[17px] font-bold font-mono">{formatNumber(filtered.length)}</div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">shown</div>
        </div>
        <div className="border border-[var(--border)] bg-[var(--panel)] rounded-xl px-3.5 py-2.5">
          <div className="text-[17px] font-bold font-mono text-emerald-400">
            {filtered.filter((p) => p.difficulty === "Easy").length}
          </div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">easy</div>
        </div>
        <div className="border border-[var(--border)] bg-[var(--panel)] rounded-xl px-3.5 py-2.5">
          <div className="text-[17px] font-bold font-mono text-amber-400">
            {filtered.filter((p) => p.difficulty === "Medium").length}
          </div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">medium</div>
        </div>
        <div className="border border-[var(--border)] bg-[var(--panel)] rounded-xl px-3.5 py-2.5">
          <div className="text-[17px] font-bold font-mono text-red-400">
            {filtered.filter((p) => p.difficulty === "Hard").length}
          </div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">hard</div>
        </div>
        <div className="border border-[var(--border)] bg-[var(--panel)] rounded-xl px-3.5 py-2.5">
          <div className="text-[17px] font-bold font-mono text-[var(--cyan)]">{reviewedCount}</div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">reviewed</div>
        </div>
      </div>

      {/* Problem Table */}
      <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[#0a0f1a]">
        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_70px_80px_110px_110px] items-center gap-2.5 px-4 bg-[#0d1117] min-h-[40px] text-[11.5px] text-[#64748b] uppercase tracking-wider font-semibold">
          <span>No.</span>
          <span>Title</span>
          <span>Solution</span>
          <span>Freq</span>
          <span>Difficulty</span>
          <span></span>
        </div>

        {/* Rows */}
        {shown.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)]">No problems match.</div>
        ) : (
          shown.map((p, i) => {
            const hasSolution = isCurated(p.slug);
            const state = mounted ? userStates[p.slug] : undefined;
            const isReviewed = state?.status === "reviewed" || state?.status === "mastered";
            const comps = (p.companies || []).slice(0, 3).map((c) => c.name).join(", ");

            return (
              <div
                key={p.id}
                className="grid grid-cols-[60px_1fr_70px_80px_110px_110px] items-center gap-2.5 px-4 border-b border-[#1a2332] min-h-[52px] hover:bg-[#111827] cursor-pointer transition-colors"
                style={{
                  animation: `fadeIn 0.25s ease both`,
                  animationDelay: `${Math.min(i * 3, 100)}ms`,
                }}
                onClick={() => router.push(`/problems/${p.slug}`)}
              >
                <span className="flex items-center gap-1.5 font-bold text-[12px] font-mono text-[#64748b]">
                  {p.paidOnly && <Crown size={13} className="text-[var(--amber)] flex-none" />}
                  {p.id}
                </span>
                <span>
                  <div className="text-[14px] font-semibold text-white">{p.title}</div>
                  <div className="text-[12px] text-[#64748b] mt-0.5">
                    {(p.topics || []).slice(0, 4).map((x) => x.name || x).join(" · ")}
                    {comps && <span className="text-[#4a5568]"> · {comps}</span>}
                  </div>
                </span>
                <span className="text-[11.5px] text-[var(--amber)] font-bold">
                  {hasSolution && (
                    <span className="inline-flex items-center gap-1">
                      <CheckCheck size={13} /> sol
                    </span>
                  )}
                </span>
                <span className="font-mono text-[12.5px] text-[#64748b]">
                  {p.askedBy ? `+${p.askedBy}` : "—"}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-bold px-2.5 py-1 rounded-full border w-fit",
                    difficultyBg(p.difficulty),
                    p.difficulty === "Easy"
                      ? "text-emerald-400"
                      : p.difficulty === "Medium"
                      ? "text-amber-400"
                      : "text-red-400"
                  )}
                >
                  {p.difficulty}
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleReview(p.slug)}
                    className={cn(
                      "px-2.5 py-1.5 text-[12px] font-medium rounded-lg border transition-colors",
                      isReviewed
                        ? "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/30"
                        : "bg-transparent text-[var(--muted)] border-[var(--border)] hover:text-white"
                    )}
                  >
                    {isReviewed ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 size={13} /> Reviewed
                      </span>
                    ) : (
                      "Review"
                    )}
                  </button>
                </span>
              </div>
            );
          })
        )}

        {/* Load More */}
        {shownCount < filtered.length && (
          <div
            className="text-center py-4 cursor-pointer text-[13px] text-white bg-[#111827] hover:bg-[#1e293b] border-t border-[#1a2332] font-medium"
            onClick={() => setShownCount((c) => c + ITEMS_PER_PAGE)}
          >
            <b>Load more</b> — showing {shownCount} of {formatNumber(filtered.length)} problems
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
