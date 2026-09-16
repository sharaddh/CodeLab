import Link from "next/link";
import { cn } from "@/lib/utils";

interface CompanyTagProps {
  name: string;
  count?: number;
  href?: string;
  className?: string;
}

const companyColors: Record<string, string> = {
  Google: "bg-[var(--blue)]/10 text-[var(--blue)] border-[var(--blue)]/20",
  Amazon: "bg-[var(--amber)]/10 text-[var(--amber)] border-[var(--amber)]/20",
  Meta: "bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--cyan)]/20",
  Facebook: "bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--cyan)]/20",
  Microsoft: "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20",
  Apple: "bg-[var(--muted)]/10 text-[var(--muted)] border-[var(--muted)]/20",
  Netflix: "bg-[var(--red)]/10 text-[var(--red)] border-[var(--red)]/20",
  Bloomberg: "bg-[var(--violet)]/10 text-[var(--violet)] border-[var(--violet)]/20",
  Uber: "bg-[#6366f1]/10 text-[#818cf8] border-[#6366f1]/20",
  Airbnb: "bg-[var(--red)]/10 text-[var(--red)] border-[var(--red)]/20",
};

function getColor(name: string): string {
  if (companyColors[name]) return companyColors[name];
  // Generate consistent color from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const colors = [
    "bg-[var(--violet)]/10 text-[var(--violet)] border-[var(--violet)]/20",
    "bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--cyan)]/20",
    "bg-[var(--amber)]/10 text-[var(--amber)] border-[var(--amber)]/20",
    "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20",
    "bg-[var(--blue)]/10 text-[var(--blue)] border-[var(--blue)]/20",
    "bg-[var(--red)]/10 text-[var(--red)] border-[var(--red)]/20",
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function CompanyTag({ name, count, href, className }: CompanyTagProps) {
  const colorClass = getColor(name);
  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold",
        colorClass,
        href && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    >
      {name}
      {count !== undefined && (
        <span className="text-[9px] opacity-60 font-mono">{count}</span>
      )}
    </span>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
