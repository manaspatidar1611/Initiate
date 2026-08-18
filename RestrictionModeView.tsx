import React, { useState } from 'react';
import { DistractingApp, Task, TaskBreakdownGroup } from '../types';
import { calculateTimeRemaining } from '../utils/timeUtils';
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Lock,
  Sparkles,
  ArrowRight,
  Zap,
  Play,
  Clock,
  Camera,
} from 'lucide-react';

interface RestrictionModeViewProps {
  apps: DistractingApp[];
  overdueTasks: Task[];
  uninitiatedTasks?: Task[];
  onToggleApp: (appId: string) => void;
  onInitiateTask: (task: Task) => void;
  onInitiateDailyProof?: (task: Task, groupId: string) => void;
}

export const RestrictionModeView: React.FC<RestrictionModeViewProps> = ({
  apps,
  overdueTasks,
  uninitiatedTasks = [],
  onToggleApp,
  onInitiateTask,
  onInitiateDailyProof,
}) => {
  // Restriction is ON if any uninitiated task or overdue task exists
  const activeUninitiatedList = uninitiatedTasks.length > 0 ? uninitiatedTasks : overdueTasks;
  const isRestrictionActive = activeUninitiatedList.length > 0;
  const restrictedAppsCount = apps.filter((a) => a.isRestricted).length;

  const [selectedSimulatedApp, setSelectedSimulatedApp] = useState<DistractingApp | null>(null);
  const [showBlockedOverlay, setShowBlockedOverlay] = useState(false);
  const [simulatedLaunchNotice, setSimulatedLaunchNotice] = useState<string | null>(null);

  const targetInitiateTask = activeUninitiatedList[0] || null;

  const handleSimulateAppLaunch = (app: DistractingApp) => {
    setSelectedSimulatedApp(app);
    if (isRestrictionActive && app.isRestricted) {
      setShowBlockedOverlay(true);
    } else {
      setSimulatedLaunchNotice(`[Simulated Demo] ${app.name} opened smoothly. All required commitments are initiated!`);
      setTimeout(() => {
        setSimulatedLaunchNotice(null);
      }, 3500);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {simulatedLaunchNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{simulatedLaunchNotice}</span>
          <button
            onClick={() => setSimulatedLaunchNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 ml-2"
          >
            ×
          </button>
        </div>
      )}
      {/* Focus Mode Summary Card */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isRestrictionActive
            ? 'bg-rose-50/70 border-rose-200 text-[#0F172A]'
            : 'bg-emerald-50/40 border-emerald-200/80 text-[#0F172A]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isRestrictionActive
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isRestrictionActive ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Focus Shield Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    isRestrictionActive
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isRestrictionActive ? 'Restriction ON' : 'Apps Unlocked'}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#0F172A] mt-0.5">
                {isRestrictionActive
                  ? `${restrictedAppsCount} distracting apps restricted until tasks are initiated`
                  : 'All commitments initiated · Distracting apps unlocked'}
              </h2>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed">
          {isRestrictionActive
            ? 'Restriction is ON because you have commitments that are not yet initiated. Submitting camera proof for your starting step removes limits immediately.'
            : 'Focus Shield is standing by. When you create new commitments or daily deadlines pass without initiation, distracting apps are locked automatically.'}
        </p>

        {isRestrictionActive && (
          <div className="mt-3.5 pt-3.5 border-t border-rose-200 space-y-2">
            <span className="text-xs font-bold text-rose-700 block flex items-center justify-between">
              <span>Initiation Required to Unlock ({activeUninitiatedList.length}):</span>
              <span className="text-[10px] font-normal text-rose-600">Submit camera proof</span>
            </span>

            <div className="space-y-2">
              {activeUninitiatedList.map((t) => {
                const timeRem = calculateTimeRemaining(t.deadlineIso);
                const hasBreakdown = t.breakdown && t.breakdown.groups.length > 0;
                const uninitiatedGroup = hasBreakdown
                  ? t.breakdown!.groups.find((g) => g.status !== 'initiated' && !g.proof)
                  : null;

                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-white border border-rose-200/90 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#0F172A] truncate">
                            {t.title}
                          </span>
                          {t.categoryTag && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold">
                              {t.categoryTag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5">
                          <Clock className="w-3 h-3 text-[#4F46E5]" />
                          <span>
                            {t.deadlineTimeFormatted || 'Upcoming'} ·{' '}
                            {timeRem.isOverdue ? (
                              <strong className="text-rose-600">Overdue ({timeRem.formatted})</strong>
                            ) : (
                              `Due in ${timeRem.formatted}`
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onInitiateTask(t)}
                        className="py-1.5 px-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Initiate Step</span>
                      </button>
                    </div>

                    {/* Breakdown Daily Milestone Note if present */}
                    {uninitiatedGroup && (
                      <div className="p-2 rounded-lg bg-[#EEF2FF]/60 border border-[#C7D2FE] flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#4F46E5]">
                          Daily Target: {uninitiatedGroup.groupTitle}{' '}
                          {uninitiatedGroup.deadlineTimeFormatted ? `(${uninitiatedGroup.deadlineTimeFormatted})` : ''}
                        </span>
                        {onInitiateDailyProof && (
                          <button
                            type="button"
                            onClick={() => onInitiateDailyProof(t, uninitiatedGroup.id)}
                            className="text-[#4F46E5] hover:underline font-bold cursor-pointer"
                          >
                            Submit Daily Proof →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Restricted Apps List & Simulator */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-[#0F172A]">
              Choose apps to shield when focus mode activates
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold">
              {restrictedAppsCount} Shielded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {apps.map((app) => (
              <div
                key={app.id}
                onClick={() => onToggleApp(app.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  app.isRestricted
                    ? 'bg-[#EEF2FF]/60 border-[#6366F1]/30 text-[#0F172A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{app.icon}</span>
                  <div>
                    <span className="font-semibold text-xs block text-[#0F172A]">
                      {app.name}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {app.isRestricted ? 'Restricted during focus' : 'Allowed'}
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={app.isRestricted}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] border-[#CBD5E1]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Test Simulator */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-[#4F46E5]" />
            <h3 className="font-semibold text-xs text-[#0F172A]">
              Test App Intercept Simulator
            </h3>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Tap any shielded app to preview how Focus Shield prompts you to initiate your task.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {apps
              .filter((a) => a.isRestricted)
              .map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleSimulateAppLaunch(app)}
                  className="py-1.5 px-3 bg-[#F8FAFC] hover:bg-[#EEF2FF] text-[#0F172A] rounded-xl text-xs font-semibold border border-[#E2E8F0] hover:border-[#4F46E5] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{app.icon}</span>
                  <span>Launch {app.name}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Simulated Intercept Modal */}
      {showBlockedOverlay && selectedSimulatedApp && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center shadow-xl space-y-4 text-[#0F172A]">
            <div className="w-12 h-12 bg-rose-100 text-[#EF4444] rounded-2xl mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Focus Shield Active · Restriction ON
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] mt-1.5">
                {selectedSimulatedApp.name} is Blocked
              </h2>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              You cannot open {selectedSimulatedApp.name} until you take and verify your starting step with camera proof for{' '}
              <strong className="text-[#0F172A]">{targetInitiateTask?.title || 'your pending task'}</strong>.
            </p>

            <div className="space-y-2 pt-1">
              {targetInitiateTask && (
                <button
                  onClick={() => {
                    setShowBlockedOverlay(false);
                    onInitiateTask(targetInitiateTask);
                  }}
                  className="w-full py-2.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Starting Step (Camera Proof)</span>
                </button>
              )}

              <button
                onClick={() => setShowBlockedOverlay(false)}
                className="w-full py-2 px-4 bg-[#F8FAFC] hover:bg-slate-100 text-[#64748B] rounded-xl text-xs font-semibold border border-[#E2E8F0] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
