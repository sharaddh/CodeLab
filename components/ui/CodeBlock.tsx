"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxLines?: number;
  className?: string;
}

export function CodeBlock({
  code,
  language = "java",
  showLineNumbers = true,
  maxLines,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const lines = code.split("\n");
  const displayLines = maxLines ? lines.slice(0, maxLines) : lines;
  const truncated = maxLines && lines.length > maxLines;

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className={cn("relative group", className)}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] bg-[#111827]">
        <span className="text-[10px] font-mono text-[var(--muted)] uppercase">{language}</span>
        <button
          onClick={copy}
          className="p-1 rounded hover:bg-[#1a2332] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          {copied ? <Check size={13} className="text-[var(--green)]" /> : <Copy size={13} />}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 bg-[#0a0f1a] text-[12px] font-mono leading-[1.6]">
        <code>
          {displayLines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="inline-block w-8 text-right mr-3 text-[#374151] select-none flex-shrink-0">
                  {i + 1}
                </span>
              )}
              <span className="text-[var(--text)]">{line}</span>
            </div>
          ))}
          {truncated && (
            <div className="text-[var(--muted)] mt-1">
              ... {lines.length - maxLines!} more lines
            </div>
          )}
        </code>
      </pre>
    </div>
  );
}
