import { useState, useEffect, useRef } from "react";

/**
 * Dedicated hook to manage the lifecycle of Object URLs for Blobs.
 * - Creates a single stable Object URL for the current Blob
 * - Safely revokes previous URL when a new Blob is provided
 * - Cleans up URL on unmount without premature revoking
 */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const currentBlobRef = useRef<Blob | null | undefined>(null);

  useEffect(() => {
    // If blob hasn't changed, retain current URL
    if (blob === currentBlobRef.current) {
      return;
    }
    currentBlobRef.current = blob;

    // Revoke previous URL if one exists
    if (currentUrlRef.current && currentUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }

    if (!blob) {
      setObjectUrl(null);
      return;
    }

    // Create new URL for current blob
    const url = URL.createObjectURL(blob);
    currentUrlRef.current = url;
    setObjectUrl(url);

    // Cleanup when blob changes or component unmounts
    return () => {
      if (currentUrlRef.current && currentUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, [blob]);

  return objectUrl;
}
