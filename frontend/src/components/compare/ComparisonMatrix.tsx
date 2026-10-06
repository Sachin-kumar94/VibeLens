import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Filter } from "lucide-react";

export interface MetricComparisonRow {
  key: string;
  label: string;
  category: "core" | "voice" | "body" | "visual" | "fusion";
  valueA: number | string;
  valueB: number | string;
  delta: number | string;
  deltaFormatted: string;
  direction: "up" | "down" | "stable" | "changed";
  unit?: string;
  description?: string;
}

interface ComparisonMatrixProps {
  matrix: MetricComparisonRow[];
  titleA: string;
  titleB: string;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  matrix,
  titleA,
  titleB,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Metrics" },
    { id: "core", label: "Core Signals" },
    { id: "voice", label: "Voice Prosody" },
    { id: "body", label: "Body Kinesics" },
    { id: "visual", label: "Visual & Affect" },
    { id: "fusion", label: "Cross-Modal" },
  ];

  const filteredMatrix = matrix.filter((row) => {
    if (selectedCategory === "all") return true;
    return row.category === selectedCategory;
  });

  const getDirectionBadge = (row: MetricComparisonRow) => {
    switch (row.direction) {
      case "up":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E6F4EA] text-[#0D9488] font-mono text-xs font-bold">
            <ArrowUpRight size={13} />
            <span>{row.deltaFormatted}</span>
          </span>
        );
      case "down":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-mono text-xs font-bold">
            <ArrowDownRight size={13} />
            <span>{row.deltaFormatted}</span>
          </span>
        );
      case "stable":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F0EDE6] text-[#575A60] font-mono text-xs font-semibold">
            <Minus size={13} />
            <span>{row.deltaFormatted}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#15171A] font-mono text-xs font-medium">
            <RefreshCw size={11} className="text-[#8C8983]" />
            <span>{row.deltaFormatted}</span>
          </span>
        );
    }
  };

  const formatCellValue = (val: number | string, unit?: string) => {
    if (val === undefined || val === null || val === "" || val === "N/A") {
      return <span className="text-[#8C8983] italic text-xs">Not available</span>;
    }
    if (typeof val === "number" && unit === "pp") {
      return <span>{val}%</span>;
    }
    return (
      <span>
        {val}
        {unit && unit !== "pp" ? ` ${unit}` : ""}
      </span>
    );
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDD7CB] space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#15171A]">
            Modality Matrix
          </h3>
          <p className="text-xs text-[#575A60] mt-0.5">
            Normalized side-by-side comparison across all comparable signal channels.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-[#15171A] text-white"
                  : "bg-[#FAF8F5] text-[#575A60] hover:text-[#15171A] border border-[#DDD7CB]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#DDD7CB] text-[11px] font-mono uppercase text-[#8C8983]">
              <th className="py-3 px-3 font-semibold">Signal Metric</th>
              <th className="py-3 px-3 font-semibold">Moment B (Baseline)</th>
              <th className="py-3 px-3 font-semibold">Moment A (Target)</th>
              <th className="py-3 px-3 font-semibold text-right">Observed Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EDE6] text-xs">
            {filteredMatrix.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#8C8983] text-xs">
                  No metrics available in this category for the selected sessions.
                </td>
              </tr>
            ) : (
              filteredMatrix.map((row) => (
                <tr key={row.key} className="hover:bg-[#FAF8F5] transition">
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#15171A] block">{row.label}</span>
                    {row.description && (
                      <span className="text-[10px] text-[#8C8983] block">{row.description}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#575A60]">
                    {formatCellValue(row.valueB, row.unit)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#15171A]">
                    {formatCellValue(row.valueA, row.unit)}
                  </td>
                  <td className="py-3 px-3 text-right">{getDirectionBadge(row)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
