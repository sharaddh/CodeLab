"use client";

import { useMemo } from "react";
import problemsData from "@/data/problems.json";
import companiesData from "@/data/companies.json";
import solutionsData from "@/data/solutions.json";
import type { Problem, Company } from "@/lib/types";

const allProblems = problemsData as Problem[];
const allCompanies = companiesData as Company[];
const solutionSlugs = new Set(solutionsData.map((s: { slug: string }) => s.slug));

export function useProblems() {
  return { problems: allProblems, companies: allCompanies, solutionSlugs };
}

export function useFilteredProblems(filters: {
  q: string;
  difficulty: string;
  topic: string;
  company: string;
  status: string;
  sort: string;
  premium: boolean;
  userStates: Record<string, unknown>;
}) {
  const { problems } = useProblems();

  return useMemo(() => {
    let list = [...problems];

    if (filters.difficulty !== "all") {
      list = list.filter((p) => p.difficulty === filters.difficulty);
    }
    if (filters.topic !== "all") {
      list = list.filter((p) =>
        (p.topics || []).some((x) => String(x.name || x) === filters.topic)
      );
    }
    if (filters.company !== "all") {
      list = list.filter((p) =>
        (p.companies || []).some(
          (c) => c.name.toLowerCase() === filters.company.toLowerCase()
        )
      );
    }
    if (filters.premium) {
      list = list.filter((p) => p.paidOnly);
    }
    if (filters.status === "reviewed") {
      list = list.filter((p) => {
        const state = filters.userStates[p.slug] as { status?: string } | undefined;
        return state?.status === "reviewed" || state?.status === "mastered";
      });
    }
    if (filters.status === "not") {
      list = list.filter((p) => {
        const state = filters.userStates[p.slug] as { status?: string } | undefined;
        return !state?.status || state.status === "unseen";
      });
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((p) =>
        `${p.id} ${p.title} ${(p.topics || []).map((x) => x.name || x).join(" ")} ${(p.companies || []).map((c) => c.name).join(" ")}`
          .toLowerCase()
          .includes(q)
      );
    }

    if (filters.sort === "freq") {
      list.sort(
        (a, b) =>
          (b.askedBy - a.askedBy) ||
          (b.frequency - a.frequency) ||
          (Number(a.id) - Number(b.id))
      );
    } else {
      list.sort((a, b) => Number(a.id) - Number(b.id));
    }

    return list;
  }, [problems, filters]);
}

export function useTopics(): string[] {
  const { problems } = useProblems();
  return useMemo(() => {
    const topicSet = new Set<string>();
    for (const p of problems) {
      for (const t of p.topics || []) {
        topicSet.add(String(t.name || t));
      }
    }
    return [...topicSet].sort();
  }, [problems]);
}

export function isCurated(slug: string): boolean {
  return solutionSlugs.has(slug);
}
