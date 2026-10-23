import React, { useState } from 'react';
import { Opportunity, UserProfile, OpportunityCategory } from '../types';
import { calculateDeadlineInfo } from '../utils/dateUtils';
import { calculateRuleBasedRelevance } from '../services/aiService';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Users,
  Award,
  Check,
  Bot,
  Terminal,
  FileText,
  ListTodo,
  Zap,
  ArrowUpRight
} from 'lucide-react';

interface LandingPageProps {
  opportunities: Opportunity[];
  userProfile: UserProfile;
  onOpenOnboarding: (category?: OpportunityCategory) => void;
  onNavigateToFeed: () => void;
  onNavigateToTracker: () => void;
  onNavigateToCommunity: () => void;
  onNavigateToAgent: () => void;
  onOpenOpportunityDetail: (opp: Opportunity) => void;
  onToggleSaveOpportunity: (oppId: string) => void;
  savedOpportunityIds: string[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  opportunities,
  userProfile,
  onOpenOnboarding,
  onNavigateToFeed,
  onNavigateToTracker,
  onNavigateToCommunity,
  onNavigateToAgent,
  onOpenOpportunityDetail,
  onToggleSaveOpportunity,
  savedOpportunityIds
}) => {
  const [selectedShowcaseCategory, setSelectedShowcaseCategory] = useState<'all' | OpportunityCategory>('all');
  const [activeInteractivePrompt, setActiveInteractivePrompt] = useState(0);

  const showcaseFiltered = opportunities.filter((o) => {
    if (selectedShowcaseCategory === 'all') return true;
    return o.category === selectedShowcaseCategory;
  }).slice(0, 6);

  const interactiveAgentExamples = [
    {
      label: 'Scholarship Search',
      prompt: 'Find fully-funded STEM scholarships in Africa or Europe, audit my academic transcript, and generate my application checklist.',
      resultTitle: 'MTN Foundation & Rhodes Oxford Triaged',
      steps: ['Intent parsed: STEM + Undergraduate', 'Scanned 28 scholarship records', 'Eligibility verified: CGPA >= 3.5 matched', 'Queued 4 custom checklist tasks']
    },
    {
      label: 'Web3 & Hackathons',
      prompt: 'Scan for active hackathons with prize pools > $20,000, verify deadline cutoffs, and draft my project pitch outline.',
      resultTitle: 'SmartChain Innovation Hackathon 2026',
      steps: ['Identified SmartChain 2026 ($25,000 pool)', 'Deadline verified: 26 days left', 'Drafted 3-tier technical architecture summary', 'Queued team registration milestone']
    },
    {
      label: 'Seed Grants & Capital',
      prompt: 'Identify equity-free grants for early-stage founders and draft my 200-word statement of ambition for the panel.',
      resultTitle: 'Tony Elumelu Foundation ($5,000 Seed)',
      steps: ['Queried 12 non-dilutive grant programs', 'Checked 54-nation African eligibility criteria', 'Auto-generated Statement of Ambition', 'Synced cutoff alert (Jan 31, 2027)']
    }
  ];

  return (
    <div className="flex flex-col bg-[#FAFAFA] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* =========================================================================
          SECTION 1: HERO SECTION (Cursor AI Inspired Precision)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-black/[0.06] dark:border-white/[0.06]">
        {/* Subtle Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-neutral-700 dark:text-neutral-300 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] mb-6 backdrop-blur-md">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>OpportunityRadar 2.0</span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-500 dark:text-neutral-400">Autonomous Opportunity Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.08] mb-6">
              Stop searching everywhere.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-indigo-600 to-indigo-900 dark:from-white dark:via-indigo-300 dark:to-neutral-400">
                Let intelligent agents find your next fit.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 max-w-2xl">
              Discover verified scholarships, grants, hackathons, and accelerators matched directly to your background. 
              Our autonomous copilot audits your eligibility, drafts personal statements, and schedules deadlines before they close.
            </p>

            {/* Primary Actions (Cursor-Style High Contrast) */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              <button
                onClick={onNavigateToAgent}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 px-6 py-3 text-sm font-semibold shadow-sm transition-all"
              >
                <Bot className="h-4 w-4 text-indigo-400 dark:text-indigo-600" />
                <span>Launch Autonomous Agent</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onNavigateToFeed}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 px-5 py-3 text-sm font-semibold border border-neutral-200 dark:border-neutral-800 transition-colors"
              >
                <Search className="h-4 w-4 text-neutral-400" />
                <span>Explore Opportunities</span>
              </button>
            </div>

            {/* Quantitative Proof Strip */}
            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] text-center w-full max-w-lg">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white block">
                  100%
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Verified Official URLs
                </span>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white block">
                  $2.4M+
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Active Prizes & Grants
                </span>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white block">
                  0
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Fabricated Deadlines
                </span>
              </div>
            </div>

          </div>

          {/* Clean Interactive Agent Preview Terminal (Replaces clunky mock cards) */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#111113] shadow-xl overflow-hidden">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/70 dark:bg-neutral-900/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-neutral-400 text-[11px]">
                  opportunity-agent --autonomous
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Ready</span>
              </div>
            </div>

            {/* Interactive Example Selector */}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-neutral-400 mr-1">Try prompt:</span>
                {interactiveAgentExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveInteractivePrompt(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeInteractivePrompt === idx
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              {/* Prompt box */}
              <div className="rounded-xl bg-neutral-100 dark:bg-[#18181b] p-3 text-xs font-mono text-neutral-800 dark:text-neutral-200 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-500 font-bold">&gt;</span>
                  <span>"{interactiveAgentExamples[activeInteractivePrompt].prompt}"</span>
                </div>
                <button
                  onClick={onNavigateToAgent}
                  className="shrink-0 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Execute in Agent</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Step progression preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {interactiveAgentExamples[activeInteractivePrompt].steps.map((st, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] mb-1">
                      <Check className="h-3 w-3" />
                      <span>Step 0{i + 1}</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                      {st}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: CORE ARCHITECTURE & THE 4 PILLARS
          ========================================================================= */}
      <section className="py-20 lg:py-28 border-b border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#0c0c0e]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
              Precision Architecture
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              Built for action, not passive browsing.
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
              Generic directories overwhelm you with broken links and expired dates. OpportunityRadar gives you an end-to-end intelligence and application workflow.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-6 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-xs mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2">
                  Verified Aggregation
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Only official institution portals and permitted sources. Every deadline, grant amount, and required document is canonical.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-500">
                Guaranteed Zero Hallucinations
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-6 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-xs mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2">
                  Eligibility Auditing
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Deep criteria evaluation against your citizenship, education level, transcripts, and technical skills before you invest time applying.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-500">
                Rule & AI Hybrid Matching
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-6 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-xs mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2">
                  Autonomous Copilot
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Give instructions in natural language. The agent synthesizes tailored statements of purpose, checks prerequisites, and plans your calendar.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                Autonomous Execution
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-6 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-xs mb-4">
                  04
                </div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2">
                  Deadline Telemetry
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Kanban tracking with 7-day, 3-day, and 24-hour urgency countdowns. Export schedules directly to Google, Apple, or Outlook calendars.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-500">
                1-Click .ICS Exports
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: OPPORTUNITY DIRECTORY SHOWCASE
          ========================================================================= */}
      <section className="py-20 lg:py-28 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                Active Programs
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
                Featured Verified Opportunities
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm max-w-xl">
                Curated open listings across scholarships, seed funding grants, hackathons, and global fellowships.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              {(['all', 'scholarship', 'grant', 'hackathon', 'fellowship'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedShowcaseCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    selectedShowcaseCategory === cat
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold'
                      : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat + 's'}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {showcaseFiltered.map((opp) => {
              const dl = calculateDeadlineInfo(opp.deadline || '');
              const isSaved = savedOpportunityIds.includes(opp.id);
              const relevance = calculateRuleBasedRelevance(opp, userProfile);

              return (
                <div
                  key={opp.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] p-5 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs group"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                      <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 text-[11px]">
                        {opp.category}
                      </span>
                      <span className={`font-mono text-[11px] ${dl.isCritical ? 'text-rose-500 font-bold' : dl.isUrgent ? 'text-amber-500 font-medium' : 'text-neutral-400'}`}>
                        {dl.statusText}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onOpenOpportunityDetail(opp)}
                      className="text-base font-bold text-neutral-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors leading-snug mb-1"
                    >
                      {opp.title}
                    </h3>

                    {/* Host */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2.5 font-medium">
                      {opp.organisation || opp.organization} · {opp.location || opp.locationName}
                    </p>

                    {/* Summary */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed mb-4">
                      {opp.summary || opp.description}
                    </p>
                  </div>

                  <div>
                    {/* Funding & Match preview */}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-100 dark:border-neutral-800/80 mb-3">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        {opp.fundingDetails || opp.fundingAmount || 'Funded'}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                        {relevance.score}% Match
                      </span>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenOpportunityDetail(opp)}
                        className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors text-center"
                      >
                        Inspect Details
                      </button>

                      <button
                        onClick={() => onToggleSaveOpportunity(opp.id)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-400'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save opportunity'}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={onNavigateToFeed}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-6 py-2.5 text-xs font-semibold transition-all shadow-xs"
            >
              <span>View All Verified Opportunities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CALL TO ACTION (Clean, Minimalist, High Converting)
          ========================================================================= */}
      <section className="py-20 lg:py-28 relative overflow-hidden bg-white dark:bg-[#0c0c0e]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-black mb-6 shadow-md">
            <Bot className="h-6 w-6 text-indigo-400 dark:text-indigo-600" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white mb-4">
            Your next breakthrough is one instruction away.
          </h2>

          <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
            Tell the autonomous agent what you want to achieve, or customize your profile to receive instant deadline alerts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToAgent}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 px-6 py-3 text-sm font-semibold shadow-xs transition-all"
            >
              <Sparkles className="h-4 w-4 text-indigo-400 dark:text-indigo-600" />
              <span>Launch Opportunity Agent</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onOpenOnboarding()}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 px-5 py-3 text-sm font-semibold border border-neutral-200 dark:border-neutral-800 transition-colors"
            >
              <span>Set Up My Profile</span>
            </button>
          </div>

        </div>
      </section>

      {/* End of Landing Page Sections */}
    </div>
  );
};
