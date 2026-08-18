import React from 'react';
import { ViewMode } from '../types';
import { Home, CheckSquare, Flame, User, Shield } from 'lucide-react';

interface BottomNavBarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  pendingCount: number;
  overdueCount: number;
  streakDays?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onViewChange,
  pendingCount,
  overdueCount,
  streakDays = 3,
}) => {
  return (
    <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-xs">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {/* Tab 1: Home */}
        <button
          id="nav-bottom-home"
          onClick={() => onViewChange('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'home'
              ? 'text-[#4F46E5] font-bold'
              : 'text-[#64748B] hover:text-[#0F172A] font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Tab 2: Tasks */}
        <button
          id="nav-bottom-tasks"
          onClick={() => onViewChange('tasks')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'tasks'
              ? 'text-[#4F46E5] font-bold'
              : 'text-[#64748B] hover:text-[#0F172A] font-medium'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#4F46E5] text-white text-[9px] font-bold rounded-full leading-tight">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Tasks</span>
        </button>

        {/* Tab 3: Momentum */}
        <button
          id="nav-bottom-momentum"
          onClick={() => onViewChange('momentum')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'momentum'
              ? 'text-[#4F46E5] font-bold'
              : 'text-[#64748B] hover:text-[#0F172A] font-medium'
          }`}
        >
          <div className="relative">
            <Flame className="w-5 h-5" />
            {streakDays > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-amber-100 text-amber-800 text-[8px] font-bold rounded-full leading-tight">
                {streakDays}d
              </span>
            )}
          </div>
          <span className="text-[10px]">Momentum</span>
        </button>

        {/* Tab 4: Profile */}
        <button
          id="nav-bottom-profile"
          onClick={() => onViewChange('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'profile'
              ? 'text-[#4F46E5] font-bold'
              : 'text-[#64748B] hover:text-[#0F172A] font-medium'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
};
