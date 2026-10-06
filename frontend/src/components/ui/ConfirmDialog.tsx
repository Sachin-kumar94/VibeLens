import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertCircle } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            variant === "danger" ? "bg-[#B77988]/15 text-[#B77988]" : "bg-[#748C78]/15 text-[#748C78]"
          }`}
        >
          <AlertCircle size={18} />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif font-bold text-base text-[#17191A]">{title}</h4>
          <p className="text-xs text-[#81827D] leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
