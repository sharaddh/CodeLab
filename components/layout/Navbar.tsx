"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, FolderGit2, Building2, Star, User, Shuffle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/problems", label: "problems", icon: FolderGit2 },
  { href: "/companies", label: "companies", icon: Building2 },
  { href: "/favorites", label: "favorites", icon: Star },
  { href: "/profile", label: "profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(3,8,6,0.92)] backdrop-blur-md">
      <div className="flex items-center gap-1 px-3 h-[30px] border-b border-[var(--border)] bg-[#050c16] text-[10px] tracking-[0.18em] text-[var(--muted)] uppercase">
        <span className="text-[var(--green)]">●</span>
        <span className="text-[var(--amber)]">●</span>
        <span className="text-[var(--red)]">●</span>
        <span className="ml-2">lc-revision-lab — bash — 80x24</span>
        <span className="ml-auto flex items-center gap-1 text-[var(--muted)]"><Activity size={11} /> session: active</span>
      </div>
      <div className="flex items-center gap-4 px-4 h-[46px]">
        <Link href="/" className="flex items-center gap-2 font-bold text-[14px] text-[var(--text)] whitespace-nowrap group">
          <div className="w-[28px] h-[28px] grid place-items-center border border-[var(--border-bright)] bg-[#0a111b] text-[var(--green)] shadow-[0_0_10px_rgba(255,255,255,0.06)]">
            <Terminal size={15} />
          </div>
          <span className="font-[family-name:var(--font-terminal)] text-[22px] leading-none tracking-wider">
            <span className="text-[var(--muted)]">root@</span>lc-lab<span className="text-[var(--muted)]">:~$</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 ml-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 h-[30px] text-[12px] font-semibold inline-flex items-center gap-1.5 border transition-all uppercase tracking-wide",
                  active
                    ? "text-[#021018] bg-[#e5e5e7] border-[#e5e5e7] shadow-[0_0_10px_rgba(255,255,255,0.08)]"
                    : "text-[var(--muted)] border-transparent hover:text-[var(--text)] hover:border-[var(--border)] hover:bg-[#0b1420]"
                )}
              >
                <Icon size={13} />
                ./{label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden md:inline text-[11px] text-[var(--dim)]">mode: <span className="text-[var(--text)]">REVISION</span></span>
          <Link
            href="/problems?random=1"
            className="flex items-center gap-1.5 px-3 h-[30px] text-[12px] font-semibold text-[var(--amber)] bg-[#0f0d05] border border-[rgba(255,176,32,0.35)] hover:bg-[#1d1406] hover:shadow-[0_0_10px_rgba(255,176,32,0.15)] transition-all uppercase tracking-wide"
          >
            <Shuffle size={13} />
            rand --pick
          </Link>
        </div>
      </div>
    </nav>
  );
}
