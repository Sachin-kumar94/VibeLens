import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Mic,
  Activity,
  Layers,
  Columns,
  Clock,
  BarChart2,
  BookOpen,
  Presentation,
  UserCheck,
  Settings,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Lock,
  Check,
  X,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { VibeLensLogo, VibeLensIcon } from "../common/BrandIcons";
import { api, UserNotification, SearchResult } from "../../services/api";
import { aiApi, SemanticSearchResult } from "../../services/aiApi";
import { useDashboardOverview } from "../../context/DashboardOverviewContext";

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user?: any;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  user,
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [aiSearchResults, setAiSearchResults] = useState<SemanticSearchResult | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHeaderNavMenuOpen, setIsHeaderNavMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);

  // Desktop Sidebar Expand/Collapse State (persisted in localStorage)
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem("vibelens_sidebar_expanded");
      if (saved !== null) {
        return saved === "true";
      }
    } catch {
      // Ignore storage read error
    }
    return true;
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleSidebar = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    setSidebarExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("vibelens_sidebar_expanded", String(next));
      } catch {}
      return next;
    });
  };

  const userName = user?.name || "Member";
  const userPlan = user?.plan || "Free Plan";
  const userEmail = user?.email || "";
  const userAvatar = user?.avatarUrl || user?.avatar || "/assets/editorial/hero-editorial-woman.jpg";

  // Hotkey listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        setIsProfileMenuOpen(false);
        setIsHeaderNavMenuOpen(false);
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close header nav menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setIsHeaderNavMenuOpen(false);
      }
    };
    if (isHeaderNavMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isHeaderNavMenuOpen]);

  // Fetch notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.warn("Notifications load error:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Error marking all read:", err);
    }
  };

  const handleNotificationClick = async (notif: UserNotification) => {
    if (!notif.read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {}
    }
    setIsNotificationOpen(false);
    if (notif.link) {
      onNavigate(notif.link);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setAiSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [results, aiResults] = await Promise.allSettled([
          api.search(searchQuery.trim()),
          aiApi.semanticSearch(searchQuery.trim()),
        ]);
        if (results.status === "fulfilled") {
          setSearchResults(results.value);
        }
        if (aiResults.status === "fulfilled") {
          setAiSearchResults(aiResults.value);
        }
      } catch (err) {
        console.warn("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navigationSections = [
    {
      title: "ANALYZE",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={17} /> },
        { label: "Image Analysis", path: "/image", icon: <ImageIcon size={17} /> },
        { label: "Voice Analysis", path: "/voice", icon: <Mic size={17} /> },
        { label: "Body Language", path: "/body", icon: <Activity size={17} /> },
        { label: "Fusion Analysis", path: "/fusion", icon: <Layers size={17} /> },
      ],
    },
    {
      title: "EXPLORE",
      items: [
        { label: "Compare", path: "/compare", icon: <Columns size={17} /> },
        { label: "History", path: "/history", icon: <Clock size={17} /> },
        { label: "Analytics", path: "/analytics", icon: <BarChart2 size={17} /> },
      ],
    },
    {
      title: "IMPROVE",
      items: [
        { label: "Presentation Coach", path: "/presentation-coach", icon: <Presentation size={17} /> },
        { label: "Interview Practice", path: "/interview", icon: <UserCheck size={17} /> },
        { label: "Journal Reflections", path: "/journal", icon: <BookOpen size={17} /> },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "Settings", path: "/settings", icon: <Settings size={17} /> },
      ],
    },
  ];

  const menuItems = navigationSections.flatMap((sec) => sec.items);

  return (
    <div className="flex min-h-screen bg-[#F8F6F2] font-sans antialiased text-[#15171A]">
      {/* Mobile Slide-over Navigation Drawer (< md) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-[#14161B] text-[#8C9099] flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="h-16 px-5 flex items-center justify-between border-b border-[#20232B]/60">
                <VibeLensLogo size={24} variant="light" />
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close navigation drawer"
                  className="p-1.5 rounded-lg text-[#8C9099] hover:text-white hover:bg-[#1C1F26] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="p-3 space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto">
                {navigationSections.map((sec) => (
                  <div key={sec.title} className="space-y-0.5">
                    <div className="px-3.5 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-[#5A5F6E] uppercase select-none">
                      {sec.title}
                    </div>
                    {sec.items.map((item) => {
                      const isActive = currentPath === item.path;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            setIsMobileDrawerOpen(false);
                            onNavigate(item.path);
                          }}
                          className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#252833] text-white shadow-xs font-semibold"
                              : "text-[#8C9099] hover:text-white hover:bg-[#1C1F26]"
                          }`}
                        >
                          <span className={isActive ? "text-[#A855F7]" : "text-[#707582]"}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Mobile Drawer Logout Action */}
                <div className="pt-2 border-t border-[#20232B]/60 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#CF6679] hover:text-white hover:bg-[#CF6679]/20 transition-all cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* 1. Dark Left Sidebar (Responsive Width: 256px expanded, 80px collapsed) */}
      <aside
        className={`${
          sidebarExpanded ? "w-64" : "w-20"
        } hidden md:flex bg-[#14161B] text-[#8C9099] flex-col justify-between shrink-0 select-none border-r border-[#20232B] transition-all duration-300 ease-out`}
      >
        <div className="flex flex-col min-w-0">
          {/* Interactive Brand Logo Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSidebar(e);
              }
            }}
            aria-label="Toggle navigation"
            aria-expanded={sidebarExpanded}
            title={sidebarExpanded ? "Collapse navigation" : "Open navigation"}
            className={`w-full h-16 flex items-center cursor-pointer group border-b border-[#20232B]/60 hover:bg-[#1C1F26] transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A855F7]/50 ${
              sidebarExpanded ? "px-5 justify-between text-left" : "justify-center px-0"
            }`}
          >
            {sidebarExpanded ? (
              <>
                <div className="flex items-center gap-2.5 transition-transform duration-150 group-hover:scale-[1.01] min-w-0">
                  <VibeLensLogo size={24} variant="light" />
                </div>
                <span
                  className="text-[11px] font-mono text-[#707582] group-hover:text-white transition-colors select-none"
                  aria-hidden="true"
                  title="Collapse navigation"
                >
                  ◂
                </span>
              </>
            ) : (
              <div className="transition-transform duration-150 group-hover:scale-110 flex items-center justify-center">
                <VibeLensIcon size={26} variant="light" />
              </div>
            )}
          </button>

          {/* Navigation Links by Section */}
          <nav className="p-3 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
            {navigationSections.map((sec, secIdx) => (
              <div key={sec.title} className="space-y-0.5">
                {sidebarExpanded ? (
                  <div className="px-3.5 pt-2.5 pb-1 text-[10px] font-mono font-bold tracking-wider text-[#5A5F6E] uppercase select-none">
                    {sec.title}
                  </div>
                ) : secIdx > 0 ? (
                  <div className="border-t border-[#20232B]/60 my-2 mx-2" />
                ) : null}

                {sec.items.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      aria-current={isActive ? "page" : undefined}
                      title={!sidebarExpanded ? item.label : undefined}
                      className={`flex items-center rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                        sidebarExpanded
                          ? "w-full gap-3.5 px-3.5 py-2.5"
                          : "justify-center h-10 w-10 mx-auto px-0 py-2.5"
                      } ${
                        isActive
                          ? "bg-[#252833] text-white shadow-xs font-semibold"
                          : "text-[#8C9099] hover:text-white hover:bg-[#1C1F26]"
                      }`}
                    >
                      <span className={isActive ? "text-[#A855F7]" : "text-[#707582]"}>
                        {item.icon}
                      </span>
                      {sidebarExpanded && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Sidebar Logout Action */}
            <div className={`pt-2 border-t border-[#20232B]/60 mt-2 ${!sidebarExpanded ? "flex justify-center" : ""}`}>
              <button
                type="button"
                onClick={onLogout}
                title={!sidebarExpanded ? "Sign Out" : undefined}
                className={`flex items-center rounded-xl text-[13px] font-medium text-[#CF6679] hover:text-white hover:bg-[#CF6679]/20 transition-all cursor-pointer ${
                  sidebarExpanded ? "w-full gap-3.5 px-3.5 py-2.5" : "justify-center h-10 w-10 mx-auto px-0 py-2.5"
                }`}
              >
                <LogOut size={16} />
                {sidebarExpanded && <span>Sign Out</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Upgrade to Pro Card at Bottom (Expanded only) */}
        {sidebarExpanded && (
          <div className="p-4 m-3 rounded-2xl bg-[#1C1F27] border border-[#2A2E39] space-y-2.5">
            <div className="flex items-center gap-2 text-white text-xs font-semibold">
              <Sparkles size={14} className="text-[#A855F7]" />
              <span>Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-[#8C9099] leading-relaxed">
              Access advanced emotion insights, multi-file batch queue & unlimited history.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("/settings")}
              className="w-full py-1.5 rounded-lg bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs font-medium transition cursor-pointer shadow-xs"
            >
              Upgrade Plan
            </button>
          </div>
        )}
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar (72px SaaS Header) */}
        <header className="h-[72px] bg-white border-b border-[#E6E2D8] px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          {/* Left: VibeLens Logo Dropdown Trigger + Search */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl mr-4">
            {/* VibeLens Header Brand Button with Interactive Dropdown */}
            <div className="relative shrink-0" ref={headerMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setIsMobileDrawerOpen(true);
                  } else {
                    setIsHeaderNavMenuOpen(!isHeaderNavMenuOpen);
                  }
                }}
                aria-label="Toggle navigation menu"
                aria-expanded={isHeaderNavMenuOpen}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                  isHeaderNavMenuOpen
                    ? "bg-[#14161B] text-white border-[#14161B] shadow-sm"
                    : "bg-[#F8F6F2] hover:bg-[#EFECE4] text-[#15171A] border-[#E2DDD3]"
                }`}
                title="Open navigation menu"
              >
                <VibeLensLogo size={22} variant={isHeaderNavMenuOpen ? "light" : "dark"} />
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    isHeaderNavMenuOpen ? "rotate-180 text-white" : "text-[#707582]"
                  }`}
                />
              </button>

              {/* Sleek Dark Dropdown Menu (matching the exact design in user screenshot) */}
              {isHeaderNavMenuOpen && (
                <div
                  className="absolute left-0 mt-2.5 w-64 bg-[#14161B] text-[#8C9099] border border-[#20232B] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
                >
                  <nav className="space-y-0.5 max-h-[calc(100vh-120px)] overflow-y-auto">
                    {menuItems.map((item) => {
                      const isActive = currentPath === item.path;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            setIsHeaderNavMenuOpen(false);
                            onNavigate(item.path);
                          }}
                          className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#252833] text-white shadow-xs font-semibold"
                              : "text-[#8C9099] hover:text-white hover:bg-[#1C1F26]"
                          }`}
                        >
                          <span className={isActive ? "text-[#A855F7]" : "text-[#707582]"}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}

                    {/* Sign Out Action in Dropdown */}
                    <div className="pt-2 border-t border-[#20232B]/60 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsHeaderNavMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#CF6679] hover:text-white hover:bg-[#CF6679]/20 transition-all cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </nav>
                </div>
              )}
            </div>

            {/* Search Trigger Button */}
            <div
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="flex items-center gap-2.5 w-full max-w-md bg-[#F4F1EA] hover:bg-[#ECE8DF] px-3.5 py-2 rounded-xl border border-[#DDD8CD] text-xs text-[#575A60] cursor-pointer transition shadow-2xs"
            >
              <Search size={15} className="text-[#8C8983]" />
              <span className="flex-1 text-[#8C8983] truncate font-sans">
                {searchQuery ? searchQuery : "Search analyses, insights..."}
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white border border-[#DDD8CD] rounded text-[10px] font-mono text-[#8C8983]">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Right Tools & User Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-xl text-[#575A60] hover:text-[#15171A] hover:bg-[#F4F1EA] transition cursor-pointer"
                title="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E6E2D8] rounded-2xl shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsNotificationOpen(false)}
                >
                  <div className="px-4 pb-2 border-b border-[#F4F1EA] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#15171A]">Notifications</h4>
                      <p className="text-[10px] text-[#707582]">{unreadCount} unread alerts</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[11px] font-semibold text-[#10B981] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F1EA]">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#8C8983]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3 text-xs transition cursor-pointer hover:bg-[#F8F6F2] flex items-start gap-2.5 ${
                            !notif.read ? "bg-[#FAF8F5]" : ""
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                              !notif.read ? "bg-[#10B981]" : "bg-transparent"
                            }`}
                          />
                          <div className="flex-1 space-y-0.5">
                            <p className="font-semibold text-[#15171A] leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-[#707582] text-[11px] leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-mono text-[#A0A4AB] block pt-0.5">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Pill with Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 pl-2 cursor-pointer group bg-transparent border-0"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#DDD8CD] bg-[#EAE5D9]">
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#15171A] group-hover:text-black leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] font-mono text-[#8C8983] leading-none">
                    {userPlan}
                  </span>
                </div>
                <ChevronDown size={13} className="text-[#8C8983]" />
              </button>

              {/* Profile Dropdown Menu with Working Logout */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#E6E2D8] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#F4F1EA]">
                    <p className="text-xs font-bold text-[#15171A]">{userName}</p>
                    <p className="text-[11px] text-[#707582] truncate">{userEmail}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#15171A] hover:bg-[#F8F6F2] flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <User size={14} className="text-[#707582]" />
                      <span>Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigate("/settings");
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#15171A] hover:bg-[#F8F6F2] flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <Settings size={14} className="text-[#707582]" />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigate("/settings");
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#15171A] hover:bg-[#F8F6F2] flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <Shield size={14} className="text-[#707582]" />
                      <span>Security</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#15171A] hover:bg-[#F8F6F2] flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <Lock size={14} className="text-[#707582]" />
                      <span>Privacy</span>
                    </button>
                  </div>

                  <div className="border-t border-[#F4F1EA] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2.5 cursor-pointer font-semibold transition-colors"
                    >
                      <LogOut size={14} />
                      <span>Log Out of VibeLens</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Search Modal Popover */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
            <div className="w-full max-w-xl bg-white border border-[#E6E2D8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100">
              {/* Search Header Input */}
              <div className="p-3.5 border-b border-[#E6E2D8] flex items-center gap-3 bg-[#FAF8F5]">
                <Search size={18} className="text-[#8C8983] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search analyses, vocal tones, emotions, vibes, journal notes..."
                  className="w-full bg-transparent text-sm text-[#15171A] placeholder-[#8C8983] outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-[#8C8983] hover:text-[#15171A] rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Results Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isSearching ? (
                  <div className="py-12 text-center text-xs text-[#707582] flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                    <span>Searching multimodal index...</span>
                  </div>
                ) : !searchQuery.trim() ? (
                  <div className="py-8 text-center space-y-1">
                    <p className="text-xs font-semibold text-[#15171A]">Type to search your records</p>
                    <p className="text-[11px] text-[#707582]">
                      Search by emotion, vocal tone, vibe descriptor, or reflection notes.
                    </p>
                  </div>
                ) : searchResults && searchResults.total === 0 ? (
                  <div className="py-12 text-center text-xs text-[#707582]">
                    No signals found matching <span className="font-semibold text-[#15171A]">"{searchQuery}"</span>.
                  </div>
                ) : (
                  searchResults && (
                    <div className="space-y-4">
                      {/* AI Identified Weak Skills & Topics */}
                      {aiSearchResults?.weakSkillMatches && aiSearchResults.weakSkillMatches.length > 0 && (
                        <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                            <Sparkles size={11} className="text-red-600" />
                            <span>AI Identified Weak Topics & Skills</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {aiSearchResults.weakSkillMatches.map((w: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  onNavigate("/interview");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-xs text-red-900 font-medium hover:bg-red-100/50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <span>⚠️ {w.skill}</span>
                                <span className="text-[10px] text-red-600 font-mono">({w.averageScore}% avg)</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Grounded Document Excerpts */}
                      {aiSearchResults?.documentExcerpts && aiSearchResults.documentExcerpts.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                            <BookOpen size={11} className="text-emerald-600" />
                            <span>Grounded Study Note Excerpts</span>
                          </span>
                          <div className="space-y-1.5">
                            {aiSearchResults.documentExcerpts.map((doc: any, idx: number) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  onNavigate("/interview");
                                }}
                                className="p-2.5 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/50 border border-emerald-200 cursor-pointer flex items-center justify-between text-xs transition"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-emerald-950">{doc.documentTitle}</p>
                                    <span className="text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                                      Page {doc.page}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-emerald-800 line-clamp-1 mt-0.5 italic">
                                    "{doc.text}"
                                  </p>
                                </div>
                                <ArrowRight size={13} className="text-emerald-700" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Interview Matches */}
                      {aiSearchResults?.interviewMatches && aiSearchResults.interviewMatches.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                            <Sparkles size={11} className="text-indigo-600" />
                            <span>Interview Practice History</span>
                          </span>
                          <div className="space-y-1.5">
                            {aiSearchResults.interviewMatches.map((im: any, idx: number) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  onNavigate("/interview");
                                }}
                                className="p-2.5 rounded-xl bg-indigo-50/50 hover:bg-indigo-100/50 border border-indigo-200 cursor-pointer flex items-center justify-between text-xs transition"
                              >
                                <div>
                                  <p className="font-semibold text-indigo-950">{im.question}</p>
                                  <p className="text-[11px] text-indigo-700">
                                    {im.category} • Score: {im.score}/100 • {im.status}
                                  </p>
                                </div>
                                <ArrowRight size={13} className="text-indigo-700" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analyses Results */}
                      {searchResults.analyses && searchResults.analyses.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8983] block mb-2">
                            Analyses ({searchResults.analyses.length})
                          </span>
                          <div className="space-y-1.5">
                            {searchResults.analyses.map((a: any) => (
                              <div
                                key={a.id}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  onNavigate(`/history`);
                                }}
                                className="p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#E8E4DA] cursor-pointer flex items-center justify-between text-xs transition"
                              >
                                <div>
                                  <p className="font-semibold text-[#15171A]">{a.title}</p>
                                  <p className="text-[11px] text-[#707582]">
                                    {a.type} • {a.emotion} • {a.vibe}
                                  </p>
                                </div>
                                <ArrowRight size={13} className="text-[#8C8983]" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Voices Results */}
                      {searchResults.voices && searchResults.voices.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8983] block mb-2">
                            Vocal Sessions ({searchResults.voices.length})
                          </span>
                          <div className="space-y-1.5">
                            {searchResults.voices.map((v: any) => (
                              <div
                                key={v.id}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  onNavigate(`/voice`);
                                }}
                                className="p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#E8E4DA] cursor-pointer flex items-center justify-between text-xs transition"
                              >
                                <div>
                                  <p className="font-semibold text-[#15171A]">{v.title}</p>
                                  <p className="text-[11px] text-[#707582]">
                                    {v.tone} • {v.wordsPerMinute} WPM • {v.emotion}
                                  </p>
                                </div>
                                <ArrowRight size={13} className="text-[#8C8983]" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Journal Entries */}
                      {searchResults.journal.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8983] block mb-2">
                            Journal Entries ({searchResults.journal.length})
                          </span>
                          <div className="space-y-1.5">
                            {searchResults.journal.map((j: any) => (
                              <div
                                key={j.id}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  onNavigate(`/journal`);
                                }}
                                className="p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#E8E4DA] cursor-pointer flex items-center justify-between text-xs transition"
                              >
                                <div>
                                  <p className="font-semibold text-[#15171A]">{j.vibe} — {j.emotion}</p>
                                  <p className="text-[11px] text-[#707582] truncate max-w-sm">
                                    {j.userNote || j.context}
                                  </p>
                                </div>
                                <ArrowRight size={13} className="text-[#8C8983]" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Search Footer */}
              <div className="p-2.5 bg-[#FAF8F5] border-t border-[#E6E2D8] flex items-center justify-between text-[11px] text-[#8C8983] px-4">
                <span>Press ESC to exit search</span>
                <span>VibeLens Multimodal Engine</span>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto max-w-[1440px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
