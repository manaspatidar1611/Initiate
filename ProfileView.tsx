import React from 'react';
import { Task } from '../types';
import {
  Flame,
  Zap,
  Target,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Settings,
  RotateCcw,
} from 'lucide-react';

interface ProfileViewProps {
  tasks: Task[];
  streakDays?: number;
  onViewRestrictions: () => void;
  onResetToStudyTask?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  tasks,
  streakDays = 5,
  onViewRestrictions,
  onResetToStudyTask,
}) => {
  const verifiedCount = tasks.filter((t) => t.status === 'initiated').length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Profile Header Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-4">
        <div className="relative">
          <img
            src="/logo.png"
            alt="Initiate"
            className="w-14 h-14 rounded-2xl object-cover border border-[#E2E8F0] shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#4F46E5] rounded-full border-2 border-white flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-white fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0F172A]">Action Initiator</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-semibold">
              Active Focus
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Focusing on taking the first step every day
          </p>
        </div>
      </div>

      {/* Momentum Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center space-y-0.5">
          <div className="flex items-center justify-center text-[#4F46E5] mb-1">
            <Flame className="w-4 h-4 fill-[#4F46E5]" />
          </div>
          <div className="text-lg font-bold text-[#0F172A]">{streakDays} Days</div>
          <div className="text-[10px] text-[#64748B] font-medium">Momentum</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center space-y-0.5">
          <div className="flex items-center justify-center text-[#10B981] mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-[#0F172A]">{verifiedCount}</div>
          <div className="text-[10px] text-[#64748B] font-medium">Initiations</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center space-y-0.5">
          <div className="flex items-center justify-center text-[#4F46E5] mb-1">
            <Target className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-[#0F172A]">{completionRate}%</div>
          <div className="text-[10px] text-[#64748B] font-medium">Velocity</div>
        </div>
      </div>

      {/* Philosophy Card */}
      <div className="p-5 rounded-2xl bg-[#EEF2FF]/60 border border-[#6366F1]/20 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#4F46E5]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>THE INITIATE PHILOSOPHY</span>
        </div>
        <p className="text-xs font-semibold text-[#0F172A] leading-relaxed">
          "Don't focus on finishing everything. Focus on taking the first step."
        </p>
        <p className="text-[11px] text-[#64748B] leading-relaxed">
          When you overcome activation energy, psychological resistance vanishes. Authentic proof ensures accountability while preserving pure focus.
        </p>
      </div>

      {/* Quick Navigation / Settings Links */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden divide-y divide-[#F1F5F9]">
        <button
          onClick={onViewRestrictions}
          className="w-full p-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">Focus Mode Shield</span>
              <span className="text-[11px] text-[#64748B]">Manage restricted apps & accountability</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#64748B]" />
        </button>

        {onResetToStudyTask && (
          <button
            onClick={onResetToStudyTask}
            className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-[#0F172A]">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] block">Reset to Study Task Only</span>
                <span className="text-[11px] text-[#64748B]">Keep 1 clean study commitment with daily milestones</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          </button>
        )}
      </div>
    </div>
  );
};
