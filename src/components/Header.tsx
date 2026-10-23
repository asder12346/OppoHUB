import React, { useState } from 'react';
import { Sun, Moon, Bell, UserCheck, Layers, Bot, Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserProfile, PersonaType } from '../types';
import { DEMO_PROFILES } from '../data/seedOpportunities';

interface HeaderProps {
  currentTab: 'landing' | 'feed' | 'tracker' | 'community' | 'agent' | 'ingestion' | 'pitch';
  setCurrentTab: (tab: 'landing' | 'feed' | 'tracker' | 'community' | 'agent' | 'ingestion' | 'pitch') => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onOpenProfile: () => void;
  onOpenReminders: () => void;
  onOpenOnboarding: () => void;
  urgentDeadlinesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userProfile,
  setUserProfile,
  onOpenProfile,
  onOpenReminders,
  onOpenOnboarding,
  urgentDeadlinesCount
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value as PersonaType;
    if (DEMO_PROFILES[selectedKey]) {
      setUserProfile(DEMO_PROFILES[selectedKey]);
    }
  };

  const navItems: {
    id: 'landing' | 'feed' | 'tracker' | 'community' | 'agent' | 'ingestion' | 'pitch';
    label: string;
    isAgent?: boolean;
  }[] = [
    { id: 'landing', label: 'Overview' },
    { id: 'feed', label: 'Explore' },
    { id: 'tracker', label: 'Tracker' },
    { id: 'agent', label: 'Agent Copilot', isAgent: true },
    { id: 'community', label: 'Community' },
    { id: 'pitch', label: 'Roadmap' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Left: Cursor-style Minimalist Brand Mark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 text-left text-sm font-bold tracking-tight text-neutral-900 transition-colors dark:text-white group"
          >
            {/* Geometric Radar / Cursor Prism Mark */}
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-mono text-xs font-black shadow-xs transition-transform group-hover:scale-105">
              <span className="text-[11px] font-mono tracking-tighter">OR</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-indigo-500 border-2 border-white dark:border-black" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-white">
                OpportunityRadar
              </span>
              <span className="hidden xl:inline px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                2.0
              </span>
            </div>
          </button>

          {/* Center Navigation Links (Cursor-style clean pill row) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  currentTab === item.id
                    ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-white/[0.08]'
                    : 'hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                {item.isAgent && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                  </span>
                )}
                <span>{item.label}</span>
                {item.isAgent && (
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                    Agentic
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Zone: Controls, Persona Switcher, & Cursor Signature Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Demo Persona Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-100/70 dark:bg-neutral-900/80 px-2.5 py-1 rounded-full border border-neutral-200/70 dark:border-neutral-800">
            <UserCheck className="h-3 w-3 text-indigo-500" />
            <select
              value={userProfile.persona}
              onChange={handlePersonaChange}
              className="bg-transparent font-medium text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer text-xs"
              title="Switch demo persona for testing"
            >
              <option value="student" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                Amina (Student)
              </option>
              <option value="developer" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                Carlos (Developer)
              </option>
              <option value="founder" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                Elena (Founder)
              </option>
              <option value="professional" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                David (Professional)
              </option>
            </select>
          </div>

          {/* Deadline reminder bell */}
          <button
            onClick={onOpenReminders}
            className="relative p-1.5 rounded-full text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Deadline Reminders"
            aria-label="Deadline reminders"
          >
            <Bell className="h-4 w-4" />
            {urgentDeadlinesCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white font-mono">
                {urgentDeadlinesCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle dark mode"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-700" />
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-neutral-100/70 hover:bg-neutral-200/70 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-800 text-left transition-colors"
            title="Edit Profile & Preferences"
          >
            <div className="h-5 w-5 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 shrink-0">
              <img
                src={userProfile.avatar}
                alt={userProfile.displayName || userProfile.name || userProfile.username}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-[80px]">
              @{userProfile.username}
            </span>
          </button>

          {/* Cursor Signature High-Contrast CTA Button */}
          <button
            onClick={() => setCurrentTab('agent')}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all"
          >
            <Sparkles className="h-3 w-3 text-indigo-400 dark:text-indigo-600" />
            <span>Launch Agent</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 md:hidden rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-xl p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                currentTab === item.id
                  ? 'bg-neutral-100 text-neutral-950 dark:bg-white/10 dark:text-white font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.isAgent && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                <span>{item.label}</span>
              </div>
              {currentTab === item.id && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          ))}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentTab('agent');
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-black font-semibold text-xs"
            >
              Launch Agent Copilot
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
