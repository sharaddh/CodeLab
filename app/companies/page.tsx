"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-extrabold">Companies</h1>
        <p className="text-[var(--muted)] text-[13px] mt-1">Browse problems by company</p>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
        <input
          type="text"
          placeholder="Search companies..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-[400px] pl-10 pr-3 py-2.5 border border-[var(--border)] rounded-lg bg-[#0a0f1a] text-white text-[13px] outline-none focus:border-[var(--violet)]/50"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {filtered.map((c) => (
          <div
            key={c.name}
            onClick={() => router.push(`/problems?company=${encodeURIComponent(c.name)}`)}
            className="border border-[var(--border)] rounded-xl p-3.5 bg-[#111827] cursor-pointer transition-all hover:border-[var(--violet)]/50 hover:translate-y-[-2px]"
          >
            <div className="text-[14px] font-bold text-white">{c.name}</div>
            {c.problemCount !== undefined && (
              <div className="text-[12px] text-[var(--muted)] mt-1">{c.problemCount} problems</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
