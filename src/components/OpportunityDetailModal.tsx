import React, { useState, useEffect } from 'react';
import { Opportunity, UserProfile, MatchAnalysis, ApplicationStage } from '../types';
import { calculateDeadlineInfo, downloadCalendarEvent } from '../utils/dateUtils';
import { analyzeOpportunityMatch } from '../services/aiService';
import {
  X,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  Download
} from 'lucide-react';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  userProfile: UserProfile;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
  onTrackWithStage?: (stage: ApplicationStage) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  userProfile,
  isSaved,
  onClose,
  onToggleSave,
  onTrackWithStage
}) => {
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(true);

  useEffect(() => {
    if (!opportunity) return;
    setIsLoadingAnalysis(true);
    let isCancelled = false;

    analyzeOpportunityMatch(opportunity, userProfile)
      .then((analysis) => {
        if (!isCancelled) {
          setMatchAnalysis(analysis);
          setIsLoadingAnalysis(false);
        }
      })
      .catch((err) => {
        console.error('Failed to analyze match', err);
        if (!isCancelled) setIsLoadingAnalysis(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [opportunity, userProfile]);

  if (!opportunity) return null;

  const deadlineInfo = calculateDeadlineInfo(opportunity.deadline);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-6 dark:border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                {opportunity.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>{opportunity.locationType} ({opportunity.locationName})</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified on {opportunity.lastVerified}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {opportunity.title}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              {opportunity.organization}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          
          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Funding / Amount</span>
              <span className="font-semibold text-slate-900 dark:text-white block">
                {opportunity.fundingAmount}
              </span>
              <span className="text-[11px] text-slate-400 capitalize">({opportunity.fundingType})</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Deadline</span>
              <span className="font-semibold font-mono text-slate-900 dark:text-white block tabular-nums">
                {deadlineInfo.formattedDate}
              </span>
              <span className={`text-[11px] font-medium ${
                deadlineInfo.isCritical ? 'text-rose-500' : deadlineInfo.isUrgent ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {deadlineInfo.statusText}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Eligible Stages</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 block text-xs">
                {(opportunity.eligibleStages || []).join(', ') || 'All career stages'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Nationalities</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 block text-xs truncate" title={(opportunity.eligibleNationalities || ['Global / Open to all']).join(', ')}>
                {(opportunity.eligibleNationalities || ['Global / Open to all']).join(', ')}
              </span>
            </div>
          </div>

          {/* AI Match & Eligibility Breakdown (Feature #4) */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-5 dark:border-sky-900/50 dark:bg-sky-950/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Personalized AI Match Analysis
                </h3>
              </div>
              {matchAnalysis && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Relevance score:</span>
                  <span className="font-mono font-bold tabular-nums text-sky-600 dark:text-sky-400">
                    {matchAnalysis.relevanceScore}/100
                  </span>
                </div>
              )}
            </div>

            {isLoadingAnalysis ? (
              <div className="py-4 text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                Evaluating candidate background and criteria against verified guidelines...
              </div>
            ) : matchAnalysis ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                    Why this matches {userProfile.name}:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {matchAnalysis.whyItMatches}
                  </p>
                </div>

                <div className="pt-2 border-t border-sky-100 dark:border-sky-900/40">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Eligibility & Criteria Breakdown:
                  </span>
                  <ul className="space-y-1">
                    {matchAnalysis.eligibilityBreakdown.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {matchAnalysis.missingInformationWarning && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Attention Requirement:</span>
                      <span>{matchAnalysis.missingInformationWarning}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Suggested Action: </span>
                  {matchAnalysis.recommendedNextStep}
                </div>
              </div>
            ) : null}
          </div>

          {/* Description & Overview */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">
              Overview & Scope
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
              {opportunity.summary}
            </p>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">
              Official Eligibility Criteria
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {(opportunity.eligibilityCriteria || opportunity.eligibility || []).map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Benefits */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">
              Benefits & Funding Inclusions
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {(opportunity.keyBenefits || opportunity.benefits || []).map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Materials */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">
              Required Application Materials
            </h3>
            <div className="flex flex-wrap gap-2">
              {(opportunity.requiredMaterials || opportunity.requiredDocuments || []).map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <FileText className="h-3 w-3 text-slate-400" />
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Source Verification Audit Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Source Transparency & Verification
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Audit checked: {opportunity.lastVerified}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-3">
              OpportunityRadar validates all opportunities against canonical organizer domains. No hallucinated deadlines or fabricated funding amounts are accepted.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={opportunity.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline"
              >
                <span>Original Source Notice</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900/90 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSave}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isSaved
                  ? 'bg-sky-50 text-sky-700 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span>Saved in Tracker</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  <span>Save Opportunity</span>
                </>
              )}
            </button>

            <button
              onClick={() => downloadCalendarEvent(
                opportunity.title,
                opportunity.organisation || opportunity.organization || 'OpportunityRadar',
                opportunity.deadline || '',
                opportunity.applicationUrl || ''
              )}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
              title="Add deadline to Apple / Google / Outlook Calendar"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export .ICS Calendar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-colors"
            >
              <span>Open Official Application</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
