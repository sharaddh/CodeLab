"use client";

import { CheckCircle, XCircle, Clock } from "lucide-react";

interface Submission {
  id: string;
  language: string;
  status: "accepted" | "wrong_answer" | "time_limit" | "runtime_error";
  timestamp: number;
  runtime?: string;
  memory?: string;
}

interface SubmissionHistoryProps {
  submissions: Submission[];
}

const statusConfig = {
  accepted: { icon: CheckCircle, color: "text-[var(--green)]", label: "Accepted" },
  wrong_answer: { icon: XCircle, color: "text-[var(--red)]", label: "Wrong Answer" },
  time_limit: { icon: Clock, color: "text-[var(--amber)]", label: "Time Limit Exceeded" },
  runtime_error: { icon: XCircle, color: "text-[var(--red)]", label: "Runtime Error" },
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-[13px] text-[var(--muted)] py-4 text-center">
        No submissions yet. Run your code to see history.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {submissions.map((sub) => {
        const { icon: Icon, color, label } = statusConfig[sub.status];
        return (
          <div
            key={sub.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#111827] text-[12px]"
          >
            <Icon size={14} className={color} />
            <span className="text-[var(--text)] font-mono">{sub.language}</span>
            <span className={`font-semibold ${color}`}>{label}</span>
            {sub.runtime && (
              <span className="text-[var(--muted)] font-mono">{sub.runtime}</span>
            )}
            {sub.memory && (
              <span className="text-[var(--muted)] font-mono">{sub.memory}</span>
            )}
            <span className="ml-auto text-[var(--muted)] font-mono text-[11px]">
              {formatTime(sub.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
