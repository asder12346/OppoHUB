import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Linkedin,
  Globe,
  Award,
  Target,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { UserProfile, PersonaType, EducationLevel } from '../types';
import { DEMO_PROFILES } from '../data/seedOpportunities';
import { loginWithSupabase, loginWithGoogle, isSupabaseConfigured } from '../services/supabase';

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
  const [step, setStep] = useState<'auth' | 'details'>('auth');

  // Basic auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [persona, setPersona] = useState<PersonaType>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Candidate Details for AI Agent (Name, LinkedIn, University, Ambition, Skills)
  const [candidateName, setCandidateName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [university, setUniversity] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('Undergraduate');
  const [fieldOfStudy, setFieldOfStudy] = useState('Computer Science & Artificial Intelligence');
  const [skills, setSkills] = useState<string[]>(['Python', 'Machine Learning', 'Data Analysis']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [statementOfAmbition, setStatementOfAmbition] = useState(
    'Targeting fully-funded MSc scholarships in AI and top-tier Web3 hackathon grants in 2026 to launch transformative infrastructure.'
  );
  const [achievements, setAchievements] = useState('Top 5% Department Honor, Dean’s Academic Honor Roll, SmartChain Hackathon Finalist');

  // Active authenticated profile being enriched
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  const handleQuickDemoLogin = (p: PersonaType) => {
    const demo = DEMO_PROFILES[p];
    if (demo) {
      onSuccess(demo);
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.error) throw new Error(res.error);

      if (res.profile) {
        // Populate step 2 fields with Google profile
        setPendingProfile(res.profile);
        setCandidateName(res.profile.displayName || res.profile.name || 'Alex Morgan');
        setLinkedinUrl(res.profile.linkedin || 'https://linkedin.com/in/alexmorgan');
        setPortfolioUrl(res.profile.github || res.profile.portfolioUrl || 'https://github.com/alexmorgan');
        setUniversity(res.profile.university || 'University of Lagos / Global Online');
        setCountry(res.profile.country || 'Nigeria');
        setFieldOfStudy(res.profile.fieldOfStudy || 'Computer Science & AI');
        setSkills(res.profile.skills || ['Python', 'Machine Learning']);
        setStatementOfAmbition(res.profile.statementOfAmbition || res.profile.careerGoals || '');
        // Move to details step so user can review and provide exact details
        setStep('details');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsGoogleLoading(false);
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
          onClose();
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
            fieldOfStudy: 'Computer Science & AI',
            skills: ['Problem Solving', 'Research', 'Python'],
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

          setPendingProfile(generatedProfile);
          setCandidateName(generatedProfile.displayName);
          setStep('details');
        }
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
          country,
          preferredLocations: ['Global'],
          educationLevel,
          fieldOfStudy,
          skills: ['Critical Thinking', 'Problem Solving', 'Collaboration'],
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
          nationality: country,
          preferredFormat: 'all',
          bio: `Dedicated ${persona} seeking world-class opportunities.`
        };

        setPendingProfile(newProfile);
        setCandidateName(displayName || username);
        // Smoothly transition to Step 2: Details for AI Agent
        setStep('details');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const clean = newSkillInput.trim();
    if (!skills.includes(clean)) {
      setSkills([...skills, clean]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveDetails = () => {
    const base = pendingProfile || {
      id: 'usr_' + Date.now(),
      username: username || 'user_' + Date.now(),
      displayName: candidateName || 'Candidate',
      email: email || 'user@opportunityradar.org',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      persona,
      stage: 'undergraduate',
      country,
      preferredLocations: ['Global', country],
      educationLevel,
      fieldOfStudy,
      skills,
      interests: ['Global Scholarships', 'Hackathons', 'Tech Innovation'],
      careerGoals: statementOfAmbition,
      preferredCategories: ['scholarship', 'grant', 'hackathon'],
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
      nationality: country,
      preferredFormat: 'all',
      bio: statementOfAmbition
    };

    const enrichedProfile: UserProfile = {
      ...base,
      displayName: candidateName || base.displayName,
      name: candidateName || base.displayName,
      linkedin: linkedinUrl,
      github: portfolioUrl,
      portfolioUrl: portfolioUrl,
      university: university || 'Global Academic / Tech Institute',
      country: country || base.country,
      nationality: country || base.nationality,
      educationLevel,
      fieldOfStudy,
      skills: skills.length > 0 ? skills : base.skills,
      statementOfAmbition: statementOfAmbition || base.careerGoals,
      careerGoals: statementOfAmbition || base.careerGoals,
      achievements: achievements
        ? achievements.split(',').map((a) => a.trim()).filter(Boolean)
        : ['SmartChain Hackathon Finalist', 'Academic Honor List']
    };

    onSuccess(enrichedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Scrollable Container with sleek styling to avoid any cutoff on smaller screens */}
      <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] text-neutral-900 dark:text-neutral-100 p-6 sm:p-8 shadow-2xl transition-all">
        
        {/* Atmospheric ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-36 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* =========================================================================
            STEP 1: AUTHENTICATION (SIGN IN WITH GOOGLE & EMAIL)
            ========================================================================= */}
        {step === 'auth' && (
          <div>
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
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                {mode === 'login'
                  ? 'Access verified grants, tracked milestones, and autonomous AI copilot briefings.'
                  : 'Get discovered by world-class scholarships, hackathons, and seed grants matched to your profile.'}
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Sign in with Google Button */}
            <div className="space-y-4 mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/90 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                ) : (
                  <>
                    {/* Official Multi-colored Google SVG icon */}
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-neutral-200 dark:border-white/[0.08] w-full" />
                <span className="bg-white dark:bg-[#0c0c0e] px-3 text-[11px] font-mono text-neutral-400 uppercase tracking-wider shrink-0">
                  or continue with email
                </span>
                <div className="border-t border-neutral-200 dark:border-white/[0.08] w-full" />
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                      Username <span className="text-indigo-500">*</span>
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
                      Full Name
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
                      Primary Track
                    </label>
                    <select
                      value={persona}
                      onChange={(e) => setPersona(e.target.value as PersonaType)}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 px-3 text-xs text-neutral-900 dark:text-neutral-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="student">Student / Academic Researcher</option>
                      <option value="developer">Developer / Web3 Builder</option>
                      <option value="founder">Entrepreneur / Startup Founder</option>
                      <option value="professional">Mid-Career Professional</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                  Email Address <span className="text-indigo-500">*</span>
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
                  Password <span className="text-indigo-500">*</span>
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
                    <span>{mode === 'login' ? 'Sign In to Account' : 'Continue to Personal Details'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-white/[0.06]">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mb-2.5">
                <span>1-CLICK DEMO ACCOUNTS</span>
                <span className="text-emerald-500 flex items-center gap-1 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Instant
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
                Want guided wizard? Launch 5-Step Onboarding →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: ENRICH CANDIDATE DETAILS FOR AI AGENT
            (Name, LinkedIn, University, Skills, Ambition)
            ========================================================================= */}
        {step === 'details' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('auth')}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>AI AGENT COPILOT PROFILE</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                Tell Us About Yourself
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Your AI agent uses your LinkedIn, university, and core ambition to verify eligibility, draft tailored personal statements, and answer queries with precision.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1">
                  Full Legal / Candidate Name <span className="text-indigo-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-9 pr-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* LinkedIn & Portfolio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-500" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/alexmorgan"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-9 pr-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1">
                    GitHub or Portfolio URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://github.com/alexmorgan"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-9 pr-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* University & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1">
                    University / Current Institution
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="e.g. University of Lagos, Imperial College"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-9 pr-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1">
                    Country / Nationality (for eligibility)
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Nigeria, Kenya, United Kingdom, USA"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 px-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Education Stage & Field of Study */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1">
                    Education Stage
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 px-3 text-xs text-neutral-900 dark:text-neutral-100 focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    <option value="Undergraduate">Undergraduate Student</option>
                    <option value="Graduate / Master">Master’s / Graduate</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                    <option value="Early-Career">Early Career Professional</option>
                    <option value="High School">High School Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1">
                    Field of Study / Focus
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science, AI, Biotech"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 px-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Core Skills */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Core Skills & Badges (used for match scoring)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-indigo-900 dark:hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add skill (e.g. Solidity, Research Writing, PyTorch)..."
                    className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2 px-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Statement of Ambition */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300">
                    Statement of Ambition / What are you aiming to win?
                  </label>
                  <span className="text-[10px] text-indigo-500 font-mono">Used for AI personal statement</span>
                </div>
                <textarea
                  rows={3}
                  value={statementOfAmbition}
                  onChange={(e) => setStatementOfAmbition(e.target.value)}
                  placeholder="Describe your 2026 targets (e.g. Master's scholarships in Europe, $50k seed funding, or Web3 hackathons)..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 p-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Notable Achievements */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mb-1">
                  Notable Achievements / Awards / Publications (comma-separated)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-500" />
                  <input
                    type="text"
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="e.g. 1st Place Hackathon, 3.8/4.0 GPA, Published Research Paper"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 py-2.5 pl-9 pr-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-neutral-100 dark:border-white/[0.08] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveDetails}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={handleSaveDetails}
                className="py-2.5 px-6 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold shadow-xs transition-all flex items-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-600" />
                <span>Save & Launch AI Copilot</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
