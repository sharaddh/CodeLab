"use client";
import { create } from "zustand";

type BottomPanel = "tests" | "console" | "debugger" | "visualizer" | "notes" | "attempts";

interface UIState {
  sidebarOpen: boolean;
  bottomPanel: BottomPanel;
  commandPaletteOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setBottomPanel: (panel: BottomPanel) => void;
  toggleCommandPalette: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  bottomPanel: "tests",
  commandPaletteOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setBottomPanel: (panel) => set({ bottomPanel: panel }),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
}));
