import React, { useState } from 'react';
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserProfile } from '../types';

interface HeaderProps {
  currentTab: 'landing' | 'feed' | 'tracker' | 'community' | 'agent' | 'ingestion' | 'pitch';
  setCurrentTab: (tab: 'landing' | 'feed' | 'tracker' | 'community' | 'agent' | 'ingestion' | 'pitch') => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onOpenProfile: () => void;
  onOpenReminders?: () => void;
  urgentDeadlinesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userProfile,
  onOpenLogin,
  onOpenSignUp,
  onOpenProfile,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strictly the 3 core items requested: Overview, Explore, Agentic
  const primaryNavItems: {
    id: 'landing' | 'feed' | 'agent';
    label: string;
    isAgent?: boolean;
  }[] = [
    { id: 'landing', label: 'Overview' },
    { id: 'feed', label: 'Explore' },
    { id: 'agent', label: 'Agentic', isAgent: true }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl transition-colors">
      <div className="relative mx-auto flex h-13 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Cursor-style Minimalist Brand Mark */}
        <div className="flex items-center">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 text-left text-sm font-bold tracking-tight text-neutral-900 transition-colors dark:text-white group"
          >
            {/* Geometric Cursor-style Icon Prism */}
            <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-black font-mono text-[10px] font-black shadow-xs transition-transform group-hover:scale-105">
              <span>OR</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </div>

            <span className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-white">
              OpportunityRadar
            </span>
          </button>
        </div>

        {/* Center Navigation Links: Perfectly Centered (Overview, Explore, Agentic) */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {primaryNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-neutral-950 dark:text-white font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
                    : 'hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                }`}
              >
                {item.isAgent && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Zone: Controls, Login, and Sign Up (without notification bell) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle dark mode"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-700" />
            )}
          </button>

          {/* User Session Indicator (Optional quick profile access) */}
          {userProfile && userProfile.username && (
            <button
              onClick={onOpenProfile}
              className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
              title="View profile settings"
            >
              <div className="h-4 w-4 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.username}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="max-w-[70px] truncate">@{userProfile.username}</span>
            </button>
          )}

          {/* Login Button (Replacing generic profile button) */}
          <button
            onClick={onOpenLogin}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white px-2.5 py-1.5 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
          >
            Log In
          </button>

          {/* Sign Up Button (Cursor-style high-contrast pill) */}
          <button
            onClick={onOpenSignUp}
            className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Sign Up</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 md:hidden rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl p-4 space-y-1">
          {primaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                currentTab === item.id
                  ? 'bg-black/[0.06] text-neutral-950 dark:bg-white/10 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.03] dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.isAgent && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                <span>{item.label}</span>
              </div>
              {currentTab === item.id && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          ))}
          
          <div className="pt-3 mt-2 border-t border-black/[0.06] dark:border-white/[0.08] grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
            >
              Log In
            </button>
            <button
              onClick={() => {
                onOpenSignUp();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-black font-semibold text-xs"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
