"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3 mb-4">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            variant === "danger" ? "bg-[var(--red)]/10" : "bg-[var(--amber)]/10"
          }`}
        >
          <AlertTriangle
            size={18}
            className={variant === "danger" ? "text-[var(--red)]" : "text-[var(--amber)]"}
          />
        </div>
        <p className="text-[13px] text-[var(--text)] leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)]/20 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={handleConfirm}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-colors ${
            variant === "danger"
              ? "bg-[var(--red)] hover:bg-[var(--red)]/80"
              : "bg-[var(--amber)] hover:bg-[var(--amber)]/80"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
