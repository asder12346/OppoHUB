import React from 'react';
import { Opportunity, UserProfile } from '../types';
import { calculateDeadlineInfo, downloadCalendarEvent } from '../utils/dateUtils';
import { calculateRuleBasedRelevance } from '../services/aiService';
import { Bookmark, BookmarkCheck, ExternalLink, ShieldCheck, Calendar, ArrowUpRight, Sparkles } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  userProfile: UserProfile;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenDetails: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  userProfile,
  isSaved,
  onToggleSave,
  onOpenDetails
}) => {
  const deadlineInfo = calculateDeadlineInfo(opportunity.deadline || '');
  const matchResult = calculateRuleBasedRelevance(opportunity, userProfile);

  const getCategoryLabel = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const getFormatLabel = (fmt?: string) => {
    if (!fmt) return 'Flexible';
    if (fmt === 'in-person' || fmt === 'onsite') return 'In-Person';
    return fmt.charAt(0).toUpperCase() + fmt.slice(1);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-white/[0.08] dark:bg-[#0c0c0e] dark:hover:border-white/[0.18]">
      
      {/* Top Header Row: Clean unboxed metadata kicker */}
      <div>
        <div className="flex items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {getCategoryLabel(opportunity.category)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{getFormatLabel(opportunity.workArrangement || (opportunity.locationType as string))}</span>
            <span aria-hidden="true">·</span>
            <span>{opportunity.location || opportunity.locationName || 'Global'}</span>
          </div>

          {/* Verification indicator */}
          <div className="flex items-center gap-1 shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Verified Source</span>
          </div>
        </div>

        {/* Primary Title & Organization */}
        <div className="cursor-pointer" onClick={onOpenDetails}>
          <h3 className="text-base font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors dark:text-white dark:group-hover:text-indigo-400 leading-snug">
            {opportunity.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {opportunity.organisation || opportunity.organization}
          </p>
        </div>

        {/* Short Summary */}
        <p className="mt-2.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {opportunity.summary || opportunity.description}
        </p>

        {/* AI Match Context Strip */}
        <div className="mt-3.5 rounded-xl bg-neutral-50 p-2.5 dark:bg-white/[0.04] border border-neutral-200/60 dark:border-white/[0.05] text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Fit for {(userProfile.displayName || userProfile.name || userProfile.username || 'You').split(' ')[0]}</span>
            </span>
            <span className="font-mono font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
              {matchResult.score}% Match
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
            {matchResult.matchReasons[0] || 'Eligible based on educational & professional track.'}
          </p>
        </div>
      </div>

      {/* Bottom Section: Funding, Deadline, Actions */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between text-xs mb-3">
          <div>
            <span className="text-[11px] text-neutral-400 block font-mono">Award / Funding</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {opportunity.fundingAmount}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block font-mono">Deadline</span>
            <span
              className={`font-semibold ${
                deadlineInfo.isUrgent
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-neutral-900 dark:text-neutral-200'
              }`}
            >
              {deadlineInfo.formattedDate}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDetails}
            className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>

          <button
            onClick={onToggleSave}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'border-neutral-200 dark:border-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/[0.05]'
            }`}
            title={isSaved ? 'Remove from Tracker' : 'Save to Tracker'}
            aria-label="Toggle save"
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>

          <button
            onClick={() =>
              downloadCalendarEvent(
                opportunity.title,
                opportunity.organisation || opportunity.organization || 'OpportunityRadar',
                opportunity.deadline || '',
                opportunity.applicationUrl || opportunity.sourceUrl || window.location.href
              )
            }
            className="p-2 rounded-xl border border-neutral-200 dark:border-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/[0.05] transition-colors"
            title="Download Calendar Reminder (.ics)"
            aria-label="Add to calendar"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
