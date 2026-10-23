import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { UserProfile, PersonaType } from '../types';
import { DEMO_PROFILES } from '../data/seedOpportunities';
import { loginWithSupabase, isSupabaseConfigured } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  onLaunchFullOnboarding: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
  onLaunchFullOnboarding
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [persona, setPersona] = useState<PersonaType>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickDemoLogin = (p: PersonaType) => {
    const demo = DEMO_PROFILES[p];
    if (demo) {
      onSuccess(demo);
      onClose();
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter both email and password.');
        }

        if (isSupabaseConfigured) {
          const res = await loginWithSupabase(email, password);
          if (res.error) throw new Error(res.error);
        }

        // Match against existing demo profile or create session
        const matchingDemo = Object.values(DEMO_PROFILES).find(
          (p) => p.email?.toLowerCase() === email.toLowerCase() || p.username.toLowerCase() === email.toLowerCase()
        );

        if (matchingDemo) {
          onSuccess(matchingDemo);
        } else {
          const generatedProfile: UserProfile = {
            id: 'usr_' + Date.now(),
            username: email.split('@')[0] || 'member',
            displayName: email.split('@')[0] || 'Opportunity Seeker',
            email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            persona: 'student',
            stage: 'undergraduate',
            country: 'Global',
            preferredLocations: ['Global'],
            educationLevel: 'Undergraduate',
            fieldOfStudy: 'General Studies',
            skills: ['Problem Solving', 'Research'],
            interests: ['Education', 'Tech Innovation'],
            careerGoals: 'Discover and win world-class opportunities.',
            preferredCategories: ['scholarship', 'hackathon', 'grant'],
            workArrangementPreference: 'all',
            experienceLevel: 'entry',
            isPublic: true,
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
            },
            nationality: 'International',
            preferredFormat: 'all',
            bio: 'Member of OpportunityRadar exploring world-class scholarships, grants, and technical programs.'
          };
          onSuccess(generatedProfile);
        }

        onClose();
      } else {
        // Sign Up Mode
        if (!email.trim() || !password.trim() || !username.trim()) {
          throw new Error('Please fill in username, email, and password.');
        }

        const newProfile: UserProfile = {
          id: 'usr_' + Date.now(),
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          displayName: displayName || username,
          email,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          persona,
          stage: persona === 'student' ? 'undergraduate' : persona === 'developer' ? 'developer' : persona === 'founder' ? 'founder' : 'professional',
          country: 'Global',
          preferredLocations: ['Global'],
          educationLevel: persona === 'student' ? 'Undergraduate' : 'Graduate / Master',
          fieldOfStudy: 'Computer Science & Technology',
          skills: ['Critical Thinking', 'Collaboration'],
          interests: ['Global Opportunities', 'Career Growth'],
          careerGoals: `Excel as a high-impact ${persona} on the global stage.`,
          preferredCategories: persona === 'student' ? ['scholarship', 'fellowship'] : persona === 'developer' ? ['hackathon', 'grant'] : ['grant', 'accelerator'],
          workArrangementPreference: 'all',
          experienceLevel: persona === 'student' ? 'entry' : 'intermediate',
          isPublic: true,
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
          },
          nationality: 'International',
          preferredFormat: 'all',
          bio: `Excited ${persona} seeking high-impact opportunities on OpportunityRadar.`
        };

        onSuccess(newProfile);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] text-neutral-900 dark:text-neutral-100 p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Subtle glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Mode Selector Header */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-white/[0.05] rounded-xl mb-6 max-w-xs mx-auto border border-neutral-200/60 dark:border-white/[0.06]">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
              mode === 'login'
                ? 'bg-white dark:bg-white dark:text-black text-neutral-950 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
              mode === 'signup'
                ? 'bg-white dark:bg-white dark:text-black text-neutral-950 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-black font-mono text-xs font-black shadow-xs mb-3">
            OR
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
            {mode === 'login' ? 'Welcome back to OpportunityRadar' : 'Create your OpportunityRadar account'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {mode === 'login'
              ? 'Access saved opportunities, custom checklists, and agent recommendations.'
              : 'Discover grants, scholarships, and hackathons tailored to your ambitions.'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alexmorgan"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-8 pr-3 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                  Primary Focus
                </label>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value as PersonaType)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 px-3 text-xs text-neutral-900 dark:text-neutral-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="student">Student / Academic Researcher</option>
                  <option value="developer">Developer / Tech Builder</option>
                  <option value="founder">Entrepreneur / Startup Founder</option>
                  <option value="professional">Mid-Career Professional</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : 'Create Free Account'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mb-2.5">
            <span>QUICK DEMO ACCOUNTS</span>
            <span className="text-emerald-500 flex items-center gap-1 font-sans">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 1-Click
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleQuickDemoLogin('student')}
              className="text-left p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-white/[0.06] transition-colors"
            >
              <div className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">Amina Bello</div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Student Scholar</div>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('developer')}
              className="text-left p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-white/[0.06] transition-colors"
            >
              <div className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">Carlos Silva</div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Full-Stack & Web3</div>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('founder')}
              className="text-left p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-white/[0.06] transition-colors"
            >
              <div className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">Elena Rostova</div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Founder & CEO</div>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('professional')}
              className="text-left p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-white/[0.06] transition-colors"
            >
              <div className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">David Chen</div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400">AI Fellow / Lead</div>
            </button>
          </div>
        </div>

        {/* Deep Onboarding Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              onClose();
              onLaunchFullOnboarding();
            }}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Want guided personalization? Launch 5-Step Onboarding →
          </button>
        </div>

      </div>
    </div>
  );
};
