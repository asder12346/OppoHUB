import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, ApplicationTrackerItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Local persistent simulated Auth Session storage key
const SIMULATED_AUTH_KEY = 'opportunityradar_auth_session_v1';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  profile: UserProfile;
}

export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SIMULATED_AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse auth session', err);
  }
  return null;
}

export function setStoredAuthSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(SIMULATED_AUTH_KEY);
  } else {
    localStorage.setItem(SIMULATED_AUTH_KEY, JSON.stringify(session));
  }
}

/**
 * Register a new user with Supabase (or simulated fallback)
 */
export async function registerWithSupabase(
  email: string,
  password: string,
  profileData: Omit<UserProfile, 'id' | 'email'>
): Promise<{ user: any; profile: UserProfile; error?: string }> {
  const userId = 'usr_' + Date.now();
  const profile: UserProfile = {
    ...profileData,
    id: userId,
    email,
    notificationEmail: email
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: profile.username,
            name: profile.name,
            persona: profile.persona,
            stage: profile.stage,
            country: profile.country
          }
        }
      });

      if (error) {
        return { user: null, profile, error: error.message };
      }

      const realUserId = data.user?.id || userId;
      const finalProfile = { ...profile, id: realUserId };

      // Upsert profile in Supabase 'profiles' table
      await supabase.from('profiles').upsert({
        id: realUserId,
        email,
        username: finalProfile.username,
        name: finalProfile.name,
        avatar: finalProfile.avatar,
        bio: finalProfile.bio,
        persona: finalProfile.persona,
        stage: finalProfile.stage,
        country: finalProfile.country,
        nationality: finalProfile.nationality,
        interests: finalProfile.interests,
        skills: finalProfile.skills,
        preferred_categories: finalProfile.preferredCategories,
        is_public: finalProfile.isPublic,
        created_at: new Date().toISOString()
      });

      setStoredAuthSession({
        user: { id: realUserId, email, created_at: new Date().toISOString() },
        profile: finalProfile
      });

      return { user: data.user, profile: finalProfile };
    } catch (err: any) {
      console.warn('Supabase real signup error, using simulated session fallback:', err);
    }
  }

  // Graceful simulated session (instant signup for prototype/demo)
  const session: AuthSession = {
    user: { id: userId, email, created_at: new Date().toISOString() },
    profile
  };
  setStoredAuthSession(session);
  return { user: session.user, profile };
}

/**
 * Sign in user with Supabase (or simulated fallback)
 */
export async function loginWithSupabase(
  email: string,
  password: string
): Promise<{ user: any; profile?: UserProfile; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Fetch user profile from Supabase
      const { data: profileRecord } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      let profile: UserProfile | undefined;
      if (profileRecord) {
        profile = {
          id: profileRecord.id,
          username: profileRecord.username || email.split('@')[0],
          displayName: profileRecord.display_name || profileRecord.name || email.split('@')[0],
          name: profileRecord.name || email.split('@')[0],
          email: profileRecord.email,
          avatar: profileRecord.avatar || '',
          bio: profileRecord.bio || '',
          persona: profileRecord.persona || 'student',
          stage: profileRecord.stage || 'undergraduate',
          country: profileRecord.country || 'Global',
          preferredLocations: profileRecord.preferred_locations || [profileRecord.country || 'Global'],
          educationLevel: profileRecord.education_level || 'Undergraduate',
          fieldOfStudy: profileRecord.field_of_study || 'General Studies',
          nationality: profileRecord.nationality || 'Global',
          interests: profileRecord.interests || [],
          skills: profileRecord.skills || [],
          careerGoals: profileRecord.career_goals || 'Explore scholarships and opportunities',
          preferredCategories: profileRecord.preferred_categories || ['scholarship', 'hackathon'],
          workArrangementPreference: profileRecord.work_arrangement || 'all',
          experienceLevel: profileRecord.experience_level || 'student',
          preferredFormat: 'all',
          fundingPreference: 'all',
          notificationEmail: email,
          emailAlertsEnabled: true,
          isPublic: profileRecord.is_public ?? true,
          notificationPreferences: {
            emailDigest: true,
            deadlineAlert7Days: true,
            deadlineAlert3Days: true,
            deadlineAlert1Day: true
          },
          recommendationPreferences: {
            minimumMatchScore: 60,
            includeInternational: true,
            includeAfricanOnly: false
          }
        };
      }

      return { user: data.user, profile };
    } catch (err: any) {
      console.warn('Supabase sign-in error:', err);
    }
  }

  // Fallback demo simulation
  const existing = getStoredAuthSession();
  if (existing && existing.user.email.toLowerCase() === email.toLowerCase()) {
    return { user: existing.user, profile: existing.profile };
  }

  // Create temporary session if not found
  const tempUser = { id: 'usr_' + Date.now(), email, created_at: new Date().toISOString() };
  return { user: tempUser };
}

/**
 * Sign out
 */
export async function logoutSupabase(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error', e);
    }
  }
  setStoredAuthSession(null);
}
