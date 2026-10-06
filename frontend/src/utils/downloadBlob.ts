/**
 * Programmatic audio blob download utility.
 * Uses native document.createElement("a") with temporary Blob URL
 * to avoid browser navigation errors, fake HTTP requests, or "Check internet connection" failures.
 */

export interface DownloadResult {
  success: boolean;
  error?: string;
  filename?: string;
}

/**
 * Sanitizes a string for use as a safe filename across Windows, macOS, and Linux
 */
export function sanitizeFilename(name: string, fallbackExt = "webm"): string {
  if (!name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `voice_session_${timestamp}.${fallbackExt}`;
  }

  // Remove path traversal and invalid characters: \ / : * ? " < > |
  let sanitized = name.replace(/[/\\?%*:|"<>]/g, "-").trim();

  // If sanitized is empty after stripping
  if (!sanitized) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    sanitized = `voice_session_${timestamp}`;
  }

  // Ensure valid extension
  if (!sanitized.includes(".")) {
    sanitized = `${sanitized}.${fallbackExt}`;
  }

  return sanitized;
}

/**
 * Derives file extension from Blob MIME type
 */
export function getExtensionFromMime(mimeType?: string): string {
  if (!mimeType) return "webm";
  const lower = mimeType.toLowerCase();
  if (lower.includes("webm")) return "webm";
  if (lower.includes("ogg")) return "ogg";
  if (lower.includes("mp4") || lower.includes("m4a")) return "mp4";
  if (lower.includes("wav")) return "wav";
  if (lower.includes("mp3") || lower.includes("mpeg")) return "mp3";
  return "webm";
}

/**
 * Downloads a Blob reliably to the user's computer
 */
export function downloadBlob(blob: Blob | null | undefined, desiredFilename?: string): DownloadResult {
  // 1. Validate Blob
  if (!blob || !(blob instanceof Blob) || blob.size === 0) {
    console.warn("[downloadBlob] Cannot download: Blob is empty or invalid.");
    return {
      success: false,
      error: "There's no recording to download.",
    };
  }

  try {
    // 2. Resolve safe filename and extension
    const ext = getExtensionFromMime(blob.type);
    let filename = desiredFilename;

    if (!filename || filename.trim() === "") {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      filename = `voice_session_${timestamp}.${ext}`;
    } else {
      filename = sanitizeFilename(filename, ext);
    }

    // 3. Create fresh temporary Object URL dedicated for download
    const downloadUrl = URL.createObjectURL(blob);

    // 4. Create hidden anchor element and programmatically trigger download
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = downloadUrl;
    anchor.download = filename;

    // Append to body to ensure Chrome and Firefox handle click event properly
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // 5. Development console debug information (do not log audio data)
    if (Boolean((import.meta as any).env?.DEV)) {
      console.log("[AudioDownload] Download triggered successfully:", {
        source: "In-Memory Blob URL",
        mimeType: blob.type,
        sizeBytes: blob.size,
        filename,
      });
    }

    // 6. Safely revoke temporary download URL after browser has started reading the stream
    setTimeout(() => {
      try {
        URL.revokeObjectURL(downloadUrl);
      } catch (e) {}
    }, 60000);

    return {
      success: true,
      filename,
    };
  } catch (err: any) {
    console.error("[downloadBlob] Download failed:", err);
    return {
      success: false,
      error: err.message || "Failed to download recording file.",
    };
  }
}
