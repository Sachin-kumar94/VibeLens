import { Request, Response } from "express";
import { DocumentService } from "../services/documents/documentService.js";
import { DocumentRetriever } from "../services/documents/documentRetriever.js";
import { JobDescriptionAnalyzer } from "../services/documents/jobDescriptionAnalyzer.js";
import { prisma } from "../services/prisma.service.js";
import fs from "fs";
import path from "path";

export class DocumentController {
  private async resolveUserId(req: Request): Promise<string> {
    if (req.user?.id) return req.user.id;
    const defaultUser = await prisma.user.findFirst({ select: { id: true } });
    return defaultUser?.id || "cmus53ny300025po8aezh9kp0";
  }

  /**
   * POST /api/documents/upload
   * Handles PDF, DOCX, TXT upload and triggers the ingestion pipeline
   */
  async upload(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file was uploaded. Please attach a PDF, DOCX, or TXT file.",
        });
      }

      const sourceType = (req.body.sourceType || "STUDY_MATERIAL").toUpperCase() as
        | "RESUME"
        | "JOB_DESCRIPTION"
        | "STUDY_MATERIAL";

      const title = req.body.title || req.file.originalname;

      const ingested = await DocumentService.ingestDocument({
        userId,
        file: req.file,
        sourceType,
        title,
      });

      res.status(201).json({
        success: true,
        data: ingested,
        message: "Document analyzed and ready for interview practice.",
      });
    } catch (err: any) {
      console.error("Document upload error:", err);
      // Clean up uploaded temporary file if error occurred
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }

      res.status(400).json({
        success: false,
        error: err.message || "Failed to process document.",
      });
    }
  }

  /**
   * POST /api/documents/job-description/text
   * Allows direct paste of Job Description text without a file
   */
  async pasteJobDescription(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const { text, title, role, company } = req.body;

      if (!text || typeof text !== "string" || text.trim().length < 20) {
        return res.status(400).json({
          success: false,
          error: "Job description text must contain at least 20 characters.",
        });
      }

      const cleanTitle = title || (role ? `${role} Role Description` : "Pasted Job Description");
      const analyzed = JobDescriptionAnalyzer.analyze(text);

      // Save virtual user document
      const userDoc = await prisma.userDocument.create({
        data: {
          userId,
          filename: `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`,
          type: "txt",
          mimeType: "text/plain",
          size: Buffer.byteLength(text, "utf-8"),
          title: cleanTitle,
          sourceType: "JOB_DESCRIPTION",
          status: "READY",
          pageCount: 1,
          isSelectedForInterview: true,
          metadata: JSON.stringify({
            detectedRole: analyzed.role,
            skillsCount: analyzed.skills.length,
          }),
        },
      });

      // Save parsed Job Description
      const jd = await prisma.jobDescription.create({
        data: {
          userId,
          documentId: userDoc.id,
          title: cleanTitle,
          role: role || analyzed.role || "Software Engineer",
          company: company || analyzed.company || "Target Company",
          requirements: JSON.stringify(analyzed.requirements),
          responsibilities: JSON.stringify(analyzed.responsibilities),
          skills: JSON.stringify(analyzed.skills),
          tools: JSON.stringify(analyzed.tools),
          experienceLevel: analyzed.experienceLevel,
          rawText: text,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          document: userDoc,
          jobDescription: jd,
          analyzed,
        },
        message: "Job description saved and ready for role-aligned practice.",
      });
    } catch (err: any) {
      console.error("Paste JD error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to process job description.",
      });
    }
  }

  /**
   * GET /api/documents
   * List all documents for the user with counts
   */
  async list(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const { sourceType } = req.query;

      const docs = await DocumentService.getDocuments(
        userId,
        sourceType ? String(sourceType).toUpperCase() : undefined
      );

      res.json({
        success: true,
        data: docs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || "Failed to list documents.",
      });
    }
  }

  /**
   * GET /api/documents/:id
   * Get single document details + chunk previews
   */
  async getById(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const id = String(req.params.id);

      const doc = await DocumentService.getDocumentById(userId, id);
      if (!doc) {
        return res.status(404).json({ success: false, error: "Document not found." });
      }

      res.json({
        success: true,
        data: doc,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || "Failed to fetch document.",
      });
    }
  }

  /**
   * PATCH /api/documents/:id/toggle
   * Toggle isSelectedForInterview flag
   */
  async toggleSelection(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const id = String(req.params.id);
      const { isSelected } = req.body;

      const updated = await DocumentService.toggleDocumentSelection(
        userId,
        id,
        Boolean(isSelected)
      );

      res.json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || "Failed to update document selection.",
      });
    }
  }

  /**
   * DELETE /api/documents/:id
   * Delete document and chunks with optional cascade to dependent questions
   */
  async delete(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const id = String(req.params.id);
      const cascadeQuestions = req.query.cascadeQuestions === "true";

      await DocumentService.deleteDocument(userId, id, cascadeQuestions);

      res.json({
        success: true,
        message: "Document and associated learning references deleted.",
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || "Failed to delete document.",
      });
    }
  }

  /**
   * GET /api/documents/search
   * Search through user's uploaded document chunks
   */
  async search(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const query = String(req.query.q || req.query.query || "").trim();

      if (!query || query.length < 2) {
        return res.json({ success: true, data: [] });
      }

      const results = await DocumentRetriever.searchDocuments(userId, query, 10);
      res.json({
        success: true,
        data: results,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || "Search failed.",
      });
    }
  }

  /**
   * GET /api/documents/resume/active
   * Get latest parsed resume profile
   */
  async getActiveResume(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const resume = await prisma.resumeProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { document: true },
      });

      if (!resume) {
        return res.json({ success: true, data: null });
      }

      res.json({
        success: true,
        data: {
          id: resume.id,
          name: resume.name,
          summary: resume.summary,
          education: JSON.parse(resume.education || "[]"),
          experience: JSON.parse(resume.experience || "[]"),
          internships: JSON.parse(resume.internships || "[]"),
          projects: JSON.parse(resume.projects || "[]"),
          skills: JSON.parse(resume.skills || "[]"),
          technologies: JSON.parse(resume.technologies || "[]"),
          certifications: JSON.parse(resume.certifications || "[]"),
          achievements: JSON.parse(resume.achievements || "[]"),
          document: resume.document,
          createdAt: resume.createdAt,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || "Failed to get resume profile.",
      });
    }
  }
}

export const documentController = new DocumentController();
