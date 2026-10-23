import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import {
  Opportunity,
  UserProfile,
  ApplicationTrackerItem,
  OpportunityCategory,
  LocationType,
  FundingType
} from './types';
import { LandingPage } from './components/LandingPage';
import { OnboardingModal } from './components/OnboardingModal';
import { CommunityProfiles } from './components/CommunityProfiles';
import {
  loadStoredProfile,
  saveStoredProfile,
  loadStoredTracker,
  saveStoredTracker,
  getAllOpportunities,
  saveCustomOpportunities,
  loadCustomOpportunities,
  loadCommunityProfiles,
  saveCommunityProfiles
} from './utils/storage';
import { calculateRuleBasedRelevance } from './services/aiService';
import { calculateDeadlineInfo } from './utils/dateUtils';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FiltersBar } from './components/FiltersBar';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { ApplicationTracker } from './components/ApplicationTracker';
import { IngestionStudio } from './components/IngestionStudio';
import { SmartChainPitch } from './components/SmartChainPitch';
import { ProfileModal } from './components/ProfileModal';
import { DeadlineRemindersModal } from './components/DeadlineRemindersModal';
import { OpportunityAgent } from './components/OpportunityAgent';
import { ArrowRight, Compass, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  return (
    <ThemeProvider>
      <OpportunityRadarApp />
    </ThemeProvider>
  );
}

function OpportunityRadarApp() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'feed' | 'tracker' | 'community' | 'agent' | 'ingestion' | 'pitch'>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile>(loadStoredProfile);
  const [communityProfiles, setCommunityProfiles] = useState<UserProfile[]>(loadCommunityProfiles);
  const [trackerItems, setTrackerItems] = useState<ApplicationTrackerItem[]>(loadStoredTracker);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(getAllOpportunities);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | OpportunityCategory>('all');
  const [selectedFormat, setSelectedFormat] = useState<'all' | LocationType>('all');
  const [selectedFunding, setSelectedFunding] = useState<'all' | FundingType>('all');
  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'recent'>('match');
  const [showOnlyVerified, setShowOnlyVerified] = useState<boolean>(false);
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);

  // Modals
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [onboardingCategory, setOnboardingCategory] = useState<OpportunityCategory | undefined>(undefined);

  // Save profile & tracker changes to storage
  useEffect(() => {
    saveStoredProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveStoredTracker(trackerItems);
  }, [trackerItems]);

  // Urgent deadlines count for bell indicator
  const urgentDeadlinesCount = useMemo(() => {
    return trackerItems.filter((item) => {
      const opp = opportunities.find((o) => o.id === item.opportunityId);
      if (!opp) return false;
      const dl = calculateDeadlineInfo(opp.deadline);
      return dl.daysLeft >= 0 && dl.daysLeft <= 7;
    }).length;
  }, [trackerItems, opportunities]);

  // Track / Untrack opportunity toggle
  const handleToggleSave = (opportunityId: string) => {
    const existingIndex = trackerItems.findIndex((t) => t.opportunityId === opportunityId);
    if (existingIndex >= 0) {
      setTrackerItems((prev) => prev.filter((t) => t.opportunityId !== opportunityId));
    } else {
      const opp = opportunities.find((o) => o.id === opportunityId);
      const newTrackerItem: ApplicationTrackerItem = {
        id: 'track_' + Date.now(),
        opportunityId,
        stage: 'saved',
        updatedAt: new Date().toISOString(),
        personalDeadline: opp?.deadline,
        notes: '',
        checklist: (opp?.requiredMaterials || ['Official Application Form', 'CV / Resume']).map((m, idx) => ({
          id: 'c_' + idx,
          text: `Prepare ${m}`,
          done: false
        }))
      };
      setTrackerItems((prev) => [newTrackerItem, ...prev]);
    }
  };

  const handleUpdateTrackerItem = (updated: ApplicationTrackerItem) => {
    setTrackerItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleRemoveTrackerItem = (id: string) => {
    setTrackerItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Handle Profile Save and Sync to Community Roster
  const handleSaveProfile = (newProf: UserProfile) => {
    setUserProfile(newProf);
    setCommunityProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === newProf.id || p.username === newProf.username);
      let updated: UserProfile[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = newProf;
      } else {
        updated = [newProf, ...prev];
      }
      saveCommunityProfiles(updated);
      return updated;
    });
  };

  const handleSelectCommunityUser = (targetUser: UserProfile) => {
    setUserProfile(targetUser);
    setCurrentTab('feed');
  };

  const handleOpenOnboardingWithCategory = (cat?: OpportunityCategory) => {
    setOnboardingCategory(cat);
    setIsOnboardingModalOpen(true);
  };

  const handleAddMatchesToTracker = (
    matchedOpps: Opportunity[],
    customChecklist: { id: string; text: string; done: boolean }[]
  ) => {
    setTrackerItems((prev) => {
      const updated = [...prev];
      matchedOpps.forEach((opp) => {
        const existingIndex = updated.findIndex((t) => t.opportunityId === opp.id);
        if (existingIndex >= 0) {
          const existing = updated[existingIndex];
          const existingTexts = existing.checklist.map((c) => c.text);
          const newItems = customChecklist.filter((c) => !existingTexts.includes(c.text));
          updated[existingIndex] = {
            ...existing,
            checklist: [...existing.checklist, ...newItems]
          };
        } else {
          updated.unshift({
            id: 'track_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            opportunityId: opp.id,
            stage: 'planning',
            updatedAt: new Date().toISOString(),
            personalDeadline: opp.deadline,
            notes: `Autonomous Agent identified fit for ${opp.title}.`,
            checklist: customChecklist.length > 0 ? customChecklist : [
              { id: 'c1', text: 'Verify official eligibility criteria', done: true },
              { id: 'c2', text: 'Draft personal statement of ambition', done: false },
              { id: 'c3', text: 'Submit application before deadline', done: false }
            ]
          });
        }
      });
      return updated;
    });
  };

  // Publish from Ingestion Studio
  const handlePublishOpportunity = (newOpp: Opportunity) => {
    const custom = loadCustomOpportunities();
    const updatedCustom = [newOpp, ...custom];
    saveCustomOpportunities(updatedCustom);
    setOpportunities([newOpp, ...opportunities]);
    setSelectedCategory('all');
    setCurrentTab('feed');
  };

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let result = opportunities.filter((opp) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const tagsStr = (opp.tags || opp.requiredSkills || []).join(' ');
        const corpus = `${opp.title} ${opp.organisation || opp.organization || ''} ${opp.summary || opp.description || ''} ${opp.category} ${tagsStr} ${opp.location || opp.locationName || ''}`.toLowerCase();
        if (!corpus.includes(query)) return false;
      }

      // Category
      if (selectedCategory !== 'all' && opp.category !== selectedCategory) {
        return false;
      }

      // Format
      if (selectedFormat !== 'all' && (opp.workArrangement !== selectedFormat && opp.locationType !== selectedFormat)) {
        return false;
      }

      // Funding
      if (selectedFunding !== 'all' && opp.fundingType !== selectedFunding) {
        return false;
      }

      // Verified only
      if (showOnlyVerified && opp.verificationStatus !== 'Verified Source' && (opp.verificationStatus as string) !== 'verified') {
        return false;
      }

      // Urgent only
      if (urgentOnly) {
        const dl = calculateDeadlineInfo(opp.deadline || '');
        if (dl.daysLeft < 0 || dl.daysLeft > 14) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'match') {
        const scoreA = calculateRuleBasedRelevance(a, userProfile).score;
        const scoreB = calculateRuleBasedRelevance(b, userProfile).score;
        return scoreB - scoreA;
      }
      if (sortBy === 'deadline') {
        const dateA = new Date(a.deadline || '').getTime();
        const dateB = new Date(b.deadline || '').getTime();
        return dateA - dateB;
      }
      if (sortBy === 'recent') {
        const dateA = new Date(a.lastVerifiedAt || a.lastVerified || a.publishedAt || '').getTime();
        const dateB = new Date(b.lastVerifiedAt || b.lastVerified || b.publishedAt || '').getTime();
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [
    opportunities,
    searchQuery,
    selectedCategory,
    selectedFormat,
    selectedFunding,
    showOnlyVerified,
    urgentOnly,
    sortBy,
    userProfile
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedFormat('all');
    setSelectedFunding('all');
    setShowOnlyVerified(false);
    setUrgentOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* 3-zone Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenReminders={() => setIsRemindersModalOpen(true)}
        onOpenOnboarding={() => handleOpenOnboardingWithCategory()}
        urgentDeadlinesCount={urgentDeadlinesCount}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        
        {/* Landing Page (5 Sections) */}
        {currentTab === 'landing' && (
          <LandingPage
            opportunities={opportunities}
            userProfile={userProfile}
            onOpenOnboarding={handleOpenOnboardingWithCategory}
            onNavigateToFeed={() => setCurrentTab('feed')}
            onNavigateToTracker={() => setCurrentTab('tracker')}
            onNavigateToCommunity={() => setCurrentTab('community')}
            onNavigateToAgent={() => setCurrentTab('agent')}
            onOpenOpportunityDetail={(opp) => setSelectedOpportunity(opp)}
            onToggleSaveOpportunity={handleToggleSave}
            savedOpportunityIds={trackerItems.map((t) => t.opportunityId)}
          />
        )}

        {/* Discovery Feed */}
        {currentTab === 'feed' && (
          <div>
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              onExploreTracker={() => setCurrentTab('tracker')}
            />

            <FiltersBar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              selectedFunding={selectedFunding}
              setSelectedFunding={setSelectedFunding}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showOnlyVerified={showOnlyVerified}
              setShowOnlyVerified={setShowOnlyVerified}
              urgentOnly={urgentOnly}
              setUrgentOnly={setUrgentOnly}
              totalCount={opportunities.length}
              filteredCount={filteredOpportunities.length}
              onResetFilters={resetFilters}
            />

            {/* Opportunities Feed Grid */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {filteredOpportunities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
                  <Compass className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    No matching opportunities found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
                    Try broadening your filters, resetting category selections, or using the AI Ingestion Studio to import a new opportunity.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpportunities.map((opp) => {
                    const isSaved = trackerItems.some((t) => t.opportunityId === opp.id);
                    return (
                      <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        userProfile={userProfile}
                        isSaved={isSaved}
                        onToggleSave={() => handleToggleSave(opp.id)}
                        onOpenDetails={() => setSelectedOpportunity(opp)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application Tracker */}
        {currentTab === 'tracker' && (
          <ApplicationTracker
            trackerItems={trackerItems}
            opportunities={opportunities}
            onUpdateTrackerItem={handleUpdateTrackerItem}
            onRemoveTrackerItem={handleRemoveTrackerItem}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
          />
        )}

        {/* Opportunity Agent (Autonomous Copilot) */}
        {currentTab === 'agent' && (
          <OpportunityAgent
            userProfile={userProfile}
            opportunities={opportunities}
            trackerItems={trackerItems}
            onAddMatchesToTracker={handleAddMatchesToTracker}
            onOpenOpportunityDetail={(opp) => setSelectedOpportunity(opp)}
          />
        )}

        {/* Community Profiles */}
        {currentTab === 'community' && (
          <CommunityProfiles
            currentUser={userProfile}
            communityProfiles={communityProfiles}
            onOpenEditProfile={() => setIsProfileModalOpen(true)}
            onSelectUserForDemo={handleSelectCommunityUser}
          />
        )}

        {/* AI Ingestion Studio */}
        {currentTab === 'ingestion' && (
          <IngestionStudio
            existingOpportunities={opportunities}
            onPublishOpportunity={handlePublishOpportunity}
          />
        )}

        {/* Hackathon Pitch & Roadmap */}
        {currentTab === 'pitch' && (
          <SmartChainPitch />
        )}
      </main>

      {/* Footer (Rendered when not on Landing page, or as site fallback) */}
      {currentTab !== 'landing' && (
        <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">OpportunityRadar</span>
              <span>· Autonomous Opportunity Engine</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setCurrentTab('landing')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Overview
              </button>
              <button
                onClick={() => setCurrentTab('feed')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Explore
              </button>
              <button
                onClick={() => setCurrentTab('tracker')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Tracker
              </button>
              <button
                onClick={() => setCurrentTab('agent')}
                className="hover:text-slate-900 dark:hover:text-white font-semibold text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                Agent Copilot
              </button>
              <button
                onClick={() => setCurrentTab('community')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Community
              </button>
              <button
                onClick={() => setCurrentTab('pitch')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Roadmap
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          userProfile={userProfile}
          isSaved={trackerItems.some((t) => t.opportunityId === selectedOpportunity.id)}
          onClose={() => setSelectedOpportunity(null)}
          onToggleSave={() => handleToggleSave(selectedOpportunity.id)}
        />
      )}

      {/* User Onboarding Flow Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        initialCategory={onboardingCategory}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={(newProf) => {
          handleSaveProfile(newProf);
          setCurrentTab('feed');
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        userProfile={userProfile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSaveProfile={handleSaveProfile}
      />

      {/* Reminders Modal */}
      <DeadlineRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        userProfile={userProfile}
        trackerItems={trackerItems}
        opportunities={opportunities}
      />

    </div>
  );
}
