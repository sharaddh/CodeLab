import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-12 h-12 rounded-full bg-[#1a2332] flex items-center justify-center mb-3 text-[var(--muted)]">
        {icon}
      </div>
      <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">{title}</h3>
      {description && <p className="text-[13px] text-[var(--muted)] max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
