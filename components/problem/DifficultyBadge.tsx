import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "Easy" | "Medium" | "Hard" | string;
  size?: "sm" | "md";
  className?: string;
}

const styles = {
  Easy: "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20",
  Medium: "bg-[var(--amber)]/10 text-[var(--amber)] border-[var(--amber)]/20",
  Hard: "bg-[var(--red)]/10 text-[var(--red)] border-[var(--red)]/20",
};

const sizeStyles = {
  sm: "text-[9px] px-1 py-px",
  md: "text-[10px] px-1.5 py-0.5",
};

export function DifficultyBadge({ difficulty, size = "md", className }: DifficultyBadgeProps) {
  const color = styles[difficulty as keyof typeof styles] || styles.Easy;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-bold border leading-tight",
        color,
        sizeStyles[size],
        className
      )}
    >
      {difficulty}
    </span>
  );
}
