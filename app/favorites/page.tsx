"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ArrowRight } from "lucide-react";
import problemsData from "@/data/problems.json";
import { useProblemStore } from "@/lib/stores/problem-store";
import { cn, difficultyBg } from "@/lib/utils";
import type { Problem } from "@/lib/types";

const allProblems = problemsData as Problem[];

export default function FavoritesPage() {
  const router = useRouter();
  const { userStates, loadFromStorage } = useProblemStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  const favoriteSlugs = mounted
    ? Object.entries(userStates)
        .filter(([, s]) => s.favorite)
        .map(([slug]) => slug)
    : [];

  const favoriteProblems = allProblems.filter((p) => favoriteSlugs.includes(p.slug));

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 font-mono">
      <div className="mb-5 border border-[var(--border)] bg-[var(--panel)]">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] text-[var(--muted)] uppercase tracking-widest">
          <span className="text-[#a1a1aa]">*</span><span className="ml-2">~/favorites -- starred.list</span>
        </div>
        <div className="p-4">
          <div className="text-[12px] text-[var(--muted)] mb-1"><span className="text-[var(--text)]">user@lc-lab</span>:<span className="text-[var(--muted)]">~</span>$ cat ./favorites</div>
          <h1 className="text-[30px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)] tracking-wider flex items-center gap-2"><Star size={22} /> STARRED_PROBLEMS</h1>
          <p className="text-[12px] text-[var(--muted)] mt-1">Persisted local bookmarks. Count: {favoriteProblems.length}</p>
        </div>
      </div>

      {favoriteProblems.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] bg-[var(--panel)] p-10 text-center">
          <div className="text-[var(--muted)] text-[13px]">[EMPTY] no starred entries found.</div>
          <div className="text-[11px] text-[var(--dim)] mt-2">hint: run <span className="text-[var(--text)]">star &lt;problem&gt;</span> from a problem workspace.</div>
        </div>
      ) : (
        <div className="border border-[var(--border)] overflow-hidden bg-[#080809]">
          <div className="grid grid-cols-[40px_70px_1fr_110px_40px] items-center gap-2 px-4 py-2 bg-[#0f0f12] border-b border-[var(--border)] text-[10px] uppercase tracking-widest text-[var(--muted)]">
            <span>*</span><span>ID</span><span>TITLE</span><span>DIFF</span><span></span>
          </div>
          {favoriteProblems.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/problems/${p.slug}`)}
              className="grid grid-cols-[40px_70px_1fr_110px_40px] items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[#17171c] cursor-pointer"
            >
              <Star size={14} className="text-[#d4d4d8] fill-[#d4d4d8]" />
              <span className="text-[12px] font-mono text-[var(--dim)]">#{p.id}</span>
              <span className="text-[13px] font-semibold text-[var(--text)]">{p.title}</span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 border w-fit uppercase tracking-wide", difficultyBg(p.difficulty),
                p.difficulty === "Easy" ? "text-[#d4d4d8]" : p.difficulty === "Medium" ? "text-[#a1a1aa]" : "text-[#71717a]"
              )}>
                {p.difficulty}
              </span>
              <ArrowRight size={14} className="text-[var(--muted)]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
