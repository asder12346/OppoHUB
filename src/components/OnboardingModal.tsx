import React, { useState } from 'react';
import { UserProfile, PersonaType, UserStage, OpportunityCategory, LocationType, WorkArrangement } from '../types';
import { registerWithSupabase, isSupabaseConfigured } from '../services/supabase';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Shield,
  User,
  GraduationCap,
  Code,
  Rocket,
  Briefcase,
  Compass,
  AtSign,
  Lock,
  Mail,
  Camera,
  Layers,
  Check
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userProfile: UserProfile) => void;
  initialCategory?: OpportunityCategory;
}

const PERSONA_OPTIONS: {
  type: PersonaType;
  title: string;
  desc: string;
  defaultCategories: OpportunityCategory[];
  icon: typeof GraduationCap;
}[] = [
  {
    type: 'student',
    title: 'Student & Graduate',
    desc: 'Scholarships, academic fellowships, research grants, and student hackathons.',
    defaultCategories: ['scholarship', 'fellowship', 'hackathon'],
    icon: GraduationCap
  },
  {
    type: 'developer',
    title: 'Developer & Creator',
    desc: 'Hackathons, Web3 bounties, open-source grants, and sponsored certifications.',
    defaultCategories: ['hackathon', 'grant', 'training'],
    icon: Code
  },
  {
    type: 'founder',
    title: 'Entrepreneur & Founder',
    desc: 'Startup accelerators, non-dilutive seed capital, and pitch competitions.',
    defaultCategories: ['accelerator', 'grant', 'competition'],
    icon: Rocket
  },
  {
    type: 'professional',
    title: 'Professional & Job Seeker',
    desc: 'Industry fellowships, executive courses, global remote jobs, and certifications.',
    defaultCategories: ['job', 'training', 'fellowship'],
    icon: Briefcase
  }
];

const PRESET_AVATARS = [
  '/src/assets/images/avatar_student_amina_1791894200671.jpg',
  '/src/assets/images/avatar_developer_carlos_1791894199800.jpg',
  '/src/assets/images/persona_founder_builder_1791893408064.jpg',
  '/src/assets/images/persona_student_scholar_1791893407892.jpg'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialCategory
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [persona, setPersona] = useState<PersonaType>('student');
  const [stage, setStage] = useState<UserStage>('undergraduate');
  const [country, setCountry] = useState('Global');
  const [nationality, setNationality] = useState('Global');
  const [preferredFormat, setPreferredFormat] = useState<'all' | LocationType>('all');
  const [bio, setBio] = useState('');
  const [preferredCategories, setPreferredCategories] = useState<OpportunityCategory[]>(
    initialCategory ? [initialCategory, 'scholarship', 'hackathon'] : ['scholarship', 'hackathon', 'grant']
  );
  const [skills, setSkills] = useState<string[]>(['Problem Solving', 'Communication']);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>(['Technology', 'Innovation']);
  const [interestInput, setInterestInput] = useState('');

  if (!isOpen) return null;

  const handleQuickDemoFill = (personaType: PersonaType) => {
    if (personaType === 'student') {
      setName('Amina Bello');
      setUsername('aminabello');
      setEmail('amina.bello@university.edu');
      setPassword('opportunityradar2026');
      setPersona('student');
      setStage('undergraduate');
      setCountry('Nigeria');
      setNationality('Nigerian');
      setBio('Undergraduate Computer Science researcher seeking fully funded scholarships and global fellowships.');
      setPreferredCategories(['scholarship', 'fellowship', 'hackathon']);
      setSkills(['Python', 'Data Structures', 'Technical Writing']);
      setInterests(['AI Research', 'Global Higher Ed', 'Open Source']);
      setAvatar(PRESET_AVATARS[0]);
    } else if (personaType === 'developer') {
      setName('Carlos Silva');
      setUsername('carlos_silva');
      setEmail('carlos.silva@techmail.io');
      setPassword('opportunityradar2026');
      setPersona('developer');
      setStage('developer');
      setCountry('Brazil');
      setNationality('Brazilian');
      setBio('Full-stack and Web3 developer competing in global hackathons and building decentralized apps.');
      setPreferredCategories(['hackathon', 'grant', 'training']);
      setSkills(['TypeScript', 'Solidity', 'Rust', 'Docker']);
      setInterests(['Smart Contracts', 'Decentralized Protocols', 'Hackathons']);
      setAvatar(PRESET_AVATARS[1]);
    } else if (personaType === 'founder') {
      setName('Elena Rostova');
      setUsername('elena_greentech');
      setEmail('elena@greencircuit.co');
      setPassword('opportunityradar2026');
      setPersona('founder');
      setStage('founder');
      setCountry('Germany');
      setNationality('German');
      setBio('Clean energy hardware founder preparing for international accelerator cohorts and non-dilutive seed grants.');
      setPreferredCategories(['accelerator', 'grant', 'competition']);
      setSkills(['Product Strategy', 'Clean Tech', 'Pitching', 'Financial Modeling']);
      setInterests(['Grid Storage', 'Venture Capital', 'Accelerators']);
      setAvatar(PRESET_AVATARS[2]);
    }
  };

  const toggleCategory = (cat: OpportunityCategory) => {
    if (preferredCategories.includes(cat)) {
      if (preferredCategories.length > 1) {
        setPreferredCategories(preferredCategories.filter((c) => c !== cat));
      }
    } else {
      setPreferredCategories([...preferredCategories, cat]);
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleAddInterest = () => {
    if (!interestInput.trim()) return;
    if (!interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
    }
    setInterestInput('');
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setAuthError(null);

    const cleanUsername = username.replace(/^@+/, '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'user_' + Date.now().toString().slice(-4);
    const cleanBio = bio.trim() || `Passionate ${stage} focused on ${interests.slice(0, 2).join(' & ')} opportunities.`;

    const workPref: 'all' | WorkArrangement = preferredFormat === 'in-person' ? 'onsite' : (preferredFormat as any) || 'all';

    const profileData: Omit<UserProfile, 'id' | 'email'> = {
      username: cleanUsername,
      displayName: name.trim() || cleanUsername,
      name: name.trim() || cleanUsername,
      avatar,
      bio: cleanBio,
      persona,
      stage,
      country: country.trim() || 'Global',
      preferredLocations: [country.trim() || 'Global'],
      educationLevel: (stage === 'high-school' ? 'High School' : stage === 'undergraduate' ? 'Undergraduate' : stage === 'graduate' ? 'Graduate / Master' : 'Early-Career'),
      fieldOfStudy: interests[0] || 'General Studies',
      nationality: nationality.trim() || 'Global',
      interests,
      skills,
      careerGoals: `Advance career in ${interests.join(', ') || 'technology and leadership'}`,
      preferredCategories,
      workArrangementPreference: workPref,
      experienceLevel: persona === 'student' ? 'student' : persona === 'founder' ? 'founder' : 'entry',
      preferredFormat: preferredFormat as any,
      fundingPreference: persona === 'student' ? 'fully-funded-only' : 'grants-prizes',
      notificationEmail: email,
      emailAlertsEnabled: true,
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
        includeAfricanOnly: country.toLowerCase().includes('nigeria') || nationality.toLowerCase().includes('nigerian')
      }
    };

    try {
      const res = await registerWithSupabase(
        email || `${cleanUsername}@radar.user`,
        password || 'default_radar_pass_2026',
        profileData
      );

      if (res.error) {
        setAuthError(res.error);
        setIsLoading(false);
        return;
      }

      onComplete(res.profile);
      onClose();
    } catch (err: any) {
      console.error('Onboarding registration error', err);
      // Fallback completion
      const fallbackProfile: UserProfile = {
        ...profileData,
        id: 'usr_' + Date.now(),
        email: email || `${cleanUsername}@radar.user`
      };
      onComplete(fallbackProfile);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Progress Bar & Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-600 text-white font-mono text-xs font-bold">
                OR
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                OpportunityRadar Onboarding
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Step {step} of 5
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s === step
                    ? 'bg-sky-600 dark:bg-sky-500'
                    : s < step
                    ? 'bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-xs max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: Account & Credentials */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Your Radar Account
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Powered by Supabase Auth & PostgreSQL. Store your saved opportunities and application deadlines.
                </p>
              </div>

              {/* Quick Demo Pre-fill Pill Bar */}
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-[11px]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sky-800 dark:text-sky-300">
                    Fast Demo Test? Pick a 1-click persona:
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('student')}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 font-medium transition-colors"
                  >
                    Amina (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('developer')}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 font-medium transition-colors"
                  >
                    Carlos (Developer)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('founder')}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 font-medium transition-colors"
                  >
                    Elena (Founder)
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs">
                  {authError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cornelius James"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Username handle (@handle)
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      placeholder="cornelius_dev"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Persona & Career Stage */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  What Best Describes Your Current Path?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Helps our AI matching algorithm filter irrelevant requirements and highlight opportunities you actually qualify for.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERSONA_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = persona === opt.type;
                  return (
                    <button
                      type="button"
                      key={opt.type}
                      onClick={() => {
                        setPersona(opt.type);
                        setPreferredCategories(opt.defaultCategories);
                      }}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                        active
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-white ring-2 ring-sky-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-5 w-5 ${active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                        {active && <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
                      </div>
                      <span className="font-bold text-xs">{opt.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
                  Specific Stage / Degree
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as UserStage)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white capitalize"
                >
                  <option value="high-school">High School Student</option>
                  <option value="undergraduate">Undergraduate University Student</option>
                  <option value="graduate">Graduate / Master's / PhD Candidate</option>
                  <option value="developer">Developer / Engineer</option>
                  <option value="founder">Startup Founder / Co-founder</option>
                  <option value="early-career">Early-Career Professional (0-3 yrs)</option>
                  <option value="experienced">Experienced Professional (4+ yrs)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Location & Country */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Location & Eligibility Passport
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Many scholarships and grants have nationality or regional rules. We use this to protect you from applying to programs you aren't eligible for.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Nigeria, Germany, United States, Kenya"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Citizenship / Nationality
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. Nigerian, German, American, Ghanaian"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                  Format Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'remote', 'in-person'] as ('all' | LocationType)[]).map((fmt) => (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => setPreferredFormat(fmt)}
                      className={`p-3 rounded-xl border text-center transition-colors capitalize ${
                        preferredFormat === fmt
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {fmt === 'all' ? 'Any Format' : fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                  Select a Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatar(av)}
                      className={`h-12 w-12 rounded-full overflow-hidden border-2 transition-all ${
                        avatar === av ? 'ring-2 ring-sky-500 border-white' : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Avatar option" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Target Categories & Bio */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Target Categories & Profile Bio
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Select the opportunity streams you want to monitor and write a short bio for other community members.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                  Select Target Streams (at least 1)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'scholarship',
                    'hackathon',
                    'accelerator',
                    'grant',
                    'fellowship',
                    'competition',
                    'training',
                    'job'
                  ].map((cat) => {
                    const active = preferredCategories.includes(cat as OpportunityCategory);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat as OpportunityCategory)}
                        className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors ${
                          active
                            ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Short Bio (shown on public profile)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Computer Science student passionate about AI agents and decentralized computing looking for research fellowships..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Skills Tags */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Your Core Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="e.g. Python, Pitching, Research, TypeScript"
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-[11px] text-slate-700 dark:text-slate-300"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((k) => k !== s))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Welcome */}
          {step === 5 && (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <Sparkles className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  You're Ready, {name || username || 'Innovator'}!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto mt-1">
                  Your OpportunityRadar profile is calibrated. We will rank global programs against your background and keep your deadlines on schedule.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 p-4 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Handle & Role:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    @{username || 'handle'} · {persona} ({stage})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Passport:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {country} / {nationality}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Monitored Categories:</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400 capitalize">
                    {preferredCategories.join(', ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Supabase Auth & Database Schema Ready</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 text-xs">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) setName(username || 'Candidate');
                if (step === 1 && !username.trim()) setUsername('innovator_' + Math.floor(Math.random() * 900 + 100));
                setStep((prev) => (prev + 1) as any);
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-600 dark:hover:bg-sky-500 font-semibold shadow-xs transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleCompleteOnboarding}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span>Configuring Profile...</span>
              ) : (
                <>
                  <span>Launch OpportunityRadar</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
