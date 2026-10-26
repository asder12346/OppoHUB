import { UserProfile } from '../types';

export interface ProfileCompletionDimension {
  id: 'linkedin' | 'education' | 'interests' | 'ambition' | 'skills';
  label: string;
  isFilled: boolean;
  weight: number;
  description: string;
  fieldId: string;
}

export interface ProfileCompletionResult {
  percentage: number;
  dimensions: ProfileCompletionDimension[];
  completedCount: number;
  totalCount: number;
  summaryMessage: string;
  isOptimal: boolean;
}

/**
 * Calculates real-time profile completion and AI match readiness score.
 * Emphasizes LinkedIn, Education, and Interests as requested.
 */
export function calculateProfileCompletion(profile: UserProfile): ProfileCompletionResult {
  const hasLinkedIn = Boolean(
    profile.linkedin &&
    profile.linkedin.trim().length > 6 &&
    profile.linkedin.includes('linkedin.com')
  );

  const hasEducation = Boolean(
    (profile.university && profile.university.trim().length > 0) ||
    (profile.fieldOfStudy && profile.fieldOfStudy.trim().length > 0) ||
    (profile.educationLevel && profile.educationLevel.trim().length > 0)
  );

  const hasInterests = Boolean(profile.interests && profile.interests.length > 0);

  const hasAmbition = Boolean(
    (profile.statementOfAmbition && profile.statementOfAmbition.trim().length > 0) ||
    (profile.careerGoals && profile.careerGoals.trim().length > 0) ||
    (profile.bio && profile.bio.trim().length > 0)
  );

  const hasSkills = Boolean(profile.skills && profile.skills.length > 0);

  // Dimension weights strictly emphasize LinkedIn, Education, and Interests
  const dimensions: ProfileCompletionDimension[] = [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      isFilled: hasLinkedIn,
      weight: 25,
      description: 'Verifies track record and credentials',
      fieldId: 'field-linkedin'
    },
    {
      id: 'education',
      label: 'Education',
      isFilled: hasEducation,
      weight: 25,
      description: 'Used for degree, university and GPA requirements',
      fieldId: 'field-education'
    },
    {
      id: 'interests',
      label: 'Interests',
      isFilled: hasInterests,
      weight: 20,
      description: 'Determines opportunity recommendation categories',
      fieldId: 'field-interests'
    },
    {
      id: 'ambition',
      label: 'Ambition & Goals',
      isFilled: hasAmbition,
      weight: 15,
      description: 'Powers custom Statement of Ambition drafting',
      fieldId: 'field-ambition'
    },
    {
      id: 'skills',
      label: 'Skills',
      isFilled: hasSkills,
      weight: 15,
      description: 'Matches technical bounties and project needs',
      fieldId: 'field-skills'
    }
  ];

  const earnedWeight = dimensions.reduce((acc, d) => acc + (d.isFilled ? d.weight : 0), 0);
  const percentage = Math.min(100, Math.round(earnedWeight));
  const completedCount = dimensions.filter((d) => d.isFilled).length;

  let summaryMessage = 'Basic Profile: Add LinkedIn, Education & Interests to boost your AI match accuracy.';
  if (percentage >= 100) {
    summaryMessage = 'All-Star Profile! The AI Agent has full context to discover, verify, and draft applications with maximum precision.';
  } else if (percentage >= 80) {
    summaryMessage = 'High AI Match Precision: Just a few more details to achieve optimal autonomous discovery.';
  } else if (percentage >= 50) {
    summaryMessage = 'Good Progress: Complete LinkedIn, Education, or Interests for +40% more tailored opportunity matches.';
  }

  return {
    percentage,
    dimensions,
    completedCount,
    totalCount: dimensions.length,
    summaryMessage,
    isOptimal: percentage >= 85
  };
}
