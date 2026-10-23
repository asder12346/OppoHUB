export type OpportunityCategory =
  | 'scholarship'
  | 'internship'
  | 'job'
  | 'grant'
  | 'hackathon'
  | 'fellowship'
  | 'accelerator'
  | 'competition'
  | 'training';

export type WorkArrangement = 'remote' | 'onsite' | 'hybrid';

export type VerificationState =
  | 'Verified Source'
  | 'Needs Verification'
  | 'Closing Soon'
  | 'Expired';

export type EducationLevel =
  | 'High School'
  | 'Undergraduate'
  | 'Graduate / Master'
  | 'Doctorate / PhD'
  | 'Early-Career'
  | 'Open to All';

export type ExperienceLevel =
  | 'student'
  | 'entry'
  | 'intermediate'
  | 'senior'
  | 'founder'
  | 'all';

export type ApplicationStatus =
  | 'Saved'
  | 'Planning to Apply'
  | 'Applied'
  | 'Interview or Follow-up'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export interface Opportunity {
  id: string;
  title: string;
  organisation: string;
  category: OpportunityCategory;
  location: string;
  workArrangement: WorkArrangement;
  description: string;
  eligibility: string[];
  requiredQualifications?: string[];
  requiredSkills: string[];
  benefits: string[];
  fundingDetails: string;
  fundingType: 'fully-funded' | 'partially-funded' | 'grant-prize' | 'salary-stipend' | 'free';
  deadline: string; // ISO date 'YYYY-MM-DD'
  publishedAt: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationState;
  opportunityStatus: 'open' | 'closing_soon' | 'closed';
  sourceUrl: string;
  applicationUrl: string;
  requiredDocuments: string[];
  applicationInstructions: string;
  isSeededDemonstration: boolean; // clearly distinguishes demonstration records
  isNigerianOrAfrican: boolean;
  featured?: boolean;

  // Compatibility aliases for existing components
  organization?: string;
  locationType?: WorkArrangement | string;
  locationName?: string;
  eligibleStages?: string[];
  eligibleNationalities?: string[];
  fundingAmount?: string;
  summary?: string;
  eligibilityCriteria?: string[];
  keyBenefits?: string[];
  requiredMaterials?: string[];
  tags?: string[];
  lastVerified?: string;
}

export type LocationType = 'remote' | 'in-person' | 'hybrid' | 'onsite';
export type FundingType = 'fully-funded' | 'partially-funded' | 'grant-prize' | 'salary-stipend' | 'free';
export type UserStage = 'high-school' | 'undergraduate' | 'graduate' | 'developer' | 'founder' | 'professional' | string;
export type ApplicationStage = 'saved' | 'planning' | 'applied' | 'interview' | 'completed';

export interface ApplicationTrackerItem {
  id: string;
  opportunityId: string;
  stage: ApplicationStage;
  updatedAt: string;
  personalDeadline?: string;
  notes?: string;
  nextStep?: string;
  checklist: { id: string; text: string; done: boolean }[];
}

export interface MatchAnalysis {
  relevanceScore: number;
  whyItMatches: string;
  eligibilityVerdict: 'eligible' | 'verify_criteria' | 'likely_mismatch';
  eligibilityBreakdown: string[];
  missingInformationWarning: string | null;
  recommendedNextStep: string;
}

export type PersonaType = 'student' | 'developer' | 'founder' | 'professional';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  country: string;
  preferredLocations: string[];
  educationLevel: EducationLevel;
  fieldOfStudy: string;
  skills: string[];
  interests: string[];
  careerGoals: string;
  preferredCategories: OpportunityCategory[];
  workArrangementPreference: 'all' | WorkArrangement;
  experienceLevel: ExperienceLevel;
  persona: PersonaType;
  isPublic: boolean;
  notificationPreferences: {
    emailDigest: boolean;
    deadlineAlert7Days: boolean;
    deadlineAlert3Days: boolean;
    deadlineAlert1Day: boolean;
  };
  recommendationPreferences: {
    minimumMatchScore: number;
    includeInternational: boolean;
    includeAfricanOnly: boolean;
  };

  // Compatibility aliases
  name?: string;
  stage?: string;
  nationality?: string;
  preferredFormat?: 'all' | WorkArrangement;
  fundingPreference?: 'all' | 'fully-funded-only' | 'grants-prizes';
  notificationEmail?: string;
  emailAlertsEnabled?: boolean;
  website?: string;
  githubOrPortfolio?: string;
}

export interface SavedOpportunityItem {
  id: string;
  userId: string;
  opportunityId: string;
  notes: string;
  savedAt: string;
}

export interface ApplicationItem {
  id: string;
  userId: string;
  opportunityId: string;
  status: ApplicationStatus;
  appliedAt?: string;
  personalDeadline?: string;
  notes: string;
  nextStep: string;
  updatedAt: string;
  checklist: { id: string; text: string; done: boolean }[];

  // Compatibility alias
  stage?: string;
}

export interface ReminderItem {
  id: string;
  userId: string;
  opportunityId: string;
  title: string;
  reminderDate: string; // YYYY-MM-DD
  daysBefore: 7 | 3 | 1 | 0;
  status: 'pending' | 'triggered' | 'dismissed';
}

export interface IngestionRun {
  id: string;
  source: string;
  startedAt: string;
  completedAt: string;
  status: 'success' | 'warning' | 'failed';
  recordsFound: number;
  recordsPublished: number;
  errorSummary?: string;
}

export interface RecommendationMatch {
  opportunity: Opportunity;
  matchScore: number; // 0 to 100 internal ranking score
  matchLabel: 'Strong Match' | 'Possible Match' | 'Low Match';
  whyItMatches: string;
  alignedSkills: string[];
  alignedInterests: string[];
  eligibilityConditionsToCheck: string[];
  missingInformation: string[];
  suggestedAction: string;
}

export interface IngestionDraft {
  title: string;
  organisation: string;
  category: OpportunityCategory;
  location: string;
  workArrangement: WorkArrangement;
  fundingDetails: string;
  fundingType: 'fully-funded' | 'partially-funded' | 'grant-prize' | 'salary-stipend' | 'free';
  deadline: string;
  sourceUrl: string;
  applicationUrl: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  requiredDocuments: string[];
  requiredSkills: string[];
  verificationStatus: VerificationState;
  isSeededDemonstration: boolean;
  isNigerianOrAfrican: boolean;

  // Compatibility aliases
  organization?: string;
  locationType?: string;
  locationName?: string;
  fundingAmount?: string;
  summary?: string;
  eligibilityCriteria?: string[];
  keyBenefits?: string[];
  requiredMaterials?: string[];
  tags?: string[];
}

export interface AgentThoughtStep {
  step: string;
  status: 'pending' | 'in_progress' | 'done';
  detail?: string;
}

export interface AgentActionPlan {
  id: string;
  query: string;
  status: 'idle' | 'analyzing' | 'scanning' | 'auditing' | 'synthesizing' | 'completed' | 'error';
  thoughtChain: AgentThoughtStep[];
  summary: string;
  matchedOpportunityIds: string[];
  eligibilityVerdict: string;
  recommendedNextSteps: string[];
  suggestedChecklist: { id: string; text: string; done: boolean }[];
  draftDocument?: { title: string; type: string; content: string };
  executedActions: string[];
  createdAt: string;
}
