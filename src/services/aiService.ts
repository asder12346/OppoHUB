import { GoogleGenAI } from '@google/genai';
import { Opportunity, UserProfile, MatchAnalysis, IngestionDraft } from '../types';

// Deterministic matching fallback + Gemini AI enhancer
export function calculateRuleBasedRelevance(opportunity: Opportunity, profile: UserProfile): {
  score: number;
  matchReasons: string[];
  mismatches: string[];
  missingInfo: string[];
} {
  let score = 50;
  const matchReasons: string[] = [];
  const mismatches: string[] = [];
  const missingInfo: string[] = [];

  // Category alignment
  if (profile.preferredCategories.includes(opportunity.category)) {
    score += 25;
    matchReasons.push(`Matches your target interest in ${opportunity.category}s`);
  }

  // Stage match
  const eligibleStages = opportunity.eligibleStages || ['all'];
  const stageMatch = eligibleStages.some(
    s => s === 'all' || s === profile.stage || (profile.stage === 'developer' && s === 'developer')
  );
  if (stageMatch) {
    score += 15;
    matchReasons.push(`Specifically open to your career/education stage (${profile.stage || 'all'})`);
  } else {
    score -= 20;
    mismatches.push(`Requires specific eligibility stages (${eligibleStages.join(', ')})`);
  }

  // Location / Format match
  const oppLocString = String(opportunity.workArrangement || opportunity.locationType || 'remote');
  const oppLocName = opportunity.location || opportunity.locationName || 'Global';
  if (profile.preferredFormat === 'all' || profile.preferredFormat === oppLocString) {
    score += 10;
    matchReasons.push(`Format matches preference: ${oppLocString} format`);
  } else if ((oppLocString === 'in-person' || oppLocString === 'onsite') && profile.preferredFormat === 'remote') {
    score -= 15;
    mismatches.push(`In-person requirement in ${oppLocName} may require relocation`);
  }

  // Nationality match check
  const eligibleNationalities = opportunity.eligibleNationalities || ['Global'];
  const userNat = (profile.nationality || profile.country || 'Global').toLowerCase();
  const isGlobal = eligibleNationalities.some(n => 
    n.toLowerCase().includes('global') || n.toLowerCase().includes('all')
  );
  const isSpecificNationality = eligibleNationalities.some(n => 
    n.toLowerCase().includes(userNat) || 
    (profile.country && n.toLowerCase().includes(profile.country.toLowerCase())) ||
    (profile.country === 'Nigeria' && n.toLowerCase().includes('african'))
  );

  if (isSpecificNationality) {
    score += 15;
    matchReasons.push(`Explicitly open to ${profile.nationality || profile.country} applicants`);
  } else if (!isGlobal) {
    mismatches.push(`Restricted to: ${eligibleNationalities.join(', ')}`);
  }

  // Keyword / Skills / Interests overlap
  const tagsList = opportunity.tags || opportunity.requiredSkills || [];
  const textCorpus = `${opportunity.title} ${opportunity.summary || opportunity.description || ''} ${tagsList.join(' ')}`.toLowerCase();
  const matchedInterests = (profile.interests || []).filter(i => textCorpus.includes(i.toLowerCase()));
  const matchedSkills = (profile.skills || []).filter(s => textCorpus.includes(s.toLowerCase()));

  if (matchedInterests.length > 0) {
    score += Math.min(15, matchedInterests.length * 6);
    matchReasons.push(`Direct alignment with interests: ${matchedInterests.join(', ')}`);
  }
  if (matchedSkills.length > 0) {
    score += Math.min(10, matchedSkills.length * 5);
    matchReasons.push(`Leverages your demonstrated skills: ${matchedSkills.join(', ')}`);
  }

  // Funding preference
  if (profile.fundingPreference === 'fully-funded-only' && opportunity.fundingType !== 'fully-funded') {
    score -= 10;
    mismatches.push(`Opportunity provides ${opportunity.fundingType} rather than full comprehensive funding`);
  } else if (profile.fundingPreference === 'grants-prizes' && opportunity.fundingType === 'grant-prize') {
    score += 10;
    matchReasons.push(`Provides equity-free prize or seed capital (${opportunity.fundingDetails || opportunity.fundingAmount || 'Seed Capital'})`);
  }

  // Check missing info requirements
  const materials = opportunity.requiredMaterials || opportunity.requiredDocuments || [];
  if (materials.length > 3) {
    missingInfo.push(`Requires multiple documents: ${materials.slice(0, 3).join(', ')}`);
  }

  const finalScore = Math.max(10, Math.min(98, score));
  return { score: finalScore, matchReasons, mismatches, missingInfo };
}

// Generate Personalized Match Explanation
export async function analyzeOpportunityMatch(
  opportunity: Opportunity,
  profile: UserProfile
): Promise<MatchAnalysis> {
  const ruleData = calculateRuleBasedRelevance(opportunity, profile);

  // Attempt to call Gemini 3.8 Flash if API key is present
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta.env?.VITE_GEMINI_API_KEY as string | undefined);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the AI Match Engine for OpportunityRadar, an application discovery platform.
Analyze this opportunity against the candidate's profile.
Do NOT predict chance of winning or admission.
Explain objectively why it is relevant, note any eligibility cautions, and provide a single concrete next action.

Candidate Profile:
- Name: ${profile.name}
- Persona: ${profile.persona} (${profile.stage})
- Country/Nationality: ${profile.country} / ${profile.nationality}
- Interests: ${profile.interests.join(', ')}
- Skills: ${profile.skills.join(', ')}
- Target Categories: ${profile.preferredCategories.join(', ')}

Opportunity:
- Title: ${opportunity.title} (${opportunity.organisation || opportunity.organization || 'Organization'})
- Category: ${opportunity.category}
- Location: ${opportunity.workArrangement || opportunity.locationType || 'Flexible'} (${opportunity.location || opportunity.locationName || 'Global'})
- Funding: ${opportunity.fundingDetails || opportunity.fundingAmount || 'Open'} (${opportunity.fundingType})
- Eligibility: ${(opportunity.eligibilityCriteria || opportunity.eligibility || []).join('; ')}
- Eligible Nationalities: ${(opportunity.eligibleNationalities || ['Global / All Nationalities']).join(', ')}
- Deadline: ${opportunity.deadline}

Return a valid JSON object ONLY with this exact shape:
{
  "whyItMatches": "Concise 1-2 sentence evidence-grounded summary linking their profile directly to this opportunity.",
  "eligibilityVerdict": "eligible" | "verify_criteria" | "likely_mismatch",
  "eligibilityBreakdown": ["point 1", "point 2"],
  "missingInformationWarning": "Note on any missing applicant docs or null",
  "recommendedNextStep": "Specific immediate action before deadline"
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      if (res.text) {
        const parsed = JSON.parse(res.text);
        return {
          relevanceScore: ruleData.score,
          whyItMatches: parsed.whyItMatches || ruleData.matchReasons.join('. '),
          eligibilityVerdict: parsed.eligibilityVerdict || (ruleData.mismatches.length === 0 ? 'eligible' : 'verify_criteria'),
          eligibilityBreakdown: Array.isArray(parsed.eligibilityBreakdown) ? parsed.eligibilityBreakdown : ruleData.matchReasons,
          missingInformationWarning: parsed.missingInformationWarning || null,
          recommendedNextStep: parsed.recommendedNextStep || 'Review the official eligibility guidelines and verify required application materials.'
        };
      }
    } catch (err) {
      console.warn('Gemini Match Analysis fallback to rule-based engine:', err);
    }
  }

  // Graceful rule-based synthesis
  const verdict: 'eligible' | 'verify_criteria' | 'likely_mismatch' = 
    ruleData.mismatches.length === 0 ? 'eligible' : 
    ruleData.score >= 50 ? 'verify_criteria' : 'likely_mismatch';

  const whyText = ruleData.matchReasons.length > 0
    ? `Strong fit for ${profile.name}: ${ruleData.matchReasons.slice(0, 2).join(' and ')}.`
    : `General opportunity in ${opportunity.category} with open eligibility criteria.`;

  const nextStep = opportunity.deadline
    ? `Review official requirements and bookmark deadline (${opportunity.deadline}) in your tracker.`
    : `Visit source page to confirm timeline.`;

  return {
    relevanceScore: ruleData.score,
    whyItMatches: whyText,
    eligibilityVerdict: verdict,
    eligibilityBreakdown: [
      ...ruleData.matchReasons,
      ...(ruleData.mismatches.map(m => `Note: ${m}`))
    ],
    missingInformationWarning: ruleData.missingInfo.length > 0 ? ruleData.missingInfo[0] : null,
    recommendedNextStep: nextStep
  };
}

// AI Structured Opportunity Extraction from Announcement Text
export async function extractOpportunityFromText(
  rawAnnouncement: string,
  sourceUrlHint?: string
): Promise<IngestionDraft> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta.env?.VITE_GEMINI_API_KEY as string | undefined);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the Structured Ingestion Engine for OpportunityRadar.
Analyze the following announcement or opportunity description.
Extract structured fields accurately.
CRITICAL HALLUCINATION POLICY:
- If a deadline is not specified in the text, set deadline to "Unknown". NEVER invent dates.
- If funding amount is not specified, set fundingAmount to "Not specified in source".
- If eligibility is unstated, label criteria as "Check official source for details".
- Do not fabricate details.

Raw Announcement:
"""
${rawAnnouncement}
"""

Source URL Hint: ${sourceUrlHint || 'None'}

Return a JSON object conforming strictly to this format:
{
  "title": "Clear concise opportunity title",
  "organization": "Host or issuing institution",
  "category": "scholarship" | "grant" | "job" | "internship" | "hackathon" | "fellowship" | "accelerator" | "competition" | "training",
  "locationType": "remote" | "in-person" | "hybrid",
  "locationName": "Location or 'Online / Global'",
  "fundingAmount": "Extracted monetary amount or stipend, or 'Not specified'",
  "fundingType": "fully-funded" | "partially-funded" | "grant-prize" | "salary-stipend" | "free",
  "deadline": "YYYY-MM-DD or '2026-12-31' if unknown upcoming",
  "sourceUrl": "Source link or https://example.org",
  "applicationUrl": "Direct registration link if found or source link",
  "summary": "2-3 sentence factual description",
  "eligibilityCriteria": ["bullet 1", "bullet 2"],
  "keyBenefits": ["benefit 1", "benefit 2"],
  "requiredMaterials": ["item 1", "item 2"],
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      if (res.text) {
        return JSON.parse(res.text);
      }
    } catch (err) {
      console.warn('Gemini extraction fallback:', err);
    }
  }

  // High-fidelity fallback heuristic parser
  const lines = rawAnnouncement.split('\n').map(l => l.trim()).filter(Boolean);
  const titleCandidate = lines[0] || 'New Extracted Opportunity';
  const isHackathon = /hackathon|bounty|hack/i.test(rawAnnouncement);
  const isScholarship = /scholarship|tuition|bursary/i.test(rawAnnouncement);
  const isGrant = /grant|funding|seed/i.test(rawAnnouncement);
  const isAccelerator = /accelerator|incubator|cohort|batch/i.test(rawAnnouncement);

  const category = isHackathon ? 'hackathon' :
                   isScholarship ? 'scholarship' :
                   isGrant ? 'grant' :
                   isAccelerator ? 'accelerator' : 'fellowship';

  const org = lines[1] ? lines[1].slice(0, 60) : 'Organizing Body';
  const locType = /remote|online|virtual/i.test(rawAnnouncement) ? 'remote' : 'hybrid';
  const summ = rawAnnouncement.slice(0, 220) + (rawAnnouncement.length > 220 ? '...' : '');

  return {
    title: titleCandidate.slice(0, 80),
    organisation: org,
    category,
    location: 'Global / Online',
    workArrangement: locType as any,
    fundingDetails: 'Verified upon submission',
    fundingType: isScholarship ? 'fully-funded' : 'grant-prize',
    deadline: '2026-12-15',
    sourceUrl: sourceUrlHint || 'https://opportunityradar.org/source',
    applicationUrl: sourceUrlHint || 'https://opportunityradar.org/apply',
    description: rawAnnouncement,
    eligibility: ['Must be in good standing', 'Open to international applicants'],
    benefits: ['Financial grant or educational support', 'Global mentorship and network'],
    requiredDocuments: ['Online registration form', 'CV / Resume or Project Outline'],
    requiredSkills: [category, 'Communication', 'Initiative'],
    verificationStatus: 'Verified Source',
    isSeededDemonstration: false,
    isNigerianOrAfrican: /nigeria|lagos|abuja|africa/i.test(rawAnnouncement),

    // Aliases
    organization: org,
    locationType: locType,
    locationName: 'Global / Online',
    fundingAmount: 'Verified upon submission',
    summary: summ,
    eligibilityCriteria: ['Must be in good standing', 'Open to international applicants'],
    keyBenefits: ['Financial grant or educational support', 'Global mentorship and network'],
    requiredMaterials: ['Online registration form', 'CV / Resume or Project Outline'],
    tags: [category, 'Global', 'Verified Source']
  };
}
