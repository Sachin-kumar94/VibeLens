import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Trash2,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Eye,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { documentApi, UserDocumentItem, ResumeProfileData, DocumentChunkItem } from "../../services/documentApi";
import { AskVibeLensModal } from "../study/AskVibeLensModal";
import { QuizModal } from "../study/QuizModal";
import { FlashcardsModal } from "../study/FlashcardsModal";
import { NotesSummaryModal } from "../study/NotesSummaryModal";

interface DocumentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentsUpdated?: () => void;
}

export const DocumentLibraryModal: React.FC<DocumentLibraryModalProps> = ({
  isOpen,
  onClose,
  onDocumentsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"RESUME" | "JOB_DESCRIPTION" | "STUDY_MATERIAL">("RESUME");
  const [documents, setDocuments] = useState<UserDocumentItem[]>([]);
  const [resumeProfile, setResumeProfile] = useState<ResumeProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Paste JD state
  const [pastedJdText, setPastedJdText] = useState("");
  const [pastedJdRole, setPastedJdRole] = useState("");
  const [pastedJdCompany, setPastedJdCompany] = useState("");
  const [isSubmittingJd, setIsSubmittingJd] = useState(false);

  // Study search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DocumentChunkItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected chunk view modal
  const [viewingChunk, setViewingChunk] = useState<DocumentChunkItem | null>(null);

  // AI Study Assistant Modals
  const [activeStudyActionDoc, setActiveStudyActionDoc] = useState<UserDocumentItem | null>(null);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [docs, resume] = await Promise.all([
        documentApi.getDocuments(),
        documentApi.getActiveResume(),
      ]);
      setDocuments(docs);
      setResumeProfile(resume);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sourceType: "RESUME" | "JOB_DESCRIPTION" | "STUDY_MATERIAL"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgressMsg("Uploading...");
    setErrorMessage(null);

    try {
      setUploadProgressMsg("Analyzing document structure...");
      await documentApi.uploadDocument(file, sourceType);
      setUploadProgressMsg("Ready ✓");
      await loadData();
      if (onDocumentsUpdated) onDocumentsUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process document.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgressMsg(null), 2500);
      e.target.value = "";
    }
  };

  const handleToggleSelection = async (docId: string, current: boolean) => {
    try {
      await documentApi.toggleSelection(docId, !current);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isSelectedForInterview: !current } : d))
      );
      if (onDocumentsUpdated) onDocumentsUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not toggle document selection.");
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm("Remove this document from your interview knowledge base?")) return;
    try {
      await documentApi.deleteDocument(docId, false);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (resumeProfile?.document?.id === docId) {
        setResumeProfile(null);
      }
      if (onDocumentsUpdated) onDocumentsUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not delete document.");
    }
  };

  const handlePasteJdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedJdText.trim() || pastedJdText.length < 20) {
      setErrorMessage("Please paste at least 20 characters of job description text.");
      return;
    }

    setIsSubmittingJd(true);
    setErrorMessage(null);
    try {
      await documentApi.pasteJobDescription({
        text: pastedJdText,
        role: pastedJdRole || undefined,
        company: pastedJdCompany || undefined,
      });
      setPastedJdText("");
      setPastedJdRole("");
      setPastedJdCompany("");
      await loadData();
      if (onDocumentsUpdated) onDocumentsUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse job description.");
    } finally {
      setIsSubmittingJd(false);
    }
  };

  const handleSearchMaterials = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    setIsSearching(true);
    try {
      const results = await documentApi.searchDocuments(searchQuery.trim());
      setSearchResults(results);
    } catch (err: any) {
      console.warn("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  const resumeDocs = documents.filter((d) => d.sourceType === "RESUME");
  const jdDocs = documents.filter((d) => d.sourceType === "JOB_DESCRIPTION");
  const studyDocs = documents.filter((d) => d.sourceType === "STUDY_MATERIAL");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#DDD7CB] bg-white">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#15171A]" />
              <h2 className="text-lg font-serif font-bold text-[#15171A]">My Interview Profile & Materials</h2>
            </div>
            <p className="text-xs text-[#7D7971] mt-0.5">
              Manage your Resume, Job Descriptions, and Study Notes for personalized, source-grounded interview practice.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7D7971] hover:text-[#15171A] hover:bg-[#FAF8F5] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#DDD7CB] bg-white px-6 gap-6">
          <button
            onClick={() => setActiveTab("RESUME")}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "RESUME"
                ? "border-[#15171A] text-[#15171A]"
                : "border-transparent text-[#7D7971] hover:text-[#15171A]"
            }`}
          >
            <FileText size={14} />
            <span>Resume / CV</span>
            {resumeDocs.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("JOB_DESCRIPTION")}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "JOB_DESCRIPTION"
                ? "border-[#15171A] text-[#15171A]"
                : "border-transparent text-[#7D7971] hover:text-[#15171A]"
            }`}
          >
            <Briefcase size={14} />
            <span>Job Description</span>
            {jdDocs.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("STUDY_MATERIAL")}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "STUDY_MATERIAL"
                ? "border-[#15171A] text-[#15171A]"
                : "border-transparent text-[#7D7971] hover:text-[#15171A]"
            }`}
          >
            <BookOpen size={14} />
            <span>Study Materials & Books</span>
            {studyDocs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#E5E0D5] text-[10px] text-[#575A60]">
                {studyDocs.length}
              </span>
            )}
          </button>
        </div>

        {/* Global Notifications */}
        {uploadProgressMsg && (
          <div className="bg-[#EBF5FB] border-b border-[#AED6F1] px-6 py-2 text-xs font-medium text-[#1B4F72] flex items-center gap-2">
            <Loader2 size={13} className="animate-spin text-[#2980B9]" />
            <span>{uploadProgressMsg}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-[#FDEDEC] border-b border-[#F5B7B1] px-6 py-2.5 text-xs text-[#922B21] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-xs underline hover:no-underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: RESUME */}
          {activeTab === "RESUME" && (
            <div className="space-y-6">
              {/* Active Resume Card */}
              {resumeDocs.length > 0 ? (
                <div className="bg-white border border-[#DDD7CB] rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F8F5] border border-[#A3E4D7] flex items-center justify-center text-[#117A65]">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-[#15171A]">
                            {resumeDocs[0].filename}
                          </h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F8F5] text-[#117A65] text-[10px] font-medium">
                            <CheckCircle2 size={10} />
                            Ready
                          </span>
                        </div>
                        <p className="text-xs text-[#7D7971] mt-0.5">
                          {(resumeDocs[0].size / 1024).toFixed(1)} KB · Uploaded{" "}
                          {new Date(resumeDocs[0].createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-medium text-[#15171A] cursor-pointer transition">
                        Replace
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={(e) => handleFileUpload(e, "RESUME")}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <button
                        onClick={() => handleDeleteDocument(resumeDocs[0].id)}
                        className="p-1.5 rounded-lg text-[#C0392B] hover:bg-[#FDEDEC] transition cursor-pointer"
                        title="Delete resume"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Extracted Facts Summary */}
                  {resumeProfile && (
                    <div className="pt-4 border-t border-[#E5E0D5] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-[#15171A] block mb-1">Extracted Projects</span>
                        {resumeProfile.projects.length > 0 ? (
                          <ul className="space-y-1 text-[#575A60]">
                            {resumeProfile.projects.map((p, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#10B981]" />
                                <span className="font-medium text-[#15171A]">{p.name}</span>
                                {p.technologies?.length > 0 && (
                                  <span className="text-[#8C8983]">({p.technologies.slice(0, 3).join(", ")})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[#8C8983] italic">None detected</span>
                        )}
                      </div>

                      <div>
                        <span className="font-semibold text-[#15171A] block mb-1">Extracted Skills</span>
                        {resumeProfile.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {resumeProfile.skills.slice(0, 10).map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E5E0D5] text-[11px] text-[#575A60]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#8C8983] italic">None detected</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-[#DDD7CB] rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D5] flex items-center justify-center mx-auto text-[#7D7971]">
                    <Upload size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#15171A]">Upload your Resume / CV</h3>
                    <p className="text-xs text-[#7D7971] max-w-md mx-auto mt-1">
                      Our system extracts your verified projects, technologies, and achievements so the interview engine asks real questions grounded in what you built.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#2A2E33] transition cursor-pointer shadow-xs">
                    <Upload size={13} />
                    <span>Select Resume (PDF, DOCX, TXT)</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={(e) => handleFileUpload(e, "RESUME")}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JOB DESCRIPTION */}
          {activeTab === "JOB_DESCRIPTION" && (
            <div className="space-y-6">
              {/* Existing JD List */}
              {jdDocs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#7D7971] uppercase tracking-wider">
                    Active Job Descriptions
                  </h4>
                  {jdDocs.map((jd) => (
                    <div
                      key={jd.id}
                      className="bg-white border border-[#DDD7CB] rounded-xl p-4 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#EBF5FB] border border-[#AED6F1] flex items-center justify-center text-[#2980B9]">
                          <Briefcase size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#15171A]">{jd.title}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F8F5] text-[#117A65] text-[10px] font-medium">
                              Ready ✓
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7D7971]">
                            Uploaded {new Date(jd.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSelection(jd.id, jd.isSelectedForInterview)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            jd.isSelectedForInterview
                              ? "bg-[#15171A] text-white border-[#15171A]"
                              : "bg-[#FAF8F5] text-[#7D7971] border-[#DDD7CB] hover:text-[#15171A]"
                          }`}
                        >
                          {jd.isSelectedForInterview ? "Active for Interview" : "Inactive"}
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(jd.id)}
                          className="p-1.5 rounded-lg text-[#C0392B] hover:bg-[#FDEDEC] transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paste or Upload JD */}
              <div className="bg-white border border-[#DDD7CB] rounded-2xl p-6 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#15171A]">Add Target Job Description</h3>
                  <p className="text-xs text-[#7D7971] mt-0.5">
                    Align your practice questions with the specific requirements, tools, and responsibilities of the role you are targeting.
                  </p>
                </div>

                <form onSubmit={handlePasteJdSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Role (e.g. Senior Frontend Engineer)"
                      value={pastedJdRole}
                      onChange={(e) => setPastedJdRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDD7CB] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#15171A]"
                    />
                    <input
                      type="text"
                      placeholder="Company (optional)"
                      value={pastedJdCompany}
                      onChange={(e) => setPastedJdCompany(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDD7CB] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#15171A]"
                    />
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Paste the Job Description requirements, qualifications, and responsibilities here..."
                    value={pastedJdText}
                    onChange={(e) => setPastedJdText(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-[#DDD7CB] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#15171A] font-mono"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label className="text-xs text-[#7D7971] hover:text-[#15171A] flex items-center gap-1.5 cursor-pointer">
                      <Upload size={12} />
                      <span>Or upload JD document (PDF/DOCX)</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => handleFileUpload(e, "JOB_DESCRIPTION")}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmittingJd || pastedJdText.length < 20}
                      className="px-4 py-2 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#2A2E33] transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isSubmittingJd ? "Analyzing..." : "Save Job Description"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: STUDY MATERIALS */}
          {activeTab === "STUDY_MATERIAL" && (
            <div className="space-y-6">
              {/* Upload Box */}
              <div className="bg-white border border-[#DDD7CB] rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#15171A]">Add Study Books, Notes or PDFs</h3>
                  <p className="text-xs text-[#7D7971] mt-0.5">
                    Upload your technical textbooks, cheat sheets, or lecture notes (DBMS, OS, System Design, etc.). Questions will be grounded with exact page citations.
                  </p>
                </div>

                <label className="shrink-0 px-4 py-2 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#2A2E33] transition cursor-pointer flex items-center gap-2 shadow-xs">
                  <Plus size={14} />
                  <span>Upload Study PDF/Notes</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => handleFileUpload(e, "STUDY_MATERIAL")}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* Keyword Search across study chunks */}
              {studyDocs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-3 text-[#7D7971]" />
                      <input
                        type="text"
                        placeholder="Search your notes (e.g. Normalization, TCP, Indexing)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchMaterials()}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DDD7CB] bg-white focus:outline-none focus:border-[#15171A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchMaterials}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-medium text-[#15171A] transition cursor-pointer"
                    >
                      {isSearching ? <Loader2 size={13} className="animate-spin" /> : "Search"}
                    </button>
                  </div>

                  {/* Search Results Preview */}
                  {searchResults.length > 0 && (
                    <div className="bg-white border border-[#DDD7CB] rounded-xl p-3.5 space-y-2">
                      <span className="text-[11px] font-semibold text-[#7D7971] uppercase tracking-wider block">
                        Matching Note Sections
                      </span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((res, i) => (
                          <div
                            key={i}
                            onClick={() => setViewingChunk(res)}
                            className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5E0D5] hover:border-[#15171A] text-xs transition cursor-pointer"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#15171A]">
                              <span>{res.citation}</span>
                              <Eye size={12} className="text-[#7D7971]" />
                            </div>
                            <p className="text-[11px] text-[#575A60] line-clamp-2 mt-1 font-mono">
                              {res.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Study Material Documents List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#7D7971] uppercase tracking-wider">
                  Uploaded Study Materials ({studyDocs.length})
                </h4>

                {studyDocs.length === 0 ? (
                  <div className="bg-white border border-[#DDD7CB] rounded-xl p-8 text-center text-xs text-[#7D7971]">
                    No study materials uploaded yet. Upload a technical book or course notes to practice questions directly from your materials.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {studyDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white border border-[#DDD7CB] rounded-xl p-4 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#F4ECF7] border border-[#D7BDE2] flex items-center justify-center text-[#8E44AD]">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#15171A]">{doc.filename}</span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                    doc.status === "READY"
                                      ? "bg-[#E8F8F5] text-[#117A65]"
                                      : doc.status === "PROCESSING"
                                      ? "bg-[#FEF9E7] text-[#B7950B]"
                                      : "bg-[#FDEDEC] text-[#922B21]"
                                  }`}
                                >
                                  {doc.status === "READY" ? "Ready ✓" : doc.status}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#7D7971]">
                                {doc.pageCount ? `${doc.pageCount} pages · ` : ""}
                                {doc._count?.chunks ? `${doc._count.chunks} indexed chunks · ` : ""}
                                {(doc.size / 1024).toFixed(0)} KB · Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleSelection(doc.id, doc.isSelectedForInterview)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                                doc.isSelectedForInterview
                                  ? "bg-[#15171A] text-white border-[#15171A]"
                                  : "bg-[#FAF8F5] text-[#7D7971] border-[#DDD7CB] hover:text-[#15171A]"
                              }`}
                            >
                              {doc.isSelectedForInterview ? "Active for Questions" : "Inactive"}
                            </button>

                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 rounded-lg text-[#C0392B] hover:bg-[#FDEDEC] transition cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* AI Document Study Actions */}
                        <div className="pt-2 border-t border-[#F0EBE1] flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStudyActionDoc(doc);
                              setIsAskModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Sparkles size={12} className="text-emerald-600" />
                            <span>Ask VibeLens</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStudyActionDoc(doc);
                              setIsQuizModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>🎯 Take Quiz</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStudyActionDoc(doc);
                              setIsFlashcardsModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>🗂️ Flashcards</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStudyActionDoc(doc);
                              setIsSummaryModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>📑 Summary</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#DDD7CB] bg-white flex items-center justify-between">
          <div className="text-xs text-[#7D7971]">
            Active Sources:{" "}
            <span className="font-semibold text-[#15171A]">
              {[
                resumeDocs.length > 0 ? "Resume" : null,
                jdDocs.some((d) => d.isSelectedForInterview) ? "Job Description" : null,
                studyDocs.some((d) => d.isSelectedForInterview) ? "Study Materials" : null,
              ]
                .filter(Boolean)
                .join(", ") || "Standard Question Bank only"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#2A2E33] transition cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Viewing Chunk Submodal */}
        {viewingChunk && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white border border-[#DDD7CB] rounded-xl max-w-lg w-full p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-2">
                <span className="text-xs font-semibold text-[#15171A]">{viewingChunk.citation}</span>
                <button
                  onClick={() => setViewingChunk(null)}
                  className="p-1 text-[#7D7971] hover:text-[#15171A]"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="text-xs text-[#575A60] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap font-mono p-3 bg-[#FAF8F5] rounded-lg">
                {viewingChunk.text}
              </div>
            </div>
          </div>
        )}

        {/* Grounded AI Study Modals */}
        {activeStudyActionDoc && (
          <>
            <AskVibeLensModal
              isOpen={isAskModalOpen}
              onClose={() => setIsAskModalOpen(false)}
              documentId={activeStudyActionDoc.id}
              documentTitle={activeStudyActionDoc.title || activeStudyActionDoc.filename}
            />
            <QuizModal
              isOpen={isQuizModalOpen}
              onClose={() => setIsQuizModalOpen(false)}
              documentId={activeStudyActionDoc.id}
              documentTitle={activeStudyActionDoc.title || activeStudyActionDoc.filename}
            />
            <FlashcardsModal
              isOpen={isFlashcardsModalOpen}
              onClose={() => setIsFlashcardsModalOpen(false)}
              documentId={activeStudyActionDoc.id}
              documentTitle={activeStudyActionDoc.title || activeStudyActionDoc.filename}
            />
            <NotesSummaryModal
              isOpen={isSummaryModalOpen}
              onClose={() => setIsSummaryModalOpen(false)}
              documentId={activeStudyActionDoc.id}
              documentTitle={activeStudyActionDoc.title || activeStudyActionDoc.filename}
            />
          </>
        )}
      </div>
    </div>
  );
};
