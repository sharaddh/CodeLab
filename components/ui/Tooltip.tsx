"use client";

import { useState, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ children, content, side = "top", className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    clearTimeout(timeoutRef.current ?? undefined);
    timeoutRef.current = setTimeout(() => setOpen(true), 300);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current ?? undefined);
    setOpen(false);
  };

  const pos =
    side === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
      : side === "bottom"
        ? "top-full left-1/2 -translate-x-1/2 mt-2"
        : side === "left"
          ? "right-full top-1/2 -translate-y-1/2 mr-2"
          : "left-full top-1/2 -translate-y-1/2 ml-2";

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1 rounded bg-[#0d1117] border border-[var(--border)] text-[11px] text-[var(--text)] whitespace-nowrap pointer-events-none shadow-lg",
            pos,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
