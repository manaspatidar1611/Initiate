import React from 'react';
import { Task } from '../types';
import {
  Flame,
  Zap,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Clock,
  Activity,
  Eye,
} from 'lucide-react';

interface MomentumViewProps {
  tasks: Task[];
  onViewProof: (task: Task) => void;
  onInitiateTask: (task: Task) => void;
}

export const MomentumView: React.FC<MomentumViewProps> = ({
  tasks,
  onViewProof,
}) => {
  const verifiedTasks = tasks.filter((t) => t.status === 'initiated');
  const totalActions = tasks.length;
  const initiationRate = totalActions > 0 ? Math.round((verifiedTasks.length / totalActions) * 100) : 100;

  // 7-day streak tracker
  const weekDays = [
    { day: 'Mon', completed: true, label: '3 started' },
    { day: 'Tue', completed: true, label: '4 started' },
    { day: 'Wed', completed: true, label: '2 started' },
    { day: 'Thu', completed: true, label: '5 started' },
    { day: 'Fri', completed: true, label: '3 started' },
    { day: 'Sat', completed: true, label: '2 started' },
    { day: 'Today', completed: verifiedTasks.length > 0, label: `${verifiedTasks.length} started`, isToday: true },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Momentum Summary Header */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Momentum Velocity</span>
            </span>
            <h2 className="text-lg font-bold text-[#0F172A] mt-0.5">
              Action Momentum
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Focusing purely on taking the initial action to eliminate inertia.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#EEF2FF] border border-[#6366F1]/20 text-[#4F46E5] flex items-center gap-2">
            <Flame className="w-5 h-5 fill-[#4F46E5]" />
            <div className="text-right">
              <span className="text-[9px] text-[#64748B] block font-semibold leading-none">STREAK</span>
              <span className="text-sm font-bold text-[#4F46E5]">3 Days</span>
            </div>
          </div>
        </div>

        {/* Clean Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-semibold text-[#64748B] block">Initiations</span>
            <div className="text-xl font-bold text-[#0F172A]">{verifiedTasks.length}</div>
            <div className="text-[10px] text-[#10B981] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-semibold text-[#64748B] block">Initiation Rate</span>
            <div className="text-xl font-bold text-[#0F172A]">{initiationRate}%</div>
            <div className="text-[10px] text-[#4F46E5] font-semibold">Consistent</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-semibold text-[#64748B] block">Avg Starting Time</span>
            <div className="text-xl font-bold text-[#0F172A]">3.8m</div>
            <div className="text-[10px] text-[#64748B] font-semibold">Fast start</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-semibold text-[#64748B] block">Focus Protected</span>
            <div className="text-xl font-bold text-[#0F172A]">4.5h</div>
            <div className="text-[10px] text-[#10B981] font-semibold">Shielded</div>
          </div>
        </div>

        {/* 7-Day Consistency Tracker */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" />
              7-Day Initiation Streak
            </span>
            <span className="text-[10px] font-bold text-[#10B981]">On Track</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-0.5">
            {weekDays.map((item, idx) => (
              <div
                key={idx}
                className={`p-1.5 rounded-lg text-center flex flex-col items-center justify-between border transition-all ${
                  item.isToday
                    ? 'bg-[#EEF2FF] border-[#4F46E5]'
                    : item.completed
                    ? 'bg-white border-[#E2E8F0]'
                    : 'bg-white border-[#E2E8F0] opacity-50'
                }`}
              >
                <span className="text-[9px] font-semibold text-[#64748B]">{item.day}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center my-1 ${
                    item.completed
                      ? 'bg-[#10B981] text-white'
                      : 'bg-slate-200 text-[#64748B]'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-[8px] font-medium text-[#0F172A] truncate max-w-full">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Starting Steps Proof Gallery */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Verified Proof Log
            </h3>
            <p className="text-xs text-[#64748B]">
              Authenticated starting step proof
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-semibold">
            {verifiedTasks.length} Verified
          </span>
        </div>

        {verifiedTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {verifiedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onViewProof(task)}
                className="p-3 rounded-xl border border-[#E2E8F0] hover:border-[#4F46E5] bg-[#F8FAFC] transition-all cursor-pointer group flex items-center gap-3 shadow-2xs"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 relative">
                  {task.proof?.mediaUrl ? (
                    <img
                      src={task.proof.mediaUrl}
                      alt={task.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#10B981] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                    <span className="text-[10px] text-[#64748B]">{task.proof?.timestamp}</span>
                  </div>

                  <h4 className="font-semibold text-xs text-[#0F172A] truncate mt-0.5">
                    {task.title}
                  </h4>
                  <p className="text-[10px] text-[#64748B] truncate">
                    {task.proof?.note || task.description || 'Starting Step'}
                  </p>
                </div>

                <Eye className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#4F46E5]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 p-4 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC]">
            <Clock className="w-6 h-6 text-[#64748B] mx-auto mb-1 opacity-60" />
            <p className="text-xs font-semibold text-[#0F172A]">No verified proofs yet today</p>
            <p className="text-[10px] text-[#64748B] mt-0.5">
              Take your starting step on any pending task to start your log.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
