import React, { useState } from 'react';
import { Opportunity, UserProfile, ApplicationTrackerItem, AgentActionPlan, AgentThoughtStep } from '../types';
import { runOpportunityAgent } from '../services/agentService';
import { calculateDeadlineInfo, downloadCalendarEvent } from '../utils/dateUtils';
import {
  Bot,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Bookmark,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Terminal,
  FileText,
  ListTodo,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface OpportunityAgentProps {
  userProfile: UserProfile;
  opportunities: Opportunity[];
  trackerItems: ApplicationTrackerItem[];
  onAddMatchesToTracker: (matchedOpps: Opportunity[], customChecklist: { id: string; text: string; done: boolean }[]) => void;
  onOpenOpportunityDetail: (opp: Opportunity) => void;
}

const PRESET_PROMPTS = [
  {
    title: 'Fully-funded scholarships with prep checklist',
    prompt: 'Find fully-funded scholarships closing in the next 60 days that match my education level, audit my eligibility, and generate my complete preparation checklist.'
  },
  {
    title: 'Seed grants & founder pitch draft',
    prompt: 'Identify equity-free seed grants and startup competitions for African founders, audit requirements, and draft my initial statement of purpose.'
  },
  {
    title: 'Hackathons with high win-probability',
    prompt: 'Scan for active tech & Web3 hackathons matching my technical skills, check prize pools, and create an execution plan for my team.'
  },
  {
    title: 'Full eligibility audit & blocker scan',
    prompt: 'Conduct a comprehensive eligibility audit on my profile across all programs. Flag any missing prerequisite transcripts or document blockers.'
  }
];

export const OpportunityAgent: React.FC<OpportunityAgentProps> = ({
  userProfile,
  opportunities,
  trackerItems,
  onAddMatchesToTracker,
  onOpenOpportunityDetail
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [actionPlan, setActionPlan] = useState<AgentActionPlan | null>(null);
  const [liveSteps, setLiveSteps] = useState<AgentThoughtStep[]>([]);
  const [copiedDocument, setCopiedDocument] = useState(false);
  const [trackerQueued, setTrackerQueued] = useState(false);

  const handleRunAgent = async (overridePrompt?: string) => {
    const query = (overridePrompt || promptInput).trim();
    if (!query || isRunning) return;

    setIsRunning(true);
    setTrackerQueued(false);
    setCopiedDocument(false);
    setActionPlan(null);

    const initialSteps: AgentThoughtStep[] = [
      { step: 'Parsing natural language instructions & operational constraints', status: 'in_progress' },
      { step: 'Scanning opportunity knowledge graph against user background', status: 'pending' },
      { step: 'Auditing multi-factor eligibility criteria & prerequisite documents', status: 'pending' },
      { step: 'Synthesizing tailored action plan, execution checklist, and draft deliverables', status: 'pending' }
    ];
    setLiveSteps(initialSteps);

    try {
      const plan = await runOpportunityAgent(
        query,
        userProfile,
        opportunities,
        trackerItems,
        (stepIndex, updatedStep) => {
          setLiveSteps((prev) => {
            const next = [...prev];
            next[stepIndex] = updatedStep;
            return next;
          });
        }
      );
      setActionPlan(plan);
    } catch (err) {
      console.error('Agent execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const matchedOpps = (actionPlan?.matchedOpportunityIds || [])
    .map((id) => opportunities.find((o) => o.id === id))
    .filter((o): o is Opportunity => Boolean(o));

  const handleQueueToTracker = () => {
    if (!actionPlan || matchedOpps.length === 0) return;
    onAddMatchesToTracker(matchedOpps, actionPlan.suggestedChecklist);
    setTrackerQueued(true);
  };

  const handleCopyDocument = () => {
    if (actionPlan?.draftDocument?.content) {
      navigator.clipboard.writeText(actionPlan.draftDocument.content);
      setCopiedDocument(true);
      setTimeout(() => setCopiedDocument(false), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Autonomous Copilot v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Opportunity Agent
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Give natural language instructions. The agent scans verified programs, audits your eligibility, drafts personal statements, and queues applications directly to your tracker.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs bg-neutral-100 dark:bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-neutral-400">Context:</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {userProfile.displayName || userProfile.name || userProfile.username}
          </span>
          <span className="text-neutral-400">·</span>
          <span className="capitalize font-mono text-indigo-600 dark:text-indigo-400">
            {userProfile.persona} ({userProfile.country})
          </span>
        </div>
      </div>

      {/* Agent Command Input (Cursor-style command bar) */}
      <div className="relative rounded-2xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-[#111113] p-2 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 mb-6">
        <div className="flex items-start gap-3 p-2">
          <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRunAgent();
                }
              }}
              placeholder="Tell the agent what to find or execute: e.g. 'Find fully-funded scholarships in Europe or Canada, audit my CGPA, and draft my application statement...'"
              className="w-full resize-none bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none leading-relaxed"
            />
            
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[10px]">
                  Enter ↵
                </kbd>
                <span>to execute</span>
              </span>

              <div className="flex items-center gap-2">
                {promptInput && (
                  <button
                    onClick={() => setPromptInput('')}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs px-2 py-1"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => handleRunAgent()}
                  disabled={!promptInput.trim() || isRunning}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-semibold text-xs transition-all bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  {isRunning ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-600" />
                      <span>Run Agent</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-2.5">
          Suggested Autonomous Directives
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPromptInput(preset.prompt);
                handleRunAgent(preset.prompt);
              }}
              disabled={isRunning}
              className="text-left rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 hover:bg-white dark:bg-neutral-900/50 dark:hover:bg-neutral-900 p-3 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                <span>{preset.title}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                {preset.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Execution Progress & Live Thought Chain */}
      {isRunning && (
        <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-indigo-600 animate-ping" />
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-mono">
                Autonomous Reasoning Engine Active
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-500">Evaluating Knowledge Graph...</span>
          </div>

          <div className="space-y-3">
            {liveSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                {step.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : step.status === 'in_progress' ? (
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mt-0.5 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-neutral-300 dark:border-neutral-700 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className={`font-medium ${step.status === 'done' ? 'text-neutral-900 dark:text-white' : step.status === 'in_progress' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-neutral-400'}`}>
                    {step.step}
                  </span>
                  {step.detail && (
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                      ↳ {step.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Deck */}
      {actionPlan && !isRunning && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Briefing Banner */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-mono text-xs font-bold">
                  ✓
                </span>
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  Agent Briefing & Strategy Report
                </span>
              </div>
              <span className="font-mono text-[11px] text-neutral-400">
                {new Date(actionPlan.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              {actionPlan.summary}
            </p>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={handleQueueToTracker}
                disabled={trackerQueued || matchedOpps.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all shadow-xs disabled:opacity-60"
              >
                {trackerQueued ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Queued in Tracker</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Queue {matchedOpps.length} Matches into Application Tracker</span>
                  </>
                )}
              </button>

              <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>{actionPlan.eligibilityVerdict}</span>
              </div>
            </div>
          </div>

          {/* Matched Opportunities Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Identified Best-Fit Programs ({matchedOpps.length})
              </h2>
              <span className="text-xs text-neutral-500">Sorted by Agent match coefficient</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchedOpps.map((opp) => {
                const dl = calculateDeadlineInfo(opp.deadline || '');
                return (
                  <div
                    key={opp.id}
                    className="flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
                        <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {opp.category}
                        </span>
                        <span className={`font-mono ${dl.isCritical ? 'text-rose-500' : dl.isUrgent ? 'text-amber-500' : 'text-neutral-400'}`}>
                          {dl.statusText}
                        </span>
                      </div>

                      <h3
                        onClick={() => onOpenOpportunityDetail(opp)}
                        className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors leading-snug mb-1"
                      >
                        {opp.title}
                      </h3>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        {opp.organisation || opp.organization}
                      </p>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                        {opp.summary || opp.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {opp.fundingDetails || opp.fundingAmount || 'Funded'}
                      </span>
                      <button
                        onClick={() => onOpenOpportunityDetail(opp)}
                        className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
                      >
                        <span>Audit</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Panel: Draft Document + Action Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Generated Application Statement */}
            {actionPlan.draftDocument && (
              <div className="lg:col-span-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {actionPlan.draftDocument.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                      {actionPlan.draftDocument.type}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                    Auto-synthesized draft tailored to your background, skills, and target program objectives.
                  </p>

                  <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-4 border border-neutral-200/80 dark:border-neutral-800 font-serif text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                    {actionPlan.draftDocument.content}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    Ready to paste into host application portal
                  </span>
                  <button
                    onClick={handleCopyDocument}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
                  >
                    {copiedDocument ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Statement</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Right: Tailored Preparation Checklist */}
            <div className="lg:col-span-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      Action Execution Checklist
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {actionPlan.suggestedChecklist.length} tasks
                  </span>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Autonomous priority schedule to ensure submission before earliest cutoff date.
                </p>

                <div className="space-y-2.5">
                  {actionPlan.suggestedChecklist.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/40 text-xs"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300 leading-snug">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Checklist auto-attached when queuing to tracker</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
