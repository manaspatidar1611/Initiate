import React from 'react';
import { Task } from '../types';
import { calculateTimeRemaining } from '../utils/timeUtils';
import { ArrowRight, Sparkles, Target, Zap, CheckCircle2, Clock } from 'lucide-react';

interface HeroInitiationCardProps {
  urgentTask: Task | null;
  onInitiateTask: (task: Task) => void;
  onOpenAddTask: () => void;
  streakDays?: number;
  initiationRate?: number;
}

export const HeroInitiationCard: React.FC<HeroInitiationCardProps> = ({
  urgentTask,
  onInitiateTask,
  onOpenAddTask,
}) => {
  const remaining = urgentTask ? calculateTimeRemaining(urgentTask.deadlineIso) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-xs animate-fade-in">
      {/* Subtle Indigo Accent Backdrop */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#EEF2FF] rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Section Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold tracking-wider uppercase">
          <Sparkles className="w-3 h-3 text-[#4F46E5]" />
          <span>THE INITIATION PRINCIPLE</span>
        </div>

        {/* Heading & Subtitle */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] leading-tight">
            Focus On Taking The Starting Step.
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
            Overcome inertia by taking your initial action.
          </p>
        </div>

        {/* Action / Urgent Task Context */}
        {urgentTask ? (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F1F5F9]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
                <Target className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Next commitment:</span>
                <span className="font-bold text-[#0F172A] truncate">{urgentTask.title}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-0.5 flex-wrap">
                <span>Target: {urgentTask.deadlineTimeFormatted}</span>
                {remaining && (
                  <span
                    className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.2 rounded ${
                      remaining.isOverdue
                        ? 'bg-rose-100 text-rose-700'
                        : remaining.isUrgent
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#EEF2FF] text-[#4F46E5]'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    {remaining.isOverdue
                      ? `${remaining.formatted} overdue`
                      : `${remaining.formatted} remaining`}
                  </span>
                )}
                {urgentTask.categoryTag && <span>· {urgentTask.categoryTag}</span>}
              </div>
            </div>

            <button
              id="btn-hero-take-starting-step"
              onClick={() => onInitiateTask(urgentTask)}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all hover:shadow-sm active:scale-[0.98] cursor-pointer shrink-0"
            >
              <span>TAKE STARTING STEP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F1F5F9]">
            <div className="flex items-center gap-2 text-xs text-[#10B981] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>All active commitments initiated. Ready for your next focus?</span>
            </div>

            <button
              id="btn-hero-add-task"
              onClick={onOpenAddTask}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all hover:shadow-sm active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>CREATE COMMITMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
