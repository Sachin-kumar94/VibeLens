import React, { useState } from "react";
import { Navbar } from "../components/common/Navbar";
import { NaturalHero } from "../components/landing/NaturalHero";
import { TrustAndFeatureIntro } from "../components/landing/TrustAndFeatureIntro";
import { MomentsSection } from "../components/landing/MomentsSection";
import { HorizontalStory } from "../components/landing/HorizontalStory";
import { PersonalVibe } from "../components/landing/PersonalVibe";
import { PersonalBaseline } from "../components/landing/PersonalBaseline";
import { VibeJournal } from "../components/landing/VibeJournal";
import { EditorialAnalytics } from "../components/landing/EditorialAnalytics";
import { PricingSection } from "../components/landing/PricingSection";
import { ResourcesSection } from "../components/landing/ResourcesSection";
import { VisualArchive } from "../components/landing/VisualArchive";
import { PrivacySection } from "../components/landing/PrivacySection";
import { Footer } from "../components/common/Footer";
import { InteractiveStudio } from "../components/studio/InteractiveStudio";
import { AuthModal } from "../components/auth/AuthModal";

interface LandingPageProps {
  onNavigateApp?: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateApp }) => {
  const [viewMode, setViewMode] = useState<"landing" | "studio">("landing");
  const [studioInitialTab, setStudioInitialTab] = useState<"image" | "voice" | "body" | "fusion">("image");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const scrollToSection = (id: string) => {
    const targetId = id === "how-it-works" || id === "features" ? "features" : id;
    if (viewMode === "studio") {
      setViewMode("landing");
      setTimeout(() => {
        const el = document.getElementById(targetId) || document.getElementById(id);
        if (el) {
          const yOffset = -85;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } else {
      const el = document.getElementById(targetId) || document.getElementById(id);
      if (el) {
        const yOffset = -85;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const openStudio = (tab?: string) => {
    if (onNavigateApp) {
      onNavigateApp("/dashboard");
      return;
    }
    const validTab = (tab === "voice" || tab === "body" || tab === "fusion") ? tab : "image";
    setStudioInitialTab(validTab);
    setViewMode("studio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAuth = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  if (viewMode === "studio") {
    return (
      <InteractiveStudio
        initialTab={studioInitialTab}
        onBackToLanding={() => {
          setViewMode("landing");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#17191A] selection:bg-[#DDD8CD] selection:text-[#17191A] font-sans antialiased overflow-x-hidden">
      {/* 1. Minimal Sticky Navbar with working Sign In & Get Started */}
      <Navbar
        onNavigate={scrollToSection}
        onOpenApp={openStudio}
        onSignIn={() => openAuth("login")}
        onGetStarted={() => openAuth("register")}
      />

      {/* 2. Hero Section: Natural Humanistic Hero (Matching Reference Concept) */}
      <div id="hero">
        <NaturalHero
          onExplore={() => openAuth("register")}
          onSeeHowItWorks={() => scrollToSection("how-it-works")}
          onWatchDemo={() => scrollToSection("how-it-works")}
        />
      </div>

      {/* 2b. Trust Strip & Feature Preview Cards (Matches Reference Concept) */}
      <TrustAndFeatureIntro onNavigateSection={scrollToSection} />

      {/* Auth Modal (Matches Screenshot: Create account & Welcome back) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          if (onNavigateApp) {
            onNavigateApp("/dashboard");
          }
        }}
      />

      {/* 3. Section 2: Moments Section (Unique Layouts for Image, Voice in Muted Blue, Body in Natural Green) */}
      <MomentsSection />

      {/* 4. Section 3: One moment. Many signals. (Horizontal Storytelling Progression) */}
      <HorizontalStory />

      {/* 5. Section 4: Personal Vibe (Minimal Horizontal Meters & 7-Day Line Bar) */}
      <div id="product">
        <PersonalVibe />
      </div>

      {/* 6. Section 5: Personal Baseline (Real Comparisons: Average vs Today vs Delta Change) */}
      <PersonalBaseline />

      {/* 7. Section 6: Vibe Journal (Warm Digital Notebook with Still Life Photo & Reflection Notes) */}
      <VibeJournal />

      {/* 13. Section 12: Editorial Analytics (Thin Lines, Minimal Charts, Off-White Surfaces) */}
      <EditorialAnalytics />

      {/* 14. Section 13: Pricing Tiers */}
      <PricingSection onSelectPlan={() => openAuth("register")} />

      {/* 15. Section 14: Knowledge & Framework Resources */}
      <ResourcesSection />

      {/* 16. Section 15: Visual Archive (Curated Historical Moments Catalog) */}
      <VisualArchive />

      {/* 17. Section 16: Honest Privacy Pillars (Surveillance-Free, Local Encryption) */}
      <PrivacySection />

      {/* 18. Minimalist Handcrafted Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
