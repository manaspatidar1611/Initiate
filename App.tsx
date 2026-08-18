import React, { useState, useEffect } from 'react';
import { Task, DistractingApp, ViewMode, TaskProof, TaskBreakdownGroup } from './types';
import { INITIAL_TASKS, INITIAL_DISTRACTING_APPS } from './data/sampleData';
import { calculateTimeRemaining } from './utils/timeUtils';
import { Header } from './components/Header';
import { HeroInitiationCard } from './components/HeroInitiationCard';
import { TaskCard } from './components/TaskCard';
import { BottomNavBar } from './components/BottomNavBar';
import { AddTaskModal } from './components/AddTaskModal';
import { InitiateProofModal } from './components/InitiateProofModal';
import { ProofViewModal } from './components/ProofViewModal';
import { RestrictionModeView } from './components/RestrictionModeView';
import { MomentumView } from './components/MomentumView';
import { ProfileView } from './components/ProfileView';
import { DeviceFrame } from './components/DeviceFrame';
import {
  ShieldAlert,
  Flame,
  Plus,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react';

export function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('initiate_study_tasks_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    return INITIAL_TASKS;
  });

  const [apps, setApps] = useState<DistractingApp[]>(() => {
    const saved = localStorage.getItem('initiate_apps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved apps', e);
      }
    }
    return INITIAL_DISTRACTING_APPS;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'initiated'>('all');
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(false);

  // Modal states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [initiatingTask, setInitiatingTask] = useState<Task | null>(null);
  const [initiatingDailyGroupId, setInitiatingDailyGroupId] = useState<string | undefined>(undefined);
  const [viewingProofTask, setViewingProofTask] = useState<Task | null>(null);
  const [viewingProofDailyGroup, setViewingProofDailyGroup] = useState<TaskBreakdownGroup | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('initiate_study_tasks_v3', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('initiate_apps', JSON.stringify(apps));
  }, [apps]);

  // Derived task counts
  const pendingTasks = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'needs_evidence' || t.status === 'under_review'
  );
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'initiated') return false;
    if (t.status === 'overdue') return true;
    return calculateTimeRemaining(t.deadlineIso).isOverdue;
  });
  const initiatedTasks = tasks.filter((t) => t.status === 'initiated');

  // Most urgent task for the Hero card
  const urgentTask =
    overdueTasks[0] ||
    pendingTasks.sort(
      (a, b) => new Date(a.deadlineIso).getTime() - new Date(b.deadlineIso).getTime()
    )[0] ||
    null;

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      categoryTag: newTaskData.categoryTag || 'FOCUS COMMITMENT',
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleInitiateClick = (task: Task) => {
    setInitiatingTask(task);
    setInitiatingDailyGroupId(undefined);
  };

  const handleInitiateDailyProof = (task: Task, groupId: string) => {
    setInitiatingTask(task);
    setInitiatingDailyGroupId(groupId);
  };

  const handleViewDailyProof = (task: Task, group: TaskBreakdownGroup) => {
    setViewingProofTask(task);
    setViewingProofDailyGroup(group);
  };

  const handleSubmitProof = (taskId: string, proof: TaskProof, groupId?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isVerified = proof.aiVerification.status === 'verified';
          const newStatus =
            isVerified
              ? 'initiated'
              : proof.aiVerification.status === 'needs_evidence'
              ? 'needs_evidence'
              : proof.aiVerification.status === 'under_review'
              ? 'under_review'
              : 'overdue';

          let updatedBreakdown = t.breakdown;
          if (t.breakdown && groupId) {
            updatedBreakdown = {
              ...t.breakdown,
              groups: t.breakdown.groups.map((g) => {
                if (g.id === groupId) {
                  return {
                    ...g,
                    proof,
                    status: (isVerified ? 'initiated' : proof.aiVerification.status) as any,
                  };
                }
                return g;
              }),
            };
          }

          return {
            ...t,
            status: groupId ? (isVerified ? 'initiated' : t.status) : newStatus,
            proof: !groupId || !t.proof ? proof : t.proof,
            breakdown: updatedBreakdown,
          };
        }
        return t;
      })
    );
    setInitiatingTask(null);
    setInitiatingDailyGroupId(undefined);
  };

  const handleToggleApp = (appId: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, isRestricted: !a.isRestricted } : a))
    );
  };

  const handleToggleStep = (taskId: string, groupId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.breakdown) {
          return {
            ...t,
            breakdown: {
              ...t.breakdown,
              groups: t.breakdown.groups.map((g) => {
                if (g.id === groupId) {
                  return {
                    ...g,
                    items: g.items.map((item) => {
                      if (item.id === itemId) {
                        return { ...item, isCompleted: !item.isCompleted };
                      }
                      return item;
                    }),
                  };
                }
                return g;
              }),
            },
          };
        }
        return t;
      })
    );
  };

  // Filtered task list
  const filteredTasks = tasks.filter((t) => {
    const isOverdue = t.status !== 'initiated' && calculateTimeRemaining(t.deadlineIso).isOverdue;
    if (filter === 'pending') return t.status !== 'initiated' && !isOverdue;
    if (filter === 'overdue') return isOverdue || t.status === 'overdue';
    if (filter === 'initiated') return t.status === 'initiated';
    return true;
  });

  return (
    <DeviceFrame isFrameActive={isDeviceFrame}>
      <div className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A]">
        {/* Navigation & Header Bar */}
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          pendingCount={pendingTasks.length}
          initiatedCount={initiatedTasks.length}
          overdueCount={overdueTasks.length}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          isDeviceFrame={isDeviceFrame}
          onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-4 pb-20">
          {currentView === 'home' ? (
            <div className="space-y-4">
              {/* Focus Mode Notification Card (Productivity-first tone, light pink/danger background) */}
              {overdueTasks.length > 0 && (
                <div className="p-4 bg-[#FEF2F2] border border-rose-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#0F172A] shadow-2xs animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-100 text-[#EF4444] shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#0F172A]">
                        Focus Mode
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                        {overdueTasks.length} overdue task is limiting distracting apps until you initiate your starting step.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('restrictions')}
                    className="py-2 px-3.5 bg-white hover:bg-slate-50 text-[#0F172A] border border-rose-200 font-semibold rounded-xl text-xs shadow-2xs shrink-0 cursor-pointer transition-all self-end sm:self-center"
                  >
                    View Restricted Apps
                  </button>
                </div>
              )}

              {/* The Initiation Principle Hero Section */}
              <HeroInitiationCard
                urgentTask={urgentTask}
                onInitiateTask={handleInitiateClick}
                onOpenAddTask={() => setIsAddTaskOpen(true)}
                streakDays={3}
                initiationRate={
                  tasks.length > 0
                    ? Math.round((initiatedTasks.length / tasks.length) * 100)
                    : 100
                }
              />

              {/* Subtle Momentum Reinforcement */}
              <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-[#0F172A]">
                    Today's Momentum:
                  </span>
                  <span className="text-[#64748B]">
                    {initiatedTasks.length} / {tasks.length} tasks started
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>3-day momentum</span>
                </div>
              </div>

              {/* Task Filter Segmented Control */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-2">
                  {/* Clean Segmented Control */}
                  <div className="p-1 bg-[#F1F5F9] rounded-xl flex items-center gap-1 text-xs">
                    <button
                      onClick={() => setFilter('all')}
                      className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                        filter === 'all'
                          ? 'bg-[#4F46E5] text-white shadow-2xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      All {tasks.length}
                    </button>

                    <button
                      onClick={() => setFilter('pending')}
                      className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                        filter === 'pending'
                          ? 'bg-[#4F46E5] text-white shadow-2xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      Pending {pendingTasks.length}
                    </button>

                    <button
                      onClick={() => setFilter('overdue')}
                      className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                        filter === 'overdue'
                          ? 'bg-[#4F46E5] text-white shadow-2xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      Overdue {overdueTasks.length}
                    </button>

                    <button
                      onClick={() => setFilter('initiated')}
                      className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                        filter === 'initiated'
                          ? 'bg-[#4F46E5] text-white shadow-2xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      Completed {initiatedTasks.length}
                    </button>
                  </div>

                  <button
                    id="btn-add-task-shortcut"
                    onClick={() => setIsAddTaskOpen(true)}
                    className="p-2 bg-white hover:bg-[#F8FAFC] text-[#4F46E5] border border-[#E2E8F0] rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
                    title="Create Commitment"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Task Cards List */}
                {filteredTasks.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onInitiate={handleInitiateClick}
                        onViewProof={(t) => {
                          setViewingProofTask(t);
                          setViewingProofDailyGroup(null);
                        }}
                        onInitiateDailyProof={handleInitiateDailyProof}
                        onViewDailyProof={handleViewDailyProof}
                        onToggleStep={handleToggleStep}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
                    <Clock className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
                    <h3 className="font-semibold text-[#0F172A] text-xs">No tasks in this filter</h3>
                    <p className="text-[11px] text-[#64748B] mt-0.5 mb-3">
                      Add a task or switch tabs to see your commitments.
                    </p>
                    <button
                      onClick={() => setIsAddTaskOpen(true)}
                      className="py-2 px-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Commitment</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : currentView === 'tasks' ? (
            /* Dedicated Tasks View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">All Commitments</h2>
                  <p className="text-xs text-[#64748B]">Manage your tasks and starting step windows</p>
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="py-2 px-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Task Filter Segmented Control */}
              <div className="p-1 bg-[#F1F5F9] rounded-xl flex items-center gap-1 text-xs">
                <button
                  onClick={() => setFilter('all')}
                  className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-[#4F46E5] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  All {tasks.length}
                </button>

                <button
                  onClick={() => setFilter('pending')}
                  className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'pending'
                      ? 'bg-[#4F46E5] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Pending {pendingTasks.length}
                </button>

                <button
                  onClick={() => setFilter('overdue')}
                  className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'overdue'
                      ? 'bg-[#4F46E5] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Overdue {overdueTasks.length}
                </button>

                <button
                  onClick={() => setFilter('initiated')}
                  className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'initiated'
                      ? 'bg-[#4F46E5] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Completed {initiatedTasks.length}
                </button>
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onInitiate={handleInitiateClick}
                    onViewProof={(t) => {
                      setViewingProofTask(t);
                      setViewingProofDailyGroup(null);
                    }}
                    onInitiateDailyProof={handleInitiateDailyProof}
                    onViewDailyProof={handleViewDailyProof}
                    onToggleStep={handleToggleStep}
                  />
                ))}
              </div>
            </div>
          ) : currentView === 'momentum' ? (
            <MomentumView
              tasks={tasks}
              onViewProof={(t) => {
                setViewingProofTask(t);
                setViewingProofDailyGroup(null);
              }}
              onInitiateTask={handleInitiateClick}
            />
          ) : currentView === 'profile' ? (
            <ProfileView
              tasks={tasks}
              streakDays={3}
              onViewRestrictions={() => setCurrentView('restrictions')}
              onResetToStudyTask={() => {
                setTasks(INITIAL_TASKS);
                setCurrentView('home');
              }}
            />
          ) : (
            <RestrictionModeView
              apps={apps}
              overdueTasks={overdueTasks}
              uninitiatedTasks={tasks.filter((t) => t.status !== 'initiated')}
              onToggleApp={handleToggleApp}
              onInitiateTask={(t) => {
                setCurrentView('home');
                setInitiatingTask(t);
              }}
              onInitiateDailyProof={(t, groupId) => {
                setCurrentView('home');
                handleInitiateDailyProof(t, groupId);
              }}
            />
          )}
        </main>

        {/* Minimal Bottom Navigation Bar */}
        <BottomNavBar
          currentView={currentView}
          onViewChange={setCurrentView}
          pendingCount={pendingTasks.length}
          overdueCount={overdueTasks.length}
          streakDays={3}
        />

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
          onAddTask={handleAddTask}
        />

        {/* Initiate Proof Modal (Strict background verification UX with Front/Back camera support) */}
        <InitiateProofModal
          task={initiatingTask}
          groupId={initiatingDailyGroupId}
          isOpen={!!initiatingTask}
          onClose={() => {
            setInitiatingTask(null);
            setInitiatingDailyGroupId(undefined);
          }}
          onSubmitProof={handleSubmitProof}
        />

        {/* View Proof Detail Modal */}
        <ProofViewModal
          task={viewingProofTask}
          dailyGroup={viewingProofDailyGroup}
          isOpen={!!viewingProofTask}
          onClose={() => {
            setViewingProofTask(null);
            setViewingProofDailyGroup(null);
          }}
          onProvideAdditionalEvidence={(taskToRetry) => {
            setViewingProofTask(null);
            setViewingProofDailyGroup(null);
            setInitiatingTask(taskToRetry);
          }}
        />
      </div>
    </DeviceFrame>
  );
}

export default App;
