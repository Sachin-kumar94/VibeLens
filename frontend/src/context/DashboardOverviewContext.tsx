import React, { createContext, useContext, useState, useCallback } from "react";

interface DashboardOverviewContextType {
  heroVisible: boolean;
  toggleHero: () => void;
  setHeroVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const STORAGE_KEY = "vibelens_dashboard_hero_visible";

const DashboardOverviewContext = createContext<DashboardOverviewContextType | undefined>(undefined);

export const DashboardOverviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [heroVisible, setHeroVisibleState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return stored === "true";
      }
    } catch {
      // Ignore sessionStorage access errors
    }
    return true;
  });

  const setHeroVisible = useCallback<React.Dispatch<React.SetStateAction<boolean>>>((action) => {
    setHeroVisibleState((prev) => {
      const next = typeof action === "function" ? (action as (p: boolean) => boolean)(prev) : action;
      try {
        sessionStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignore sessionStorage write errors
      }
      return next;
    });
  }, []);

  const toggleHero = useCallback(() => {
    setHeroVisible((prev) => !prev);
  }, [setHeroVisible]);

  return (
    <DashboardOverviewContext.Provider value={{ heroVisible, toggleHero, setHeroVisible }}>
      {children}
    </DashboardOverviewContext.Provider>
  );
};

export const useDashboardOverview = (): DashboardOverviewContextType => {
  const ctx = useContext(DashboardOverviewContext);
  if (!ctx) {
    return {
      heroVisible: true,
      toggleHero: () => {},
      setHeroVisible: () => {},
    };
  }
  return ctx;
};
