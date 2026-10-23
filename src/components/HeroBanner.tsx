import React from 'react';
import { Search, Sparkles, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { UserProfile, PersonaType } from '../types';
import { DEMO_PROFILES } from '../data/seedOpportunities';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onExploreTracker: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  userProfile,
  setUserProfile,
  onExploreTracker
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          
          {/* Left Column: Vision & Search */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-sky-600 dark:text-sky-400 mb-3">
              <span className="font-semibold uppercase tracking-wider text-[11px]">SmartChain Innovation Hackathon</span>
              <span aria-hidden="true">·</span>
              <span>Global Discovery & Action Platform</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white leading-[1.15]">
              Never miss an opportunity that could change your future.
            </h1>

            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Find scholarships, grants, hackathons, and accelerators matched directly to your background.
              Verify eligibility, audit official source documents, and track application deadlines before they pass.
            </p>

            {/* Search Input Box */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by keywords, organization, scholarship name, grant..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:placeholder-slate-400 dark:focus:border-sky-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                onClick={onExploreTracker}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 shrink-0"
              >
                <span>My Tracker</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* 4 Pillars Summary */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4 dark:border-slate-800/80 text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">01. Discover</span>
                <span className="text-slate-500 dark:text-slate-400">Aggregated from verified global sources</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">02. Match</span>
                <span className="text-slate-500 dark:text-slate-400">Ranked by skills, stage, and interests</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">03. Verify</span>
                <span className="text-slate-500 dark:text-slate-400">Direct source link & audit dates</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">04. Take Action</span>
                <span className="text-slate-500 dark:text-slate-400">Kanban tracker & .ics reminders</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Visual Asset + Active Persona Card */}
          <div className="flex flex-col lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800 h-full min-h-[300px]">
              <img
                src="/src/assets/images/hero_opportunity_radar_1791893407161.jpg"
                alt="Ambitious innovators and students collaborating on opportunities"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              
              {/* Overlay with current active persona */}
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-sky-300 font-medium">Active Simulation Persona</span>
                  <span className="font-mono text-slate-300">{userProfile.stage}</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {userProfile.name} ({userProfile.country})
                </h3>
                <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                  Interests: {userProfile.interests.slice(0, 3).join(', ')} · Target: {userProfile.preferredCategories.join(', ')}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/10 text-[11px]">
                  {(['student', 'developer', 'founder', 'professional'] as PersonaType[]).map((pKey) => (
                    <button
                      key={pKey}
                      onClick={() => setUserProfile(DEMO_PROFILES[pKey])}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        userProfile.persona === pKey
                          ? 'bg-sky-500 text-white font-semibold'
                          : 'bg-black/40 text-slate-200 hover:bg-black/60'
                      }`}
                    >
                      {pKey.charAt(0).toUpperCase() + pKey.slice(1)} View
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
