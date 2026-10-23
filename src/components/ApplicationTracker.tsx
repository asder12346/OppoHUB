import React, { useState } from 'react';
import { ApplicationTrackerItem, ApplicationStage, Opportunity } from '../types';
import { calculateDeadlineInfo, downloadCalendarEvent } from '../utils/dateUtils';
import {
  LayoutGrid,
  List,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Trash2,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';

interface ApplicationTrackerProps {
  trackerItems: ApplicationTrackerItem[];
  opportunities: Opportunity[];
  onUpdateTrackerItem: (item: ApplicationTrackerItem) => void;
  onRemoveTrackerItem: (id: string) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

const STAGES: { id: ApplicationStage; label: string; desc: string }[] = [
  { id: 'saved', label: 'Saved', desc: 'Bookmarked to review' },
  { id: 'planning', label: 'Planning', desc: 'Gathering materials & drafting' },
  { id: 'applied', label: 'Applied', desc: 'Official submission sent' },
  { id: 'interview', label: 'Shortlisted', desc: 'Interviews & assessments' },
  { id: 'completed', label: 'Completed', desc: 'Decision received / enrolled' }
];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  trackerItems,
  opportunities,
  onUpdateTrackerItem,
  onRemoveTrackerItem,
  onSelectOpportunity
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedItemForNotes, setSelectedItemForNotes] = useState<string | null>(null);

  const getOpp = (oppId: string): Opportunity | undefined => {
    return opportunities.find((o) => o.id === oppId);
  };

  const handleStageChange = (item: ApplicationTrackerItem, newStage: ApplicationStage) => {
    onUpdateTrackerItem({
      ...item,
      stage: newStage,
      updatedAt: new Date().toISOString()
    });
  };

  const handleToggleChecklist = (item: ApplicationTrackerItem, checklistId: string) => {
    const updatedChecklist = item.checklist.map((c) =>
      c.id === checklistId ? { ...c, done: !c.done } : c
    );
    onUpdateTrackerItem({
      ...item,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddChecklistItem = (item: ApplicationTrackerItem, text: string) => {
    if (!text.trim()) return;
    const newItem = {
      id: 'c_' + Date.now(),
      text: text.trim(),
      done: false
    };
    onUpdateTrackerItem({
      ...item,
      checklist: [...item.checklist, newItem],
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateNotes = (item: ApplicationTrackerItem, notes: string) => {
    onUpdateTrackerItem({
      ...item,
      notes,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Bar: Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <span>Essential Feature 05</span>
            <span aria-hidden="true">·</span>
            <span>Application Management</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Application Tracker & Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize materials, track personal deadlines, and move opportunities from discovery to completion.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {trackerItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
          <Clock className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No tracked opportunities yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Browse the discovery feed and click "Save" on scholarships, hackathons, or grants to manage your preparation milestones here.
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {STAGES.map((col) => {
            const itemsInStage = trackerItems.filter((item) => item.stage === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 min-h-[450px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {col.label}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">{col.desc}</span>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {itemsInStage.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div className="space-y-3 flex-1">
                  {itemsInStage.map((item) => {
                    const opp = getOpp(item.opportunityId);
                    if (!opp) return null;
                    const dl = calculateDeadlineInfo(opp.deadline);
                    const completedTasks = item.checklist.filter((c) => c.done).length;
                    const totalTasks = item.checklist.length;

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 text-xs"
                      >
                        {/* Title & Organization */}
                        <div
                          className="cursor-pointer"
                          onClick={() => onSelectOpportunity(opp)}
                        >
                          <span className="text-[10px] uppercase font-semibold text-sky-600 dark:text-sky-400 block mb-0.5">
                            {opp.category}
                          </span>
                          <h5 className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-sky-600 transition-colors">
                            {opp.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {opp.organization}
                          </p>
                        </div>

                        {/* Deadline badge */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="font-mono tabular-nums">
                            {dl.formattedDate}
                          </span>
                          <span className={`font-semibold ${
                            dl.isCritical ? 'text-rose-500' : dl.isUrgent ? 'text-amber-500' : 'text-slate-400'
                          }`}>
                            {dl.statusText}
                          </span>
                        </div>

                        {/* Checklist summary */}
                        {totalTasks > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                              <span>Checklist</span>
                              <span className="font-mono font-bold tabular-nums">
                                {completedTasks}/{totalTasks}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full transition-all"
                                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Expanded Checklist items */}
                        <div className="mt-2 space-y-1">
                          {item.checklist.slice(0, 3).map((check) => (
                            <label
                              key={check.id}
                              className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={check.done}
                                onChange={() => handleToggleChecklist(item, check.id)}
                                className="rounded text-sky-600 focus:ring-sky-500 h-3 w-3"
                              />
                              <span className={check.done ? 'line-through text-slate-400' : ''}>
                                {check.text}
                              </span>
                            </label>
                          ))}
                        </div>

                        {/* Stage Selector & Actions */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                          <select
                            value={item.stage}
                            onChange={(e) => handleStageChange(item, e.target.value as ApplicationStage)}
                            className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-1.5 py-1 outline-none border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move: {s.label}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => downloadCalendarEvent(
                                opp.title,
                                opp.organisation || opp.organization || 'OpportunityRadar',
                                opp.deadline || '',
                                opp.applicationUrl || ''
                              )}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Export .ics calendar reminder"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onRemoveTrackerItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500"
                              title="Remove from tracker"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {itemsInStage.length === 0 && (
                    <div className="flex items-center justify-center h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-[11px]">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Opportunity</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Checklist Progress</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {trackerItems.map((item) => {
                  const opp = getOpp(item.opportunityId);
                  if (!opp) return null;
                  const dl = calculateDeadlineInfo(opp.deadline);
                  const completed = item.checklist.filter((c) => c.done).length;
                  const total = item.checklist.length;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div
                          className="cursor-pointer hover:text-sky-600 transition-colors"
                          onClick={() => onSelectOpportunity(opp)}
                        >
                          <div>{opp.title}</div>
                          <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            {opp.organization}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{opp.category}</td>
                      <td className="px-4 py-3">
                        <select
                          value={item.stage}
                          onChange={(e) => handleStageChange(item, e.target.value as ApplicationStage)}
                          className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-2 py-1 border border-slate-200 dark:border-slate-700 outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums">
                        <div>{dl.formattedDate}</div>
                        <div className={`text-[10px] font-medium ${
                          dl.isCritical ? 'text-rose-500' : dl.isUrgent ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          {dl.statusText}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                          {completed} of {total} items done
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectOpportunity(opp)}
                            className="text-sky-600 dark:text-sky-400 hover:underline font-medium text-xs"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onRemoveTrackerItem(item.id)}
                            className="text-slate-400 hover:text-rose-500"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
