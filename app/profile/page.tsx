"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  User, Target, Star, CheckCircle2, Flame, BarChart3, Clock3, Terminal, TrendingUp, ArrowRight,
} from "lucide-react";
import problemsData from "@/data/problems.json";
import { useProblemStore } from "@/lib/stores/problem-store";
import { cn, difficultyBg } from "@/lib/utils";
import type { Problem, ProblemStatus } from "@/lib/types";

const allProblems = problemsData as Problem[];

interface AttemptEntry {
  timestamp: number;
  language?: string;
  result?: string;
  notes?: string;
  slug: string;
  title: string;
  difficulty?: string;
}

function fmtDate(ts?: number) {
  if (!ts) return "never";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "unknown";
  }
}

function relTime(ts?: number) {
  if (!ts) return "--";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function ProfilePage() {
  const { userStates, loadFromStorage } = useProblemStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  const data = useMemo(() => {
    const states = Object.entries(userStates || {});
    const bySlug = new Map(allProblems.map((p) => [p.slug, p]));

    const solvedSet = new Set<string>();
    const reviewedSet = new Set<string>();
    const masteredSet = new Set<string>();
    let favorites = 0;
    let attemptedCount = 0;
    let lastActive = 0;
    const allAttempts: AttemptEntry[] = [];

    for (const [slug, s] of states) {
      const st = s.status as ProblemStatus | undefined;
      if (st === "solved" || st === "reviewed" || st === "mastered") solvedSet.add(slug);
      if (st === "reviewed" || st === "mastered") reviewedSet.add(slug);
      if (st === "mastered") masteredSet.add(slug);
      if (s.favorite) favorites += 1;
      if ((s.attempts?.length || 0) > 0) attemptedCount += 1;

      const p = bySlug.get(slug);
      for (const a of (s.attempts || [])) {
        const ts = (a as any).timestamp || 0;
        if (ts > lastActive) lastActive = ts;
        allAttempts.push({
          timestamp: ts,
          language: (a as any).language,
          result: (a as any).result,
          notes: (a as any).notes,
          slug,
          title: p?.title || slug,
          difficulty: p?.difficulty,
        });
      }
      if ((s.revision?.lastReview || 0) > lastActive) lastActive = s.revision?.lastReview || lastActive;
    }

    const solved = solvedSet.size;
    const reviewed = reviewedSet.size;
    const mastered = masteredSet.size;
    const totalAttempts = allAttempts.length;
    const passedAttempts = allAttempts.filter((a) => a.result === "passed").length;
    const passRate = totalAttempts ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    const diffStats = (["Easy", "Medium", "Hard"] as const).map((d) => {
      const total = allProblems.filter((p) => p.difficulty === d).length;
      const done = allProblems.filter((p) => p.difficulty === d && solvedSet.has(p.slug)).length;
      return { label: d.toUpperCase(), total, done, pct: total ? (done / total) * 100 : 0 };
    });

    const topicMap = new Map<string, { total: number; done: number }>();
    for (const p of allProblems) {
      const isDone = solvedSet.has(p.slug);
      for (const t of (p.topics || [])) {
        const name = (t as any).name || (t as any);
        if (!name) continue;
        const cur = topicMap.get(name) || { total: 0, done: 0 };
        cur.total += 1;
        if (isDone) cur.done += 1;
        topicMap.set(name, cur);
      }
    }
    const topics = Array.from(topicMap.entries())
      .map(([name, v]) => ({ name, ...v, pct: v.total ? (v.done / v.total) * 100 : 0 }))
      .sort((a, b) => (b.done - a.done) || (b.total - a.total))
      .slice(0, 8);

    const recentAttempts = [...allAttempts].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    const completion = allProblems.length ? (solved / allProblems.length) * 100 : 0;
    const rank = mastered >= 50 || solved >= 300 ? "ELITE" : solved >= 120 ? "ADVANCED" : solved >= 40 ? "OPERATOR" : solved >= 10 ? "APPRENTICE" : "INITIATE";

    return {
      solved, reviewed, mastered, favorites, attemptedCount,
      totalAttempts, passedAttempts, passRate, lastActive,
      diffStats, topics, recentAttempts, completion, rank,
      touched: states.length,
    };
  }, [userStates]);

  const completion = mounted ? data.completion : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, completion)) / 100) * circ;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 font-mono">
      <div className="mb-5 border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] text-[var(--muted)] uppercase tracking-widest">
          <span className="text-[#d4d4d8]">*</span><span className="text-[#a1a1aa]">*</span><span className="text-[#71717a]">*</span>
          <span className="ml-2">~/profile -- operator_dossier</span>
          <span className="ml-auto text-[var(--dim)]">session: {mounted ? "mounted" : "loading"}</span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-[120px] h-[120px] flex-none">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#1a1a1f" strokeWidth="8" />
                <circle cx="60" cy="60" r={r} fill="none" stroke="#e4e4e7" strokeWidth="8" strokeLinecap="butt"
                  strokeDasharray={`${dash} ${circ - dash}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[22px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)]">{completion.toFixed(1)}%</div>
                <div className="text-[9px] text-[var(--dim)] uppercase tracking-widest mt-1">complete</div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[12px] text-[var(--muted)] mb-1"><span className="text-[var(--text)]">user@lc-lab</span>:<span className="text-[var(--muted)]">~</span>$ whoami --verbose</div>
              <h1 className="text-[34px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)] tracking-wider flex items-center gap-2"><User size={22} /> OPERATOR_PROFILE</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="border border-[var(--border-bright)] bg-[#17171c] px-2 py-0.5 text-[var(--text)] uppercase tracking-widest">rank: {mounted ? data.rank : "..."}</span>
                <span className="text-[var(--muted)]">nodes_solved: <span className="text-[var(--text)]">{mounted ? data.solved : 0}</span>/{allProblems.length}</span>
                <span className="text-[var(--muted)]">tracked: <span className="text-[var(--text)]">{mounted ? data.touched : 0}</span></span>
              </div>
              <div className="mt-2 text-[11px] text-[var(--dim)] flex items-center gap-2"><Clock3 size={12} /> last_active: <span className="text-[var(--muted)]">{mounted ? fmtDate(data.lastActive) : "--"}</span> <span className="text-[var(--dim)]">({mounted ? relTime(data.lastActive) : "--"})</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:w-[320px]">
            {[
              { k: "SOLVED", v: mounted ? data.solved : 0, icon: CheckCircle2 },
              { k: "REVIEWED", v: mounted ? data.reviewed : 0, icon: Target },
              { k: "MASTERED", v: mounted ? data.mastered : 0, icon: Flame },
              { k: "FAVORITES", v: mounted ? data.favorites : 0, icon: Star },
            ].map((c) => (
              <div key={c.k} className="border border-[var(--border)] bg-[#0a0a0c] p-2.5 hover:border-[var(--border-bright)] transition-colors">
                <div className="flex items-center justify-between text-[10px] text-[var(--dim)] uppercase tracking-widest"><span>{c.k}</span><c.icon size={13} className="text-[var(--muted)]" /></div>
                <div className="text-[26px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)] mt-1">{c.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <section className="lg:col-span-2 border border-[var(--border)] bg-[var(--panel)]">
          <div className="px-3 py-2 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><BarChart3 size={13} /> &gt; difficulty_matrix --progress</div>
          <div className="p-4 space-y-4">
            {(mounted ? data.diffStats : [
              { label: "EASY", total: 0, done: 0, pct: 0 },
              { label: "MEDIUM", total: 0, done: 0, pct: 0 },
              { label: "HARD", total: 0, done: 0, pct: 0 },
            ]).map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[var(--text)] tracking-widest">[{d.label}]</span>
                  <span className="text-[var(--muted)]"><span className="text-[var(--text)]">{d.done}</span> / {d.total} <span className="text-[var(--dim)]">({d.pct.toFixed(1)}%)</span></span>
                </div>
                <div className="h-2.5 bg-[#0a0a0c] border border-[var(--border)] overflow-hidden">
                  <div className="h-full bg-[#d4d4d8]" style={{ width: `${Math.min(100, d.pct)}%`, opacity: d.label === "EASY" ? 0.95 : d.label === "MEDIUM" ? 0.7 : 0.45 }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-[var(--border)] grid grid-cols-3 gap-2 text-[11px]">
              <div className="border border-[var(--border)] bg-[#0a0a0c] p-2"><div className="text-[var(--dim)] uppercase tracking-widest">attempted</div><div className="text-[18px] font-[family-name:var(--font-terminal)] text-[var(--text)]">{mounted ? data.attemptedCount : 0}</div></div>
              <div className="border border-[var(--border)] bg-[#0a0a0c] p-2"><div className="text-[var(--dim)] uppercase tracking-widest">touched</div><div className="text-[18px] font-[family-name:var(--font-terminal)] text-[var(--text)]">{mounted ? data.touched : 0}</div></div>
              <div className="border border-[var(--border)] bg-[#0a0a0c] p-2"><div className="text-[var(--dim)] uppercase tracking-widest">coverage</div><div className="text-[18px] font-[family-name:var(--font-terminal)] text-[var(--text)]">{completion.toFixed(1)}%</div></div>
            </div>
          </div>
        </section>

        <section className="border border-[var(--border)] bg-[var(--panel)]">
          <div className="px-3 py-2 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><TrendingUp size={13} /> &gt; attempt_telemetry</div>
          <div className="p-4 space-y-3 text-[12px]">
            {!mounted ? (
              <div className="text-[var(--dim)]">loading...</div>
            ) : (
              <>
                <div className="flex items-center justify-between"><span className="text-[var(--muted)]">total_attempts</span><span className="text-[var(--text)] font-bold">{data.totalAttempts}</span></div>
                <div className="flex items-center justify-between"><span className="text-[var(--muted)]">passed</span><span className="text-[var(--text)] font-bold">{data.passedAttempts}</span></div>
                <div className="flex items-center justify-between"><span className="text-[var(--muted)]">pass_rate</span><span className="text-[var(--text)] font-bold">{data.passRate}%</span></div>
                <div className="h-2 bg-[#0a0a0c] border border-[var(--border)]"><div className="h-full bg-[#e4e4e7]" style={{ width: `${data.passRate}%` }} /></div>
                <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
                  <div>identity: <span className="text-[var(--text)]">local_user</span></div>
                  <div>storage: <span className="text-[var(--text)]">browser_state</span></div>
                  <div>mode: <span className="text-[var(--text)]">offline_first</span></div>
                </div>
                <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                  <Link href="/problems" className="flex items-center justify-between border border-[var(--border)] px-2.5 py-1.5 hover:border-[var(--border-bright)] hover:bg-[#17171c] text-[11px] uppercase tracking-wide text-[var(--text)]">open_problems <ArrowRight size={12} /></Link>
                  <Link href="/favorites" className="flex items-center justify-between border border-[var(--border)] px-2.5 py-1.5 hover:border-[var(--border-bright)] hover:bg-[#17171c] text-[11px] uppercase tracking-wide text-[var(--text)]">open_favorites <ArrowRight size={12} /></Link>
                  <Link href="/settings" className="flex items-center justify-between border border-[var(--border)] px-2.5 py-1.5 hover:border-[var(--border-bright)] hover:bg-[#17171c] text-[11px] uppercase tracking-wide text-[var(--text)]">system_settings <ArrowRight size={12} /></Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="border border-[var(--border)] bg-[var(--panel)]">
          <div className="px-3 py-2 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><Terminal size={13} /> &gt; topic_focus --top_coverage</div>
          <div className="p-4">
            {!mounted ? (
              <div className="text-[var(--dim)] text-[12px]">loading...</div>
            ) : data.topics.length === 0 ? (
              <div className="text-[12px] text-[var(--muted)] border border-dashed border-[var(--border)] p-4">[EMPTY] no topic progress yet. solve problems to populate coverage telemetry.</div>
            ) : (
              <div className="space-y-3">
                {data.topics.map((t) => (
                  <div key={t.name}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[var(--text)] truncate pr-2">{t.name}</span>
                      <span className="text-[var(--muted)] flex-none">{t.done}/{t.total} <span className="text-[var(--dim)]">({t.pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-[#0a0a0c] border border-[var(--border)]"><div className="h-full bg-[#a1a1aa]" style={{ width: `${Math.min(100, t.pct)}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border border-[var(--border)] bg-[var(--panel)]">
          <div className="px-3 py-2 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><Clock3 size={13} /> &gt; tail ./activity.log</div>
          <div className="p-3">
            {!mounted ? (
              <div className="text-[var(--dim)] text-[12px]">loading...</div>
            ) : data.recentAttempts.length === 0 ? (
              <div className="text-[12px] text-[var(--muted)] border border-dashed border-[var(--border)] p-4">[EMPTY] no attempts recorded. run or debug a problem to generate activity events.</div>
            ) : (
              <div className="space-y-1.5 max-h-[320px] overflow-auto pr-1">
                {data.recentAttempts.map((a, i) => (
                  <Link key={`${a.slug}-${a.timestamp}-${i}`} href={`/problems/${a.slug}`} className="block border border-[var(--border)] bg-[#0a0a0c] px-2.5 py-2 hover:border-[var(--border-bright)] hover:bg-[#17171c] transition-colors">
                    <div className="flex items-center justify-between gap-2 text-[10px] text-[var(--dim)] uppercase tracking-wide">
                      <span>{relTime(a.timestamp)}</span>
                      <span>{a.result || "attempt"}</span>
                    </div>
                    <div className="text-[12px] text-[var(--text)] mt-0.5 truncate">{a.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                      {a.difficulty && (
                        <span className={cn("px-1.5 py-0 border uppercase tracking-wide", difficultyBg(a.difficulty as any),
                          a.difficulty === "Easy" ? "text-[#d4d4d8]" : a.difficulty === "Medium" ? "text-[#a1a1aa]" : "text-[#71717a]"
                        )}>{a.difficulty}</span>
                      )}
                      {a.language && <span className="text-[var(--muted)]">lang={a.language}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
