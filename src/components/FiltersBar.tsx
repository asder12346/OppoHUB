import React from 'react';
import { OpportunityCategory, LocationType, FundingType } from '../types';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

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
  { label: 'All Types', value: 'all' },
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
    <div className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-3">
        
        {/* Row 1: Category segmented buttons */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Counts & Clear */}
          <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono tabular-nums">
              Showing {filteredCount} of {totalCount}
            </span>
            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Filters (Format, Funding, Sorting, Toggles) */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Format Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-medium">Format:</span>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as 'all' | LocationType)}
                className="bg-transparent text-slate-700 dark:text-slate-300 font-medium outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-800">All Locations</option>
                <option value="remote" className="dark:bg-slate-800">Remote Only</option>
                <option value="in-person" className="dark:bg-slate-800">In-Person</option>
                <option value="hybrid" className="dark:bg-slate-800">Hybrid</option>
              </select>
            </div>

            {/* Funding Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-medium">Funding:</span>
              <select
                value={selectedFunding}
                onChange={(e) => setSelectedFunding(e.target.value as 'all' | FundingType)}
                className="bg-transparent text-slate-700 dark:text-slate-300 font-medium outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-800">All Funding</option>
                <option value="fully-funded" className="dark:bg-slate-800">Fully Funded</option>
                <option value="grant-prize" className="dark:bg-slate-800">Grants & Prizes</option>
                <option value="partially-funded" className="dark:bg-slate-800">Partially Funded</option>
                <option value="free" className="dark:bg-slate-800">Free / Stipend</option>
              </select>
            </div>

            {/* Urgent Deadline Checkbox */}
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                urgentOnly
                  ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-600 font-medium'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Closing Soon (≤ 14d)</span>
            </button>

            {/* Verified Only Checkbox */}
            <button
              onClick={() => setShowOnlyVerified(!showOnlyVerified)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                showOnlyVerified
                  ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-600 font-medium'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Verified Sources Only</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Sort by:</span>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'match' | 'deadline' | 'recent')}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
              >
                <option value="match" className="dark:bg-slate-800">Best AI Match Score</option>
                <option value="deadline" className="dark:bg-slate-800">Earliest Deadline</option>
                <option value="recent" className="dark:bg-slate-800">Recently Verified</option>
              </select>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
