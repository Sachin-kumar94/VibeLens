import React from "react";
import { BodyWorkspace } from "../components/body/BodyWorkspace";

interface BodyPageProps {
  onNavigate: (path: string) => void;
}

export const BodyPage: React.FC<BodyPageProps> = ({ onNavigate }) => {
  return <BodyWorkspace onNavigate={onNavigate} />;
};

export default BodyPage;
