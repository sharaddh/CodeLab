"use client";

import { useEffect, useState } from "react";
import { Settings, Monitor, Code, Bug, FolderOpen } from "lucide-react";

export default function SettingsPage() {
  const [envStatus, setEnvStatus] = useState<{ node: boolean; java: boolean; javac: boolean; python: boolean } | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [minimap, setMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/system/status")
      .then((r) => r.json())
      .then(setEnvStatus)
      .catch(() => setEnvStatus({ node: true, java: false, javac: false, python: false }));
  }, []);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6">
      <h1 className="text-[24px] font-extrabold flex items-center gap-2 mb-6">
        <Settings size={24} /> Settings
      </h1>

      {/* Environment Status */}
      <section className="mb-8">
        <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2">
          <Monitor size={18} className="text-[var(--violet)]" /> Environment
        </h2>
        <div className="border border-[var(--border)] rounded-xl bg-[#0a0f1a] divide-y divide-[var(--border)]">
          {[
            { label: "Node.js", key: "node" as const, icon: "✓" },
            { label: "Java", key: "java" as const, icon: "☕" },
            { label: "javac", key: "javac" as const, icon: "🔨" },
            { label: "Python", key: "python" as const, icon: "🐍" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3 px-4 py-3">
              <span className="text-[16px]">{item.icon}</span>
              <span className="text-[14px] font-medium text-white flex-1">{item.label}</span>
              <span
                className={
                  envStatus
                    ? envStatus[item.key]
                      ? "text-[var(--green)] text-[13px] font-semibold"
                      : "text-red-400 text-[13px] font-semibold"
                    : "text-[var(--muted)] text-[13px]"
                }
              >
                {envStatus
                  ? envStatus[item.key]
                    ? "✓ Available"
                    : "✗ Not found"
                  : "Checking..."}
              </span>
            </div>
          ))}
        </div>
        {envStatus && (!envStatus.java || !envStatus.python) && (
          <div className="mt-3 p-3 bg-[var(--amber)]/10 border border-[var(--amber)]/30 rounded-lg text-[13px] text-[var(--amber)]">
            <b>Missing tools:</b>{" "}
            {!envStatus.java && "Install JDK 17+ for Java compilation. "}
            {!envStatus.python && "Install Python 3.10+ for Python execution. "}
            Code execution features require these tools.
          </div>
        )}
      </section>

      {/* Editor Settings */}
      <section className="mb-8">
        <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2">
          <Code size={18} className="text-[var(--violet)]" /> Editor
        </h2>
        <div className="border border-[var(--border)] rounded-xl bg-[#0a0f1a] p-4 space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-[13px] text-[var(--muted)] w-[120px]">Font Size</label>
            <input
              type="range"
              min={10}
              max={24}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-[13px] font-mono text-white w-[40px]">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-[13px] text-[var(--muted)] w-[120px]">Tab Size</label>
            <select
              value={tabSize}
              onChange={(e) => setTabSize(Number(e.target.value))}
              className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[#111827] text-white text-[13px]"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-[13px] text-[var(--muted)] w-[120px]">Minimap</label>
            <button
              onClick={() => setMinimap(!minimap)}
              className={`w-10 h-5 rounded-full transition-colors ${minimap ? "bg-[var(--violet)]" : "bg-[#334155]"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${minimap ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-[13px] text-[var(--muted)] w-[120px]">Word Wrap</label>
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`w-10 h-5 rounded-full transition-colors ${wordWrap ? "bg-[var(--violet)]" : "bg-[#334155]"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${wordWrap ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Companion Server */}
      <section>
        <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2">
          <Bug size={18} className="text-[var(--violet)]" /> Companion Server
        </h2>
        <div className="border border-[var(--border)] rounded-xl bg-[#0a0f1a] p-4">
          <div className="text-[13px] text-[var(--muted)] mb-3">
            The companion server handles code execution and debugging. Run it with:
          </div>
          <code className="block px-3 py-2 bg-[#111827] rounded-lg text-[13px] font-mono text-[var(--cyan)]">
            npm run companion
          </code>
          <div className="text-[12px] text-[var(--muted)] mt-2">
            Default port: 3001. Set <code className="bg-[#111827] px-1 rounded">COMPANION_PORT</code> env var to change.
          </div>
        </div>
      </section>
    </div>
  );
}
