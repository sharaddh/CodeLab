import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "easy" | "medium" | "hard" | "accent";
  className?: string;
}

const variants = {
  default: "bg-[#273247] text-[#e2e8f0]",
  easy: "bg-[var(--green)]/15 text-[var(--green)]",
  medium: "bg-[var(--amber)]/15 text-[var(--amber)]",
  hard: "bg-[var(--red)]/15 text-[var(--red)]",
  accent: "bg-[var(--violet)]/15 text-[var(--violet)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold leading-tight",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
