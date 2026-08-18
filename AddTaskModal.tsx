import React, { useState } from 'react';
import { Task, TaskBreakdown } from '../types';
import { formatTime } from '../data/sampleData';
import {
  X,
  Calendar,
  Clock,
  Zap,
  Dumbbell,
  BookOpen,
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Calculator,
} from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryTag, setCategoryTag] = useState('FOCUS COMMITMENT');

  // Default deadline: 30 minutes from now
  const defaultDeadline = new Date(Date.now() + 30 * 60 * 1000);
  const [deadlineDate, setDeadlineDate] = useState(
    defaultDeadline.toISOString().split('T')[0]
  );
  const [deadlineTime, setDeadlineTime] = useState(
    defaultDeadline.toTimeString().slice(0, 5)
  );

  // AI Task Breakdown State (100% Optional)
  const [showAiOptions, setShowAiOptions] = useState(false);
  const [syllabusMaterial, setSyllabusMaterial] = useState('');
  const [dailyDeadlineTime, setDailyDeadlineTime] = useState('20:00');
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);
  const [generatedBreakdown, setGeneratedBreakdown] = useState<TaskBreakdown | null>(null);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyPresetMinutes = (minutesFromNow: number) => {
    const target = new Date(Date.now() + minutesFromNow * 60 * 1000);
    setDeadlineDate(target.toISOString().split('T')[0]);
    setDeadlineTime(target.toTimeString().slice(0, 5));
  };

  const applyPresetDays = (daysFromNow: number) => {
    const target = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    setDeadlineDate(target.toISOString().split('T')[0]);
    setDeadlineTime(target.toTimeString().slice(0, 5));
  };

  const applyTemplate = (presetTitle: string, presetDesc: string, tag: string, daysOffset?: number) => {
    setTitle(presetTitle);
    setDescription(presetDesc);
    setCategoryTag(tag);
    if (daysOffset) {
      applyPresetDays(daysOffset);
    }
  };

  const handleGenerateBreakdown = async () => {
    if (!title.trim()) {
      setBreakdownError('Please enter a task title before generating a breakdown.');
      return;
    }

    setBreakdownError(null);
    setIsGeneratingBreakdown(true);

    try {
      const combinedDate = new Date(`${deadlineDate}T${deadlineTime}:00`);
      const nowMs = Date.now();
      const targetMs = combinedDate.getTime();
      const diffDays = Math.max(1, Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24)));

      const response = await fetch('/api/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: title.trim(),
          taskDescription: description.trim() || undefined,
          deadlineIso: combinedDate.toISOString(),
          daysRemaining: diffDays,
          syllabusMaterial: syllabusMaterial.trim() || undefined,
          dailyDeadlineTime: dailyDeadlineTime || '20:00',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate breakdown');
      }

      const data = await response.json();
      if (data.breakdown) {
        setGeneratedBreakdown(data.breakdown);
        setShowAiOptions(true);
      } else {
        throw new Error(data.error || 'Unable to generate action plan');
      }
    } catch (err: any) {
      console.warn('AI Breakdown error:', err);
      setBreakdownError('Could not generate breakdown at this moment. You can still create the task normally.');
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  const handleUpdateGroupDeadline = (groupId: string, newDateStr: string, newTimeStr: string) => {
    if (!generatedBreakdown) return;
    try {
      const combined = new Date(`${newDateStr}T${newTimeStr}:00`);
      const formatted = `${newDateStr === new Date().toISOString().split('T')[0] ? 'Today' : newDateStr} · ${formatTime(combined)}`;

      setGeneratedBreakdown({
        ...generatedBreakdown,
        groups: generatedBreakdown.groups.map((g) => {
          if (g.id === groupId) {
            return {
              ...g,
              targetDate: newDateStr,
              deadlineIso: combined.toISOString(),
              deadlineTimeFormatted: formatted,
              items: g.items.map((it) => ({
                ...it,
                deadlineIso: combined.toISOString(),
                deadlineTimeFormatted: formatted,
              })),
            };
          }
          return g;
        }),
      });
      setEditingGroupId(null);
    } catch (e) {
      console.error('Failed to update group deadline', e);
    }
  };

  const handleRemoveBreakdown = () => {
    setGeneratedBreakdown(null);
    setSyllabusMaterial('');
    setShowAiOptions(false);
    setBreakdownError(null);
    setEditingGroupId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Combine date and time
    const combinedDate = new Date(`${deadlineDate}T${deadlineTime}:00`);
    const deadlineIso = combinedDate.toISOString();
    const deadlineTimeFormatted = formatTime(combinedDate);

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      categoryTag: categoryTag.trim() || 'FOCUS COMMITMENT',
      deadlineIso,
      deadlineTimeFormatted,
      breakdown: generatedBreakdown || undefined,
    });

    setTitle('');
    setDescription('');
    setSyllabusMaterial('');
    setGeneratedBreakdown(null);
    setShowAiOptions(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        id="add-task-modal"
        className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden text-[#0F172A] my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#F1F5F9] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-[#0F172A] text-base leading-tight">Create Commitment</h2>
              <p className="text-xs text-[#64748B]">Set your task and deadline for the starting step</p>
            </div>
          </div>
          <button
            id="btn-close-add-task-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick Idea Templates */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Quick Templates
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyTemplate('30-Min Workout', 'Do dumbbell squats, lunges and core exercises.', 'LEG DAY · 30 MIN')}
                className="p-2.5 text-left bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] hover:border-[#4F46E5] rounded-xl text-xs font-semibold text-[#0F172A] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Dumbbell className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                <span className="truncate">Workout Session</span>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Study Chapter 3 OS Memory', 'Read Operating Systems memory management & take notes', 'OPERATING SYSTEMS · 45 MIN')}
                className="p-2.5 text-left bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] hover:border-[#4F46E5] rounded-xl text-xs font-semibold text-[#0F172A] flex items-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                <span className="truncate">Study & Notes</span>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('Prepare for Maths Test', 'Prepare Boolean Algebra & canonical forms', 'MATHS TEST · 5 DAYS', 5)}
                className="p-2.5 text-left bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] hover:border-[#4F46E5] rounded-xl text-xs font-semibold text-[#0F172A] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                <span className="truncate">Maths Test (5d)</span>
              </button>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
              Task Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="input-task-title"
              type="text"
              required
              placeholder="e.g. 30-Min Workout, Prepare for Maths Test"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white text-xs font-medium transition-all"
            />
          </div>

          {/* Category Tag */}
          <div>
            <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
              Tag / Category Label
            </label>
            <input
              type="text"
              placeholder="e.g. LEG DAY · 30 MIN or MATHS EXAM · 5 DAYS"
              value={categoryTag}
              onChange={(e) => setCategoryTag(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white text-xs font-medium transition-all"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
              Starting Step Description
            </label>
            <input
              id="input-task-description"
              type="text"
              placeholder="e.g. Prepare Boolean Algebra, or set up workout gear"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white text-xs font-medium transition-all"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#4F46E5]" />
              <span>Target Window</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPresetMinutes(15)}
                className="py-1.5 px-2 bg-[#F8FAFC] hover:bg-[#EEF2FF] hover:border-[#4F46E5] text-[#0F172A] rounded-lg text-xs font-semibold border border-[#E2E8F0] transition-colors cursor-pointer text-center"
              >
                +15m
              </button>
              <button
                type="button"
                onClick={() => applyPresetMinutes(30)}
                className="py-1.5 px-2 bg-[#EEF2FF] text-[#4F46E5] rounded-lg text-xs font-semibold border border-[#6366F1]/30 transition-colors cursor-pointer text-center"
              >
                +30m
              </button>
              <button
                type="button"
                onClick={() => applyPresetMinutes(60)}
                className="py-1.5 px-2 bg-[#F8FAFC] hover:bg-[#EEF2FF] hover:border-[#4F46E5] text-[#0F172A] rounded-lg text-xs font-semibold border border-[#E2E8F0] transition-colors cursor-pointer text-center"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={() => applyPresetDays(5)}
                className="py-1.5 px-2 bg-[#F8FAFC] hover:bg-[#EEF2FF] hover:border-[#4F46E5] text-[#0F172A] rounded-lg text-xs font-semibold border border-[#E2E8F0] transition-colors cursor-pointer text-center"
              >
                +5 Days
              </button>
            </div>
          </div>

          {/* Date & Time Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#4F46E5]" />
                <span>Date</span>
              </label>
              <input
                id="input-task-date"
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#4F46E5]" />
                <span>Deadline</span>
              </label>
              <input
                id="input-task-time"
                type="time"
                required
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* OPTIONAL AI TASK BREAKDOWN SECTION */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <div className="rounded-2xl border border-[#E0E7FF] bg-[#F8FAFC] overflow-hidden transition-all">
              {/* Section Header / Prompt */}
              <div className="p-3.5 flex items-center justify-between gap-2 bg-gradient-to-r from-[#EEF2FF] to-[#FAF5FF]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white shadow-2xs text-[#4F46E5]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A]">
                      Break this task into smaller steps with AI?
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Optional · Overcome inertia with a day-by-day action plan
                    </p>
                  </div>
                </div>

                {!generatedBreakdown ? (
                  <button
                    id="btn-toggle-ai-breakdown-options"
                    type="button"
                    onClick={() => setShowAiOptions(!showAiOptions)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#C7D2FE] hover:bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <span>{showAiOptions ? 'Hide' : 'Break Down'}</span>
                    {showAiOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Plan Attached</span>
                  </span>
                )}
              </div>

              {/* AI Options Content (when expanded or when breakdown generated) */}
              {(showAiOptions || generatedBreakdown) && (
                <div className="p-3.5 space-y-3 bg-white border-t border-[#E2E8F0]">
                  {!generatedBreakdown ? (
                    <>
                      {/* Optional Syllabus / Study Material Input */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#0F172A] mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                            <span>Add syllabus/study material (optional)</span>
                          </span>
                          <span className="text-[10px] text-[#64748B] font-normal">Optional</span>
                        </label>
                        <textarea
                          id="input-syllabus-material"
                          rows={2}
                          placeholder="e.g. Paste relevant syllabus topics, chapters, formula lists, or test requirements here..."
                          value={syllabusMaterial}
                          onChange={(e) => setSyllabusMaterial(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white text-xs font-normal transition-all"
                        />
                      </div>

                      {/* Daily Deadline Setting */}
                      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-[#0F172A] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                            <span>Target Per-Day Deadline Time</span>
                          </label>
                          <span className="text-[10px] text-[#64748B]">Applies to each day</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={dailyDeadlineTime}
                            onChange={(e) => setDailyDeadlineTime(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold focus:outline-none focus:border-[#4F46E5]"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setDailyDeadlineTime('18:00')}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                                dailyDeadlineTime === '18:00'
                                  ? 'bg-[#EEF2FF] border-[#6366F1]/40 text-[#4F46E5]'
                                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                              }`}
                            >
                              6 PM
                            </button>
                            <button
                              type="button"
                              onClick={() => setDailyDeadlineTime('20:00')}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                                dailyDeadlineTime === '20:00'
                                  ? 'bg-[#EEF2FF] border-[#6366F1]/40 text-[#4F46E5]'
                                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                              }`}
                            >
                              8 PM (Standard)
                            </button>
                            <button
                              type="button"
                              onClick={() => setDailyDeadlineTime('22:00')}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                                dailyDeadlineTime === '22:00'
                                  ? 'bg-[#EEF2FF] border-[#6366F1]/40 text-[#4F46E5]'
                                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                              }`}
                            >
                              10 PM
                            </button>
                          </div>
                        </div>
                      </div>

                      {breakdownError && (
                        <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                          {breakdownError}
                        </p>
                      )}

                      {/* Action Buttons for AI Generation */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAiOptions(false)}
                          className="text-[11px] text-[#64748B] hover:text-[#0F172A] font-semibold cursor-pointer"
                        >
                          Skip (Create normally)
                        </button>

                        <button
                          id="btn-generate-ai-breakdown"
                          type="button"
                          disabled={isGeneratingBreakdown || !title.trim()}
                          onClick={handleGenerateBreakdown}
                          className="py-1.5 px-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                          {isGeneratingBreakdown ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating Per-Day Plan...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Generate Per-Day Plan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Generated Breakdown Preview */
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#0F172A]">Per-Day Milestone Plan</span>
                          {generatedBreakdown.syllabusUsed ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold">
                              Syllabus Analyzed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#64748B] text-[10px] font-medium">
                              {generatedBreakdown.groups.length} Days Planned
                            </span>
                          )}
                        </div>

                        <button
                          id="btn-remove-breakdown"
                          type="button"
                          onClick={handleRemoveBreakdown}
                          title="Remove AI Breakdown"
                          className="text-[#94A3B8] hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {generatedBreakdown.summary && (
                        <p className="text-xs text-[#64748B] italic bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                          "{generatedBreakdown.summary}"
                        </p>
                      )}

                      {/* Day / Phase Groups List with Daily Deadlines */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {generatedBreakdown.groups.map((group) => {
                          const isEditing = editingGroupId === group.id;
                          const currentGroupDate = group.targetDate || new Date().toISOString().split('T')[0];
                          const currentGroupTime = group.deadlineIso
                            ? new Date(group.deadlineIso).toTimeString().slice(0, 5)
                            : dailyDeadlineTime;

                          return (
                            <div
                              key={group.id}
                              className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-[#4F46E5] tracking-wide uppercase">
                                    {group.groupTitle}
                                  </span>
                                  {group.deadlineTimeFormatted && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold">
                                      <Clock className="w-2.5 h-2.5" />
                                      <span>{group.deadlineTimeFormatted}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingGroupId(isEditing ? null : group.id)}
                                    className="text-[10px] text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                                  >
                                    {isEditing ? 'Done' : 'Edit Deadline'}
                                  </button>
                                  <span className="text-[10px] text-[#64748B]">
                                    ({group.items.length} {group.items.length === 1 ? 'step' : 'steps'})
                                  </span>
                                </div>
                              </div>

                              {/* In-line Deadline Editor */}
                              {isEditing && (
                                <div className="p-2 bg-white rounded-lg border border-[#C7D2FE] flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-1 text-[10px]">
                                    <span className="text-[#64748B]">Date:</span>
                                    <input
                                      type="date"
                                      defaultValue={currentGroupDate}
                                      id={`edit-date-${group.id}`}
                                      className="px-1.5 py-0.5 rounded border border-[#CBD5E1] text-[10px]"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px]">
                                    <span className="text-[#64748B]">Time:</span>
                                    <input
                                      type="time"
                                      defaultValue={currentGroupTime}
                                      id={`edit-time-${group.id}`}
                                      className="px-1.5 py-0.5 rounded border border-[#CBD5E1] text-[10px]"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const dInput = document.getElementById(`edit-date-${group.id}`) as HTMLInputElement;
                                      const tInput = document.getElementById(`edit-time-${group.id}`) as HTMLInputElement;
                                      if (dInput && tInput) {
                                        handleUpdateGroupDeadline(group.id, dInput.value, tInput.value);
                                      }
                                    }}
                                    className="px-2 py-0.5 bg-[#4F46E5] text-white rounded text-[10px] font-semibold cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              )}

                              <ul className="space-y-1">
                                {group.items.map((item) => (
                                  <li
                                    key={item.id}
                                    className="text-xs text-[#0F172A] flex items-start gap-1.5 pl-1"
                                  >
                                    <span className="text-[#4F46E5] font-bold mt-0.5">•</span>
                                    <span>{item.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedBreakdown(null);
                            setShowAiOptions(true);
                          }}
                          className="text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                        >
                          Regenerate / Edit Settings
                        </button>
                        <span className="text-[#64748B]">
                          Per-day deadlines will be assigned
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-3 rounded-xl border border-[#E2E8F0] text-[#64748B] text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-add-task"
              type="submit"
              className="w-2/3 py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              {generatedBreakdown ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create with AI Plan</span>
                </>
              ) : (
                <span>Create Commitment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

