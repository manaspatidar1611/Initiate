import React from 'react';
import { ViewMode } from '../types';
import { Plus, Smartphone, Zap } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  pendingCount: number;
  initiatedCount: number;
  overdueCount: number;
  onOpenAddTask: () => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onViewChange,
  onOpenAddTask,
  isDeviceFrame,
  onToggleDeviceFrame,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] text-[#0F172A] shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div
          id="header-brand"
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onViewChange('home')}
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt="Initiate Logo"
              className="w-10 h-10 rounded-2xl object-cover border border-[#E2E8F0] shadow-xs group-hover:scale-105 transition-transform shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#4F46E5] rounded-full border-2 border-white flex items-center justify-center">
              <Zap className="w-2 h-2 text-white fill-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base tracking-tight leading-none text-[#0F172A]">
                Initiate
              </h1>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium leading-tight mt-0.5">
              Take The Starting Step
            </p>
          </div>
        </div>

        {/* Action Icons on the Right */}
        <div className="flex items-center gap-2">
          {/* Subtle Add Task Button */}
          <button
            id="btn-header-add-task"
            onClick={onOpenAddTask}
            className="py-1.5 px-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Create Task"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          {/* Toggle Device Frame */}
          <button
            id="btn-toggle-frame"
            onClick={onToggleDeviceFrame}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer shadow-2xs ${
              isDeviceFrame
                ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#6366F1]/30 font-semibold'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
            title="Toggle Mobile Frame"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
