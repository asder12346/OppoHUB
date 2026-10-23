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
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ContactModal } from './components/ContactModal';
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string>('');

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
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 dark:bg-[#09090b] dark:text-neutral-100 flex flex-col font-sans transition-colors relative selection:bg-indigo-500 selection:text-white">
      
      {/* Signature Atmospheric Black Texture Glow & Dot Matrix across ALL pages */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-indigo-500/5 dark:bg-indigo-600/12 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 right-0 w-[550px] h-[350px] bg-purple-500/5 dark:bg-purple-600/8 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-60" />
      </div>

      {/* Cursor AI Inspired Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onOpenLogin={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenSignUp={() => {
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenReminders={() => setIsRemindersModalOpen(true)}
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
            onNavigateToAgent={(prompt) => {
              if (prompt) setAgentInitialPrompt(prompt);
              setCurrentTab('agent');
            }}
            onOpenOpportunityDetail={(opp) => setSelectedOpportunity(opp)}
            onToggleSaveOpportunity={handleToggleSave}
            savedOpportunityIds={trackerItems.map((t) => t.opportunityId)}
          />
        )}

        {/* Discovery Feed (Explore) */}
        {currentTab === 'feed' && (
          <div>
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              onExploreTracker={() => setCurrentTab('tracker')}
              onLaunchAgent={() => setCurrentTab('agent')}
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
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
              {filteredOpportunities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-white/[0.08] p-12 text-center bg-white dark:bg-[#0c0c0e]">
                  <Compass className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    No matching opportunities found
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-1 mb-4">
                    Try broadening your filters, resetting category selections, or asking the Agentic Copilot to search deeper.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            initialPrompt={agentInitialPrompt}
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

      {/* Enhanced Global Footer with Interactive Contact & Ingestion */}
      <Footer
        onNavigateToTab={(tab) => setCurrentTab(tab)}
        onOpenContact={() => setIsContactModalOpen(true)}
      />

      {/* Auth Modal (Login & Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          handleSaveProfile(profile);
          if (profile.statementOfAmbition || profile.linkedin || profile.university) {
            setCurrentTab('agent');
          }
        }}
        onLaunchFullOnboarding={() => {
          handleOpenOnboardingWithCategory();
        }}
      />

      {/* Contact & Support Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Opportunity Detail Modal */}
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
