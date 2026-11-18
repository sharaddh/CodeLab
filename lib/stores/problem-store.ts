"use client";
import { create } from "zustand";
import type { Problem, ProblemDetail, ProblemUserState, ProblemStatus, Attempt } from "@/lib/types";

const STORAGE_KEY = "lc-revision-lab-v2";

function loadUserStates(): Record<string, ProblemUserState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUserStates(states: Record<string, ProblemUserState>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

function getDefaultState(slug: string): ProblemUserState {
  return {
    slug,
    code: { java: "", python: "", cpp: "" },
    language: "java",
    notes: "",
    status: "unseen",
    favorite: false,
    attempts: [],
    revision: {
      nextReview: 0,
      interval: 1,
      confidence: 3,
      reviewCount: 0,
    },
  };
}

interface ProblemStore {
  currentProblem: Problem | null;
  currentDetail: ProblemDetail | null;
  userStates: Record<string, ProblemUserState>;
  setCurrentProblem: (problem: Problem | null) => void;
  setCurrentDetail: (detail: ProblemDetail | null) => void;
  getUserState: (slug: string) => ProblemUserState;
  updateUserState: (slug: string, updates: Partial<ProblemUserState>) => void;
  setStatus: (slug: string, status: ProblemStatus) => void;
  toggleFavorite: (slug: string) => void;
  setCode: (slug: string, lang: "java" | "python" | "cpp", code: string) => void;
  setNotes: (slug: string, notes: string) => void;
  addAttempt: (slug: string, attempt: Attempt) => void;
  loadFromStorage: () => void;
}

export const useProblemStore = create<ProblemStore>((set, get) => ({
  currentProblem: null,
  currentDetail: null,
  userStates: {},
  setCurrentProblem: (problem) => set({ currentProblem: problem }),
  setCurrentDetail: (detail) => set({ currentDetail: detail }),
  getUserState: (slug) => {
    const { userStates } = get();
    const state = userStates[slug] ?? getDefaultState(slug);
    return {
      ...getDefaultState(slug),
      ...state,
      code: { ...getDefaultState(slug).code, ...(state.code || {}) },
    };
  },
  updateUserState: (slug, updates) =>
    set((state) => {
      const existing = state.userStates[slug] ?? getDefaultState(slug);
      const updated = {
        ...getDefaultState(slug),
        ...existing,
        ...updates,
        code: {
          ...getDefaultState(slug).code,
          ...(existing.code || {}),
          ...(updates.code || {}),
        },
      };
      const newUserStates = { ...state.userStates, [slug]: updated };
      saveUserStates(newUserStates);
      return { userStates: newUserStates };
    }),
  setStatus: (slug, status) => {
    const { updateUserState } = get();
    updateUserState(slug, { status });
  },
  toggleFavorite: (slug) => {
    const { userStates } = get();
    const existing = userStates[slug] ?? getDefaultState(slug);
    const { updateUserState } = get();
    updateUserState(slug, { favorite: !existing.favorite });
  },
  setCode: (slug, lang, code) => {
    const { userStates } = get();
    const existing = userStates[slug] ?? getDefaultState(slug);
    const { updateUserState } = get();
    updateUserState(slug, {
      code: { ...existing.code, [lang]: code },
      language: lang,
    });
  },
  setNotes: (slug, notes) => {
    const { updateUserState } = get();
    updateUserState(slug, { notes });
  },
  addAttempt: (slug, attempt) => {
    const { userStates } = get();
    const existing = userStates[slug] ?? getDefaultState(slug);
    const { updateUserState } = get();
    updateUserState(slug, {
      attempts: [...existing.attempts, attempt],
    });
  },
  loadFromStorage: () => {
    set({ userStates: loadUserStates() });
  },
}));
