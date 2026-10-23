import React from 'react';
import { Opportunity, UserProfile } from '../types';
import { calculateDeadlineInfo, downloadCalendarEvent } from '../utils/dateUtils';
import { calculateRuleBasedRelevance } from '../services/aiService';
import { Bookmark, BookmarkCheck, ExternalLink, ShieldCheck, Calendar, ArrowUpRight } from 'lucide-react';

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
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700">
      
      {/* Top Header Row: Clean unboxed metadata kicker */}
      <div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sky-600 dark:text-sky-400">
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
          <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors dark:text-white dark:group-hover:text-sky-400 leading-snug">
            {opportunity.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            {opportunity.organisation || opportunity.organization}
          </p>
        </div>

        {/* Short Summary */}
        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {opportunity.summary || opportunity.description}
        </p>

        {/* AI Match Context Strip (Clean unboxed inline feedback) */}
        <div className="mt-3.5 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/70 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Match for {(userProfile.displayName || userProfile.name || userProfile.username || 'You').split(' ')[0]}
            </span>
            <span className="font-mono font-bold tabular-nums text-sky-600 dark:text-sky-400">
              {matchResult.score}% Relevance
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {matchResult.matchReasons[0] || 'Open criteria matching profile interests.'}
          </p>
        </div>
      </div>

      {/* Bottom Section: Funding, Deadline, Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-3">
          <div>
            <span className="text-[11px] text-slate-400 block">Funding / Award</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {opportunity.fundingAmount}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Deadline</span>
            <span className={`font-mono tabular-nums font-semibold ${
              deadlineInfo.isCritical
                ? 'text-rose-600 dark:text-rose-400'
                : deadlineInfo.isUrgent
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {deadlineInfo.formattedDate} ({deadlineInfo.statusText})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onToggleSave}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isSaved
                ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
            title={isSaved ? 'In Tracker' : 'Save to Tracker'}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Tracked</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                <span>Save</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenDetails}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Details & Audit
            </button>
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors dark:bg-sky-600 dark:hover:bg-sky-500 shrink-0"
              title="Open verified official application portal"
            >
              <span>Apply</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
