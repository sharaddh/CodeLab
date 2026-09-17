"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  GitBranch,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

const benefits = [
  "Keep your revision streak moving",
  "Save problem notes and favorites",
  "Pick up where your last session ended",
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="login-shell min-h-screen overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20">
        <section className="login-intro max-w-xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
            <Sparkles size={13} />
            Your next breakthrough starts here
          </div>

          <div className="mb-6 flex items-center gap-3 text-cyan-300">
            <div className="grid size-11 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
              <Code2 size={23} />
            </div>
            <span className="text-sm font-bold tracking-[0.08em] text-slate-300">LEETCODE REVISION LAB</span>
          </div>

          <h1 className="max-w-lg text-4xl font-black leading-[1.03] tracking-[-0.04em] text-white sm:text-6xl">
            Turn solved problems into lasting skill.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">
            A focused workspace for revisiting patterns, debugging your thinking, and building the confidence to solve what comes next.
          </p>

          <ul className="mt-9 space-y-4">
            {benefits.map((benefit, index) => (
              <li key={benefit} className="login-benefit flex items-center gap-3 text-sm font-medium text-slate-300" style={{ animationDelay: `${index * 90 + 180}ms` }}>
                <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="login-card login-card-enter rounded-3xl border border-white/10 bg-slate-950/75 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-amber-300">Welcome back</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Sign in to your lab</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Your problem history is waiting for you.</p>
          </div>

          <button type="button" className="login-control flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]">
            <GitBranch size={17} />
            Continue with GitHub
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            <span className="h-px flex-1 bg-white/10" />
            or continue with email
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-300">
              Email address
              <span className="login-input mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 transition focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-300/10">
                <Mail size={17} className="text-slate-500" />
                <input type="email" required placeholder="you@example.com" className="h-11 min-w-0 flex-1 bg-transparent text-sm font-normal text-white outline-none placeholder:text-slate-600" />
              </span>
            </label>

            <label className="block text-sm font-semibold text-slate-300">
              Password
              <span className="login-input mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 transition focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-300/10">
                <LockKeyhole size={17} className="text-slate-500" />
                <input type={showPassword ? "text" : "password"} required placeholder="Enter your password" className="h-11 min-w-0 flex-1 bg-transparent text-sm font-normal text-white outline-none placeholder:text-slate-600" />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="text-slate-500 transition hover:text-slate-200">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-400">
                <input type="checkbox" className="accent-amber-300" />
                Remember me
              </label>
              <Link href="#" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Forgot password?</Link>
            </div>

            <button type="submit" className="login-submit group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 text-sm font-extrabold text-slate-950 transition hover:bg-amber-200">
              Sign in
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to the lab? <Link href="#" className="font-bold text-slate-200 transition hover:text-amber-300">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
}