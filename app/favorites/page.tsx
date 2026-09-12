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
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-extrabold flex items-center gap-2">
          <Star className="text-[var(--amber)]" size={24} /> Favorites
        </h1>
        <p className="text-[var(--muted)] text-[13px] mt-1">Your starred problems</p>
      </div>

      {favoriteProblems.length === 0 ? (
        <div className="text-[var(--muted)] text-[14px] py-12 text-center">
          No favorites yet. Star problems to add them here.
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[#0a0f1a]">
          {favoriteProblems.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/problems/${p.slug}`)}
              className="flex items-center gap-4 px-4 py-3 border-b border-[#1a2332] hover:bg-[#111827] cursor-pointer"
            >
              <Star size={16} className="text-[var(--amber)] fill-[var(--amber)] flex-none" />
              <span className="text-[12px] font-mono text-[#64748b] w-[50px]">{p.id}</span>
              <span className="text-[14px] font-semibold text-white flex-1">{p.title}</span>
              <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full border", difficultyBg(p.difficulty),
                p.difficulty === "Easy" ? "text-emerald-400" : p.difficulty === "Medium" ? "text-amber-400" : "text-red-400"
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
