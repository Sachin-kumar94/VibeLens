import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

interface ChangeItem {
  label: string;
  delta: string;
  detail: string;
}

interface ChangeListProps {
  changes: {
    improved: ChangeItem[];
    stable: ChangeItem[];
    decreased: ChangeItem[];
  };
}

export const ChangeList: React.FC<ChangeListProps> = ({ changes }) => {
  const hasImproved = changes.improved && changes.improved.length > 0;
  const hasStable = changes.stable && changes.stable.length > 0;
  const hasDecreased = changes.decreased && changes.decreased.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#15171A]">
            What Changed
          </h3>
          <p className="text-xs text-[#575A60] mt-0.5">
            Categorized signal movement from Moment B to Moment A.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Improved Column */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-[#15171A]">
                Higher / Improved ({changes.improved.length})
              </h4>
            </div>
            <ArrowUpRight size={14} className="text-[#10B981]" />
          </div>

          <div className="space-y-2.5">
            {!hasImproved ? (
              <p className="text-xs text-[#8C8983] py-4 text-center">
                No signals showed measurable upward deltas.
              </p>
            ) : (
              changes.improved.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-[#15171A] block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[#575A60] block">
                      {item.detail}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#E6F4EA] text-[#0D9488] font-mono text-xs font-bold shrink-0 ml-2">
                    ↑ {item.delta}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Stable Column */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C8983]" />
              <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-[#15171A]">
                Consistent / Stable ({changes.stable.length})
              </h4>
            </div>
            <Minus size={14} className="text-[#8C8983]" />
          </div>

          <div className="space-y-2.5">
            {!hasStable ? (
              <p className="text-xs text-[#8C8983] py-4 text-center">
                No signals remained completely unchanged.
              </p>
            ) : (
              changes.stable.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-[#15171A] block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[#575A60] block">
                      {item.detail}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#F0EDE6] text-[#575A60] font-mono text-xs font-bold shrink-0 ml-2">
                    → {item.delta}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Decreased Column */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-[#15171A]">
                Lower / Decreased ({changes.decreased.length})
              </h4>
            </div>
            <ArrowDownRight size={14} className="text-rose-500" />
          </div>

          <div className="space-y-2.5">
            {!hasDecreased ? (
              <p className="text-xs text-[#8C8983] py-4 text-center">
                No signals showed a downward shift.
              </p>
            ) : (
              changes.decreased.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-[#15171A] block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[#575A60] block">
                      {item.detail}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-mono text-xs font-bold shrink-0 ml-2">
                    ↓ {item.delta}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
