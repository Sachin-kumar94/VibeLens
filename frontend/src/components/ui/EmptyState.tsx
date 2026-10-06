import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#DDD7CB] bg-[#FAF8F5]/60 flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD7CB] text-[#81827D] flex items-center justify-center shadow-2xs">
        {icon || <FolderOpen size={22} />}
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="font-serif font-bold text-lg text-[#17191A]">{title}</h3>
        <p className="text-xs text-[#81827D] leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
