import React, { useState } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { Modal } from "../ui/Modal";

interface CustomDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStart?: string;
  initialEnd?: string;
  onApply: (startDate: string, endDate: string) => void;
  onReset: () => void;
}

export const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  isOpen,
  onClose,
  initialStart,
  initialEnd,
  onApply,
  onReset,
}) => {
  const [start, setStart] = useState(
    initialStart || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
  );
  const [end, setEnd] = useState(initialEnd || new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    if (!start || !end) {
      setError("Please select both a start and end date.");
      return;
    }
    const dStart = new Date(start);
    const dEnd = new Date(end);
    if (dStart > dEnd) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError(null);
    onApply(start, end);
    onClose();
  };

  const handleReset = () => {
    setError(null);
    onReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Date Range"
      subtitle="Select a custom window to filter your personal communication signals."
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#8C8983] block mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setError(null);
                }}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs text-[#15171A] outline-hidden focus:border-[#15171A]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#8C8983] block mb-1">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setError(null);
                }}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs text-[#15171A] outline-hidden focus:border-[#15171A]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#F0EDE6]">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#707582] hover:text-[#15171A] hover:bg-[#FAF8F5] transition cursor-pointer"
          >
            Reset
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-[#DDD7CB] text-xs font-medium text-[#15171A] hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
