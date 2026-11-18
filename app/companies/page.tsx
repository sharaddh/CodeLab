"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2 } from "lucide-react";
import companiesData from "@/data/companies.json";
import type { Company } from "@/lib/types";

const allCompanies = companiesData as Company[];

export default function CompaniesPage() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = q
    ? allCompanies.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    : allCompanies;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 font-mono">
      <div className="mb-5 border border-[var(--border)] bg-[var(--panel)]">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] text-[var(--muted)] uppercase tracking-widest">
          <span className="text-[#a1a1aa]">*</span><span className="ml-2">~/companies -- index.db</span>
        </div>
        <div className="p-4">
          <div className="text-[12px] text-[var(--muted)] mb-1"><span className="text-[var(--text)]">user@lc-lab</span>:<span className="text-[var(--muted)]">~</span>$ ls ./companies --group=org</div>
          <h1 className="text-[30px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)] tracking-wider flex items-center gap-2"><Building2 size={22} /> COMPANY_INDEX</h1>
          <p className="text-[12px] text-[var(--muted)] mt-1">Browse problem nodes grouped by company tag. Total entries: {allCompanies.length}.</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-[520px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dim)]" />
        <input
          type="text"
          placeholder="grep company_name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border border-[var(--border)] bg-[#0a0a0c] text-[13px] outline-none"
        />
      </div>
      <div className="text-[11px] text-[var(--muted)] mb-3 uppercase tracking-widest">&gt; results: {filtered.length} match(es)</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {filtered.map((c) => (
          <div
            key={c.name}
            onClick={() => router.push(`/problems?company=${encodeURIComponent(c.name)}`)}
            className="border border-[var(--border)] p-3 bg-[var(--panel)] cursor-pointer transition-all hover:border-[var(--border-bright)] hover:bg-[#17171c] group"
          >
            <div className="text-[10px] text-[var(--dim)] mb-1">dir/</div>
            <div className="text-[14px] font-semibold text-[var(--text)] group-hover:text-[#ffffff]">{c.name}</div>
            {c.problemCount !== undefined && (
              <div className="text-[11px] text-[var(--muted)] mt-1"><span className="text-[var(--text)]">{c.problemCount}</span> problems</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
