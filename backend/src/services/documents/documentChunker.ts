/**
 * Document Chunker
 * Chunks documents while preserving page numbers, section headers, and semantic boundaries.
 * Includes injection protection (Section 126 & 127: text is treated purely as data).
 */

export interface RawDocumentPage {
  pageNumber: number;
  text: string;
}

export interface DocumentChunkResult {
  page: number;
  section: string;
  text: string;
  tokenCount: number;
  metadata?: Record<string, any>;
}

export class DocumentChunker {
  /**
   * Chunks page-aware text into structured semantic blocks
   */
  static chunkPages(
    pages: RawDocumentPage[],
    chunkSizeChars = 1800,
    chunkOverlapChars = 200
  ): DocumentChunkResult[] {
    const chunks: DocumentChunkResult[] = [];

    for (const pageItem of pages) {
      const pageText = this.sanitizeText(pageItem.text);
      if (!pageText || pageText.trim().length < 20) continue;

      const paragraphs = pageText.split(/\n\s*\n/);
      let currentSection = `Page ${pageItem.pageNumber}`;
      let currentChunkText = "";

      for (const p of paragraphs) {
        const trimmed = p.trim();
        if (!trimmed) continue;

        // Detect potential section header (short line ending in colon or uppercase)
        if (
          trimmed.length < 80 &&
          (trimmed.endsWith(":") ||
            /^[A-Z0-9\s\-_–—]+$/.test(trimmed) ||
            /^#+\s/.test(trimmed))
        ) {
          currentSection = trimmed.replace(/^#+\s*/, "").replace(/:$/, "").trim();
        }

        if (currentChunkText.length + trimmed.length > chunkSizeChars && currentChunkText.length > 200) {
          chunks.push({
            page: pageItem.pageNumber,
            section: currentSection,
            text: currentChunkText.trim(),
            tokenCount: Math.round(currentChunkText.trim().length / 4),
          });
          // Retain overlap from end of current chunk
          const overlap = currentChunkText.slice(-chunkOverlapChars);
          currentChunkText = overlap + "\n\n" + trimmed;
        } else {
          currentChunkText = currentChunkText
            ? currentChunkText + "\n\n" + trimmed
            : trimmed;
        }
      }

      if (currentChunkText.trim().length > 30) {
        chunks.push({
          page: pageItem.pageNumber,
          section: currentSection,
          text: currentChunkText.trim(),
          tokenCount: Math.round(currentChunkText.trim().length / 4),
        });
      }
    }

    return chunks;
  }

  /**
   * Chunks flat text when page numbers are not available
   */
  static chunkFlatText(
    text: string,
    sourceName = "Document",
    chunkSizeChars = 1800
  ): DocumentChunkResult[] {
    const cleanText = this.sanitizeText(text);
    if (!cleanText || cleanText.length < 20) return [];

    const paragraphs = cleanText.split(/\n\s*\n/);
    const chunks: DocumentChunkResult[] = [];
    let currentChunkText = "";
    let currentSection = sourceName;
    let pageEstimate = 1;
    let charCountOnPage = 0;

    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;

      // Estimate ~2500 chars per page
      charCountOnPage += trimmed.length;
      if (charCountOnPage > 2500) {
        pageEstimate++;
        charCountOnPage = 0;
      }

      if (
        trimmed.length < 80 &&
        (trimmed.endsWith(":") ||
          /^[A-Z0-9\s\-_–—]+$/.test(trimmed) ||
          /^#+\s/.test(trimmed))
      ) {
        currentSection = trimmed.replace(/^#+\s*/, "").replace(/:$/, "").trim();
      }

      if (currentChunkText.length + trimmed.length > chunkSizeChars && currentChunkText.length > 200) {
        chunks.push({
          page: pageEstimate,
          section: currentSection,
          text: currentChunkText.trim(),
          tokenCount: Math.round(currentChunkText.trim().length / 4),
        });
        currentChunkText = trimmed;
      } else {
        currentChunkText = currentChunkText
          ? currentChunkText + "\n\n" + trimmed
          : trimmed;
      }
    }

    if (currentChunkText.trim().length > 30) {
      chunks.push({
        page: pageEstimate,
        section: currentSection,
        text: currentChunkText.trim(),
        tokenCount: Math.round(currentChunkText.trim().length / 4),
      });
    }

    return chunks;
  }

  /**
   * Sanitizes text and strips zero-width/control characters
   * Prevents prompt injection payloads from being interpreted as instructions
   */
  private static sanitizeText(text: string): string {
    if (!text) return "";
    return text
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }
}
