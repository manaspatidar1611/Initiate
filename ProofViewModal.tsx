import React from 'react';
import { Task, TaskBreakdownGroup, VerificationState } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  X,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface ProofViewModalProps {
  task: Task | null;
  dailyGroup?: TaskBreakdownGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onProvideAdditionalEvidence?: (task: Task) => void;
}

export const ProofViewModal: React.FC<ProofViewModalProps> = ({
  task,
  dailyGroup,
  isOpen,
  onClose,
  onProvideAdditionalEvidence,
}) => {
  if (!isOpen || !task) return null;

  const proof = dailyGroup?.proof || task.proof;
  if (!proof) return null;

  const ai = proof.aiVerification;
  const status: VerificationState =
    ai?.status ||
    (dailyGroup?.status === 'initiated' || task.status === 'initiated' ? 'verified' : 'needs_evidence');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        id="proof-view-modal"
        className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden my-auto text-[#0F172A] flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            {status === 'verified' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{dailyGroup ? `${dailyGroup.groupTitle} Proof Verified` : 'Proof Verified'}</span>
              </span>
            )}
            {status === 'needs_evidence' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>More Evidence Needed</span>
              </span>
            )}
            {status === 'rejected' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#EF4444] text-xs font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                <span>Proof Rejected</span>
              </span>
            )}
            {status === 'under_review' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFC] text-[#64748B] text-xs font-semibold border border-[#E2E8F0]">
                <Clock className="w-3.5 h-3.5" />
                <span>Under Review</span>
              </span>
            )}
          </div>

          <button
            id="btn-close-proof-view"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              {task.title} {dailyGroup ? `· ${dailyGroup.groupTitle}` : ''}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Target: {dailyGroup?.deadlineTimeFormatted || task.deadlineTimeFormatted} {task.categoryTag ? `· ${task.categoryTag}` : ''}
            </p>
          </div>

          {/* Proof Media Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0]">
            {proof.type === 'video' ? (
              <video
                src={proof.mediaUrl}
                controls
                autoPlay
                loop
                className="w-full max-h-[260px] object-cover rounded-2xl"
              />
            ) : (
              <img
                src={proof.mediaUrl}
                alt="Submitted Proof"
                className="w-full max-h-[260px] object-cover rounded-2xl"
              />
            )}

            <div className="p-2.5 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>{proof.type.toUpperCase()} Proof</span>
              </span>
              <span>Submitted at {proof.timestamp}</span>
            </div>
          </div>

          {/* Verification Status Description */}
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed ${
              status === 'verified'
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                : status === 'needs_evidence'
                ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-[#0F172A]'
            }`}
          >
            <p className="font-medium">
              {status === 'verified'
                ? 'Starting step authenticated. Active focus unlocked.'
                : ai?.statusReason || 'Your proof has been evaluated.'}
            </p>

            {status === 'needs_evidence' && ai?.additionalEvidencePrompt && (
              <div className="mt-2 pt-2 border-t border-amber-200/60 font-semibold text-[#D97706] text-[11px]">
                💡 Action needed: "{ai.additionalEvidencePrompt}"
              </div>
            )}
          </div>

          {/* AI Plan Progress if present */}
          {task.breakdown && (
            <div className="p-3 rounded-xl bg-[#EEF2FF]/50 border border-[#E0E7FF] text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#4F46E5] text-[11px]">
                <span>AI Action Plan ({task.breakdown.groups.length} Days)</span>
                <span>
                  {task.breakdown.groups.reduce((acc, g) => acc + g.items.filter((i) => i.isCompleted).length, 0)}/
                  {task.breakdown.groups.reduce((acc, g) => acc + g.items.length, 0)} completed
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Next recommended focus: {task.breakdown.groups.find(g => g.items.some(i => !i.isCompleted))?.items.find(i => !i.isCompleted)?.text || 'All steps finished!'}
              </p>
            </div>
          )}

          {/* Note if present */}
          {proof.note && (
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <span className="font-semibold text-[#64748B] block text-[10px] uppercase">
                Note
              </span>
              <p className="text-[#0F172A] mt-0.5">{proof.note}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] shrink-0 flex items-center gap-3">
          {status === 'needs_evidence' && onProvideAdditionalEvidence ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onProvideAdditionalEvidence(task);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Evidence</span>
              </button>
            </>
          ) : (
            <button
              id="btn-close-proof-modal-bottom"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] font-semibold text-xs border border-[#E2E8F0] transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
