"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Terminal, Eye, EyeOff, GitBranch, LockKeyhole, Mail, Cpu } from "lucide-react";

const benefits = [
  "persist revision state and streak metrics",
  "save problem notes, flags, and favorites",
  "resume last workspace session instantly",
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="login-shell min-h-screen overflow-hidden px-5 py-10 sm:px-8 lg:px-12 font-mono">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20">
        <section className="login-intro max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 border border-[var(--border-bright)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text)]">
            <Cpu size={13} />
            secure_session / auth_gate
          </div>

          <div className="mb-5 flex items-center gap-3 text-[var(--text)]">
            <div className="grid size-11 place-items-center border border-[var(--border-bright)] bg-[#0b0b0d] shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <Terminal size={22} />
            </div>
            <span className="text-[13px] font-bold tracking-[0.12em] text-[var(--muted)] uppercase">leetcode_revision_lab // access</span>
          </div>

          <div className="text-[12px] text-[var(--muted)] mb-2"><span className="text-[var(--text)]">guest@lc-lab</span>:<span className="text-[var(--muted)]">~</span>$ ./authenticate --user</div>
          <h1 className="max-w-lg text-[38px] sm:text-[54px] leading-[0.95] font-[family-name:var(--font-terminal)] tracking-wider text-[var(--text)]">
            INITIATE_SESSION<span className="cursor-blink"></span>
          </h1>
          <p className="mt-5 max-w-lg text-[14px] leading-7 text-[var(--muted)]">
            Authenticate to access your revision workspace, execution history, and problem state cache. Local-first, keyboard-driven, terminal-grade.
          </p>

          <ul className="mt-8 space-y-3 border border-[var(--border)] bg-[rgba(11,11,13,0.8)] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[var(--dim)] mb-2">&gt; capabilities</div>
            {benefits.map((benefit, index) => (
              <li key={benefit} className="login-benefit flex items-center gap-3 text-[13px] text-[var(--text)]" style={{ animationDelay: `${index * 90 + 180}ms` }}>
                <span className="text-[#a1a1aa]">[+]</span>
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="login-card login-card-enter border border-[var(--border)] bg-[rgba(11,11,13,0.95)] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] text-[var(--muted)] uppercase tracking-widest">
            <span className="text-[#d4d4d8]">*</span><span className="text-[#a1a1aa]">*</span><span className="text-[#71717a]">*</span>
            <span className="ml-2">login.prompt</span>
          </div>
          <div className="p-6 sm:p-7">
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-widest">&gt; welcome_back</p>
              <h2 className="mt-2 text-[26px] leading-none font-[family-name:var(--font-terminal)] tracking-wider text-[var(--text)]">SIGN_IN</h2>
              <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">credentials required to mount user workspace.</p>
            </div>

            <button type="button" className="flex h-10 w-full items-center justify-center gap-2 border border-[var(--border)] bg-[#0a0a0c] text-[12px] font-semibold text-[var(--text)] uppercase tracking-wide transition hover:border-[var(--border-bright)] hover:bg-[#17171c]">
              <GitBranch size={15} className="text-[var(--muted)]" />
              auth --provider=github
            </button>

            <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dim)]">
              <span className="h-px flex-1 bg-[var(--border)]" />
              or use credentials
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-widest">
                email_address
                <span className="mt-2 flex items-center gap-3 border border-[var(--border)] bg-[#0a0a0c] px-3.5 transition focus-within:border-[var(--border-bright)]">
                  <Mail size={15} className="text-[var(--dim)]" />
                  <input type="email" required placeholder="user@domain.tld" className="h-10 min-w-0 flex-1 bg-transparent text-[13px] text-[var(--text)] outline-none placeholder:text-[#52525b] !border-none !shadow-none !p-0" />
                </span>
              </label>

              <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-widest">
                password
                <span className="mt-2 flex items-center gap-3 border border-[var(--border)] bg-[#0a0a0c] px-3.5 transition focus-within:border-[var(--border-bright)]">
                  <LockKeyhole size={15} className="text-[var(--dim)]" />
                  <input type={showPassword ? "text" : "password"} required placeholder="********" className="h-10 min-w-0 flex-1 bg-transparent text-[13px] text-[var(--text)] outline-none placeholder:text-[#52525b] !border-none !shadow-none !p-0" />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="text-[var(--dim)] transition hover:text-[var(--text)] !p-0 !border-none !bg-transparent">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </span>
              </label>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <label className="flex items-center gap-2 text-[var(--muted)] uppercase tracking-wide">
                  <input type="checkbox" className="accent-[#d4d4d8]" />
                  persist
                </label>
                <Link href="#" className="font-semibold text-[var(--text)] uppercase tracking-wide hover:text-[#ffffff]">forgot?</Link>
              </div>

              <button type="submit" className="login-submit group mt-2 flex h-11 w-full items-center justify-center gap-2 bg-[#e5e5e7] text-[12px] font-extrabold text-[#050505] uppercase tracking-[0.14em] transition hover:bg-[#ffffff] border border-[#e5e5e7]">
                execute_login
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <p className="mt-6 text-center text-[12px] text-[var(--muted)]">
              no account? <Link href="#" className="font-bold text-[var(--text)] hover:text-[#ffffff] uppercase tracking-wide">register --new</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
