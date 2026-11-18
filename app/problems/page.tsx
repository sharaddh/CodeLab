"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Crown, CheckCircle2 } from "lucide-react";
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 font-mono">
      <div className="mb-4 border border-[var(--border)] bg-[var(--panel)]">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] text-[var(--muted)] uppercase tracking-widest">
          <span className="text-[#d4d4d8]">*</span><span className="text-[#a1a1aa]">*</span><span className="text-[#71717a]">*</span>
          <span className="ml-2">~/problems -- query_engine</span>
        </div>
        <div className="p-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-[12px] text-[var(--muted)] mb-1"><span className="text-[var(--text)]">user@lc-lab</span>:<span className="text-[var(--muted)]">~</span>$ ./problems --interactive --index</div>
            <h1 className="text-[30px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)] tracking-wider">PROBLEM_DATABASE</h1>
            <p className="text-[12px] text-[var(--muted)] mt-1">filter, sort, and open problem workspaces. records: {formatNumber(filtered.length)} shown</p>
          </div>
          <div className="text-[11px] text-[var(--dim)] border border-[var(--border)] px-3 py-2 bg-[#0a0a0c]">
            <div>reviewed: <span className="text-[var(--text)]">{reviewedCount}</span></div>
            <div>mode: <span className="text-[var(--muted)]">QUERY</span></div>
          </div>
        </div>
      </div>

      <div className="sticky top-[76px] z-10 flex gap-2 flex-wrap items-center p-2.5 bg-[rgba(8,8,10,0.97)] border border-[var(--border)] backdrop-blur-md mb-4">
        <div className="text-[10px] text-[var(--dim)] uppercase tracking-widest mr-1 hidden md:block">&gt; filters</div>
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dim)]" />
          <input
            type="text"
            placeholder="grep id|title|topic|company..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setShownCount(ITEMS_PER_PAGE); }}
            className="w-full pl-9 pr-3 py-2 border border-[var(--border)] bg-[#0a0a0c] text-[13px] outline-none"
          />
        </div>

        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setShownCount(ITEMS_PER_PAGE); }} className="px-3 py-2 border border-[var(--border)] bg-[#0a0a0c] text-[12px] max-w-[160px]">
          <option value="all">diff: all</option>
          <option value="Easy">diff: easy</option>
          <option value="Medium">diff: medium</option>
          <option value="Hard">diff: hard</option>
        </select>

        <select value={topic} onChange={(e) => { setTopic(e.target.value); setShownCount(ITEMS_PER_PAGE); }} className="px-3 py-2 border border-[var(--border)] bg-[#0a0a0c] text-[12px] max-w-[170px]">
          <option value="all">topic: all</option>
          {topics.map((t) => (<option key={t} value={t}>topic: {t}</option>))}
        </select>

        <select value={company} onChange={(e) => { setCompany(e.target.value); setShownCount(ITEMS_PER_PAGE); }} className="px-3 py-2 border border-[var(--border)] bg-[#0a0a0c] text-[12px] max-w-[170px]">
          <option value="all">company: all</option>
          {companies.map((c) => (<option key={c.name} value={c.name}>co: {c.name}</option>))}
        </select>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setShownCount(ITEMS_PER_PAGE); }} className="px-3 py-2 border border-[var(--border)] bg-[#0a0a0c] text-[12px]">
          <option value="all">status: all</option>
          <option value="reviewed">status: reviewed</option>
          <option value="not">status: not_reviewed</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 border border-[var(--border)] bg-[#0a0a0c] text-[12px]">
          <option value="id">sort: id</option>
          <option value="freq">sort: freq</option>
        </select>

        <button
          onClick={() => { setPremium(!premium); setShownCount(ITEMS_PER_PAGE); }}
          className={cn(
            "px-3 py-2 border text-[12px] font-semibold transition-colors uppercase tracking-wide",
            premium
              ? "bg-[#e5e5e7] text-[#050505] border-[#e5e5e7]"
              : "bg-[#0a0a0c] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
          )}
        >
          premium
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { label: "SHOWN", value: formatNumber(filtered.length), color: "text-[var(--text)]" },
          { label: "EASY", value: filtered.filter((p) => p.difficulty === "Easy").length, color: "text-[#d4d4d8]" },
          { label: "MED", value: filtered.filter((p) => p.difficulty === "Medium").length, color: "text-[#a1a1aa]" },
          { label: "HARD", value: filtered.filter((p) => p.difficulty === "Hard").length, color: "text-[#71717a]" },
          { label: "REVIEWED", value: reviewedCount, color: "text-[var(--text)]" },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--border)] bg-[var(--panel)] px-3 py-2 min-w-[90px]">
            <div className={cn("text-[18px] leading-none font-[family-name:var(--font-terminal)]", s.color)}>{s.value}</div>
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-[var(--border)] overflow-hidden bg-[#080809]">
        <div className="grid grid-cols-[60px_1fr_70px_80px_110px_120px] items-center gap-2.5 px-4 bg-[#0f0f12] min-h-[38px] text-[10px] text-[var(--muted)] uppercase tracking-[0.16em] border-b border-[var(--border)]">
          <span>ID</span>
          <span>TITLE / TAGS</span>
          <span>SOL</span>
          <span>FREQ</span>
          <span>DIFF</span>
          <span>STATE</span>
        </div>

        {shown.length === 0 ? (
          <div className="p-10 text-center text-[var(--muted)] text-[13px]">[NO_MATCH] no records for current query.</div>
        ) : (
          shown.map((p, i) => {
            const hasSolution = isCurated(p.slug);
            const state = mounted ? userStates[p.slug] : undefined;
            const isReviewed = state?.status === "reviewed" || state?.status === "mastered";
            const comps = (p.companies || []).slice(0, 3).map((c) => c.name).join(", ");

            return (
              <div
                key={p.id}
                className="grid grid-cols-[60px_1fr_70px_80px_110px_120px] items-center gap-2.5 px-4 border-b border-[var(--border)] min-h-[52px] hover:bg-[#17171c] cursor-pointer transition-colors"
                style={{ animation: `fadeIn 0.2s ease both`, animationDelay: `${Math.min(i * 2, 80)}ms` }}
                onClick={() => router.push(`/problems/${p.slug}`)}
              >
                <span className="flex items-center gap-1.5 font-bold text-[12px] text-[var(--dim)]">
                  {p.paidOnly && <Crown size={12} className="text-[#a1a1aa] flex-none" />}
                  #{p.id}
                </span>
                <span className="min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--text)] truncate">{p.title}</div>
                  <div className="text-[11px] text-[var(--dim)] mt-0.5 truncate">
                    {(p.topics || []).slice(0, 4).map((x) => x.name || x).join(" ? ")}
                    {comps && <span className="text-[var(--muted)]"> ? {comps}</span>}
                  </div>
                </span>
                <span className="text-[11px] text-[var(--muted)] font-semibold">
                  {hasSolution ? "YES" : ""}
                </span>
                <span className="text-[12px] text-[var(--muted)]">
                  {p.askedBy ? `+${p.askedBy}` : "--"}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 border w-fit uppercase tracking-wide",
                    difficultyBg(p.difficulty),
                    p.difficulty === "Easy"
                      ? "text-[#d4d4d8]"
                      : p.difficulty === "Medium"
                      ? "text-[#a1a1aa]"
                      : "text-[#71717a]"
                  )}
                >
                  {p.difficulty}
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleReview(p.slug)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-semibold border transition-colors uppercase tracking-wide inline-flex items-center gap-1",
                      isReviewed
                        ? "bg-[#e5e5e7] text-[#050505] border-[#e5e5e7]"
                        : "bg-transparent text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--border-bright)]"
                    )}
                  >
                    {isReviewed ? (<><CheckCircle2 size={12} /> DONE</>) : "MARK"}
                  </button>
                </span>
              </div>
            );
          })
        )}

        {shownCount < filtered.length && (
          <div
            className="text-center py-3 cursor-pointer text-[12px] text-[var(--text)] bg-[#0f0f12] hover:bg-[#17171c] border-t border-[var(--border)] font-semibold uppercase tracking-widest"
            onClick={() => setShownCount((c) => c + ITEMS_PER_PAGE)}
          >
            [LOAD_MORE] showing {shownCount} / {formatNumber(filtered.length)}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
