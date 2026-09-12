"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Building2, Crown, Flame, CheckCircle, User, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/favorites", label: "Favorites", icon: Flame },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center gap-5 px-5 h-[52px] bg-[#0d1117]/90 border-b border-[var(--border)] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[15px] text-white whitespace-nowrap">
        <div className="w-[30px] h-[30px] rounded-lg grid place-items-center bg-[#1e293b] border border-[#334155] text-[var(--amber)]">
          <Code2 size={16} />
        </div>
        LeetCode <span className="text-[var(--amber)]">Revision Lab</span>
      </Link>

      <div className="flex gap-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-3.5 h-[52px] text-[13.5px] font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors",
              pathname.startsWith(href)
                ? "text-[var(--amber)] border-[var(--amber)]"
                : "text-[#a1a1aa] border-transparent hover:text-white"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/problems?random=1"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#e2e8f0] bg-[#1e293b] border border-[var(--border)] rounded-lg hover:bg-[#334155] transition-colors"
        >
          <Shuffle size={14} />
          Random
        </Link>
      </div>
    </nav>
  );
}
