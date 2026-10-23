import {
  ApplicationItem,
  Opportunity,
  UserProfile,
  SavedOpportunityItem,
  ReminderItem,
  IngestionRun,
  ApplicationTrackerItem
} from '../types';
import { DEMO_PROFILES, SEED_OPPORTUNITIES, SEED_COMMUNITY_PROFILES } from '../data/seedOpportunities';

const STORAGE_KEYS = {
  PROFILE: 'opportunityradar_profile_v2',
  SAVED_ITEMS: 'opportunityradar_saved_items_v2',
  APPLICATIONS: 'opportunityradar_applications_v2',
  REMINDERS: 'opportunityradar_reminders_v2',
  CUSTOM_OPPS: 'opportunityradar_custom_opps_v2',
  INGESTION_RUNS: 'opportunityradar_ingestion_runs_v2',
  COMMUNITY_PROFILES: 'opportunityradar_community_profiles_v2',
  SETTINGS: 'opportunityradar_settings_v2'
};

export function loadStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEMO_PROFILES.student;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return DEMO_PROFILES.student;
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

// Initial Saved Opportunities
const DEFAULT_SAVED_ITEMS: SavedOpportunityItem[] = [
  {
    id: 'saved-1',
    userId: 'profile-student-amina',
    opportunityId: 'opp-mtn-stem-2026',
    notes: 'Priority Nigerian STEM scholarship. Verify matriculation number before submission.',
    savedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'saved-2',
    userId: 'profile-student-amina',
    opportunityId: 'opp-tef-2027',
    notes: 'Non-refundable seed grant. Need to refine cash flow projections.',
    savedAt: '2026-10-02T14:30:00Z'
  },
  {
    id: 'saved-3',
    userId: 'profile-student-amina',
    opportunityId: 'opp-mc-foundation-2027',
    notes: 'Targeting Edinburgh or McGill partner tracks. Requesting transcript.',
    savedAt: '2026-10-05T09:15:00Z'
  }
];

export function loadStoredSavedItems(): SavedOpportunityItem[] {
  if (typeof window === 'undefined') return DEFAULT_SAVED_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved items', e);
  }
  return DEFAULT_SAVED_ITEMS;
}

export function saveStoredSavedItems(items: SavedOpportunityItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save saved items', e);
  }
}

// Initial Applications Tracker
const DEFAULT_INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-1',
    userId: 'profile-student-amina',
    opportunityId: 'opp-smartchain-africa-2026',
    status: 'Planning to Apply',
    appliedAt: undefined,
    personalDeadline: '2026-11-10',
    notes: 'Building prototype with 2 frontend peers. Need to record Loom video demo.',
    nextStep: 'Finalize GitHub code review and submit registration form.',
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: 'c1', text: 'Define project scope & smart contract logic', done: true },
      { id: 'c2', text: 'Create GitHub repository with README', done: true },
      { id: 'c3', text: 'Record 3-minute video walkthrough', done: false },
      { id: 'c4', text: 'Submit official portal link', done: false }
    ]
  },
  {
    id: 'app-2',
    userId: 'profile-student-amina',
    opportunityId: 'opp-rhodes-oxford-2027',
    status: 'Applied',
    appliedAt: '2026-10-05',
    personalDeadline: '2026-10-25',
    notes: 'West Africa constituency application submitted. Interview shortlist expected in late November.',
    nextStep: 'Prepare for academic panel interview and leadership review.',
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: 'c2-1', text: 'Obtain university official endorsement', done: true },
      { id: 'c2-2', text: 'Secure six recommendation letters', done: true },
      { id: 'c2-3', text: 'Submit 750-word personal statement', done: true }
    ]
  },
  {
    id: 'app-3',
    userId: 'profile-student-amina',
    opportunityId: 'opp-thiel-fellowship-2026',
    status: 'Interview or Follow-up',
    appliedAt: '2026-09-20',
    personalDeadline: '2026-12-15',
    notes: 'Completed initial review. First screening video call with foundation associate scheduled.',
    nextStep: 'Prepare technical demo of hardware prototype.',
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: 'c3-1', text: 'Submit project traction and vision pitch', done: true },
      { id: 'c3-2', text: 'Initial video screening with director', done: true },
      { id: 'c3-3', text: 'Technical architecture deep-dive', done: false }
    ]
  },
  {
    id: 'app-4',
    userId: 'profile-student-amina',
    opportunityId: 'opp-mtn-stem-2026',
    status: 'Saved',
    appliedAt: undefined,
    personalDeadline: '2026-11-18',
    notes: 'Waiting for semester stamped CGPA confirmation from faculty officer.',
    nextStep: 'Collect stamped transcript from department registry.',
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: 'c4-1', text: 'Verify 3.5 CGPA threshold with exams officer', done: true },
      { id: 'c4-2', text: 'Fill online MTN Foundation form', done: false }
    ]
  }
];

export function loadStoredApplications(): ApplicationItem[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load applications', e);
  }
  return DEFAULT_INITIAL_APPLICATIONS;
}

export function saveStoredApplications(items: ApplicationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save applications', e);
  }
}

// Initial Application Tracker Items
const DEFAULT_INITIAL_TRACKER: ApplicationTrackerItem[] = [
  {
    id: 'track-1',
    opportunityId: 'opp-smartchain-africa-2026',
    stage: 'planning',
    updatedAt: new Date().toISOString(),
    personalDeadline: '2026-11-10',
    notes: 'Building prototype with team. Need to record Loom video demo.',
    checklist: [
      { id: 'c1', text: 'Define project scope & smart contract logic', done: true },
      { id: 'c2', text: 'Create GitHub repository with README', done: true },
      { id: 'c3', text: 'Record 3-minute video walkthrough', done: false },
      { id: 'c4', text: 'Submit official portal link', done: false }
    ]
  },
  {
    id: 'track-2',
    opportunityId: 'opp-mtn-stem-2026',
    stage: 'saved',
    updatedAt: new Date().toISOString(),
    personalDeadline: '2026-11-18',
    notes: 'Verify stamped transcript before final submission.',
    checklist: [
      { id: 'c2-1', text: 'Verify 3.5 CGPA threshold with exams officer', done: true },
      { id: 'c2-2', text: 'Fill online MTN Foundation form', done: false }
    ]
  },
  {
    id: 'track-3',
    opportunityId: 'opp-rhodes-oxford-2027',
    stage: 'applied',
    updatedAt: new Date().toISOString(),
    personalDeadline: '2026-10-25',
    notes: 'West Africa constituency application submitted.',
    checklist: [
      { id: 'c3-1', text: 'Obtain university official endorsement', done: true },
      { id: 'c3-2', text: 'Secure recommendation letters', done: true },
      { id: 'c3-3', text: 'Submit personal statement', done: true }
    ]
  }
];

export function loadStoredTracker(): ApplicationTrackerItem[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_TRACKER;
  try {
    const raw = localStorage.getItem('opportunityradar_tracker_v2');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tracker', e);
  }
  return DEFAULT_INITIAL_TRACKER;
}

export function saveStoredTracker(items: ApplicationTrackerItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('opportunityradar_tracker_v2', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save tracker', e);
  }
}

// Reminders
const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    userId: 'profile-student-amina',
    opportunityId: 'opp-rhodes-oxford-2027',
    title: 'Rhodes Oxford Final Submissions Deadline',
    reminderDate: '2026-10-21',
    daysBefore: 7,
    status: 'pending'
  },
  {
    id: 'rem-2',
    userId: 'profile-student-amina',
    opportunityId: 'opp-smartchain-africa-2026',
    title: 'SmartChain Hackathon Submission Cutoff (48h Warning)',
    reminderDate: '2026-11-13',
    daysBefore: 3,
    status: 'pending'
  },
  {
    id: 'rem-3',
    userId: 'profile-student-amina',
    opportunityId: 'opp-mtn-stem-2026',
    title: 'MTN Foundation Transcript Upload Reminder',
    reminderDate: '2026-11-19',
    daysBefore: 1,
    status: 'pending'
  }
];

export function loadStoredReminders(): ReminderItem[] {
  if (typeof window === 'undefined') return DEFAULT_REMINDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load reminders', e);
  }
  return DEFAULT_REMINDERS;
}

export function saveStoredReminders(items: ReminderItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save reminders', e);
  }
}

// Ingestion Runs
const DEFAULT_INGESTION_RUNS: IngestionRun[] = [
  {
    id: 'ingest-run-1',
    source: 'National Universities Commission & Federal Bursary Feed',
    startedAt: '2026-10-12T08:00:00Z',
    completedAt: '2026-10-12T08:02:14Z',
    status: 'success',
    recordsFound: 8,
    recordsPublished: 6
  },
  {
    id: 'ingest-run-2',
    source: 'African Development Bank Youth Innovation API',
    startedAt: '2026-10-10T12:00:00Z',
    completedAt: '2026-10-10T12:01:45Z',
    status: 'success',
    recordsFound: 3,
    recordsPublished: 2
  },
  {
    id: 'ingest-run-3',
    source: 'International Fellowship & Research Consortia',
    startedAt: '2026-10-08T15:30:00Z',
    completedAt: '2026-10-08T15:34:02Z',
    status: 'warning',
    recordsFound: 14,
    recordsPublished: 11,
    errorSummary: '3 records flagged with missing canonical deadline. Held for administrator audit.'
  }
];

export function loadStoredIngestionRuns(): IngestionRun[] {
  if (typeof window === 'undefined') return DEFAULT_INGESTION_RUNS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INGESTION_RUNS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load ingestion runs', e);
  }
  return DEFAULT_INGESTION_RUNS;
}

export function saveStoredIngestionRuns(runs: IngestionRun[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.INGESTION_RUNS, JSON.stringify(runs));
  } catch (e) {
    console.error('Failed to save ingestion runs', e);
  }
}

// Custom Opportunities
export function loadCustomOpportunities(): Opportunity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_OPPS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom opportunities', e);
  }
  return [];
}

export function saveCustomOpportunities(opps: Opportunity[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_OPPS, JSON.stringify(opps));
  } catch (e) {
    console.error('Failed to save custom opportunities', e);
  }
}

export function getAllOpportunities(): Opportunity[] {
  const custom = loadCustomOpportunities();
  return [...custom, ...SEED_OPPORTUNITIES];
}

export function loadCommunityProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return SEED_COMMUNITY_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_PROFILES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load community profiles', e);
  }
  return SEED_COMMUNITY_PROFILES;
}

export function saveCommunityProfiles(profiles: UserProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save community profiles', e);
  }
}
