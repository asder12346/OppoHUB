import React, { useState, useRef } from 'react';
import { UserProfile, OpportunityCategory, LocationType, UserStage, PersonaType } from '../types';
import { DEMO_PROFILES } from '../data/seedOpportunities';
import {
  X,
  Upload,
  Camera,
  User,
  AtSign,
  Globe,
  Github,
  Bell,
  Eye,
  Check,
  Sparkles,
  Image as ImageIcon
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
    if (!profile.skills.includes(skillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skillInput.trim()]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize username: remove spaces and leading @
    const cleanUsername = profile.username.replace(/^@+/, '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const finalProfile: UserProfile = {
      ...profile,
      username: cleanUsername || 'user_' + Date.now().toString().slice(-4)
    };
    onSaveProfile(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col overflow-hidden my-8"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Edit User Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set your username, photo, and bio. Visible to other participants on OpportunityRadar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          
          {/* Profile Picture Upload & Preview Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-3">
              Profile Picture
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-sky-500/40 bg-slate-200 dark:bg-slate-700 shadow-xs">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-slate-950/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Image</span>
                  </button>

                  <span className="text-[11px] text-slate-400">or pick preset:</span>

                  <div className="flex items-center gap-1">
                    {PRESET_AVATARS.map((p) => (
                      <button
                        type="button"
                        key={p.label}
                        onClick={() => setProfile({ ...profile, avatar: p.url })}
                        className={`h-7 w-7 rounded-full overflow-hidden border transition-all ${
                          profile.avatar === p.url
                            ? 'ring-2 ring-sky-500 border-white'
                            : 'border-slate-300 dark:border-slate-700 hover:opacity-80'
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
                <p className="text-[11px] text-slate-400">
                  Supported formats: JPG, PNG, WEBP. Square ratio recommended.
                </p>
              </div>

            </div>
          </div>

          {/* Username & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="username"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 py-2 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Public profile handle: @{profile.username || 'username'}
              </span>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Full Name"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-600 dark:text-slate-400">
                Short Bio <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {profile.bio?.length || 0}/200 characters
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Introduce your focus, aspirations, and what opportunities you are targeting..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white leading-relaxed text-xs"
              required
            />
          </div>

          {/* Public Visibility Toggle */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3.5 dark:border-sky-900/40 dark:bg-sky-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Eye className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Public Profile Visibility
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow other platform members to discover your profile in the Community roster.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isPublic}
                onChange={(e) => setProfile({ ...profile, isPublic: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Education Stage, Country & Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Education / Career Stage
              </label>
              <select
                value={profile.stage}
                onChange={(e) => setProfile({ ...profile, stage: e.target.value as UserStage })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white capitalize"
              >
                <option value="high-school">High School</option>
                <option value="undergraduate">Undergraduate Student</option>
                <option value="graduate">Graduate / Master / PhD</option>
                <option value="developer">Developer / Engineer</option>
                <option value="founder">Founder / Entrepreneur</option>
                <option value="early-career">Early-Career Professional</option>
                <option value="experienced">Experienced Professional</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Country & Nationality
              </label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value, nationality: e.target.value })}
                placeholder="e.g. Nigeria / Nigerian"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">
                University / Institution
              </label>
              <input
                type="text"
                value={profile.university || ''}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                placeholder="e.g. University of Lagos / Imperial College"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={profile.linkedin || ''}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">
                GitHub / Portfolio Link
              </label>
              <input
                type="url"
                value={profile.github || profile.githubOrPortfolio || ''}
                onChange={(e) => setProfile({ ...profile, github: e.target.value, githubOrPortfolio: e.target.value })}
                placeholder="https://github.com/yourhandle"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Statement of Ambition for AI Agent */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-600 dark:text-slate-400">
                Statement of Ambition (Active in AI Agent Copilot)
              </label>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                Used to draft personal statements
              </span>
            </div>
            <textarea
              rows={2}
              value={profile.statementOfAmbition || profile.careerGoals || ''}
              onChange={(e) => setProfile({ ...profile, statementOfAmbition: e.target.value, careerGoals: e.target.value })}
              placeholder="e.g. Seeking fully-funded MSc scholarships in Artificial Intelligence and Web3 grants in 2026..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white leading-relaxed text-xs"
            />
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
              Load Demo Template:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['student', 'developer', 'founder', 'professional'] as PersonaType[]).map((pkey) => (
                <button
                  type="button"
                  key={pkey}
                  onClick={() => handleLoadPreset(pkey)}
                  className={`p-2 rounded-xl border text-left transition-colors ${
                    profile.persona === pkey
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="capitalize">{pkey}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    @{DEMO_PROFILES[pkey].username}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests Tags */}
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              Field Interests
            </label>
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
                placeholder="e.g. Artificial Intelligence, Climate, Web3"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-[11px] text-slate-700 dark:text-slate-300"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(item)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-600 dark:hover:bg-sky-500 font-semibold"
            >
              Save & Update Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
