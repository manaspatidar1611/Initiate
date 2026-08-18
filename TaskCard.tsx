import React, { useState } from 'react';
import { Task, TaskBreakdownGroup } from '../types';
import { calculateTimeRemaining } from '../utils/timeUtils';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Eye,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  BookOpen,
  Camera,
  Calendar,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onInitiate: (task: Task) => void;
  onViewProof: (task: Task) => void;
  onInitiateDailyProof?: (task: Task, groupId: string) => void;
  onViewDailyProof?: (task: Task, group: TaskBreakdownGroup) => void;
  onToggleStep?: (taskId: string, groupId: string, itemId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onInitiate,
  onViewProof,
  onInitiateDailyProof,
  onViewDailyProof,
  onToggleStep,
}) => {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  const isInitiated = task.status === 'initiated';
  const isOverdue = task.status === 'overdue';
  const isNeedsEvidence = task.status === 'needs_evidence';
  const isUnderReview = task.status === 'under_review';
  const isPending = task.status === 'pending';

  // Calculate hours and minutes remaining or past using calculateTimeRemaining
  const remaining = calculateTimeRemaining(task.deadlineIso);

  let deadlineLabel = task.deadlineTimeFormatted;
  if (isInitiated) {
    deadlineLabel = `Verified at ${task.proof?.timestamp || task.deadlineTimeFormatted}`;
  } else if (!remaining.isOverdue) {
    deadlineLabel = `${task.deadlineTimeFormatted} · ${remaining.formatted} left`;
  } else {
    deadlineLabel = `${task.deadlineTimeFormatted} · ${remaining.formatted} overdue`;
  }

  // Calculate progress bar width (for visual momentum)
  let progressPercent = 0;
  if (isInitiated) {
    progressPercent = 100;
  } else if (isNeedsEvidence || isUnderReview) {
    progressPercent = 65;
  } else if (isOverdue) {
    progressPercent = 90;
  } else {
    // Window countdown approximation
    const nowMs = Date.now();
    const deadlineMs = new Date(task.deadlineIso).getTime();
    const created = new Date(task.createdAt).getTime();
    const total = Math.max(1, deadlineMs - created);
    const elapsed = Math.max(0, nowMs - created);
    progressPercent = Math.min(85, Math.max(15, Math.round((elapsed / total) * 100)));
  }

  // Breakdown statistics
  const totalSteps = task.breakdown?.groups.reduce((acc, g) => acc + g.items.length, 0) || 0;
  const completedSteps =
    task.breakdown?.groups.reduce(
      (acc, g) => acc + g.items.filter((i) => i.isCompleted).length,
      0
    ) || 0;

  return (
    <div
      id={`task-card-${task.id}`}
      className={`rounded-2xl bg-white border transition-all p-5 shadow-xs hover:shadow-sm ${
        isOverdue
          ? 'border-[#EF4444]/30'
          : isInitiated
          ? 'border-[#E2E8F0]'
          : isNeedsEvidence
          ? 'border-[#F59E0B]/40'
          : 'border-[#E2E8F0]'
      }`}
    >
      <div className="space-y-3.5">
        {/* Card Header: Tag & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          {/* Category Tag (e.g. LEG DAY · 30 MIN) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-[#64748B] tracking-wider uppercase">
              {task.categoryTag || (task.category ? `${task.category.toUpperCase()} · 30 MIN` : 'FOCUS COMMITMENT')}
            </span>

            {task.breakdown && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>AI Plan</span>
              </span>
            )}
          </div>

          {/* Status Badge */}
          {isInitiated && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified</span>
            </span>
          )}

          {isPending && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-semibold">
              <Clock className="w-3 h-3 text-[#4F46E5]" />
              <span>Pending</span>
            </span>
          )}

          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#EF4444] text-[11px] font-semibold">
              <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
              <span>Overdue</span>
            </span>
          )}

          {isNeedsEvidence && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] text-[11px] font-semibold">
              <RotateCcw className="w-3 h-3 text-[#D97706]" />
              <span>More Evidence Needed</span>
            </span>
          )}

          {isUnderReview && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8FAFC] text-[#64748B] text-[11px] font-semibold border border-[#E2E8F0]">
              <Clock className="w-3 h-3" />
              <span>Under Review</span>
            </span>
          )}
        </div>

        {/* Task Title & Description */}
        <div>
          <h3 className="text-[15px] sm:text-base font-bold text-[#0F172A] leading-snug">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-[13px] text-[#64748B] mt-1 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* AI Action Plan Breakdown (Inside existing task system) */}
        {task.breakdown && (
          <div className="rounded-xl border border-[#E0E7FF] bg-[#F8FAFC] overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
              className="w-full p-2.5 flex items-center justify-between gap-2 hover:bg-[#EEF2FF]/60 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                <span className="font-bold text-[#0F172A] truncate">
                  AI Action Plan ({task.breakdown.groups.length} {task.breakdown.groups.length === 1 ? 'Phase' : 'Days'})
                </span>
                {task.breakdown.syllabusUsed && (
                  <span className="px-1.5 py-0.2 rounded-sm bg-[#EEF2FF] text-[#4F46E5] text-[9px] font-bold shrink-0">
                    Syllabus
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-[#64748B] font-medium">
                  {completedSteps}/{totalSteps} steps
                </span>
                {isBreakdownExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                )}
              </div>
            </button>

            {isBreakdownExpanded && (
              <div className="p-3 bg-white border-t border-[#E2E8F0] space-y-3 animate-fade-in">
                {task.breakdown.summary && (
                  <p className="text-[11px] text-[#64748B] italic bg-[#F8FAFC] p-2 rounded-lg border border-[#F1F5F9]">
                    "{task.breakdown.summary}"
                  </p>
                )}

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                  {task.breakdown.groups.map((group, gIndex) => {
                    const isGroupVerified = group.proof || group.status === 'initiated';
                    const groupRemaining = group.deadlineIso ? calculateTimeRemaining(group.deadlineIso) : null;
                    const isGroupOverdue = groupRemaining ? groupRemaining.isOverdue && !isGroupVerified : false;
                    const isGroupDueSoon = groupRemaining ? groupRemaining.isUrgent && !isGroupVerified : false;

                    return (
                      <div
                        key={group.id}
                        className={`p-2.5 rounded-xl border space-y-2 transition-all ${
                          isGroupVerified
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : isGroupOverdue
                            ? 'bg-rose-50/50 border-rose-200'
                            : isGroupDueSoon
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-[#F8FAFC] border-[#F1F5F9]'
                        }`}
                      >
                        {/* Day Title, Daily Deadline & Camera Proof Action */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wide">
                              {group.groupTitle}
                            </span>
                            {group.deadlineTimeFormatted && (
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                                  isGroupOverdue
                                    ? 'bg-rose-100 text-rose-800'
                                    : isGroupDueSoon
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-[#EEF2FF] text-[#4F46E5]'
                                }`}
                              >
                                <Clock className="w-2.5 h-2.5" />
                                <span>{group.deadlineTimeFormatted}</span>
                              </span>
                            )}
                            {groupRemaining && !isGroupVerified && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                                  isGroupOverdue
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : isGroupDueSoon
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {groupRemaining.isOverdue
                                  ? `Overdue (${groupRemaining.formatted})`
                                  : `Due in ${groupRemaining.formatted}`}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isGroupVerified ? (
                              <div className="flex items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                                {onViewDailyProof && (
                                  <button
                                    type="button"
                                    onClick={() => onViewDailyProof(task, group)}
                                    className="p-1 rounded-md text-[#4F46E5] hover:bg-[#EEF2FF] text-[10px] font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Proof</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              onInitiateDailyProof && (
                                <button
                                  type="button"
                                  onClick={() => onInitiateDailyProof(task, group.id)}
                                  className={`px-2 py-1 rounded-lg text-white text-[10px] font-semibold flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95 ${
                                    isGroupOverdue
                                      ? 'bg-rose-600 hover:bg-rose-700 animate-bounce'
                                      : 'bg-[#4F46E5] hover:bg-[#4338CA]'
                                  }`}
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>{isGroupOverdue ? 'Clear Overdue Proof' : 'Submit Proof'}</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Step Checkbox Items */}
                        <div className="space-y-1">
                          {group.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => onToggleStep && onToggleStep(task.id, group.id, item.id)}
                              className={`flex items-start gap-2 p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                                item.isCompleted
                                  ? 'text-[#94A3B8] line-through bg-transparent'
                                  : 'text-[#0F172A] hover:bg-white bg-white/70 border border-slate-100'
                              }`}
                            >
                              <button
                                type="button"
                                className="mt-0.5 text-[#4F46E5] shrink-0"
                              >
                                {item.isCompleted ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-[#10B981]" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-[#94A3B8]" />
                                )}
                              </button>
                              <span className="leading-tight">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subtle Progress Bar */}
        <div className="space-y-1.5 pt-0.5">
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isInitiated
                  ? 'bg-[#10B981]'
                  : isOverdue
                  ? 'bg-[#EF4444]'
                  : isNeedsEvidence
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#4F46E5]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#64748B]" />
              <span>{deadlineLabel}</span>
            </span>
            {isInitiated && task.proof?.timestamp && (
              <span className="text-[10px] text-[#10B981] font-medium">Starting Step Logged</span>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-[#F8FAFC] gap-3">
          {isInitiated ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Proof Authenticated</span>
              </div>
              <button
                id={`btn-view-proof-${task.id}`}
                onClick={() => onViewProof(task)}
                className="py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF2FF] text-[#0F172A] hover:text-[#4F46E5] text-xs font-semibold border border-[#E2E8F0] hover:border-[#6366F1]/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Proof</span>
              </button>
            </div>
          ) : isNeedsEvidence ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#D97706] font-medium">
                Additional proof needed
              </span>
              <button
                id={`btn-reinitiate-${task.id}`}
                onClick={() => onInitiate(task)}
                className="py-2 px-4 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Submit Evidence</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#64748B]">
                {isOverdue ? 'Distracting apps restricted' : 'Take first action'}
              </span>
              <button
                id={`btn-initiate-${task.id}`}
                onClick={() => onInitiate(task)}
                className="py-2 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Take Starting Step</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

