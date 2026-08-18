import React from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  isFrameActive: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, isFrameActive }) => {
  if (!isFrameActive) {
    return <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">{children}</div>;
  }

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-900/90 py-4 sm:py-8 px-2 flex items-center justify-center">
      {/* Phone Body Frame */}
      <div className="w-full max-w-[420px] h-[860px] max-h-[95vh] bg-white border-[10px] sm:border-[12px] border-[#0F172A] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-slate-700">
        {/* Dynamic Island / Status Bar */}
        <div className="bg-[#0F172A] px-6 py-2 flex items-center justify-between text-slate-300 text-[11px] font-medium select-none z-50 shrink-0">
          <span className="font-bold text-white tracking-tight">{nowTime}</span>

          {/* Dynamic Notch */}
          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-2 border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1E293B] border border-slate-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          </div>

          {/* System Icons */}
          <div className="flex items-center gap-1.5 text-white">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] relative flex flex-col">
          {children}
        </div>

        {/* Phone Bottom Gesture Bar */}
        <div className="bg-[#0F172A] py-2 flex items-center justify-center shrink-0">
          <div className="w-28 h-1 bg-slate-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};
