import React, { useState, useEffect } from "react";
import { aiApi, StudyPlanResponse, StudyPlanDay } from "../../services/aiApi";

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: string;
  onStartDayPractice?: (day: StudyPlanDay) => void;
}

export const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  isOpen,
  onClose,
  targetRole = "Software Engineer",
  onStartDayPractice,
}) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);

  useEffect(() => {
    if (isOpen && !plan) {
      loadPlan();
    }
  }, [isOpen]);

  const loadPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.generateStudyPlan(targetRole, 7);
      setPlan(res);
      if (res.days.length > 0) {
        setActiveDay(res.days[0].day);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to generate 7-day study plan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentDayData = plan?.days.find((d) => d.day === activeDay);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🗓️
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#15171A]">
                7-Day Personalized Practice Plan
              </h2>
              <p className="text-xs text-[#6B7280]">
                Tailored from your actual interview weak topics, wrong answers, and uploaded study notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="text-center py-20 space-y-3">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600">
                Analyzing historical performance gaps and designing your 7-day preparation schedule...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
              <button onClick={loadPlan} className="block mt-2 underline font-semibold">
                Retry
              </button>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-6">
              {/* Weak Skills Target Bar */}
              <div className="p-4 bg-white border border-[#E5E0D8] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-gray-400 block mb-1">
                    Identified Focus Areas (From Practice History)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.weakSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                      >
                        ⚠️ {sk}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Target Role</span>
                  <span className="text-sm font-bold text-[#15171A]">{plan.targetRole}</span>
                </div>
              </div>

              {/* Day selector tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E5E0D8]">
                {plan.days.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setActiveDay(d.day)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeDay === d.day
                        ? "bg-teal-700 text-white shadow-sm"
                        : "bg-white text-gray-700 border border-[#E5E0D8] hover:bg-gray-50"
                    }`}
                  >
                    <span>Day {d.day}</span>
                    <span className="text-[10px] opacity-75 hidden sm:inline">({d.practiceType})</span>
                  </button>
                ))}
              </div>

              {/* Active Day Detail Card */}
              {currentDayData && (
                <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F0EBE1]">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Day {currentDayData.day} • {currentDayData.practiceType}
                      </span>
                      <h3 className="text-base font-serif font-bold text-[#15171A] mt-2">
                        {currentDayData.title}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      Estimated Duration: {currentDayData.durationMinutes} minutes
                    </span>
                  </div>

                  {/* Objective Description */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Learning Objective
                    </span>
                    <p className="text-sm text-gray-800 leading-relaxed font-sans">
                      {currentDayData.description}
                    </p>
                  </div>

                  {/* Recommended Document Reading with citations */}
                  {currentDayData.recommendedDocuments?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-teal-900 uppercase tracking-wider block">
                        📖 Grounded Study Material Checkpoint
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentDayData.recommendedDocuments.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-xs space-y-1"
                          >
                            <div className="font-semibold text-teal-950 flex items-center justify-between">
                              <span>{doc.title}</span>
                              {doc.pageRange && (
                                <span className="text-[10px] bg-white px-2 py-0.5 rounded text-teal-800 font-medium border border-teal-200">
                                  {doc.pageRange}
                                </span>
                              )}
                            </div>
                            {doc.citation && (
                              <p className="text-teal-900 text-[11px]">{doc.citation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Targeted Questions */}
                  {currentDayData.suggestedQuestions?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                        🎯 Key Drill Questions for Day {currentDayData.day}
                      </span>
                      <div className="space-y-2">
                        {currentDayData.suggestedQuestions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-gray-800 font-medium flex items-center gap-2"
                          >
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {qIdx + 1}
                            </span>
                            <span>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        if (onStartDayPractice) {
                          onStartDayPractice(currentDayData);
                        }
                      }}
                      className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <span>Start Day {currentDayData.day} Practice Drill</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#E5E0D8] flex items-center justify-between text-xs text-gray-500">
          <span>Personalized schedule automatically adapts as you complete practice sessions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#15171A] text-white rounded-lg font-medium hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
