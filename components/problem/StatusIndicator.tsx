import { CheckCircle, Clock, Circle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "solved" | "reviewed" | "mastered" | "attempted" | "none";
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const config = {
  solved: { icon: CheckCircle, color: "text-[var(--green)]", label: "Solved" },
  reviewed: { icon: CheckCircle, color: "text-[var(--cyan)]", label: "Reviewed" },
  mastered: { icon: Zap, color: "text-[var(--violet)]", label: "Mastered" },
  attempted: { icon: Clock, color: "text-[var(--amber)]", label: "Attempted" },
  none: { icon: Circle, color: "text-[#374151]", label: "Not started" },
};

export function StatusIndicator({ status, size = 16, showLabel = false, className }: StatusIndicatorProps) {
  const { icon: Icon, color, label } = config[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon size={size} className={color} />
      {showLabel && <span className="text-[11px] font-semibold">{label}</span>}
    </span>
  );
}
