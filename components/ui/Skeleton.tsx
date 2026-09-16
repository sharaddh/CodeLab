import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({ className, count = 1, width, height, rounded = "md" }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-[#1a2332] border border-[var(--border)]/30",
            roundedMap[rounded],
            className
          )}
          style={{ width: width ?? "100%", height: height ?? 16 }}
        />
      ))}
    </div>
  );
}

export function ProblemRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[var(--border)]/50">
      <Skeleton width={32} height={16} rounded="sm" />
      <div className="flex-1 space-y-1.5">
        <Skeleton height={14} width="60%" rounded="sm" />
      </div>
      <Skeleton width={48} height={18} rounded="full" />
      <Skeleton width={24} height={16} rounded="sm" />
    </div>
  );
}
