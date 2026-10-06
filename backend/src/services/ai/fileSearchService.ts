import { prisma } from "../prisma.service.js";
import { DocumentRetriever, RetrievedChunk } from "../documents/documentRetriever.js";

export interface SearchDocumentsParams {
  userId: string;
  query: string;
  documentIds?: string[];
  limit?: number;
}

export interface GroundedCitation {
  documentId: string;
  documentTitle: string;
  filename: string;
  sourceType: string;
  page: number;
  section: string;
  citation: string;
  textSnippet: string;
  score: number;
}

export class FileSearchService {
  /**
   * Semantic and keyword retrieval for uploaded documents (PDF, DOCX, TXT)
   * Note: As per architecture rules, audio/video are NOT accepted here.
   */
  public static async search(params: SearchDocumentsParams): Promise<GroundedCitation[]> {
    const { userId, query, documentIds, limit = 5 } = params;

    // Filter to selected or specified documents
    let targetDocIds = documentIds;
    if (!targetDocIds || targetDocIds.length === 0) {
      const selected = await prisma.userDocument.findMany({
        where: {
          userId,
          status: "READY",
          isSelectedForInterview: true,
        },
        select: { id: true },
      });
      targetDocIds = selected.map((s) => s.id);
    }

    if (targetDocIds.length === 0) {
      // If none selected, search all ready user documents
      const allReady = await prisma.userDocument.findMany({
        where: { userId, status: "READY" },
        select: { id: true },
        take: 10,
      });
      targetDocIds = allReady.map((d) => d.id);
    }

    if (targetDocIds.length === 0) {
      return [];
    }

    const chunks = await DocumentRetriever.retrieveRelevantChunks(userId, query, {
      documentIds: targetDocIds,
      topK: limit,
    });

    return chunks.map((c: RetrievedChunk) => ({
      documentId: c.documentId,
      documentTitle: c.documentName,
      filename: c.documentName,
      sourceType: "STUDY_MATERIAL",
      page: c.page || 1,
      section: c.section || "General",
      citation: c.citation,
      textSnippet: c.text,
      score: c.relevanceScore,
    }));
  }

  /**
   * Validates file modality before ingestion
   */
  public static validateModality(mimeType: string, filename: string): boolean {
    const lower = filename.toLowerCase();
    const isAudioVideo =
      mimeType.startsWith("audio/") ||
      mimeType.startsWith("video/") ||
      /\.(mp3|wav|mp4|webm|m4a|ogg|avi|mov)$/i.test(lower);

    if (isAudioVideo) {
      throw new Error(
        "File Search RAG accepts text documents (PDF, DOCX, TXT) only. Audio and video files must be routed to the media transcription pipeline."
      );
    }
    return true;
  }
}
