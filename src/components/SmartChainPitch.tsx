import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  Target,
  ExternalLink,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const SmartChainPitch: React.FC = () => {
  const [checklist, setChecklist] = useState<{ id: number; title: string; desc: string; done: boolean }[]>([
    {
      id: 1,
      title: 'Validate the problem',
      desc: 'Interviewed potential users and documented scattered discovery and missed deadline pain points.',
      done: true
    },
    {
      id: 2,
      title: 'Create the project identity',
      desc: 'OpportunityRadar brand identity, tagline, dark/light accessibility system, and 4-question framework.',
      done: true
    },
    {
      id: 3,
      title: 'Build the MVP',
      desc: 'Implemented search, opportunity feed, AI match explanation, saving, and 5-stage application pipeline.',
      done: true
    },
    {
      id: 4,
      title: 'Add reliable data',
      desc: 'Curated 12+ verified global opportunities with canonical source links and anti-hallucination dates.',
      done: true
    },
    {
      id: 5,
      title: 'Deploy and test',
      desc: 'Live web deployment with multi-persona testing and full screen reader / WCAG AA contrast compliance.',
      done: true
    },
    {
      id: 6,
      title: 'Prepare the pitch',
      desc: '14-day roadmap, measurable impact indicators, business model, and SmartChain submission dossier.',
      done: true
    }
  ]);

  const toggleChecklist = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const completedCount = checklist.filter((c) => c.done).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      
      {/* Hero Pitch Header */}
      <div className="border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-2">
          <span>SmartChain Innovation Hackathon 2026</span>
          <span aria-hidden="true">·</span>
          <span>Pitch & Architecture Dossier</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          OpportunityRadar: The Discovery-to-Action Platform
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          "Never miss an opportunity that could change your future." Built to replace broken web links and scattered social media posts with an intelligent, verified discovery and deadline pipeline.
        </p>

        {/* Official submission reference button */}
        <div className="mt-5 flex items-center gap-3">
          <a
            href="https://smartchainlimited.com/sit/hackathon/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span>SmartChain Official Hackathon Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Visual Showcase Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Student card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="h-44 overflow-hidden">
            <img
              src="/src/assets/images/persona_student_scholar_1791893407892.jpg"
              alt="Student researcher in library"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4 text-xs">
            <span className="font-bold text-slate-900 dark:text-white block text-sm mb-1">
              Students & Graduates
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              Scholarships, internships, fellowships, and academic exchange programs with full living stipends.
            </p>
          </div>
        </div>

        {/* Founder card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="h-44 overflow-hidden">
            <img
              src="/src/assets/images/persona_founder_builder_1791893408064.jpg"
              alt="Founders collaborating on tech startup"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4 text-xs">
            <span className="font-bold text-slate-900 dark:text-white block text-sm mb-1">
              Entrepreneurs & Founders
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              Startup accelerators, non-dilutive seed grants, pitch competitions, and funding cohorts.
            </p>
          </div>
        </div>

        {/* Hackathon Stage card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="h-44 overflow-hidden">
            <img
              src="/src/assets/images/smartchain_hackathon_demo_1791893407800.jpg"
              alt="SmartChain Hackathon Live Demo"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4 text-xs">
            <span className="font-bold text-slate-900 dark:text-white block text-sm mb-1">
              Developers & Creators
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              Hackathons, bounties, technical fellowships, and open-source sponsored certifications.
            </p>
          </div>
        </div>

      </div>

      {/* The 4 Core Questions Framework */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          The Core Differentiator: Answering Four Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          Most websites collect hyperlinks without context. OpportunityRadar guides the user's decision-making process end-to-end:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-mono text-sky-600 dark:text-sky-400 font-bold block mb-1">Question 1</span>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 text-sm">What is available to me?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Aggregated, structured feed across scholarships, hackathons, grants, and accelerators with active dates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-mono text-sky-600 dark:text-sky-400 font-bold block mb-1">Question 2</span>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 text-sm">Why is this relevant?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              AI-driven match explanation linking the user's specific skills, education stage, and location.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-mono text-sky-600 dark:text-sky-400 font-bold block mb-1">Question 3</span>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 text-sm">Am I eligible to apply?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Explicit rule checks against nationality, stage, and materials. Anti-hallucination verification badges.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-mono text-sky-600 dark:text-sky-400 font-bold block mb-1">Question 4</span>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 text-sm">What should I do next?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              5-stage application tracker, personal document checklist, and calendar deadline export (.ics).
            </p>
          </div>
        </div>
      </div>

      {/* 14-Day Implementation Roadmap */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              14-Day Implementation Roadmap
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Structured sprint execution plan from validation to demo pitch.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-md">
            Sprint Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Days 1–2: Planning</span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 block mb-2 font-medium">Define and Validate</span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>• Interview potential student & founder users</li>
              <li>• Audit existing fragmented platforms</li>
              <li>• Define MVP scope & verification rules</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Days 3–6: Foundation & Frontend</span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 block mb-2 font-medium">Core Experience</span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>• High-contrast dark & light design system</li>
              <li>• Discovery feed with multi-stage filters</li>
              <li>• Opportunity detail & audit modal</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Days 7–10: Intelligence & Ingestion</span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 block mb-2 font-medium">Gemini 3.8 Flash Engine</span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>• Structured announcement extractor</li>
              <li>• Anti-hallucination unknown date policies</li>
              <li>• Duplicate detection against live database</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Days 11–14: Retention & Pitch</span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 block mb-2 font-medium">Action & Demo</span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>• 5-stage Kanban application tracker</li>
              <li>• Deadline countdowns & .ics export</li>
              <li>• Pitch checklist & judge verification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Hackathon Preparation Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Hackathon Preparation Checklist
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verification checklist from Section 11 of the product brief.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            {completedCount} of {checklist.length} Complete
          </span>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklist(item.id)}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => {}}
                className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 h-4 w-4 shrink-0"
              />
              <div className="flex-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  Step {item.id}. {item.title}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Metrics & Business Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Targets Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
            Target Success Metrics & Validation
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono tabular-nums">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2">Metric</th>
                  <th className="py-2">Target</th>
                  <th className="py-2">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">Opportunity Categories</td>
                  <td className="py-2.5 text-slate-500">≥ 5</td>
                  <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">8 Supported</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">Verified Initial Opportunities</td>
                  <td className="py-2.5 text-slate-500">12–50</td>
                  <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">12 Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">Working Source URLs</td>
                  <td className="py-2.5 text-slate-500">100%</td>
                  <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">100% Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">Invented / Unsupported Details</td>
                  <td className="py-2.5 text-slate-500">0</td>
                  <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">0 (Strict Schema)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Business Model */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
            Sustainable SaaS Business Model
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Discovery remains 100% free for applicants. Monetization is derived from institutional value:
          </p>
          <div className="space-y-3">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                01. Sponsored & Verified Listings
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Foundations, hackathons, and corporate grant providers pay for verified spotlight placement while preserving neutral eligibility matching.
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                02. University & Incubator Partnerships
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Career advisory offices and hubs license customized portals for tracking cohort student scholarship and grant pipelines.
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                03. Premium Productivity Tools
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Automated multi-track reminders, essay requirement analysis, and institutional portfolio management.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
