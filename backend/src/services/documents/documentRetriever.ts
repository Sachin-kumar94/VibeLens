/**
 * Document Retriever
 * Semantic and keyword-grounded chunk retrieval for personal knowledge base (Sections 152, 153, 154).
 * Returns top-K chunks with exact citations (page, section, document name).
 */

import { prisma } from "../prisma.service.js";

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentName: string;
  page: number;
  section: string;
  text: string;
  relevanceScore: number;
  citation: string;
}

export class DocumentRetriever {
  /**
   * Retrieves the most relevant chunks for a specific user and query
   */
  static async retrieveRelevantChunks(
    userId: string,
    query: string,
    options: {
      documentIds?: string[];
      sourceTypes?: string[];
      topK?: number;
    } = {}
  ): Promise<RetrievedChunk[]> {
    const { documentIds, sourceTypes, topK = 4 } = options;

    if (!query || query.trim().length < 3) return [];

    // Filter documents by user and optional filters
    const docWhere: any = {
      userId,
      status: "READY",
    };

    if (documentIds && documentIds.length > 0) {
      docWhere.id = { in: documentIds };
    }

    if (sourceTypes && sourceTypes.length > 0) {
      docWhere.sourceType = { in: sourceTypes };
    }

    const documents = await prisma.userDocument.findMany({
      where: docWhere,
      select: {
        id: true,
        filename: true,
        title: true,
        sourceType: true,
      },
    });

    if (documents.length === 0) return [];

    const activeDocIds = documents.map((d) => d.id);
    const docNameMap = new Map<string, string>();
    for (const d of documents) {
      docNameMap.set(d.id, d.title || d.filename);
    }

    // Fetch chunks belonging to these active documents
    const chunks = await prisma.documentChunk.findMany({
      where: {
        userId,
        documentId: { in: activeDocIds },
      },
      select: {
        id: true,
        documentId: true,
        page: true,
        section: true,
        text: true,
      },
      take: 200, // Safe working set for scoring
    });

    if (chunks.length === 0) return [];

    // Score chunks using TF-IDF / keyword density algorithm
    const queryTokens = this.tokenize(query);
    const scoredChunks: Array<{ chunk: typeof chunks[0]; score: number }> = [];

    for (const chunk of chunks) {
      const score = this.calculateRelevance(chunk.text, chunk.section || "", queryTokens);
      if (score > 0) {
        scoredChunks.push({ chunk, score });
      }
    }

    // Sort descending by relevance score
    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK).map(({ chunk, score }) => {
      const docName = docNameMap.get(chunk.documentId) || "Document";
      const sectionName = chunk.section ? ` — ${chunk.section}` : "";
      const pageInfo = chunk.page ? `Page ${chunk.page}` : "";
      const citation = `${docName}${pageInfo ? ` — ${pageInfo}` : ""}${sectionName}`;

      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        documentName: docName,
        page: chunk.page,
        section: chunk.section || "General",
        text: chunk.text,
        relevanceScore: Math.round(score * 100) / 100,
        citation,
      };
    });
  }

  /**
   * Search uploaded material by filename, topic, or keyword (Section 87 & 163)
   */
  static async searchDocuments(
    userId: string,
    searchTerm: string,
    limit = 10
  ): Promise<RetrievedChunk[]> {
    return this.retrieveRelevantChunks(userId, searchTerm, { topK: limit });
  }

  private static tokenize(text: string): string[] {
    const stopWords = new Set([
      "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
      "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did",
      "and", "or", "but", "if", "then", "else", "what", "which", "who", "whom", "this",
      "that", "these", "those", "how", "why", "can", "could", "should", "would",
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !stopWords.has(t));
  }

  private static calculateRelevance(
    text: string,
    section: string,
    queryTokens: string[]
  ): number {
    if (queryTokens.length === 0) return 0;

    const lowerText = text.toLowerCase();
    const lowerSection = section.toLowerCase();
    let score = 0;
    let matchedTokens = 0;

    for (const token of queryTokens) {
      // Direct exact word match
      const regex = new RegExp(`\\b${token}\\b`, "i");
      if (regex.test(lowerText)) {
        score += 2.0;
        matchedTokens++;
      } else if (lowerText.includes(token)) {
        score += 0.8;
        matchedTokens++;
      }

      // Extra weight for section title matching
      if (lowerSection.includes(token)) {
        score += 3.0;
      }
    }

    // Boost score if multiple distinct tokens matched
    const coverage = matchedTokens / queryTokens.length;
    score = score * (1 + coverage);

    return score;
  }
}
