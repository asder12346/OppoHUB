import React, { useState } from 'react';
import { UserProfile, PersonaType } from '../types';
import {
  Users,
  Search,
  AtSign,
  MapPin,
  Sparkles,
  ExternalLink,
  Edit3,
  Globe,
  Github,
  CheckCircle2,
  X,
  Share2
} from 'lucide-react';

interface CommunityProfilesProps {
  currentUser: UserProfile;
  communityProfiles: UserProfile[];
  onOpenEditProfile: () => void;
  onSelectUserForDemo?: (user: UserProfile) => void;
}

export const CommunityProfiles: React.FC<CommunityProfilesProps> = ({
  currentUser,
  communityProfiles,
  onOpenEditProfile,
  onSelectUserForDemo
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<'all' | PersonaType>('all');
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  // Combine currentUser (if public) with communityProfiles, avoiding duplicate IDs
  const allProfiles = React.useMemo(() => {
    const list = [...communityProfiles];
    const userIndex = list.findIndex((p) => p.id === currentUser.id || p.username === currentUser.username);
    if (userIndex >= 0) {
      list[userIndex] = currentUser;
    } else if (currentUser.isPublic) {
      list.unshift(currentUser);
    }
    return list;
  }, [communityProfiles, currentUser]);

  const filtered = allProfiles.filter((p) => {
    if (!p.isPublic && p.id !== currentUser.id) return false;

    if (selectedPersona !== 'all' && p.persona !== selectedPersona) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const corpus = `${p.name} ${p.username} ${p.bio} ${p.country} ${p.skills.join(' ')} ${p.interests.join(' ')}`.toLowerCase();
      if (!corpus.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <span>OpportunityRadar Community</span>
            <span aria-hidden="true">·</span>
            <span>Global Innovator Network</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Public User Profiles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Discover peer innovators, view public candidate bios, and share opportunity recommendations.
          </p>
        </div>

        {/* Current user quick action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEditProfile}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit My Profile</span>
          </button>
        </div>
      </div>

      {/* Your Profile Card Banner */}
      <div className="mb-8 rounded-2xl border border-sky-100 bg-sky-50/50 p-4 sm:p-5 dark:border-sky-900/40 dark:bg-sky-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-sky-500/50 bg-slate-200 dark:bg-slate-800 shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </h3>
                <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-medium">
                  @{currentUser.username}
                </span>
                <span className="text-[10px] bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-medium">
                  You
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1 max-w-xl">
                {currentUser.bio}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>{currentUser.stage}</span>
                <span aria-hidden="true">·</span>
                <span>{currentUser.country}</span>
                <span aria-hidden="true">·</span>
                <span className={currentUser.isPublic ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                  {currentUser.isPublic ? 'Visible to community' : 'Hidden from community'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setViewingProfile(currentUser)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition-colors shadow-xs shrink-0"
          >
            Preview Public View
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community by name, @username, skill, or bio..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs">
          {(['all', 'student', 'developer', 'founder', 'professional'] as ('all' | PersonaType)[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedPersona(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors capitalize ${
                selectedPersona === tab
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Roles' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((profile) => {
          const isMe = profile.id === currentUser.id || profile.username === currentUser.username;

          return (
            <div
              key={profile.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 text-xs"
            >
              <div>
                {/* Top User Lockup */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">
                        {profile.name}
                      </h4>
                      {isMe && (
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400 block truncate">
                      @{profile.username}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="capitalize">{profile.persona}</span>
                      <span aria-hidden="true">·</span>
                      <span>{profile.country}</span>
                    </div>
                  </div>
                </div>

                {/* Short Bio */}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
                  {profile.bio}
                </p>

                {/* Skills & Interests Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {profile.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.interests.slice(0, 2).map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-[10px] text-sky-700 dark:text-sky-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingProfile(profile)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  View Profile
                </button>

                {onSelectUserForDemo && !isMe && (
                  <button
                    onClick={() => onSelectUserForDemo(profile)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 font-medium transition-colors"
                    title="Switch feed perspective to this user's profile"
                  >
                    Simulate As User
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Public Profile View Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden my-8"
            role="dialog"
          >
            {/* Modal Top Banner */}
            <div className="h-24 bg-gradient-to-r from-sky-600 to-indigo-700 relative">
              <button
                onClick={() => setViewingProfile(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-0 relative text-xs">
              {/* Avatar overlap */}
              <div className="-mt-12 mb-3 flex items-end justify-between">
                <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 shadow-md">
                  <img
                    src={viewingProfile.avatar}
                    alt={viewingProfile.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {viewingProfile.githubOrPortfolio && (
                    <a
                      href={viewingProfile.githubOrPortfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      title="GitHub / Portfolio"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {viewingProfile.website && (
                    <a
                      href={viewingProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      title="Personal Website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Names & Handle */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {viewingProfile.name}
              </h3>
              <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-semibold block mb-2">
                @{viewingProfile.username}
              </span>

              {/* Bio */}
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs mb-4">
                {viewingProfile.bio}
              </p>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 text-[11px]">
                <div>
                  <span className="text-slate-400 block mb-0.5">Role / Stage</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">
                    {viewingProfile.stage}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Location</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewingProfile.country}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Target Categories</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">
                    {viewingProfile.preferredCategories.slice(0, 3).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Funding Focus</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">
                    {(viewingProfile.fundingPreference || viewingProfile.workArrangementPreference || 'All Opportunities').replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
                  Demonstrated Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProfile.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
                  Interests & Domains
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProfile.interests.map((i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/50 text-[11px] text-sky-700 dark:text-sky-300"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setViewingProfile(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-sky-600 font-semibold"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
