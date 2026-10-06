import React from "react";
import { ImageWorkspace } from "../components/image/ImageWorkspace";

interface ImagePageProps {
  onNavigate: (path: string) => void;
}

export const ImagePage: React.FC<ImagePageProps> = ({ onNavigate }) => {
  // Extract analysisId from query parameter if present (e.g. /image?id=ana_123)
  const searchParams = new URLSearchParams(window.location.search);
  const initialId = searchParams.get("id");

  return (
    <div className="pb-12">
      <ImageWorkspace initialAnalysisId={initialId} onNavigate={onNavigate} />
    </div>
  );
};

export default ImagePage;
