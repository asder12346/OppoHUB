import React, { useState } from 'react';
import { Opportunity, UserProfile, ApplicationTrackerItem } from '../types';
import { calculateDeadlineInfo, downloadCalendarEvent } from '../utils/dateUtils';
import {
  X,
  Bell,
  Clock,
  Calendar,
  Mail,
  Send,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DeadlineRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  trackerItems: ApplicationTrackerItem[];
  opportunities: Opportunity[];
}

export const DeadlineRemindersModal: React.FC<DeadlineRemindersModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  trackerItems,
  opportunities
}) => {
  const [emailSentAlert, setEmailSentAlert] = useState<boolean>(false);

  if (!isOpen) return null;

  // Find opportunities in user's tracker
  const trackedOpps = trackerItems
    .map((item) => {
      const opp = opportunities.find((o) => o.id === item.opportunityId);
      if (!opp) return null;
      return { item, opp, deadlineInfo: calculateDeadlineInfo(opp.deadline) };
    })
    .filter(Boolean) as {
      item: ApplicationTrackerItem;
      opp: Opportunity;
      deadlineInfo: ReturnType<typeof calculateDeadlineInfo>;
    }[];

  // Sort by deadline urgency
  const sortedTracked = [...trackedOpps].sort(
    (a, b) => a.deadlineInfo.daysLeft - b.deadlineInfo.daysLeft
  );

  const urgentList = sortedTracked.filter((t) => t.deadlineInfo.daysLeft >= 0 && t.deadlineInfo.daysLeft <= 30);

  const handleSimulateEmailDispatch = () => {
    setEmailSentAlert(true);
    setTimeout(() => {
      setEmailSentAlert(false);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col overflow-hidden my-8"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Deadline Reminders & Alerts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tracking critical closing dates across your saved opportunities.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          
          {emailSentAlert && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Reminder Email Dispatched!</span>
                <span>Sent simulated deadline briefing for {userProfile.name} to {userProfile.email}.</span>
              </div>
            </div>
          )}

          {/* Email Notification Status Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Automated Digest to: {userProfile.email}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Daily 08:00 UTC check for saved opportunities within 7 days and 48 hours.
                </span>
              </div>
            </div>
            <button
              onClick={handleSimulateEmailDispatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors shrink-0 text-xs shadow-xs"
            >
              <Send className="h-3 w-3" />
              <span>Send Test Digest</span>
            </button>
          </div>

          {/* List of upcoming deadlines */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">
              Upcoming Saved Deadlines ({urgentList.length})
            </h3>

            {urgentList.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No active opportunities in your tracker closing in the next 30 days.
              </div>
            ) : (
              <div className="space-y-3">
                {urgentList.map(({ item, opp, deadlineInfo }) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">
                          {opp.category}
                        </span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-[11px] text-slate-400">Stage: {item.stage}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {opp.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {opp.organization}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white block">
                          {deadlineInfo.formattedDate}
                        </span>
                        <span className={`text-[11px] font-bold ${
                          deadlineInfo.isCritical
                            ? 'text-rose-500'
                            : deadlineInfo.isUrgent
                            ? 'text-amber-500'
                            : 'text-slate-400'
                        }`}>
                          {deadlineInfo.statusText}
                        </span>
                      </div>

                      <button
                        onClick={() => downloadCalendarEvent(
                          opp.title,
                          opp.organisation || opp.organization || 'OpportunityRadar',
                          opp.deadline || '',
                          opp.applicationUrl || ''
                        )}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Download .ics calendar event"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Preview Mockup */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block">
              Sample Notification Email Format
            </span>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px] space-y-1">
              <p><strong>From:</strong> alerts@opportunityradar.org</p>
              <p><strong>To:</strong> {userProfile.email}</p>
              <p><strong>Subject:</strong> ⏳ Action Needed: {urgentList[0]?.opp.title || 'SmartChain Hackathon'} deadline is approaching</p>
              <p className="pt-2 text-slate-600 dark:text-slate-400">
                Hi {userProfile.name}, this is your automated OpportunityRadar reminder. An opportunity you saved is approaching its application deadline. Review requirements and submit your application before the official closing date.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-sky-600 font-semibold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
