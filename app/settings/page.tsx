"use client";

import { useState, useEffect } from "react";
import { Monitor, Code, Bug, Settings } from "lucide-react";

export default function SettingsPage() {
  const [envStatus, setEnvStatus] = useState<{ node: boolean; java: boolean; javac: boolean; python: boolean; gpp: boolean } | null>(null);
  const [fontSize, setFontSize] = useState(13);
  const [tabSize, setTabSize] = useState(4);
  const [minimap, setMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/system/status")
      .then((r) => r.json())
      .then(setEnvStatus)
      .catch(() => setEnvStatus({ node: true, java: false, javac: false, python: false, gpp: false }));
  }, []);

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 font-mono">
      <div className="mb-5 border border-[var(--border)] bg-[var(--panel)]">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[#0f0f12] text-[11px] text-[var(--muted)] uppercase tracking-widest">
          <span className="text-[#a1a1aa]">*</span><span className="ml-2">~/settings -- config.env</span>
        </div>
        <div className="p-4">
          <div className="text-[12px] text-[var(--muted)] mb-1"><span className="text-[var(--text)]">user@lc-lab</span>:<span className="text-[var(--muted)]">~</span>$ nano ./settings.conf</div>
          <h1 className="text-[30px] leading-none font-[family-name:var(--font-terminal)] text-[var(--text)] tracking-wider flex items-center gap-2"><Settings size={22} /> SYSTEM_SETTINGS</h1>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-[12px] font-bold mb-2 flex items-center gap-2 text-[var(--text)] uppercase tracking-widest"><Monitor size={14} /> &gt; env_probe --companion :3001</h2>
        <div className="border border-[var(--border)] bg-[#080809] divide-y divide-[var(--border)]">
          {[
            { label: "node", key: "node" as const },
            { label: "java", key: "java" as const },
            { label: "javac", key: "javac" as const },
            { label: "python", key: "python" as const },
            { label: "g++ (cpp)", key: "gpp" as const },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-[11px] text-[var(--dim)] w-28">which {item.label.split(" ")[0]}</span>
              <span className="text-[13px] font-medium text-[var(--text)] flex-1">{item.label}</span>
              <span className={envStatus ? (envStatus[item.key] ? "text-[#d4d4d8]" : "text-[#71717a]") : "text-[var(--muted)]"}>
                {envStatus ? (envStatus[item.key] ? "[FOUND]" : "[MISSING]") : "[...]"}
              </span>
            </div>
          ))}
        </div>
        {envStatus && (!envStatus.java || !envStatus.python || !envStatus.gpp) && (
          <div className="mt-3 p-3 border border-[var(--border-bright)] bg-[rgba(255,255,255,0.03)] text-[12px] text-[var(--muted)]">
            [WARN] missing toolchain component(s): {!envStatus.java && "JDK/javac "} {!envStatus.python && "python "} {!envStatus.gpp && "g++ "}
            -- execution/tracing may be unavailable.
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-[12px] font-bold mb-2 flex items-center gap-2 text-[var(--text)] uppercase tracking-widest"><Code size={14} /> &gt; editor.config</h2>
        <div className="border border-[var(--border)] bg-[#080809] p-4 space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-[12px] text-[var(--muted)] w-[140px]">font_size</label>
            <input type="range" min={10} max={24} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-[#d4d4d8]" />
            <span className="text-[12px] text-[var(--text)] w-[48px]">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-[12px] text-[var(--muted)] w-[140px]">tab_size</label>
            <select value={tabSize} onChange={(e) => setTabSize(Number(e.target.value))} className="px-3 py-1.5 border border-[var(--border)] bg-[#0a0a0c] text-[12px]">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
          {[
            { label: "minimap", val: minimap, set: setMinimap },
            { label: "word_wrap", val: wordWrap, set: setWordWrap },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-4">
              <label className="text-[12px] text-[var(--muted)] w-[140px]">{t.label}</label>
              <button onClick={() => t.set(!t.val)} className={`px-3 py-1 text-[11px] border font-bold tracking-widest ${t.val ? "bg-[#e5e5e7] text-[#050505] border-[#e5e5e7]" : "bg-[#0f0f12] text-[var(--muted)] border-[var(--border)]"}`}>
                {t.val ? "ON" : "OFF"}
              </button>
            </div>
          ))}
          <div className="text-[11px] text-[var(--dim)]">note: editor toggles are local UI state in this view.</div>
        </div>
      </section>

      <section>
        <h2 className="text-[12px] font-bold mb-2 flex items-center gap-2 text-[var(--text)] uppercase tracking-widest"><Bug size={14} /> &gt; companion.service</h2>
        <div className="border border-[var(--border)] bg-[#080809] p-4">
          <div className="text-[12px] text-[var(--muted)] mb-3">Execution/debug bridge daemon. Required for Run/Debug and C++/Java/Python toolchain checks.</div>
          <code className="block px-3 py-2 bg-[#0a0a0c] border border-[var(--border)] text-[13px] text-[var(--text)]">$ npm run companion</code>
          <div className="text-[11px] text-[var(--dim)] mt-2">default port: 3001 -- override: <span className="text-[var(--text)]">COMPANION_PORT</span></div>
        </div>
      </section>
    </div>
  );
}
