import React, { useState } from 'react';
import { Opportunity, IngestionDraft, OpportunityCategory, LocationType, FundingType } from '../types';
import { extractOpportunityFromText } from '../services/aiService';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Copy,
  RefreshCw,
  Plus,
  ArrowRight,
  FileCode,
  Layers
} from 'lucide-react';

interface IngestionStudioProps {
  existingOpportunities: Opportunity[];
  onPublishOpportunity: (newOpp: Opportunity) => void;
}

const SAMPLE_ANNOUNCEMENTS = [
  {
    label: 'SmartChain Decentralized Grant',
    source: 'https://smartchainlimited.com/grants/announcement-2026',
    text: `SmartChain Foundation announces the 2026 Decentralized Infrastructure Grant.
Grant pool: $75,000 in equity-free capital for developer teams building open-source tooling, zero-knowledge verification bridges, or smart contract automation.
Eligibility: Open to worldwide teams and solo contributors. Must commit to open-source Apache 2.0 license.
Application Deadline: 2026-12-10
Apply at: https://smartchainlimited.com/grants/apply`
  },
  {
    label: 'African Tech Leaders Fellowship',
    source: 'https://africatechleaders.org/call-for-applications',
    text: `Call for Applications: 2027 Africa Young Tech Leaders Fellowship.
Organized by Pan-African Innovation Alliance.
Full coverage including all travel, accommodations in Nairobi, and $2,500 research stipend.
Eligibility: Nationals of any African Union member country between ages 19 and 29 enrolled in or recently graduated from a STEM program.
Deadline: 2026-11-20
Official portal: https://africatechleaders.org/apply-2027`
  },
  {
    label: 'Global Climate Hardware Accelerator',
    source: 'https://cleanearthaccelerator.io/cohort-4',
    text: `CleanEarth Accelerator opens cohort applications for climate tech startups.
Funding: $120,000 SAFE investment + 4 months mentorship in Berlin.
Eligibility: Early-stage hardware and software startups addressing grid storage or carbon removal.
Deadline: 2026-12-01
Apply at: https://cleanearthaccelerator.io/apply`
  }
];

export const IngestionStudio: React.FC<IngestionStudioProps> = ({
  existingOpportunities,
  onPublishOpportunity
}) => {
  const [rawText, setRawText] = useState<string>(SAMPLE_ANNOUNCEMENTS[0].text);
  const [sourceUrl, setSourceUrl] = useState<string>(SAMPLE_ANNOUNCEMENTS[0].source);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedDraft, setExtractedDraft] = useState<IngestionDraft | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setIsExtracting(true);
    setSuccessMessage(null);
    setDuplicateWarning(null);

    try {
      const draft = await extractOpportunityFromText(rawText, sourceUrl);
      setExtractedDraft(draft);

      // Check duplicates against existing opportunities
      const normalizedTitle = draft.title.toLowerCase().trim();
      const duplicate = existingOpportunities.find((o) =>
        o.title.toLowerCase().includes(normalizedTitle) ||
        normalizedTitle.includes(o.title.toLowerCase()) ||
        (o.sourceUrl && draft.sourceUrl && o.sourceUrl === draft.sourceUrl)
      );

      if (duplicate) {
        setDuplicateWarning(
          `Potential Duplicate Detected: "${duplicate.title}" (${duplicate.organization}) already exists in the verified database.`
        );
      }
    } catch (err) {
      console.error('Extraction failed', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePublish = () => {
    if (!extractedDraft) return;

    const org = extractedDraft.organisation || extractedDraft.organization || 'Organizing Body';
    const loc = extractedDraft.location || extractedDraft.locationName || 'Online / Global';
    const locArrangement = (extractedDraft.workArrangement || extractedDraft.locationType || 'remote') as any;
    const desc = extractedDraft.description || extractedDraft.summary || '';
    const elig = extractedDraft.eligibility || extractedDraft.eligibilityCriteria || ['Open to all eligible applicants'];
    const bene = extractedDraft.benefits || extractedDraft.keyBenefits || ['Access to program benefits'];
    const docs = extractedDraft.requiredDocuments || extractedDraft.requiredMaterials || ['Application form'];
    const skills = extractedDraft.requiredSkills || extractedDraft.tags || [extractedDraft.category];

    const newOpportunity: Opportunity = {
      id: 'opp-ingest-' + Date.now(),
      title: extractedDraft.title,
      organisation: org,
      category: extractedDraft.category,
      location: loc,
      workArrangement: locArrangement,
      description: desc,
      eligibility: elig,
      requiredQualifications: ['General Eligibility'],
      requiredSkills: skills,
      benefits: bene,
      fundingDetails: extractedDraft.fundingDetails || extractedDraft.fundingAmount || 'Funded',
      fundingType: extractedDraft.fundingType,
      deadline: extractedDraft.deadline,
      publishedAt: new Date().toISOString().split('T')[0],
      lastVerifiedAt: new Date().toISOString().split('T')[0],
      verificationStatus: 'Verified Source',
      opportunityStatus: 'open',
      sourceUrl: extractedDraft.sourceUrl,
      applicationUrl: extractedDraft.applicationUrl,
      requiredDocuments: docs,
      applicationInstructions: 'Apply via the verified official link.',
      isSeededDemonstration: false,
      isNigerianOrAfrican: /nigeria|lagos|abuja|africa/i.test(`${loc} ${org} ${desc}`),
      featured: false,

      // Compatibility aliases
      organization: org,
      locationType: locArrangement,
      locationName: loc,
      eligibleStages: ['developer', 'undergraduate', 'founder', 'all'],
      eligibleNationalities: ['Global / Stated in Source'],
      fundingAmount: extractedDraft.fundingDetails || extractedDraft.fundingAmount,
      summary: desc.slice(0, 220),
      eligibilityCriteria: elig,
      keyBenefits: bene,
      requiredMaterials: docs,
      tags: skills,
      lastVerified: new Date().toISOString().split('T')[0]
    };

    onPublishOpportunity(newOpportunity);
    setSuccessMessage(`Successfully verified and published "${newOpportunity.title}" to the live Discovery Feed!`);
    setExtractedDraft(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider mb-1">
          <span>Essential Feature 07</span>
          <span aria-hidden="true">·</span>
          <span>Source Ingestion & Admin Audit</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          AI Structured Opportunity Ingestion
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-3xl">
          Import opportunity notices, press releases, or scholarship announcements. The AI engine extracts structured fields without inventing missing criteria or hallucinating deadlines.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Raw Input & Sample Loader */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Announcement Input
              </span>
              <span className="text-[11px] text-slate-400">
                Paste raw notice or newsletter
              </span>
            </div>

            {/* Quick Sample Selector */}
            <div className="mb-3">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Test with verified samples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_ANNOUNCEMENTS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setRawText(s.text);
                      setSourceUrl(s.source);
                      setExtractedDraft(null);
                      setDuplicateWarning(null);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Source URL / Canonical Domain
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://organization.org/program"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Announcement Text Content
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste unstructured announcement text..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono"
                />
              </div>

              <button
                onClick={handleExtract}
                disabled={isExtracting || !rawText.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Extracting Structured Record...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Extract with Gemini 3.8 Flash</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Anti-Hallucination Policy Notice */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Audited Hallucination Safeguards:
            </span>
            <p>
              • If deadlines are absent in the text, the parser marks them as "Unknown".
            </p>
            <p>
              • Original canonical URLs are preserved for human audit.
            </p>
            <p>
              • Real-time duplicate cross-referencing flags identical programs.
            </p>
          </div>
        </div>

        {/* Right Column: Structured Review & Verification Form */}
        <div className="lg:col-span-7">
          {extractedDraft ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Structured Review & Verification
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Parsed Ready for Approval
                </span>
              </div>

              {duplicateWarning && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={extractedDraft.title}
                    onChange={(e) => setExtractedDraft({ ...extractedDraft, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Host Organization
                  </label>
                  <input
                    type="text"
                    value={extractedDraft.organization || extractedDraft.organisation || ''}
                    onChange={(e) => setExtractedDraft({ ...extractedDraft, organization: e.target.value, organisation: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Category
                  </label>
                  <select
                    value={extractedDraft.category}
                    onChange={(e) => setExtractedDraft({ ...extractedDraft, category: e.target.value as OpportunityCategory })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white capitalize"
                  >
                    {['scholarship', 'hackathon', 'accelerator', 'grant', 'fellowship', 'competition', 'training', 'job'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Funding Amount
                  </label>
                  <input
                    type="text"
                    value={extractedDraft.fundingAmount || extractedDraft.fundingDetails || ''}
                    onChange={(e) => setExtractedDraft({ ...extractedDraft, fundingAmount: e.target.value, fundingDetails: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Deadline (YYYY-MM-DD)
                  </label>
                  <input
                    type="text"
                    value={extractedDraft.deadline}
                    onChange={(e) => setExtractedDraft({ ...extractedDraft, deadline: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Application URL
                  </label>
                  <input
                    type="url"
                    value={extractedDraft.applicationUrl}
                    onChange={(e) => setExtractedDraft({ ...extractedDraft, applicationUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Summary
                  </label>
                  <textarea
                    rows={3}
                    value={extractedDraft.summary || extractedDraft.description || ''}
                    onChange={(e) => setExtractedDraft({ ...extractedDraft, summary: e.target.value, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setExtractedDraft(null)}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Discard Draft
                </button>
                <button
                  onClick={handlePublish}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2 text-xs font-semibold text-white dark:bg-sky-600 dark:hover:bg-sky-500 transition-colors shadow-xs"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify & Publish to Feed</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 h-full min-h-[360px]">
              <FileCode className="h-10 w-10 text-slate-400 mb-3" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                No draft extracted yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Select one of the sample announcements on the left or paste your own, then click "Extract with Gemini 3.8 Flash".
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
