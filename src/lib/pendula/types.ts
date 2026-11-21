export type Role = "admin" | "teacher" | "learner" | "parent";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "excused"
  | "late"
  | "closed"
  | "unscheduled";

export type LearnerStatus = "active" | "inactive" | "merged";

export type TxType =
  | "attendance"
  | "perfect_week"
  | "assessment"
  | "improvement"
  | "reading"
  | "milestone"
  | "bonus"
  | "interest"
  | "deduction"
  | "reversal"
  | "merge_transfer";

export type DeductionStatus = "pending" | "approved" | "rejected";

export interface Term {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface Holiday {
  date: string;
  name: string;
  /** School-only closure that is not a public holiday. */
  schoolOnly?: boolean;
}

export interface RewardPoints {
  attendancePresent: number;
  attendanceLate: number;
  assessmentComplete: number;
  improvementPerPoint: number;
  improvementCap: number;
  readingStage: number;
  learningMilestone: number;
  perfectWeek: number;
}

export interface InterestPolicy {
  approved: boolean;
  /** Whole-number percent per posting period. 1 means 1%. */
  ratePercent: number;
  mode: "compound" | "simple";
  minBalance: number;
  maxAward: number;
  rounding: "floor" | "nearest" | "ceil";
  suspended: boolean;
}

export interface RewardPolicy {
  version: string;
  effectiveFrom: string;
  approved: boolean;
  points: RewardPoints;
  interest: InterestPolicy;
  /** Discretionary categories stay off until an administrator enables them. */
  homeworkEnabled: boolean;
  habitsEnabled: boolean;
  programmeEnabled: boolean;
}

export interface Organisation {
  name: string;
  tagline: string;
  contactEmail: string;
  setupComplete: boolean;
  /** Rewards post only after an administrator approves the policy. */
  rewardsLive: boolean;
  academicYear: number;
  terms: Term[];
  holidays: Holiday[];
  policy: RewardPolicy;
  demoCohort: boolean;
  retentionNote: string;
}

export interface Location {
  id: string;
  name: string;
  area: string;
}

export interface School {
  id: string;
  name: string;
  locationId: string;
  phase: "primary" | "high" | "combined";
}

export interface ClassGroup {
  id: string;
  name: string;
  grade: number;
  schoolId: string;
  teacherId: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: "admin" | "teacher";
  email: string;
  pin: string;
  active: boolean;
  classIds: string[];
}

export interface ParentProfile {
  id: string;
  name: string;
  phone: string;
  pin: string;
  learnerIds: string[];
}

export interface Learner {
  id: string;
  accountNumber: string;
  firstName: string;
  middleName: string;
  surname: string;
  preferredName: string;
  dob: string;
  gender: string;
  grade: number;
  schoolId: string;
  classId: string;
  locationId: string;
  status: LearnerStatus;
  mergedInto?: string;
  homeLanguage: string;
  area: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  emergencyName: string;
  emergencyPhone: string;
  supportNote: string;
  readingEggsId: string;
  photoConsent: boolean;
  registeredAt: string;
  academicYear: number;
  portalPin: string;
  importKey: string;
}

export interface AttendanceRecord {
  id: string;
  learnerId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  actorId: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  name: string;
  subject: string;
  grade: number;
  date: string;
  type: string;
  maxScore: number;
  termId: string;
  academicYear: number;
  teacherId: string;
  /** Same series means results may be compared for improvement. */
  seriesId: string;
  outcomes: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  learnerId: string;
  score: number;
  comment: string;
  actorId: string;
  at: string;
}

export interface ReadingEvent {
  id: string;
  learnerId: string;
  previousStage: number;
  stage: number;
  date: string;
  evidence: string;
  teacherId: string;
  verified: boolean;
}

export interface LedgerTransaction {
  id: string;
  idempotencyKey: string;
  at: string;
  learnerId: string;
  type: TxType;
  direction: "credit" | "debit";
  amount: number;
  reason: string;
  ruleVersion: string;
  actorId: string;
  approverId?: string;
  linkType?: string;
  linkId?: string;
  debitAccount: string;
  creditAccount: string;
}

export interface DeductionRequest {
  id: string;
  learnerId: string;
  amount: number;
  reason: string;
  category: string;
  status: DeductionStatus;
  requesterId: string;
  reviewerId?: string;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
  txId?: string;
  linkType?: string;
  linkId?: string;
  idempotencyKey: string;
}

export interface SavingsGoal {
  id: string;
  learnerId: string;
  name: string;
  target: number;
  createdAt: string;
}

export interface BadgeAward {
  id: string;
  learnerId: string;
  code: string;
  name: string;
  reason: string;
  awardedAt: string;
}

export interface Intervention {
  id: string;
  learnerId: string;
  at: string;
  authorId: string;
  note: string;
  confidential: boolean;
}

export interface MessageLog {
  id: string;
  at: string;
  actorId: string;
  learnerId: string;
  channel: "in-app";
  kind: "birthday" | "progress" | "support" | "meeting";
  body: string;
}

export interface AppNotification {
  id: string;
  at: string;
  audience: Role;
  title: string;
  body: string;
  learnerId?: string;
  read: boolean;
}

export interface AuditEvent {
  id: string;
  at: string;
  actorId: string;
  role: Role | "system";
  action: string;
  target: string;
  detail: string;
}

export interface PendulaDB {
  version: 1;
  org: Organisation;
  locations: Location[];
  schools: School[];
  classes: ClassGroup[];
  staff: StaffMember[];
  parents: ParentProfile[];
  learners: Learner[];
  attendance: AttendanceRecord[];
  assessments: Assessment[];
  results: AssessmentResult[];
  reading: ReadingEvent[];
  transactions: LedgerTransaction[];
  deductions: DeductionRequest[];
  goals: SavingsGoal[];
  badges: BadgeAward[];
  interventions: Intervention[];
  messages: MessageLog[];
  notifications: AppNotification[];
  audit: AuditEvent[];
  integrity: string;
}

export interface Session {
  role: Role;
  staffId?: string;
  learnerId?: string;
  parentId?: string;
  /** Set when an administrator is previewing another role, so they can return. */
  returnStaffId?: string;
}

export interface Actor {
  id: string;
  role: Role | "system";
  name: string;
}

export interface StatementLine {
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
  txId: string;
}

export interface Statement {
  reference: string;
  learnerName: string;
  learnerId: string;
  accountNumber: string;
  from: string;
  to: string;
  generatedAt: string;
  opening: number;
  closing: number;
  lines: StatementLine[];
  disclaimer: string;
}
