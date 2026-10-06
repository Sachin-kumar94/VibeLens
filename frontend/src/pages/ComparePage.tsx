import React, { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  ArrowRight,
  Sparkles,
  Camera,
  Mic,
  Activity,
  Layers,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { api } from "../services/api";
import { comparisonApi } from "../services/comparisonApi";
import { ComparisonHeader } from "../components/compare/ComparisonHeader";
import { AnalysisSelector } from "../components/compare/AnalysisSelector";
import { SessionCard } from "../components/compare/SessionCard";
import { ComparisonSummary } from "../components/compare/ComparisonSummary";
import { ChangeList } from "../components/compare/ChangeList";
import { ComparisonMatrix } from "../components/compare/ComparisonMatrix";
import { ComparisonInsight } from "../components/compare/ComparisonInsight";
import { ComparisonEvidence } from "../components/compare/ComparisonEvidence";
import { ComparisonLimitations } from "../components/compare/ComparisonLimitations";
import { ComparisonActions } from "../components/compare/ComparisonActions";
import { ComparisonReportModal } from "../components/compare/ComparisonReportModal";
import { ComparisonJournalModal } from "../components/compare/ComparisonJournalModal";

interface ComparePageProps {
  onNavigate: (path: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate }) => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Selected session entities
  const [selectedA, setSelectedA] = useState<any | null>(null);
  const [selectedB, setSelectedB] = useState<any | null>(null);

  // Calculated comparison result from backend comparison engine
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  // Modal controls
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  // Toast / Status state
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Initial Load of Saved History
  useEffect(() => {
    loadAnalyses();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAnalyses = async () => {
    setLoadingHistory(true);
    setCompareError(null);
    try {
      const data = await api.getAnalyses();
      setAnalyses(data || []);

      if (!data || data.length === 0) {
        setLoadingHistory(false);
        return;
      }

      // Check sessionStorage for pre-selected compare IDs from History
      const storedIdsStr = sessionStorage.getItem("vibelens_compare_ids");
      let initialA = null;
      let initialB = null;

      if (storedIdsStr) {
        try {
          const ids = JSON.parse(storedIdsStr);
          if (Array.isArray(ids) && ids.length >= 2) {
            initialA = data.find((d: any) => d.id === ids[0]);
            initialB = data.find((d: any) => d.id === ids[1]);
          } else if (Array.isArray(ids) && ids.length === 1) {
            initialA = data.find((d: any) => d.id === ids[0]);
            initialB = data.find((d: any) => d.id !== ids[0]);
          }
        } catch (e) {
          console.warn("Could not parse stored compare IDs:", e);
        }
      }

      // Default to the two most recent distinct items if available
      if (!initialA && data.length > 0) initialA = data[0];
      if (!initialB && data.length > 1) {
        initialB = data.find((d: any) => d.id !== initialA?.id) || data[1];
      }

      setSelectedA(initialA || null);
      setSelectedB(initialB || null);

      if (initialA && initialB && initialA.id !== initialB.id) {
        runComparison(initialA.id, initialB.id);
      }
    } catch (err: any) {
      console.error("Error loading analyses for comparison:", err);
      setCompareError("Could not retrieve your saved analyses. Please try again.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // 2. Perform Real Backend Comparison
  const runComparison = useCallback(async (idA: string, idB: string) => {
    if (!idA || !idB || idA === idB) {
      setCompareError("Choose two different sessions to compare.");
      setComparisonResult(null);
      return;
    }

    setComparing(true);
    setCompareError(null);
    setIsSaved(false);

    try {
      const result = await comparisonApi.compareSessions(idA, idB);
      setComparisonResult(result);
    } catch (err: any) {
      console.error("Comparison execution error:", err);
      setCompareError(
        err.message || "We couldn't calculate a comparison between the selected sessions."
      );
      setComparisonResult(null);
    } finally {
      setComparing(false);
    }
  }, []);

  // 3. Swap A and B
  const handleSwap = () => {
    if (!selectedA || !selectedB) return;
    const nextA = selectedB;
    const nextB = selectedA;
    setSelectedA(nextA);
    setSelectedB(nextB);
    runComparison(nextA.id, nextB.id);
  };

  // 4. Reset Comparison
  const handleReset = () => {
    sessionStorage.removeItem("vibelens_compare_ids");
    setSelectedA(null);
    setSelectedB(null);
    setComparisonResult(null);
    setCompareError(null);
  };

  // 5. Confirm Selection from History Modal
  const handleConfirmHistory = (itemA: any, itemB: any) => {
    setSelectedA(itemA);
    setSelectedB(itemB);
    sessionStorage.setItem("vibelens_compare_ids", JSON.stringify([itemA.id, itemB.id]));
    runComparison(itemA.id, itemB.id);
  };

  // 6. Save Comparison to Database
  const handleSaveComparison = async () => {
    if (!comparisonResult || !selectedA || !selectedB) return;
    setIsSaving(true);
    try {
      await comparisonApi.saveComparison({
        analysisAId: selectedA.id,
        analysisBId: selectedB.id,
        result: comparisonResult,
        title: `${selectedB.title} vs ${selectedA.title}`,
      });
      setIsSaved(true);
      showToast("Comparison successfully saved to your records.");
    } catch (err: any) {
      console.error("Save comparison failed:", err);
      showToast(err.message || "Failed to save comparison.");
    } finally {
      setIsSaving(false);
    }
  };

  // 7. View Original Session Handler
  const handleViewSession = (id: string, type: string) => {
    onNavigate("/history");
  };

  // Check state conditions
  const isDuplicate = selectedA && selectedB && selectedA.id === selectedB.id;
  const hasTwoSessions = selectedA && selectedB && !isDuplicate;

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-9 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#15171A] text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={15} className="text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Eyebrow, Title, Subtitle, Actions) */}
      <ComparisonHeader
        onOpenHistory={() => setIsSelectorOpen(true)}
        onSwapSessions={handleSwap}
        onReset={handleReset}
        canSwap={Boolean(selectedA && selectedB && selectedA.id !== selectedB.id)}
        hasSelection={Boolean(selectedA || selectedB)}
      />

      {/* 2. Loading State */}
      {loadingHistory ? (
        <div className="py-24 text-center text-xs text-[#707582] flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs">Loading comparison workspace...</p>
        </div>
      ) : analyses.length === 0 ? (
        /* 3. Empty State (Section 103) */
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[#DDD7CB] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-center mx-auto text-[#8C8983]">
            <FolderOpen size={24} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#15171A]">
            Compare your sessions
          </h3>
          <p className="text-sm text-[#575A60] max-w-md mx-auto">
            Complete at least two analyses to compare changes over time. Your side-by-side signal differences will automatically calibrate here.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate("/fusion")}
              className="px-5 py-2.5 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#2B2E33] inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Start an Analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : analyses.length === 1 ? (
        /* 4. One Analysis Only State (Section 104) */
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[#DDD7CB] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] border border-[#A7F3D0] flex items-center justify-center mx-auto text-[#10B981]">
            <Sparkles size={24} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#15171A]">
            One more session needed
          </h3>
          <p className="text-sm text-[#575A60] max-w-md mx-auto">
            You have 1 analysis recorded: <span className="font-semibold text-[#15171A]">"{analyses[0].title}"</span>. Record a second session in Voice, Body, or Multimodal Fusion to compare your signal progression.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate("/voice")}
              className="px-5 py-2.5 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#2B2E33] inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Start Second Analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* 5. Active Comparison Workspace */
        <div className="space-y-10">
          {/* Duplicate Selection Error Alert (Section 7) */}
          {isDuplicate && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-700 shrink-0" />
                <span className="font-medium">
                  Choose two different sessions to compare. You have currently selected the exact same session for Moment A and Moment B.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectorOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold cursor-pointer shrink-0"
              >
                Change Selection
              </button>
            </div>
          )}

          {/* Side-by-Side Session Cards (Sections 9, 10, 11, 12, 13, 14, 15) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {/* Moment A (Current / Target) */}
            {selectedA ? (
              <SessionCard
                slot="A"
                session={
                  comparisonResult?.sessionA || {
                    id: selectedA.id,
                    type: selectedA.type,
                    title: selectedA.title,
                    timestamp: selectedA.timestamp || selectedA.createdAt,
                    context: selectedA.context || "Target session",
                    confidence: selectedA.confidence || 85,
                    signalQuality: 90,
                    signalQualityRating: "Good",
                    vibe: selectedA.vibe?.descriptor || selectedA.vibe || "Calm",
                    emotion: selectedA.emotion?.primary || selectedA.emotion || "Focused",
                    fileUrl: selectedA.fileUrl || selectedA.imageUrl,
                  }
                }
                onChangeClick={() => setIsSelectorOpen(true)}
                onViewSession={handleViewSession}
              />
            ) : (
              <div
                onClick={() => setIsSelectorOpen(true)}
                className="p-8 rounded-3xl border-2 border-dashed border-[#DDD7CB] bg-[#FAF8F5] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#8C8983] min-h-[360px]"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#DDD7CB] flex items-center justify-center text-[#8C8983] mb-2">
                  <Sparkles size={18} />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#15171A]">Moment A (Target)</h4>
                <p className="text-xs text-[#575A60] mt-1">Click to select an analysis from history</p>
              </div>
            )}

            {/* Moment B (Baseline / Previous) */}
            {selectedB ? (
              <SessionCard
                slot="B"
                session={
                  comparisonResult?.sessionB || {
                    id: selectedB.id,
                    type: selectedB.type,
                    title: selectedB.title,
                    timestamp: selectedB.timestamp || selectedB.createdAt,
                    context: selectedB.context || "Baseline session",
                    confidence: selectedB.confidence || 80,
                    signalQuality: 88,
                    signalQualityRating: "Good",
                    vibe: selectedB.vibe?.descriptor || selectedB.vibe || "Centered",
                    emotion: selectedB.emotion?.primary || selectedB.emotion || "Attentive",
                    fileUrl: selectedB.fileUrl || selectedB.imageUrl,
                  }
                }
                onChangeClick={() => setIsSelectorOpen(true)}
                onViewSession={handleViewSession}
              />
            ) : (
              <div
                onClick={() => setIsSelectorOpen(true)}
                className="p-8 rounded-3xl border-2 border-dashed border-[#DDD7CB] bg-[#FAF8F5] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#8C8983] min-h-[360px]"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#DDD7CB] flex items-center justify-center text-[#8C8983] mb-2">
                  <Sparkles size={18} />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#15171A]">Moment B (Baseline)</h4>
                <p className="text-xs text-[#575A60] mt-1">Click to select a baseline session</p>
              </div>
            )}
          </div>

          {/* Comparison Computation In-Progress State (Section 66) */}
          {comparing ? (
            <div className="p-12 rounded-3xl bg-white border border-[#DDD7CB] text-center space-y-3 shadow-xs">
              <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#15171A]">
                Calculating Session Delta...
              </h4>
              <p className="text-xs text-[#575A60] font-mono">
                Aligning cross-modal features • Normalizing scales • Synthesizing evidence
              </p>
            </div>
          ) : compareError ? (
            /* Error State (Section 67) */
            <div className="p-8 rounded-3xl bg-rose-50/70 border border-rose-200 text-center space-y-3 max-w-lg mx-auto">
              <AlertCircle size={24} className="mx-auto text-rose-600" />
              <h4 className="text-sm font-bold text-rose-900">Comparison Unavailable</h4>
              <p className="text-xs text-rose-700">{compareError}</p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-xs font-medium text-rose-900 hover:bg-rose-100 cursor-pointer"
                >
                  Change Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedA && selectedB) runComparison(selectedA.id, selectedB.id);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : comparisonResult ? (
            /* Comparison Results Sections */
            <div className="space-y-9">
              {/* 1. Comparison Summary Card (Sections 16, 19, 20, 36-42) */}
              <ComparisonSummary
                summary={comparisonResult.summary}
                sessionA={comparisonResult.sessionA}
                sessionB={comparisonResult.sessionB}
              />

              {/* 2. What Changed Categorized Breakdown (Sections 17, 18, 74) */}
              <ChangeList changes={comparisonResult.changes} />

              {/* 3. Modality Matrix (Sections 28, 29, 75) */}
              <ComparisonMatrix
                matrix={comparisonResult.matrix}
                titleA={comparisonResult.sessionA.title}
                titleB={comparisonResult.sessionB.title}
              />

              {/* 4. Comparison Insight (Sections 34, 76) */}
              <ComparisonInsight insight={comparisonResult.insight} />

              {/* 5. Evidence & Limitations Grid (Sections 33, 35, 77) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                <ComparisonEvidence evidence={comparisonResult.evidence} />
                <ComparisonLimitations limitations={comparisonResult.limitations} />
              </div>

              {/* 6. Comparison Actions Bar (Sections 43, 44, 52, 78) */}
              <ComparisonActions
                onSaveComparison={handleSaveComparison}
                onAddToJournal={() => setIsJournalModalOpen(true)}
                onExportReport={() => setIsReportModalOpen(true)}
                onChangeSessions={() => setIsSelectorOpen(true)}
                onReset={handleReset}
                onNavigateScan={onNavigate}
                isSaved={isSaved}
                isSaving={isSaving}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* History Selection Modal (Sections 5, 6, 7, 8) */}
      <AnalysisSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        analyses={analyses}
        selectedA={selectedA}
        selectedB={selectedB}
        onConfirmSelection={handleConfirmHistory}
      />

      {/* Export Report Modal (Sections 78, 79) */}
      <ComparisonReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={comparisonResult}
      />

      {/* Journal Reflection Modal (Section 52) */}
      <ComparisonJournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        result={comparisonResult}
        onSuccess={() => showToast("Reflection saved to your Vibe Journal.")}
      />
    </div>
  );
};
