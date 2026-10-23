import React from 'react';
import { Search, Sparkles, ShieldCheck, ArrowRight, Compass, Bot } from 'lucide-react';
import { UserProfile } from '../types';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onExploreTracker: () => void;
  onLaunchAgent: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  userProfile,
  onExploreTracker,
  onLaunchAgent
}) => {
  return (
    <section className="relative overflow-hidden border-b border-black/[0.08] dark:border-white/[0.08] bg-[#FAFAFA] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* Subtle Radial Glow for atmospheric black texture */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          
          {/* Left Column: Vision & Search */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono text-neutral-600 dark:text-neutral-300 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] mb-4 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>EXPLORE VERIFIED OPPORTUNITIES</span>
              <span className="text-neutral-400">·</span>
              <span className="font-semibold">Global Directory</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl dark:text-white leading-[1.15]">
              Find opportunities tailored to your background.
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
              Explore scholarships, grants, hackathons, and accelerators verified against official institutional requirements.
            </p>

            {/* Search Input Box */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by keywords, organization, scholarship name, grant..."
                  className="w-full rounded-xl border border-neutral-300 dark:border-white/[0.12] bg-white dark:bg-[#111113] py-2.5 pl-10 pr-10 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                onClick={onLaunchAgent}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-all dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 shrink-0 shadow-xs"
              >
                <Bot className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-600" />
                <span>Ask Agentic Copilot</span>
              </button>
            </div>
          </div>

          {/* Right Column: Persona Matching Preview Box */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono text-[10px] font-bold">
                    AI
                  </div>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">Active Profile Fit</span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400 capitalize">
                  {userProfile.persona} · {userProfile.country}
                </span>
              </div>

              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">Target Match:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {userProfile.preferredCategories?.slice(0, 3).join(', ') || 'All Categories'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">Education / Stage:</span>
                  <span className="font-medium capitalize text-neutral-900 dark:text-white">
                    {userProfile.stage}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">Format:</span>
                  <span className="font-medium capitalize text-neutral-900 dark:text-white">
                    {userProfile.preferredFormat || 'Global'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">Rankings updated automatically</span>
                <button
                  onClick={onExploreTracker}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>My Tracker</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
