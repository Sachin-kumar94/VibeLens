import React from "react";
import { LoginPage } from "./LoginPage";

interface RegisterPageProps {
  onNavigate: (path: string) => void;
  onRegisterSuccess?: (user: any) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegisterSuccess }) => {
  return (
    <LoginPage
      onNavigate={onNavigate}
      onLoginSuccess={onRegisterSuccess}
      initialTab="register"
    />
  );
};
