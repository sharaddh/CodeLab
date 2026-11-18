"use client";
import { create } from "zustand";

interface EditorState {
  language: "java" | "python" | "cpp";
  code: { java: string; python: string; cpp: string };
  fontSize: number;
  theme: string;
  setLanguage: (lang: "java" | "python" | "cpp") => void;
  setCode: (lang: "java" | "python" | "cpp", code: string) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: string) => void;
  getCurrentCode: () => string;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  language: "java",
  code: { java: "", python: "", cpp: "" },
  fontSize: 14,
  theme: "vs-dark",
  setLanguage: (lang) => set({ language: lang }),
  setCode: (lang, code) =>
    set((state) => ({ code: { ...state.code, [lang]: code } })),
  setFontSize: (size) => set({ fontSize: size }),
  setTheme: (theme) => set({ theme }),
  getCurrentCode: () => {
    const state = get();
    return state.code[state.language];
  },
}));
