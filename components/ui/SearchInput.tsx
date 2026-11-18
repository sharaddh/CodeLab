"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  autoFocus = false,
  onKeyDown,
  className,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (v: string) => {
    setLocal(v);
    clearTimeout(timerRef.current ?? undefined);
    timerRef.current = setTimeout(() => onChange(v), debounceMs);
  };

  const clear = () => {
    setLocal("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
      <input
        ref={inputRef}
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-8 pr-8 py-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-[13px] placeholder:text-[#475569] focus:outline-none focus:border-[var(--muted)]/50 focus:ring-1 focus:ring-[var(--muted)]/25 transition-colors"
      />
      {local && (
        <button
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[#1a2332] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
