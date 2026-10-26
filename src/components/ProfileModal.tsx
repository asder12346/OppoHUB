import React, { useState, useRef } from 'react';
import { UserProfile, OpportunityCategory, UserStage, PersonaType, EducationLevel } from '../types';
import { DEMO_PROFILES } from '../data/seedOpportunities';
import { calculateProfileCompletion } from '../utils/profileUtils';
import {
  X,
  Upload,
  Camera,
  User,
  AtSign,
  Globe,
  Github,
  Eye,
  Check,
  Sparkles,
  Linkedin,
  GraduationCap,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Plus
} from 'lucide-react';

interface ProfileModalProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

const ALL_CATEGORIES: OpportunityCategory[] = [
  'scholarship',
  'hackathon',
  'accelerator',
  'grant',
  'fellowship',
  'competition',
  'training',
  'job'
];

const PRESET_AVATARS = [
  { label: 'Amina', url: '/src/assets/images/avatar_student_amina_1791894200671.jpg' },
  { label: 'Carlos', url: '/src/assets/images/avatar_developer_carlos_1791894199800.jpg' },
  { label: 'Elena', url: '/src/assets/images/persona_founder_builder_1791893408064.jpg' },
  { label: 'David', url: '/src/assets/images/persona_student_scholar_1791893407892.jpg' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userProfile,
  isOpen,
  onClose,
  onSaveProfile
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [interestInput, setInterestInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Real-time calculation of profile completion progress
  const completion = calculateProfileCompletion(profile);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    setImageUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfile((prev) => ({ ...prev, avatar: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryToggle = (cat: OpportunityCategory) => {
    const exists = profile.preferredCategories.includes(cat);
    const updated = exists
      ? profile.preferredCategories.filter((c) => c !== cat)
      : [...profile.preferredCategories, cat];
    setProfile({ ...profile, preferredCategories: updated });
  };

  const handleAddInterest = () => {
    if (!interestInput.trim()) return;
    if (!profile.interests.includes(interestInput.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, interestInput.trim()]
      });
    }
    setInterestInput('');
  };

  const handleRemoveInterest = (item: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== item)
    });
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const clean = skillInput.trim();
    if (!profile.skills.includes(clean)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, clean]
      });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (item: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== item)
    });
  };

  const handleLoadPreset = (key: PersonaType) => {
    if (DEMO_PROFILES[key]) {
      setProfile(DEMO_PROFILES[key]);
    }
  };

  const scrollToField = (fieldId: string) => {
    const elem = document.getElementById(fieldId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elem.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = profile.username
      .replace(/^@+/, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    const finalProfile: UserProfile = {
      ...profile,
      username: cleanUsername || 'user_' + Date.now().toString().slice(-4),
      displayName: profile.name || profile.displayName || cleanUsername
    };
    onSaveProfile(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e] text-neutral-900 dark:text-neutral-100 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden my-6 transition-all"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.08] px-6 py-5 shrink-0 bg-neutral-50/50 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>AI Profile Engine</span>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Candidate Profile & AI Context
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Personalize your background. Your AI Agent uses these details for precise eligibility verification and customized statement drafting.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-white/[0.06] dark:hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">

          {/* =========================================================================
              PROFILE COMPLETION & AI MATCH READINESS PROGRESS BAR
              ========================================================================= */}
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-indigo-950/20 dark:via-[#0c0c0e] dark:to-purple-950/10 p-5 shadow-xs">
            
            {/* Top Stat Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span>AI Match Readiness</span>
                    <span className="text-[11px] font-mono font-medium text-neutral-400">
                      ({completion.completedCount}/{completion.totalCount} Core Signals)
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Provides essential context for automated eligibility filtering & personal statements
                  </div>
                </div>
              </div>

              {/* Progress Percentage Badge */}
              <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/[0.08] border border-indigo-200 dark:border-white/[0.1] shadow-2xs font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>{completion.percentage}%</span>
                <span className="text-neutral-400 font-sans font-normal text-[11px]">Filled</span>
              </div>
            </div>

            {/* Visual Animated Progress Bar */}
            <div className="relative w-full h-3 rounded-full bg-neutral-200/80 dark:bg-white/[0.08] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shadow-xs relative"
                style={{ width: `${Math.max(6, completion.percentage)}%` }}
              >
                {/* Light shimmer bar */}
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>

            {/* Quick Context Pill Checkpoints (LinkedIn, Education, Interests, Ambition, Skills) */}
            <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-white/[0.06]">
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                Key AI Signals (Click to jump):
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5">
                {completion.dimensions.map((dim) => {
                  return (
                    <button
                      key={dim.id}
                      type="button"
                      onClick={() => scrollToField(dim.fieldId)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                        dim.isFilled
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                          : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-300 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700 hover:border-indigo-400'
                      }`}
                      title={`${dim.label}: ${dim.description}`}
                    >
                      {dim.isFilled ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 animate-ping" />
                      )}

                      {dim.id === 'linkedin' && <Linkedin className="h-3 w-3 text-indigo-500" />}
                      {dim.id === 'education' && <GraduationCap className="h-3 w-3 text-indigo-500" />}
                      {dim.id === 'interests' && <Target className="h-3 w-3 text-indigo-500" />}

                      <span>{dim.label}</span>

                      {!dim.isFilled && (
                        <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold ml-0.5">
                          +Add
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Encouragement Message */}
              <div className="mt-3 flex items-start gap-2 text-[11px] text-neutral-600 dark:text-neutral-300 bg-white/80 dark:bg-black/20 p-2.5 rounded-xl border border-indigo-100/80 dark:border-white/[0.05]">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {completion.summaryMessage}
                </span>
              </div>
            </div>

          </div>

          {/* Profile Picture Upload & Preview Section */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-white/[0.08] dark:bg-neutral-900/40">
            <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-3">
              Profile Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-500/40 bg-neutral-200 dark:bg-neutral-800 shadow-xs">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-neutral-400">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Upload new image"
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-[9px] font-semibold mt-0.5">Change</span>
                </button>
              </div>

              {/* Upload Controls & Presets */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 font-medium transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Image</span>
                  </button>

                  <span className="text-[11px] text-neutral-400">or pick persona avatar:</span>

                  <div className="flex items-center gap-1">
                    {PRESET_AVATARS.map((p) => (
                      <button
                        type="button"
                        key={p.label}
                        onClick={() => setProfile({ ...profile, avatar: p.url })}
                        className={`h-7 w-7 rounded-full overflow-hidden border transition-all ${
                          profile.avatar === p.url
                            ? 'ring-2 ring-indigo-500 border-white'
                            : 'border-neutral-300 dark:border-neutral-700 hover:opacity-80'
                        }`}
                        title={`Use ${p.label}'s photo`}
                      >
                        <img src={p.url} alt={p.label} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {imageUploadError && (
                  <p className="text-[11px] text-rose-500 font-medium">{imageUploadError}</p>
                )}
                <p className="text-[11px] text-neutral-400">
                  Supported formats: JPG, PNG, WEBP.
                </p>
              </div>

            </div>
          </div>

          {/* Username & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                Username <span className="text-indigo-500">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="username"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-8 pr-3 py-2 text-neutral-900 dark:text-white font-mono"
                  required
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Public profile handle: @{profile.username || 'username'}
              </span>
            </div>

            <div>
              <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                Display Name <span className="text-indigo-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name || profile.displayName || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value, displayName: e.target.value })}
                placeholder="Full Legal / Candidate Name"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-neutral-600 dark:text-neutral-400">
                Short Bio <span className="text-indigo-500">*</span>
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {profile.bio?.length || 0}/200 characters
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={200}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Introduce your focus, aspirations, and what opportunities you are targeting..."
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-2.5 text-neutral-900 dark:text-white leading-relaxed text-xs"
              required
            />
          </div>

          {/* =========================================================================
              EDUCATION & INSTITUTIONAL CONTEXT (Anchor id="field-education")
              ========================================================================= */}
          <div id="field-education" className="space-y-3 pt-2 border-t border-neutral-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 dark:text-white">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              <span>Education & Institutional Eligibility</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                  Education Stage
                </label>
                <select
                  value={profile.stage || profile.educationLevel}
                  onChange={(e) => setProfile({
                    ...profile,
                    stage: e.target.value as UserStage,
                    educationLevel: e.target.value as EducationLevel
                  })}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white"
                >
                  <option value="undergraduate">Undergraduate Student</option>
                  <option value="graduate">Graduate / Master</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                  <option value="developer">Developer / Engineer</option>
                  <option value="founder">Founder / Entrepreneur</option>
                  <option value="early-career">Early-Career Professional</option>
                  <option value="high-school">High School Senior</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                  University / Institution
                </label>
                <input
                  type="text"
                  value={profile.university || ''}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  placeholder="e.g. University of Lagos / MIT"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={profile.fieldOfStudy || ''}
                  onChange={(e) => setProfile({ ...profile, fieldOfStudy: e.target.value })}
                  placeholder="e.g. Computer Science, AI, Biotech"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                  Country & Nationality (for geographic eligibility)
                </label>
                <input
                  type="text"
                  value={profile.country || ''}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value, nationality: e.target.value })}
                  placeholder="e.g. Nigeria / International"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                  Preferred Work Format
                </label>
                <select
                  value={profile.workArrangementPreference || 'all'}
                  onChange={(e) => setProfile({ ...profile, workArrangementPreference: e.target.value as any, preferredFormat: e.target.value as any })}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white capitalize"
                >
                  <option value="all">Any Format (Remote & Onsite)</option>
                  <option value="remote">Remote Only</option>
                  <option value="onsite">On-Site Only</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* =========================================================================
              LINKEDIN & PROFESSIONAL PROFILES (Anchor id="field-linkedin")
              ========================================================================= */}
          <div id="field-linkedin" className="space-y-3 pt-2 border-t border-neutral-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 dark:text-white">
                <Linkedin className="h-4 w-4 text-indigo-500" />
                <span>LinkedIn & Professional Portfolio</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                Crucial for AI Agent Statement Tailoring
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-500" />
                  <input
                    type="url"
                    value={profile.linkedin || ''}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-9 pr-3 py-2 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                  GitHub or Portfolio Link
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="url"
                    value={profile.github || profile.githubOrPortfolio || ''}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value, githubOrPortfolio: e.target.value })}
                    placeholder="https://github.com/yourhandle"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-9 pr-3 py-2 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              STATEMENT OF AMBITION FOR AI AGENT (Anchor id="field-ambition")
              ========================================================================= */}
          <div id="field-ambition" className="pt-2 border-t border-neutral-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Target className="h-4 w-4 text-indigo-500" />
                <span>Statement of Ambition / 2026 Target Goals</span>
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                Used to draft bespoke application essays
              </span>
            </div>
            <textarea
              rows={3}
              value={profile.statementOfAmbition || profile.careerGoals || ''}
              onChange={(e) => setProfile({ ...profile, statementOfAmbition: e.target.value, careerGoals: e.target.value })}
              placeholder="Describe your ambitious targets for 2026 (e.g. Securing a fully-funded MSc in AI at Oxford/Cambridge, or winning $50k grants to scale decentralized infrastructure)..."
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-neutral-900 dark:text-white leading-relaxed text-xs"
            />
          </div>

          {/* =========================================================================
              TECHNICAL & RESEARCH SKILLS (Anchor id="field-skills")
              ========================================================================= */}
          <div id="field-skills" className="pt-2 border-t border-neutral-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-indigo-500" />
                <span>Technical & Domain Skills</span>
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                For hackathons, bounties & research fellowships
              </span>
            </div>

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
                placeholder="Add skill (e.g. Python, Solidity, PyTorch, Research Writing)..."
                className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-1 rounded-lg text-[11px] text-indigo-800 dark:text-indigo-300 font-medium"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(item)}
                    className="text-indigo-400 hover:text-indigo-700 dark:hover:text-white ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* =========================================================================
              INTERESTS & TOPIC DOMAINS (Anchor id="field-interests")
              ========================================================================= */}
          <div id="field-interests" className="pt-2 border-t border-neutral-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Target className="h-4 w-4 text-indigo-500" />
                <span>Topic Interests & Sectors</span>
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                Used to weight recommendations
              </span>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
                placeholder="e.g. Artificial Intelligence, Climate Tech, Web3, Public Health..."
                className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg text-[11px] text-neutral-700 dark:text-neutral-300"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(item)}
                    className="text-neutral-400 hover:text-rose-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Opportunity Categories */}
          <div className="pt-2 border-t border-neutral-100 dark:border-white/[0.06]">
            <label className="font-bold text-xs text-neutral-900 dark:text-white block mb-2">
              Target Opportunity Types
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const active = profile.preferredCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-3 py-2 rounded-xl border text-left transition-all capitalize flex items-center justify-between text-xs ${
                      active
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-black border-neutral-950 dark:border-white font-semibold'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                    }`}
                  >
                    <span>{cat}</span>
                    {active && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="pt-2 border-t border-neutral-100 dark:border-white/[0.06]">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-2 text-xs">
              Fill with Demo Persona Template:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['student', 'developer', 'founder', 'professional'] as PersonaType[]).map((pkey) => (
                <button
                  type="button"
                  key={pkey}
                  onClick={() => handleLoadPreset(pkey)}
                  className={`p-2 rounded-xl border text-left transition-colors ${
                    profile.persona === pkey
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-semibold'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="capitalize">{pkey}</div>
                  <div className="text-[10px] text-neutral-400 font-mono truncate">
                    @{DEMO_PROFILES[pkey].username}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-neutral-100 dark:border-white/[0.08] flex items-center justify-between">
            <div className="text-[11px] text-neutral-500 font-mono">
              Readiness: <span className="font-bold text-indigo-600 dark:text-indigo-400">{completion.percentage}%</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Save Profile Changes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
