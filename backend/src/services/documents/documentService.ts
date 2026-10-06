/**
 * Document Service
 * Handles document ingestion, text extraction, chunking, and database persistence (Sections 17-21, 80-86).
 */

import fs from "fs";
import path from "path";
import { prisma } from "../prisma.service.js";
import { DocumentChunker, RawDocumentPage } from "./documentChunker.js";
import { ResumeAnalyzer } from "./resumeAnalyzer.js";
import { JobDescriptionAnalyzer } from "./jobDescriptionAnalyzer.js";
import { GeminiProvider } from "../ai/geminiProvider.js";
import { ModelRouter } from "../ai/modelRouter.js";

// Storage directory for uploaded documents
const UPLOADS_DOCS_DIR = path.resolve(process.cwd(), "data", "uploads", "documents");
if (!fs.existsSync(UPLOADS_DOCS_DIR)) {
  fs.mkdirSync(UPLOADS_DOCS_DIR, { recursive: true });
}

export interface IngestDocumentParams {
  userId: string;
  file: Express.Multer.File;
  sourceType: "RESUME" | "JOB_DESCRIPTION" | "STUDY_MATERIAL";
  title?: string;
}

export class DocumentService {
  /**
   * Ingest, validate, extract, chunk, and index an uploaded document
   */
  static async ingestDocument(params: IngestDocumentParams) {
    const { userId, file, sourceType, title } = params;

    const ext = path.extname(file.originalname).toLowerCase();
    const cleanTitle = (title || file.originalname).replace(/\.[^/.]+$/, "");

    // 1. Initial UserDocument record in PROCESSING state
    const userDoc = await prisma.userDocument.create({
      data: {
        userId,
        filename: file.originalname,
        type: ext.replace(".", "") || "txt",
        mimeType: file.mimetype,
        size: file.size,
        title: cleanTitle,
        sourceType,
        status: "PROCESSING",
        storagePath: file.path,
        isSelectedForInterview: true,
      },
    });

    try {
      // 2. Extract text and pages
      const extraction = await this.extractTextFromFile(file.path, ext, file.mimetype);

      if (!extraction.fullText || extraction.fullText.trim().length < 20) {
        if (ext === ".pdf") {
          throw new Error(
            "This document appears to contain scanned pages or image-only content. Text extraction isn't available for this file."
          );
        }
        throw new Error("We couldn't extract readable text from this file.");
      }

      // 3. Chunk the document
      let chunks: Array<{ page: number; section: string; text: string; tokenCount: number }> = [];
      if (extraction.pages && extraction.pages.length > 0) {
        chunks = DocumentChunker.chunkPages(extraction.pages);
      } else {
        chunks = DocumentChunker.chunkFlatText(extraction.fullText, cleanTitle);
      }

      // 4. Batch store document chunks
      if (chunks.length > 0) {
        await prisma.documentChunk.createMany({
          data: chunks.map((c) => ({
            documentId: userDoc.id,
            userId,
            page: c.page,
            section: c.section,
            text: c.text,
            tokenCount: c.tokenCount,
          })),
        });
      }

      // 5. Source-specific profile analysis
      if (sourceType === "RESUME") {
        const resumeProfile = ResumeAnalyzer.analyze(extraction.fullText);
        await prisma.resumeProfile.create({
          data: {
            userId,
            documentId: userDoc.id,
            name: resumeProfile.profile.name !== "Unavailable" ? resumeProfile.profile.name : cleanTitle,
            summary: resumeProfile.profile.summary !== "Unavailable" ? resumeProfile.profile.summary : null,
            education: JSON.stringify(resumeProfile.education),
            experience: JSON.stringify(resumeProfile.experience),
            internships: JSON.stringify(resumeProfile.internships),
            projects: JSON.stringify(resumeProfile.projects),
            skills: JSON.stringify(resumeProfile.skills),
            technologies: JSON.stringify(resumeProfile.technologies),
            certifications: JSON.stringify(resumeProfile.certifications),
            achievements: JSON.stringify(resumeProfile.achievements),
            rawText: extraction.fullText,
          },
        });
      } else if (sourceType === "JOB_DESCRIPTION") {
        const jdParsed = JobDescriptionAnalyzer.analyze(extraction.fullText);
        await prisma.jobDescription.create({
          data: {
            userId,
            documentId: userDoc.id,
            title: cleanTitle,
            role: jdParsed.role || "Software Engineer",
            company: jdParsed.company,
            requirements: JSON.stringify(jdParsed.requirements),
            responsibilities: JSON.stringify(jdParsed.responsibilities),
            skills: JSON.stringify(jdParsed.skills),
            tools: JSON.stringify(jdParsed.tools),
            experienceLevel: jdParsed.experienceLevel,
            rawText: extraction.fullText,
          },
        });
      }

      // 6. Mark UserDocument as READY
      const updatedDoc = await prisma.userDocument.update({
        where: { id: userDoc.id },
        data: {
          status: "READY",
          pageCount: extraction.pageCount || 1,
          metadata: JSON.stringify({
            chunkCount: chunks.length,
            extractedChars: extraction.fullText.length,
          }),
        },
      });

      return updatedDoc;
    } catch (err: any) {
      console.error(`Document processing failed for doc ${userDoc.id}:`, err);
      const friendlyError = err.message || "Failed to process document content.";

      await prisma.userDocument.update({
        where: { id: userDoc.id },
        data: {
          status: "FAILED",
          errorMessage: friendlyError,
        },
      });

      throw new Error(friendlyError);
    }
  }

  /**
   * Helper to parse PDF, DOCX, TXT into raw pages and text
   */
  private static async extractTextFromFile(
    filePath: string,
    ext: string,
    _mimetype: string
  ): Promise<{ fullText: string; pageCount: number; pages?: RawDocumentPage[] }> {
    if (ext === ".txt" || ext === ".md") {
      const fullText = fs.readFileSync(filePath, "utf-8");
      return { fullText, pageCount: 1 };
    }

    if (ext === ".docx") {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ path: filePath });
        const fullText = result.value || "";
        return { fullText, pageCount: 1 };
      } catch (e: any) {
        console.warn("Mammoth docx parse error:", e);
        throw new Error("Unable to parse Word (.docx) document.");
      }
    }

    if (ext === ".pdf") {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfParseModule = await import("pdf-parse");

        let fullText = "";
        let pageCount = 1;
        let pages: RawDocumentPage[] | undefined = undefined;

        // 1. pdf-parse v2 API (PDFParse class)
        if ((pdfParseModule as any).PDFParse) {
          const PDFParseClass = (pdfParseModule as any).PDFParse;
          const parser = new PDFParseClass({ data: new Uint8Array(dataBuffer) });
          const result = await parser.getText();
          await parser.destroy();

          fullText = (result.text || "").trim();
          pageCount = result.total || result.pages?.length || 1;
          if (Array.isArray(result.pages) && result.pages.length > 0) {
            pages = result.pages.map((p: any) => ({
              pageNumber: p.num || 1,
              text: p.text || "",
            }));
          }
        } else {
          // 2. pdf-parse v1 functional API fallback
          const pdfParse = (pdfParseModule as any).default || pdfParseModule;
          if (typeof pdfParse === "function") {
            const data = await pdfParse(dataBuffer);
            fullText = (data.text || "").trim();
            pageCount = data.numpages || 1;

            const rawPages = fullText.split(/\f/);
            if (rawPages.length > 1) {
              pages = rawPages.map((pText: string, idx: number) => ({
                pageNumber: idx + 1,
                text: pText,
              }));
            }
          }
        }

        // 3. Multimodal Gemini PDF OCR fallback if text is sparse or image-only
        if (!fullText || fullText.length < 20) {
          if (GeminiProvider.isConfigured()) {
            try {
              const base64Data = dataBuffer.toString("base64");
              const res = await GeminiProvider.analyzeMultimodal(
                [
                  { inlineData: { mimeType: "application/pdf", data: base64Data } },
                  {
                    text: "Extract and transcribe all text, headings, sections, tables, and notes from this document verbatim. Preserve line breaks and paragraph structure.",
                  },
                ],
                {
                  feature: "pdf_ocr_extraction",
                  model: ModelRouter.getFastModel(),
                  timeoutMs: 25000,
                }
              );

              const geminiText = typeof res === "string" ? res : res?.text || JSON.stringify(res);
              if (geminiText && geminiText.length > 20) {
                fullText = geminiText;
                pageCount = 1;
              }
            } catch (geminiErr) {
              console.warn("[DocumentService] Gemini multimodal PDF fallback failed:", geminiErr);
            }
          }
        }

        if (fullText && fullText.length > 0) {
          return { fullText, pageCount, pages };
        }

        throw new Error(
          "We couldn't extract text from this PDF. It may be password-protected, encrypted, or contain only scanned images without selectable text."
        );
      } catch (e: any) {
        console.warn("PDF parse error:", e);
        if (e?.name === "PasswordException" || /password/i.test(e?.message || "")) {
          throw new Error("This PDF is password-protected. Please upload an unprotected or unlocked copy.");
        }
        if (/corrupt|format|invalid/i.test(e?.message || "")) {
          throw new Error("Unable to parse PDF text. The document appears corrupt or damaged.");
        }
        throw new Error(e?.message || "Unable to extract text from this PDF.");
      }
    }

    // Fallback: try reading as plain utf-8
    const raw = fs.readFileSync(filePath, "utf-8");
    return { fullText: raw, pageCount: 1 };
  }

  /**
   * List documents for a user with optional filter
   */
  static async getDocuments(userId: string, sourceType?: string) {
    const where: any = {
      userId,
      status: { not: "DELETED" },
    };
    if (sourceType) {
      where.sourceType = sourceType;
    }

    return prisma.userDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });
  }

  /**
   * Get single document with chunks preview
   */
  static async getDocumentById(userId: string, documentId: string) {
    return prisma.userDocument.findFirst({
      where: { id: documentId, userId },
      include: {
        chunks: {
          take: 20,
          orderBy: { page: "asc" },
        },
        resumeProfiles: true,
        jobDescriptions: true,
      },
    });
  }

  /**
   * Toggle selection state for an interview source document
   */
  static async toggleDocumentSelection(userId: string, documentId: string, isSelected: boolean) {
    const doc = await prisma.userDocument.findFirst({
      where: { id: documentId, userId },
    });
    if (!doc) throw new Error("Document not found or access denied.");

    return prisma.userDocument.update({
      where: { id: documentId },
      data: { isSelectedForInterview: isSelected },
    });
  }

  /**
   * Delete document and optionally cascade dependent generated questions
   */
  static async deleteDocument(userId: string, documentId: string, cascadeQuestions = false) {
    const doc = await prisma.userDocument.findFirst({
      where: { id: documentId, userId },
    });
    if (!doc) throw new Error("Document not found or access denied.");

    // Remove file from disk if present
    if (doc.storagePath && fs.existsSync(doc.storagePath)) {
      try {
        fs.unlinkSync(doc.storagePath);
      } catch (e) {
        console.warn("Could not remove document file:", e);
      }
    }

    // Cascade dependent questions if requested
    if (cascadeQuestions) {
      await prisma.interviewQuestion.deleteMany({
        where: {
          userId,
          sourceDocumentId: documentId,
        },
      });
    } else {
      // Disassociate without deleting
      await prisma.interviewQuestion.updateMany({
        where: { sourceDocumentId: documentId },
        data: { sourceDocumentId: null },
      });
    }

    // Delete record (cascades chunks, resumeProfiles, jobDescriptions via Prisma relation)
    return prisma.userDocument.delete({
      where: { id: documentId },
    });
  }
}
