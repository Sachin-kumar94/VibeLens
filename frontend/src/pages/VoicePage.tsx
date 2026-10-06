import React from "react";
import { VoiceWorkspace } from "../components/voice/VoiceWorkspace";

interface VoicePageProps {
  onNavigate: (path: string) => void;
}

export const VoicePage: React.FC<VoicePageProps> = ({ onNavigate }) => {
  return <VoiceWorkspace onNavigate={onNavigate} />;
};

export default VoicePage;
