import React, { useState, useEffect } from 'react';
import { Opportunity, UserProfile, ApplicationTrackerItem, AgentActionPlan, AgentThoughtStep } from '../types';
import { runOpportunityAgent, generateDossierFile, answerAgentDirectQuestion, AgentExecutionResult } from '../services/agentService';
import { calculateDeadlineInfo, downloadCalendarEvent } from '../utils/dateUtils';
import { calculateProfileCompletion } from '../utils/profileUtils';
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
  ArrowUpRight,
  Download,
  Edit3,
  Cpu,
  Zap,
  CheckSquare,
  Square,
  Linkedin,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Globe,
  TrendingUp
} from 'lucide-react';

interface OpportunityAgentProps {
  userProfile: UserProfile;
  opportunities: Opportunity[];
  trackerItems: ApplicationTrackerItem[];
  initialPrompt?: string;
  onAddMatchesToTracker: (matchedOpps: Opportunity[], customChecklist: { id: string; text: string; done: boolean }[]) => void;
  onOpenOpportunityDetail: (opp: Opportunity) => void;
  onOpenProfile?: () => void;
}

const PRESET_DIRECTIVES = [
  {
    title: 'Fully-funded STEM scholarships',
    prompt: 'Find fully-funded STEM scholarships in Europe or Africa closing in the next 60 days, verify eligibility for my degree, and draft my application statement.'
  },
  {
    title: 'Seed grants & founder pitch draft',
    prompt: 'Identify equity-free seed grants and startup competitions for African founders, audit requirements, and draft my initial statement of ambition.'
  },
  {
    title: 'High-prize Web3 hackathons',
    prompt: 'Scan for active tech & Web3 hackathons matching my technical skills, check prize pools, and create an execution roadmap for my team.'
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
  initialPrompt = '',
  onAddMatchesToTracker,
  onOpenOpportunityDetail,
  onOpenProfile
}) => {
  const profileCompletion = calculateProfileCompletion(userProfile);
  const [promptInput, setPromptInput] = useState(initialPrompt || '');
  const [isRunning, setIsRunning] = useState(false);
  const [actionPlan, setActionPlan] = useState<AgentExecutionResult | null>(null);
  const [liveSteps, setLiveSteps] = useState<AgentThoughtStep[]>([]);
  const [copiedDocument, setCopiedDocument] = useState(false);
  const [trackerQueued, setTrackerQueued] = useState(false);
  const [isEditingStatement, setIsEditingStatement] = useState(false);
  const [editedStatementText, setEditedStatementText] = useState('');
  const [localChecklist, setLocalChecklist] = useState<{ id: string; text: string; done: boolean }[]>([]);

  // Direct conversational Q&A grounded in user's LinkedIn, University & Ambition
  const [directQuestion, setDirectQuestion] = useState('');
  const [directAnswer, setDirectAnswer] = useState<string | null>(null);
  const [isAnsweringDirect, setIsAnsweringDirect] = useState(false);

  const handleAskDirectQuestion = async (customQ?: string) => {
    const q = (customQ || directQuestion).trim();
    if (!q || isAnsweringDirect) return;
    setIsAnsweringDirect(true);
    setDirectAnswer(null);
    try {
      const answer = await answerAgentDirectQuestion(q, userProfile, opportunities);
      setDirectAnswer(answer);
    } catch (e) {
      console.error(e);
      setDirectAnswer('Unable to generate tailored answer at this moment.');
    } finally {
      setIsAnsweringDirect(false);
    }
  };

  // If initialPrompt changes, populate input and auto-run
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setPromptInput(initialPrompt);
      handleRunAgent(initialPrompt);
    }
  }, [initialPrompt]);

  const handleRunAgent = async (overridePrompt?: string) => {
    const query = (overridePrompt || promptInput).trim();
    if (!query || isRunning) return;

    setIsRunning(true);
    setTrackerQueued(false);
    setCopiedDocument(false);
    setIsEditingStatement(false);
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
      setLocalChecklist(plan.suggestedChecklist || []);
      if (plan.draftDocument?.content) {
        setEditedStatementText(plan.draftDocument.content);
      }
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
    onAddMatchesToTracker(matchedOpps, localChecklist);
    setTrackerQueued(true);
  };

  const handleToggleCheckItem = (id: string) => {
    setLocalChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleCopyDocument = () => {
    const textToCopy = isEditingStatement ? editedStatementText : (actionPlan?.draftDocument?.content || '');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedDocument(true);
      setTimeout(() => setCopiedDocument(false), 2200);
    }
  };

  const handleDownloadDossier = () => {
    if (!actionPlan) return;
    const currentPlan: AgentActionPlan = {
      ...actionPlan,
      suggestedChecklist: localChecklist,
      draftDocument: actionPlan.draftDocument
        ? { ...actionPlan.draftDocument, content: editedStatementText || actionPlan.draftDocument.content }
        : undefined
    };
    generateDossierFile(currentPlan, opportunities, userProfile);
  };

  const handleAddConstraint = (phrase: string) => {
    if (promptInput.includes(phrase)) return;
    const updated = promptInput ? `${promptInput.trim()}, ${phrase}` : phrase;
    setPromptInput(updated);
  };

  const completedChecklistCount = localChecklist.filter((c) => c.done).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 transition-colors">
      
      {/* Header bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 mb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Autonomous Intelligence Copilot v2.4</span>
            <span className="text-neutral-400">·</span>
            <span>Real-Time Reasoning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            Opportunity Agent
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Give conversational instructions. The agent parses eligibility thresholds, scans verified programs, drafts tailored application statements, and queues milestones into your pipeline.
          </p>
        </div>

        {/* Active Candidate Profile Intelligence Bar with Match Readiness Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 self-start md:self-auto text-xs bg-white dark:bg-[#0c0c0e] p-3 rounded-xl border border-neutral-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full overflow-hidden bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-800">
              <img
                src={userProfile.avatar}
                alt={userProfile.displayName}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>{userProfile.displayName || userProfile.name}</span>
                {userProfile.linkedin && (
                  <a
                    href={userProfile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
                    title="Verified LinkedIn Profile"
                  >
                    <Linkedin className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1.5 flex-wrap">
                {userProfile.university && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3 text-neutral-400" />
                    <span className="truncate max-w-[120px]">{userProfile.university}</span>
                    <span>·</span>
                  </span>
                )}
                <span>{userProfile.country}</span>
              </div>
            </div>
          </div>

          {/* Progress bar visual indicating context completeness */}
          <div className="sm:border-l sm:border-neutral-200 dark:sm:border-white/[0.08] sm:pl-3.5 pt-2 sm:pt-0 min-w-[160px]">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                <span>AI Readiness</span>
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {profileCompletion.percentage}%
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-white/[0.08] overflow-hidden mb-1.5 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.max(6, profileCompletion.percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-neutral-400 truncate max-w-[110px]" title={profileCompletion.summaryMessage}>
                {profileCompletion.percentage >= 80 ? 'Optimal context' : 'Add LinkedIn/Edu'}
              </span>
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                >
                  Edit Profile →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Command Input (Cursor-style command bar) */}
      <div className="relative rounded-2xl border border-neutral-300 dark:border-white/[0.12] bg-white dark:bg-[#0c0c0e] p-2 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 mb-6">
        <div className="flex items-start gap-3 p-2">
          <div className="h-8 w-8 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
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
              className="w-full resize-none bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none leading-relaxed"
            />
            
            {/* Quick Directive Modifier Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1 text-[11px]">
              <span className="text-neutral-400 font-mono text-[10px]">Add constraint:</span>
              {[
                'Fully-funded only',
                'Closing within 30 days',
                'Africa & Diaspora focused',
                'Include project pitch outline',
                'No application fee'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAddConstraint(chip)}
                  className="px-2 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-white/[0.06] transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/[0.06] text-xs">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.08] border border-neutral-200 dark:border-white/[0.08] font-mono text-[10px]">
                  Enter ↵
                </kbd>
                <span>to execute autonomous plan</span>
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
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-semibold text-xs transition-all bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  {isRunning ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Reasoning...</span>
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

      {/* Suggested Directives Row */}
      <div className="mb-8">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400 block mb-2.5">
          Preset Autonomous Directives
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_DIRECTIVES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPromptInput(preset.prompt);
                handleRunAgent(preset.prompt);
              }}
              disabled={isRunning}
              className="text-left rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] hover:bg-neutral-50 dark:hover:bg-[#111113] p-3 transition-all hover:border-neutral-300 dark:hover:border-white/[0.16] group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
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

      {/* Interactive Direct Q&A with Agent grounded in candidate's credentials */}
      <div className="mb-8 rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Ask Agent Any Question About Your Profile & Opportunities
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
            Powered by your LinkedIn, University & Ambition
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={directQuestion}
            onChange={(e) => setDirectQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAskDirectQuestion();
              }
            }}
            placeholder={`e.g. "Am I eligible for Rhodes with my background from ${userProfile.university || 'university'}?" or "How should I describe my projects on LinkedIn?"`}
            className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 py-2.5 px-3.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => handleAskDirectQuestion()}
            disabled={!directQuestion.trim() || isAnsweringDirect}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAnsweringDirect ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span>Ask Agent</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggested Questions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1">
          <span className="text-neutral-400 font-mono text-[10px]">Quick Ask:</span>
          {[
            `Check my eligibility for European & African scholarships with my ${userProfile.fieldOfStudy} background`,
            `How should I position my LinkedIn profile for competitive hackathons?`,
            `What are the highest-probability grants for my ambition in ${userProfile.country}?`
          ].map((prompt, qIdx) => (
            <button
              key={qIdx}
              type="button"
              onClick={() => {
                setDirectQuestion(prompt);
                handleAskDirectQuestion(prompt);
              }}
              className="text-left px-2.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-white/[0.06] text-neutral-600 dark:text-neutral-300 transition-colors truncate max-w-xs sm:max-w-md"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Answer Display */}
        {directAnswer && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs leading-relaxed animate-in fade-in">
            <div className="flex items-center justify-between font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Agent Tailored Answer</span>
              </span>
              <button
                onClick={() => setDirectAnswer(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-[11px]"
              >
                Dismiss
              </button>
            </div>
            <div className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
              {directAnswer}
            </div>
          </div>
        )}
      </div>

      {/* Execution Progress & Live Thought Chain (Terminal Style) */}
      {isRunning && (
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-[#0c0c0e] p-6 mb-8 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
              </span>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-mono">
                Autonomous Reasoning Engine
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-indigo-500" />
              <span>Scanning live opportunities...</span>
            </span>
          </div>

          <div className="space-y-3 font-mono">
            {liveSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                {step.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : step.status === 'in_progress' ? (
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mt-0.5 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-neutral-300 dark:border-neutral-700 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className={`font-medium ${step.status === 'done' ? 'text-neutral-900 dark:text-white' : step.status === 'in_progress' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-neutral-400'}`}>
                    {step.step}
                  </span>
                  {step.detail && (
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
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
          
          {/* Executive Briefing Banner & HUD */}
          <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-mono text-xs font-bold">
                  ✓
                </span>
                <span className="font-bold text-sm text-neutral-950 dark:text-white">
                  Strategy Briefing & Execution Plan
                </span>
              </div>
              
              {/* Telemetry HUD chips */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex-wrap">
                {actionPlan.telemetry && (
                  <>
                    <span className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.05]">
                      {actionPlan.telemetry.durationMs}ms
                    </span>
                    <span>·</span>
                    <span className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.05]">
                      {actionPlan.telemetry.recordsScanned} scanned
                    </span>
                    <span>·</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {actionPlan.telemetry.confidenceScore}% Confidence
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-5">
              {actionPlan.summary}
            </p>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleQueueToTracker}
                  disabled={trackerQueued || matchedOpps.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all shadow-xs disabled:opacity-60"
                >
                  {trackerQueued ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Queued in Tracker ({matchedOpps.length})</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Queue {matchedOpps.length} Matches into Application Tracker</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadDossier}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-white/[0.08] hover:bg-neutral-50 dark:hover:bg-white/[0.05] text-neutral-800 dark:text-neutral-200 transition-colors"
                  title="Download complete Markdown dossier"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Download Full Dossier (.md)</span>
                </button>
              </div>

              <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>{actionPlan.eligibilityVerdict}</span>
              </div>
            </div>
          </div>

          {/* Matched Opportunities Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                Top Identified Programs ({matchedOpps.length})
              </h2>
              <span className="text-xs text-neutral-400">Ranked by background fit & deadlines</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchedOpps.map((opp) => {
                const dl = calculateDeadlineInfo(opp.deadline || '');
                return (
                  <div
                    key={opp.id}
                    className="flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] p-4 hover:border-neutral-300 dark:hover:border-white/[0.16] transition-all group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
                        <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
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

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/[0.06] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {opp.fundingDetails || opp.fundingAmount || 'Funded'}
                      </span>
                      <button
                        onClick={() => onOpenOpportunityDetail(opp)}
                        className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
                      >
                        <span>Audit Specs</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Panel: Draft Document (Editable) + Interactive Action Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Application Statement / Proposal Draft with live editor */}
            {actionPlan.draftDocument && (
              <div className="lg:col-span-7 rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {actionPlan.draftDocument.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingStatement(!isEditingStatement)}
                        className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.05]"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>{isEditingStatement ? 'Preview' : 'Edit Text'}</span>
                      </button>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.05] text-neutral-500">
                        {actionPlan.draftDocument.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                    Auto-synthesized draft tailored to your background, skills, and target program objectives.
                  </p>

                  {isEditingStatement ? (
                    <textarea
                      rows={8}
                      value={editedStatementText}
                      onChange={(e) => setEditedStatementText(e.target.value)}
                      className="w-full rounded-xl bg-neutral-50 dark:bg-[#111113] p-4 border border-indigo-500 text-xs text-neutral-900 dark:text-neutral-100 font-sans leading-relaxed outline-none"
                    />
                  ) : (
                    <div className="rounded-xl bg-neutral-50 dark:bg-[#111113] p-4 border border-neutral-200/80 dark:border-white/[0.06] text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                      {editedStatementText || actionPlan.draftDocument.content}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    {(editedStatementText || actionPlan.draftDocument.content).split(/\s+/).filter(Boolean).length} words · Ready for submission portal
                  </span>
                  <button
                    onClick={handleCopyDocument}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-white/[0.08] hover:bg-neutral-200 dark:hover:bg-white/[0.14] text-neutral-800 dark:text-neutral-200 transition-colors"
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

            {/* Right: Interactive Action Checklist */}
            <div className="lg:col-span-5 rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      Action Execution Checklist
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {completedChecklistCount}/{localChecklist.length} completed
                  </span>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Check off prerequisite documents as you prepare them. Synchronized with your Application Tracker.
                </p>

                <div className="space-y-2.5">
                  {localChecklist.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheckItem(item.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                        item.done
                          ? 'border-emerald-500/40 bg-emerald-500/5 text-neutral-400 line-through'
                          : 'border-neutral-200/80 dark:border-white/[0.06] bg-neutral-50/60 dark:bg-white/[0.03] text-neutral-800 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-white/[0.12]'
                      }`}
                    >
                      {item.done ? (
                        <CheckSquare className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                      )}
                      <span className="leading-snug">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/[0.06] text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Auto-queues to Application Tracker</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {Math.round((completedChecklistCount / Math.max(1, localChecklist.length)) * 100)}% Ready
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
