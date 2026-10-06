import React, { useState } from "react";
import {
  Bookmark,
  BookOpen,
  Download,
  RotateCcw,
  PlusCircle,
  CheckCircle2,
  Share2,
  FolderSync,
} from "lucide-react";

interface ComparisonActionsProps {
  onSaveComparison: () => Promise<void>;
  onAddToJournal: () => void;
  onExportReport: () => void;
  onChangeSessions: () => void;
  onReset: () => void;
  onNavigateScan: (path: string) => void;
  isSaved: boolean;
  isSaving: boolean;
}

export const ComparisonActions: React.FC<ComparisonActionsProps> = ({
  onSaveComparison,
  onAddToJournal,
  onExportReport,
  onChangeSessions,
  onReset,
  onNavigateScan,
  isSaved,
  isSaving,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white border border-[#DDD7CB] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        {/* Save Comparison */}
        <button
          type="button"
          onClick={onSaveComparison}
          disabled={isSaving || isSaved}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-2xs ${
            isSaved
              ? "bg-[#E6F4EA] text-[#0D9488] border border-[#A7F3D0]"
              : "bg-[#15171A] text-white hover:bg-[#2B2E33]"
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 size={14} />
              <span>Comparison Saved</span>
            </>
          ) : isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Bookmark size={14} className="text-[#10B981]" />
              <span>Save Comparison</span>
            </>
          )}
        </button>

        {/* Add to Journal */}
        <button
          type="button"
          onClick={onAddToJournal}
          className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] transition flex items-center gap-2 cursor-pointer hover:bg-[#F2ECE1]"
        >
          <BookOpen size={14} className="text-[#A855F7]" />
          <span>Add to Journal</span>
        </button>

        {/* Export Report */}
        <button
          type="button"
          onClick={onExportReport}
          className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] transition flex items-center gap-2 cursor-pointer hover:bg-[#F2ECE1]"
        >
          <Download size={14} className="text-[#3B82F6]" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        {/* Change Sessions */}
        <button
          type="button"
          onClick={onChangeSessions}
          className="px-3 py-2 rounded-xl bg-transparent border border-[#DDD7CB] hover:bg-[#FAF8F5] text-xs font-medium text-[#15171A] transition flex items-center gap-1.5 cursor-pointer"
        >
          <FolderSync size={13} className="text-[#8C8983]" />
          <span>Change Sessions</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-2 rounded-xl bg-transparent border border-transparent hover:border-[#DDD7CB] text-xs font-medium text-[#707582] hover:text-[#15171A] transition flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        {/* Run another scan */}
        <button
          type="button"
          onClick={() => onNavigateScan("/fusion")}
          className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#15171A] text-xs font-semibold text-[#15171A] transition flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle size={13} className="text-[#10B981]" />
          <span>New Analysis</span>
        </button>
      </div>
    </div>
  );
};
