import React from 'react';
import { OpportunityCategory, LocationType, FundingType } from '../types';
import { Filter, SlidersHorizontal, RotateCcw, ShieldCheck } from 'lucide-react';

interface FiltersBarProps {
  selectedCategory: 'all' | OpportunityCategory;
  setSelectedCategory: (cat: 'all' | OpportunityCategory) => void;
  selectedFormat: 'all' | LocationType;
  setSelectedFormat: (fmt: 'all' | LocationType) => void;
  selectedFunding: 'all' | FundingType;
  setSelectedFunding: (fnd: 'all' | FundingType) => void;
  sortBy: 'match' | 'deadline' | 'recent';
  setSortBy: (sort: 'match' | 'deadline' | 'recent') => void;
  showOnlyVerified: boolean;
  setShowOnlyVerified: (val: boolean) => void;
  urgentOnly: boolean;
  setUrgentOnly: (val: boolean) => void;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

const CATEGORIES: { label: string; value: 'all' | OpportunityCategory }[] = [
  { label: 'All Opportunities', value: 'all' },
  { label: 'Scholarships', value: 'scholarship' },
  { label: 'Hackathons', value: 'hackathon' },
  { label: 'Accelerators', value: 'accelerator' },
  { label: 'Grants', value: 'grant' },
  { label: 'Fellowships', value: 'fellowship' },
  { label: 'Competitions', value: 'competition' },
  { label: 'Training', value: 'training' }
];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedFormat,
  setSelectedFormat,
  selectedFunding,
  setSelectedFunding,
  sortBy,
  setSortBy,
  showOnlyVerified,
  setShowOnlyVerified,
  urgentOnly,
  setUrgentOnly,
  totalCount,
  filteredCount,
  onResetFilters
}) => {
  const isFiltered =
    selectedCategory !== 'all' ||
    selectedFormat !== 'all' ||
    selectedFunding !== 'all' ||
    showOnlyVerified ||
    urgentOnly;

  return (
    <div className="border-b border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-[#09090b]/90 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-6xl flex flex-col gap-3">
        
        {/* Row 1: Category segmented buttons in Cursor style */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-neutral-950 shadow-xs dark:bg-white dark:text-black font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Result Count Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 shrink-0">
            <span>Showing</span>
            <span className="font-semibold text-neutral-900 dark:text-white font-mono">{filteredCount}</span>
            <span>of {totalCount} verified</span>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown & Toggle Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              className="rounded-lg border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] py-1.5 px-2.5 text-xs text-neutral-800 dark:text-neutral-200 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">Any Format</option>
              <option value="remote">Remote</option>
              <option value="in-person">In-Person / Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>

            {/* Funding Filter */}
            <select
              value={selectedFunding}
              onChange={(e) => setSelectedFunding(e.target.value as any)}
              className="rounded-lg border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] py-1.5 px-2.5 text-xs text-neutral-800 dark:text-neutral-200 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">Any Funding</option>
              <option value="fully-funded">Fully Funded</option>
              <option value="partially-funded">Partially Funded</option>
              <option value="unpaid">Non-Funded / Bounties</option>
            </select>

            {/* Verified Sources Toggle */}
            <button
              onClick={() => setShowOnlyVerified(!showOnlyVerified)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs ${
                showOnlyVerified
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Only</span>
            </button>

            {/* Closing Soon Toggle */}
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs ${
                urgentOnly
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Closing in 14 Days</span>
            </button>

            {/* Reset button */}
            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2 py-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] py-1.5 px-2.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="match">AI Profile Match</option>
              <option value="deadline">Approaching Deadline</option>
              <option value="recent">Recently Verified</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
