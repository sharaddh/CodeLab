"use client";
import { create } from "zustand";
import type { TraceEvent } from "@/lib/types";

interface DebuggerState {
  trace: TraceEvent[];
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  isDebugging: boolean;
  setTrace: (events: TraceEvent[]) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  startDebugging: () => void;
  stopDebugging: () => void;
  restart: () => void;
  getCurrentEvent: () => TraceEvent | null;
}

export const useDebuggerStore = create<DebuggerState>((set, get) => ({
  trace: [],
  currentStep: 0,
  isPlaying: false,
  speed: 1,
  isDebugging: false,
  setTrace: (events) => set({ trace: events, currentStep: 0, isDebugging: true }),
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.trace.length - 1),
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),
  startDebugging: () => set({ isDebugging: true, currentStep: 0 }),
  stopDebugging: () =>
    set({ isDebugging: false, isPlaying: false, trace: [], currentStep: 0 }),
  restart: () => set({ currentStep: 0, isPlaying: false }),
  getCurrentEvent: () => {
    const { trace, currentStep } = get();
    return trace[currentStep] ?? null;
  },
}));
