import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DashboardOverviewProvider } from "./context/DashboardOverviewContext";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ImagePage } from "./pages/ImagePage";
import { BatchPage } from "./pages/BatchPage";
import { VoicePage } from "./pages/VoicePage";
import { BodyPage } from "./pages/BodyPage";
import { FusionPage } from "./pages/FusionPage";
import { PresentationCoachPage } from "./pages/PresentationCoachPage";
import { InterviewPage } from "./pages/InterviewPage";
import { JournalPage } from "./pages/JournalPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ComparePage } from "./pages/ComparePage";
import { VibeHealthPage } from "./pages/VibeHealthPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { AppLayout } from "./components/layout/AppLayout";

const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || "/");
  const { user, logout, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (_userData: any) => {
    handleNavigate("/dashboard");
  };

  const handleLogout = async () => {
    await logout();
    handleNavigate("/");
  };

  const isPublicPage =
    currentPath === "/" ||
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath === "/onboarding" ||
    currentPath.startsWith("/verify-email") ||
    currentPath.startsWith("/reset-password");

  const renderContent = () => {
    if (currentPath.startsWith("/verify-email")) {
      return <VerifyEmailPage onNavigate={handleNavigate} />;
    }
    if (currentPath.startsWith("/reset-password")) {
      return <ResetPasswordPage onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith("/image/") || currentPath.startsWith("/image-analysis/")) {
      return <ImagePage onNavigate={handleNavigate} />;
    }

    switch (currentPath) {
      case "/login":
        return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case "/register":
        return <RegisterPage onNavigate={handleNavigate} onRegisterSuccess={handleLoginSuccess} />;
      case "/onboarding":
        return <OnboardingPage onNavigate={handleNavigate} />;
      case "/dashboard":
        return <DashboardPage onNavigate={handleNavigate} />;
      case "/image":
      case "/image-analysis":
        return <ImagePage onNavigate={handleNavigate} />;
      case "/batch":
        return <BatchPage onNavigate={handleNavigate} />;
      case "/voice":
        return <VoicePage onNavigate={handleNavigate} />;
      case "/body":
        return <BodyPage onNavigate={handleNavigate} />;
      case "/fusion":
        return <FusionPage onNavigate={handleNavigate} />;
      case "/presentation":
      case "/presentation-coach":
        return <PresentationCoachPage onNavigate={handleNavigate} />;
      case "/interview":
        return <InterviewPage onNavigate={handleNavigate} />;
      case "/journal":
        return <JournalPage onNavigate={handleNavigate} />;
      case "/analytics":
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case "/history":
        return <HistoryPage onNavigate={handleNavigate} />;
      case "/compare":
        return <ComparePage onNavigate={handleNavigate} />;
      case "/vibe-health":
        return <VibeHealthPage onNavigate={handleNavigate} />;
      case "/profile":
        return <ProfilePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "/settings":
        return <SettingsPage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "/":
      default:
        return <LandingPage onNavigateApp={handleNavigate} />;
    }
  };

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] text-[#15171A] font-sans antialiased selection:bg-[#DDD8CD] selection:text-[#15171A]">
        {renderContent()}
      </div>
    );
  }

  // Protect internal routes if unauthenticated
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] text-[#15171A] font-sans antialiased selection:bg-[#DDD8CD] selection:text-[#15171A]">
        <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <AppLayout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      user={user || undefined}
    >
      {renderContent()}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardOverviewProvider>
        <AppContent />
      </DashboardOverviewProvider>
    </AuthProvider>
  );
};

export default App;
