"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Command } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import problemsData from "@/data/problems.json";
import type { Problem } from "@/lib/types";

const allProblems = problemsData as Problem[];

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  category: string;
}

function buildItems(): CommandItem[] {
  const items: CommandItem[] = [
    { id: "nav-home", label: "Dashboard", href: "/", category: "Navigation" },
    { id: "nav-problems", label: "All Problems", href: "/problems", category: "Navigation" },
    { id: "nav-companies", label: "Companies", href: "/companies", category: "Navigation" },
    { id: "nav-favorites", label: "Favorites", href: "/favorites", category: "Navigation" },
    { id: "nav-profile", label: "Profile", href: "/profile", category: "Navigation" },
    { id: "nav-settings", label: "Settings", href: "/settings", category: "Navigation" },
  ];

  for (const p of allProblems.slice(0, 200)) {
    items.push({
      id: `problem-${p.slug}`,
      label: p.title,
      description: `${p.id} · ${p.difficulty}`,
      href: `/problems/${p.slug}`,
      category: "Problems",
    });
  }

  return items;
}

const allItems = buildItems();

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 20);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIdx]) {
      navigate(filtered[selectedIdx].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.12 }}
            className="relative z-10 w-full max-w-lg mx-4 bg-[#0d1117] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <Search size={16} className="text-[var(--muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search problems, navigate..."
                className="flex-1 bg-transparent text-[var(--text)] text-[14px] placeholder:text-[#475569] focus:outline-none"
              />
              <kbd className="text-[10px] text-[var(--muted)] border border-[var(--border)] rounded px-1.5 py-0.5 bg-[#111827]">
                ESC
              </kbd>
            </div>
            <div className="max-h-[300px] overflow-y-auto py-1">
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-[13px] text-[var(--muted)]">
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}
              {filtered.slice(0, 15).map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                    i === selectedIdx ? "bg-[var(--violet)]/10" : "hover:bg-[#111827]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[var(--text)] truncate">{item.label}</div>
                    {item.description && (
                      <div className="text-[11px] text-[var(--muted)] truncate">{item.description}</div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#374151] bg-[#111827] px-1.5 py-0.5 rounded flex-shrink-0">
                    {item.category}
                  </span>
                  <ArrowRight size={12} className="text-[#374151] flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
