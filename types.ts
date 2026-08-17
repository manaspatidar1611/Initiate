export type TaskStatus = 'pending' | 'initiated' | 'overdue' | 'needs_evidence' | 'under_review' | 'rejected';

export type ProofType = 'photo' | 'video' | 'document' | 'screenshot';

export type VerificationState = 'verified' | 'needs_evidence' | 'rejected' | 'under_review';

export interface EvidenceBreakdown {
  taskRelevance: number;      // 0 - 100
  evidenceStrength: number;   // 0 - 100
  ocrTextMatch: number;       // 0 - 100
  visualMatch: number;        // 0 - 100
  freshnessScore: number;     // 0 - 100
  tamperingRisk: number;      // 0 - 100 (higher = riskier)
  uniquenessScore: number;    // 0 - 100
  overallScore: number;       // 0 - 100
}

export interface AiVerificationResult {
  status: VerificationState;
  confidenceScore: number;    // 0 - 100
  statusReason: string;       // User-facing clear explanation
  detectedActivity: string;   // e.g. "Workout Summary Screen with 34-min timer"
  extractedOcrText?: string;  // Extracted text from image/document
  matchedKeywords: string[];
  breakdown: EvidenceBreakdown;
  tamperingSignals?: string[]; // e.g. ["Visual blur near timestamp", "Possible stock photo"]
  additionalEvidencePrompt?: string; // Task-specific challenge if status is 'needs_evidence'
  proofHash?: string;         // SHA-256 hash for duplicate detection
  isDuplicate?: boolean;      // True if identical or reused proof detected
  verifiedAt: string;         // ISO timestamp
}

export interface TaskProof {
  id: string;
  type: ProofType;
  mediaUrl: string;           // Base64 or Blob URL or image URL
  fileName?: string;
  fileFormat?: string;        // 'image/jpeg', 'image/png', 'application/pdf', etc.
  fileSizeBytes?: number;
  timestamp: string;          // Formatted time string e.g. "6:42 PM"
  initiatedAtDate: string;    // ISO date string
  note?: string;
  aiVerification: AiVerificationResult;
  supplementaryProofs?: TaskProof[]; // Multi-piece evidence attachments
}

export interface TaskStepItem {
  id: string;
  text: string;
  isCompleted?: boolean;
  deadlineIso?: string;
  deadlineTimeFormatted?: string;
  status?: TaskStatus;
  proof?: TaskProof;
}

export interface TaskBreakdownGroup {
  id: string;
  groupTitle: string; // e.g. "Day 1", "Day 2" or "Step 1: Setup"
  targetDate?: string; // e.g. "2026-08-16"
  deadlineIso?: string; // ISO deadline for this specific day
  deadlineTimeFormatted?: string; // e.g. "Today 8:00 PM", "Tomorrow 8:00 PM"
  status?: TaskStatus; // 'pending' | 'initiated' | 'overdue' | 'needs_evidence' | 'under_review'
  proof?: TaskProof; // Camera proof captured for this day
  cameraFacingUsed?: 'user' | 'environment';
  items: TaskStepItem[];
}

export interface TaskBreakdown {
  summary?: string;
  syllabusUsed?: boolean;
  totalDays?: number;
  groups: TaskBreakdownGroup[];
  generatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadlineIso: string;        // Full ISO string for countdown calculation
  deadlineTimeFormatted: string; // e.g. "7:00 PM"
  status: TaskStatus;
  proof?: TaskProof;
  createdAt: string;
  category?: 'fitness' | 'study' | 'coding' | 'reading' | 'chores' | 'work' | 'general';
  categoryTag?: string;       // e.g. "LEG DAY · 30 MIN", "CHAPTER 3 · 45 MIN"
  estimatedMinutes?: number;
  breakdown?: TaskBreakdown;  // Optional AI Action Breakdown
}

export interface DistractingApp {
  id: string;
  name: string;
  packageName: string;
  icon: string;               // Lucide icon name or emoji
  isRestricted: boolean;
}

export type ViewMode = 'home' | 'tasks' | 'focus' | 'momentum' | 'restrictions' | 'profile' | 'flutter-guide';
