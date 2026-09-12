export function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c)
  );
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function difficultyColor(d: string): string {
  switch (d) {
    case "Easy": return "text-emerald-400";
    case "Medium": return "text-amber-400";
    case "Hard": return "text-red-400";
    default: return "text-zinc-400";
  }
}

export function difficultyBg(d: string): string {
  switch (d) {
    case "Easy": return "bg-emerald-500/10 border-emerald-500/30";
    case "Medium": return "bg-amber-500/10 border-amber-500/30";
    case "Hard": return "bg-red-500/10 border-red-500/30";
    default: return "bg-zinc-500/10 border-zinc-500/30";
  }
}
