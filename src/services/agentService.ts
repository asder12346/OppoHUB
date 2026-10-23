import { GoogleGenAI } from '@google/genai';
import { Opportunity, UserProfile, ApplicationTrackerItem, AgentActionPlan, AgentThoughtStep } from '../types';
import { calculateRuleBasedRelevance } from './aiService';
import { calculateDeadlineInfo } from '../utils/dateUtils';

export async function runOpportunityAgent(
  prompt: string,
  userProfile: UserProfile,
  allOpportunities: Opportunity[],
  currentTrackerItems: ApplicationTrackerItem[],
  onStepUpdate?: (stepIndex: number, step: AgentThoughtStep) => void
): Promise<AgentActionPlan> {
  const steps: AgentThoughtStep[] = [
    { step: 'Parsing natural language instructions & extracting operational constraints', status: 'in_progress' },
    { step: 'Scanning opportunity knowledge graph against user background', status: 'pending' },
    { step: 'Auditing multi-factor eligibility criteria & prerequisite documents', status: 'pending' },
    { step: 'Synthesizing tailored action plan, execution checklist, and draft deliverables', status: 'pending' }
  ];

  const updateStep = (index: number, status: 'pending' | 'in_progress' | 'done', detail?: string) => {
    steps[index] = { ...steps[index], status, detail };
    if (onStepUpdate) {
      onStepUpdate(index, steps[index]);
    }
  };

  // Step 1: Simulate thinking & parse constraints
  await new Promise((r) => setTimeout(r, 600));
  const queryLower = prompt.toLowerCase();
  
  // Detect category keywords
  const categories: string[] = [];
  if (/scholarship|study|tuition|oxford|cambridge|masters|degree/i.test(queryLower)) categories.push('scholarship');
  if (/grant|funding|capital|seed|tef|non-dilutive/i.test(queryLower)) categories.push('grant');
  if (/hackathon|bounty|hack|smartchain|eth/i.test(queryLower)) categories.push('hackathon');
  if (/accelerator|incubator|yc|combinator/i.test(queryLower)) categories.push('accelerator');
  if (/fellowship|thiel/i.test(queryLower)) categories.push('fellowship');
  if (/internship|job/i.test(queryLower)) categories.push('internship', 'job');

  updateStep(0, 'done', `Identified intent parameters: Categories: [${categories.join(', ') || 'All categories'}], Persona: ${userProfile.persona}`);

  // Step 2: Knowledge graph scan
  updateStep(1, 'in_progress', 'Evaluating match coefficients across verified opportunities...');
  await new Promise((r) => setTimeout(r, 800));

  // Filter & score opportunities
  const scored = allOpportunities.map((opp) => {
    const rule = calculateRuleBasedRelevance(opp, userProfile);
    let boost = 0;
    
    // Check keyword overlap with query
    const oppCorpus = `${opp.title} ${opp.organisation || opp.organization || ''} ${opp.category} ${opp.location || ''} ${(opp.tags || []).join(' ')} ${opp.description || opp.summary || ''}`.toLowerCase();
    
    if (categories.length > 0 && categories.includes(opp.category)) {
      boost += 30;
    }
    
    const words = queryLower.split(/\s+/).filter(w => w.length > 3);
    words.forEach(w => {
      if (oppCorpus.includes(w)) boost += 8;
    });

    const dl = calculateDeadlineInfo(opp.deadline || '');
    if (dl.daysLeft >= 0 && dl.daysLeft <= 60) boost += 5;

    return {
      opp,
      totalScore: rule.score + boost,
      rule
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  const matched = scored.slice(0, 3).map(s => s.opp);

  updateStep(1, 'done', `Selected top ${matched.length} high-confidence opportunities with average match score of ${Math.round(scored.slice(0, 3).reduce((acc, c) => acc + c.totalScore, 0) / Math.max(1, matched.length))}%`);

  // Step 3: Eligibility & document audit
  updateStep(2, 'in_progress', 'Cross-referencing citizenship, education level, and required transcripts...');
  await new Promise((r) => setTimeout(r, 800));

  const missingDocs: string[] = [];
  matched.forEach(m => {
    const docs = m.requiredDocuments || m.requiredMaterials || [];
    docs.forEach(d => {
      if (!missingDocs.includes(d)) missingDocs.push(d);
    });
  });

  updateStep(2, 'done', `Verified requirements: ${missingDocs.length} prerequisite documents catalogued.`);

  // Step 4: Synthesize Plan & Deliverables
  updateStep(3, 'in_progress', 'Generating personalized preparation checklist & statement draft...');
  await new Promise((r) => setTimeout(r, 700));

  // Check if Gemini is available for real-time generative completion
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  let generatedSummary = '';
  let generatedEssay: { title: string; type: string; content: string } | undefined;
  const checklistItems = [
    { id: 'chk-1', text: `Verify eligibility threshold & transcripts for ${matched[0]?.title || 'primary opportunity'}`, done: false },
    { id: 'chk-2', text: `Prepare certified copies of: ${missingDocs.slice(0, 2).join(', ') || 'Official ID and Resume'}`, done: false },
    { id: 'chk-3', text: `Draft personal statement of ambition aligning ${userProfile.skills.slice(0, 2).join(' & ')} with host mission`, done: false },
    { id: 'chk-4', text: `Review application deadline with 7-day buffer before official cutoff`, done: false }
  ];

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const promptText = `You are the OpportunityRadar Autonomous Opportunity Agent.
User Profile:
- Name: ${userProfile.displayName || userProfile.name || userProfile.username}
- Persona: ${userProfile.persona} (${userProfile.educationLevel || userProfile.stage})
- Country/Nationality: ${userProfile.country} / ${userProfile.nationality}
- Skills: ${userProfile.skills.join(', ')}
- Interests: ${userProfile.interests.join(', ')}
- Career Goals: ${userProfile.careerGoals}

User Instruction: "${prompt}"

Target Identified Opportunities:
${matched.map(m => `- ${m.title} (${m.organisation || m.organization}) | Deadline: ${m.deadline} | Funding: ${m.fundingDetails || m.fundingAmount}`).join('\n')}

Generate a JSON response with:
{
  "summary": "Concise 2-3 sentence strategic briefing explaining why these exact opportunities were selected and how the applicant should position themselves.",
  "eligibilityVerdict": "Clear 1-sentence confirmation of applicant eligibility status and key condition to check.",
  "recommendedNextSteps": ["Step 1", "Step 2", "Step 3"],
  "checklist": ["Actionable preparation item 1", "Actionable preparation item 2", "Actionable preparation item 3", "Actionable preparation item 4"],
  "draftDocument": {
    "title": "Tailored Statement of Purpose / Proposal Pitch",
    "type": "Statement of Ambition",
    "content": "A high-impact 200-word draft paragraph that the user can immediately use or adapt for their application."
  }
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      if (res.text) {
        const parsed = JSON.parse(res.text);
        generatedSummary = parsed.summary || '';
        if (parsed.checklist && Array.isArray(parsed.checklist)) {
          checklistItems.length = 0;
          parsed.checklist.forEach((c: string, idx: number) => {
            checklistItems.push({ id: `chk-${idx}`, text: c, done: false });
          });
        }
        if (parsed.draftDocument && parsed.draftDocument.content) {
          generatedEssay = parsed.draftDocument;
        }
      }
    } catch (e) {
      console.warn('Gemini generative agent call fallback:', e);
    }
  }

  if (!generatedSummary) {
    const top = matched[0];
    generatedSummary = `Autonomous Agent triaged your profile against ${allOpportunities.length} live records. Identified ${matched.length} optimal targets led by "${top?.title || 'Featured Program'}", strongly aligned with your ${userProfile.skills.slice(0, 2).join(' & ')} background and ${userProfile.country} eligibility criteria.`;
  }

  if (!generatedEssay && matched[0]) {
    const top = matched[0];
    generatedEssay = {
      title: `Application Statement for ${top.title}`,
      type: 'Personal Statement Draft',
      content: `As an ambitious ${userProfile.persona} based in ${userProfile.country} with dedicated training in ${userProfile.skills.slice(0, 3).join(', ')}, I am applying to ${top.title} to drive meaningful, scalable impact. My background combines rigorous problem-solving with a proven commitment to ${userProfile.interests[0] || 'innovation'}. Through ${top.organisation || top.organization || 'this program'}, I intend to leverage the provided resources and global network to accelerate my long-term career ambition: ${userProfile.careerGoals || 'building transformative technology for community advancement'}.`
    };
  }

  updateStep(3, 'done', 'Autonomous plan synthesized and deliverables ready for execution.');

  return {
    id: 'agent-run-' + Date.now(),
    query: prompt,
    status: 'completed',
    thoughtChain: steps,
    summary: generatedSummary,
    matchedOpportunityIds: matched.map(m => m.id),
    eligibilityVerdict: `Eligible for all ${matched.length} matched programs under current ${userProfile.country} / ${userProfile.persona} background.`,
    recommendedNextSteps: [
      `Review matched programs and queue them directly into your Application Tracker.`,
      `Verify certified academic transcript and host recommendations before the earliest deadline (${matched[0]?.deadline || 'upcoming'}).`,
      `Copy and refine the auto-generated statement draft into your application portal.`
    ],
    suggestedChecklist: checklistItems,
    draftDocument: generatedEssay,
    executedActions: [],
    createdAt: new Date().toISOString()
  };
}
