import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Globe,
  Compass,
  FileCheck,
  Bot,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { OpportunityCategory } from '../types';

interface FooterProps {
  onNavigateToTab: (tab: 'landing' | 'feed' | 'tracker' | 'community' | 'agent' | 'ingestion' | 'pitch') => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToTab, onOpenContact }) => {
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineMsg, setInlineMsg] = useState('');
  const [inlineSubmitting, setInlineSubmitting] = useState(false);
  const [inlineSuccess, setInlineSuccess] = useState(false);

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineEmail.trim()) return;

    setInlineSubmitting(true);
    setTimeout(() => {
      setInlineSubmitting(false);
      setInlineSuccess(true);
    }, 600);
  };

  return (
    <footer className="relative border-t border-black/[0.08] dark:border-white/[0.08] bg-[#FAFAFA] dark:bg-[#070709] text-neutral-600 dark:text-neutral-400 text-xs overflow-hidden transition-colors">
      
      {/* Subtle Atmospheric Glow at Footer Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/[0.03] dark:bg-indigo-600/[0.06] rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* =========================================================================
          TOP TIER: INTERACTIVE CONTACT & INGESTION BOX
          ========================================================================= */}
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40 mb-3">
                <Sparkles className="h-3 w-3" />
                <span>INSTITUTIONAL INGESTION & SUPPORT</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mb-2">
                Have an opportunity to publish or need tailored support?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
                Connect with our verification desk to list scholarships, hackathons, and seed grants, or ask our team any technical questions.
              </p>
              
              <div className="mt-4 flex items-center gap-4 text-xs">
                <button
                  onClick={onOpenContact}
                  className="inline-flex items-center gap-1.5 text-neutral-900 dark:text-white font-semibold hover:underline"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Open Full Contact Form</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Avg response: &lt; 2 hrs
                </span>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="lg:col-span-5">
              {inlineSuccess ? (
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
                  <div className="font-semibold text-xs text-neutral-900 dark:text-white">Message Dispatched</div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    Thank you. We will contact you at <span className="font-mono text-indigo-500">{inlineEmail}</span>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInlineSubmit} className="space-y-2.5">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={inlineEmail}
                      onChange={(e) => setInlineEmail(e.target.value)}
                      placeholder="Enter your institutional email..."
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 py-2.5 pl-9 pr-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={inlineMsg}
                      onChange={(e) => setInlineMsg(e.target.value)}
                      placeholder="Brief note or opportunity URL (optional)..."
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 py-2.5 px-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={inlineSubmitting}
                    className="w-full py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {inlineSubmitting ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        <span>Send Quick Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* =========================================================================
            MIDDLE TIER: 4 ORGANIZED COLUMNS
            ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-black/[0.06] dark:border-white/[0.06]">
          
          {/* Column 1: Core Navigation */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateToTab('landing')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('feed')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Explore Feed
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('agent')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Agent Copilot</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-500 font-bold">
                    AI
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('tracker')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Application Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('community')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Community Network
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Opportunities */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
              Opportunities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateToTab('feed')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Scholarships & Fellowships
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('feed')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Hackathons & Web3 Bounties
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('feed')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Seed Grants & Capital
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('feed')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Startup Accelerators
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('feed')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Global Remote Internships
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Tools */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
              Trust & Ingestion
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateToTab('ingestion')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Ingestion Studio</span>
                  <ExternalLink className="h-3 w-3 text-neutral-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab('pitch')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  SmartChain Hackathon Roadmap
                </button>
              </li>
              <li>
                <span className="text-neutral-400">Institutional Source Audit</span>
              </li>
              <li>
                <span className="text-neutral-400">Deterministic Eligibility</span>
              </li>
              <li>
                <span className="text-neutral-400">Zero Telemetry Protocol</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Organization */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
              Contact & Connect
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenContact}
                  className="text-neutral-900 dark:text-white font-medium hover:underline flex items-center gap-1.5"
                >
                  <MessageSquare className="h-3 w-3 text-indigo-500" />
                  <span>Send Direct Inquiry</span>
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@opportunityradar.org"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors font-mono text-[11px]"
                >
                  desk@opportunityradar.org
                </a>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>All Systems Operational</span>
                </div>
              </li>
              <li>
                <span className="text-[11px] text-neutral-400">
                  Global Coverage (54+ African Nations & International)
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* =========================================================================
            BOTTOM TIER: LEGAL, COPYRIGHT, ARCHITECTURAL CREDENTIALS
            ========================================================================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-mono text-[9px] font-bold">
              OR
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">
              OpportunityRadar
            </span>
            <span>© 2026. All verified institutional data sourced from official public registries.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer">
              Privacy Policy
            </span>
            <span>·</span>
            <span className="hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer">
              Terms of Service
            </span>
            <span>·</span>
            <button
              onClick={onOpenContact}
              className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
