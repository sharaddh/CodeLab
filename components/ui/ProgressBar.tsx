import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "green" | "amber" | "red" | "violet" | "cyan";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const colorMap = {
  green: "bg-[var(--green)]",
  amber: "bg-[var(--amber)]",
  red: "bg-[var(--red)]",
  violet: "bg-[var(--violet)]",
  cyan: "bg-[var(--cyan)]",
};

const sizeMap = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2.5",
};

export function ProgressBar({
  value,
  max = 100,
  color = "violet",
  size = "md",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-full rounded-full bg-[#1a2332] overflow-hidden", sizeMap[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-mono text-[var(--muted)] tabular-nums w-[36px] text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
