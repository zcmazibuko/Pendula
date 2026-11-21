import {
  ageOn,
  dayKind,
  isoDate,
  monthEnd,
  monthKey,
  monthsBetween,
  schoolDaysOfWeek,
} from "./calendar.ts";
import type {
  Actor,
  Assessment,
  AssessmentResult,
  AttendanceRecord,
  AttendanceStatus,
  AuditEvent,
  BadgeAward,
  DeductionRequest,
  InterestPolicy,
  Learner,
  LedgerTransaction,
  PendulaDB,
  ReadingEvent,
  RewardPolicy,
  Role,
  Statement,
  TxType,
} from "./types.ts";

export const DISCLAIMER =
  "Virtual educational points only. Not a real bank account, not rand, and not a monetary deposit.";

export const DEFAULT_POLICY: RewardPolicy = {
  version: "2026.1",
  effectiveFrom: "2026-01-14",
  approved: false,
  points: {
    attendancePresent: 10,
    attendanceLate: 5,
    assessmentComplete: 20,
    improvementPerPoint: 5,
    improvementCap: 50,
    readingStage: 30,
    learningMilestone: 15,
    perfectWeek: 20,
  },
  interest: {
    approved: false,
    ratePercent: 1,
    mode: "compound",
    minBalance: 0,
    maxAward: 500,
    rounding: "nearest",
    suspended: false,
  },
  homeworkEnabled: false,
  habitsEnabled: false,
  programmeEnabled: false,
};

export function uid(prefix: string): string {
  const a = Math.random().toString(36).slice(2, 8);
  const b = Date.now().toString(36).slice(-4);
  return `${prefix}-${a}${b}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function learnerLabel(l: Pick<Learner, "preferredName" | "firstName" | "surname">): string {
  return `${l.preferredName || l.firstName} ${l.surname}`.trim();
}

export function fullName(l: Pick<Learner, "firstName" | "middleName" | "surname">): string {
  return [l.firstName, l.middleName, l.surname].filter(Boolean).join(" ");
}

export function nextSequence(existing: string[], year: number, prefix: string): string {
  let max = 0;
  const re = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  for (const id of existing) {
    const m = re.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${year}-${String(max + 1).padStart(5, "0")}`;
}

export function normaliseName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[b.length];
}

function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  const max = Math.max(a.length, b.length);
  if (!max) return 1;
  return 1 - levenshtein(a, b) / max;
}

export interface DuplicateHit {
  learnerId: string;
  confidence: number;
  level: "confirmed" | "possible";
  reasons: string[];
}

export function findDuplicates(
  learners: Learner[],
  draft: {
    firstName: string;
    surname: string;
    dob: string;
    schoolId?: string;
    grade?: number;
    guardianPhone?: string;
  },
  ignoreId?: string,
): DuplicateHit[] {
  const first = normaliseName(draft.firstName);
  const surname = normaliseName(draft.surname);
  const phone = (draft.guardianPhone || "").replace(/\D/g, "");
  const hits: DuplicateHit[] = [];
  for (const learner of learners) {
    if (learner.id === ignoreId || learner.status === "merged") continue;
    const reasons: string[] = [];
    let score = 0;
    const sameDob = Boolean(draft.dob) && learner.dob === draft.dob;
    const fn = similarity(first, normaliseName(learner.firstName));
    const sn = similarity(surname, normaliseName(learner.surname));
    const pn = similarity(first, normaliseName(learner.preferredName));
    const nameScore = Math.max(fn, pn);
    if (sameDob && nameScore > 0.92 && sn > 0.92) {
      score = 0.97;
      reasons.push("Same date of birth and a matching name");
    } else if (sameDob && sn > 0.9 && nameScore > 0.8) {
      score = 0.86;
      reasons.push("Same date of birth and a very similar name");
    } else if (sameDob && sn > 0.84) {
      score = 0.72;
      reasons.push("Same date of birth and a similar surname");
    } else if (nameScore > 0.95 && sn > 0.95 && !sameDob) {
      score = 0.6;
      reasons.push("Name matches, but the date of birth differs — check before treating this as the same child");
    }
    const theirPhone = learner.guardianPhone.replace(/\D/g, "");
    if (phone && theirPhone && phone === theirPhone && sn > 0.8) {
      score = Math.max(score, 0.78);
      reasons.push("Guardian phone number matches");
    }
    if (score >= 0.55 && draft.schoolId && learner.schoolId === draft.schoolId && learner.grade === draft.grade) {
      score = Math.min(0.99, score + 0.04);
      reasons.push("Same school and grade");
    }
    if (score >= 0.55) {
      hits.push({
        learnerId: learner.id,
        confidence: Math.round(score * 100) / 100,
        level: score >= 0.9 ? "confirmed" : "possible",
        reasons,
      });
    }
  }
  return hits.sort((a, b) => b.confidence - a.confidence);
}

export function fingerprint(db: Pick<PendulaDB, "transactions" | "learners" | "deductions">): string {
  const body = db.transactions
    .map(
      (t) =>
        `${t.id}|${t.idempotencyKey}|${t.learnerId}|${t.direction}|${t.amount}|${t.type}|${t.debitAccount}|${t.creditAccount}`,
    )
    .join("\n");
  let h = 2166136261;
  const extra = `${db.learners.length}:${db.deductions.length}:`;
  const s = extra + body;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function stamp(db: PendulaDB): PendulaDB {
  return { ...db, integrity: fingerprint(db) };
}

export function integrityOk(db: PendulaDB): boolean {
  return db.integrity === fingerprint(db);
}

export function pushAudit(
  db: PendulaDB,
  actor: Actor,
  action: string,
  target: string,
  detail: string,
  at = nowIso(),
): AuditEvent {
  const event: AuditEvent = {
    id: uid("aud"),
    at,
    actorId: actor.id,
    role: actor.role,
    action,
    target,
    detail,
  };
  db.audit = [event, ...db.audit].slice(0, 2000);
  return event;
}

export function notify(
  db: PendulaDB,
  audience: Role,
  title: string,
  body: string,
  learnerId?: string,
): void {
  db.notifications = [
    {
      id: uid("ntf"),
      at: nowIso(),
      audience,
      title,
      body,
      learnerId,
      read: false,
    },
    ...db.notifications,
  ].slice(0, 400);
}

export function roundPoints(value: number, mode: InterestPolicy["rounding"]): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (mode === "floor") return Math.floor(value + 1e-9);
  if (mode === "ceil") return Math.ceil(value - 1e-9);
  return Math.round(value);
}

export function accountIdsFor(db: PendulaDB, learnerId: string): Set<string> {
  const ids = new Set<string>([learnerId]);
  for (const learner of db.learners) {
    if (learner.mergedInto && ids.has(learner.mergedInto)) ids.add(learner.id);
    if (learner.mergedInto === learnerId) ids.add(learner.id);
  }
  // Include chains one more hop.
  let grew = true;
  while (grew) {
    grew = false;
    for (const learner of db.learners) {
      if (learner.mergedInto && ids.has(learner.id) && !ids.has(learner.mergedInto)) {
        ids.add(learner.mergedInto);
        grew = true;
      }
      if (learner.mergedInto && ids.has(learner.mergedInto) && !ids.has(learner.id)) {
        ids.add(learner.id);
        grew = true;
      }
    }
  }
  return ids;
}

export function transactionsFor(db: PendulaDB, learnerId: string): LedgerTransaction[] {
  const ids = accountIdsFor(db, learnerId);
  return db.transactions.filter((t) => ids.has(t.learnerId));
}

export function balanceOf(db: PendulaDB, learnerId: string, asOf?: string): number {
  let total = 0;
  for (const tx of transactionsFor(db, learnerId)) {
    if (asOf && tx.at.slice(0, 10) > asOf) continue;
    total += tx.direction === "credit" ? tx.amount : -tx.amount;
  }
  return total;
}

export function balanceParts(db: PendulaDB, learnerId: string): {
  balance: number;
  earned: number;
  deductions: number;
  interest: number;
} {
  let earned = 0;
  let deductions = 0;
  let interest = 0;
  for (const tx of transactionsFor(db, learnerId)) {
    if (tx.direction === "credit") {
      if (tx.type === "interest") interest += tx.amount;
      else earned += tx.amount;
    } else {
      deductions += tx.amount;
    }
  }
  return { balance: earned + interest - deductions, earned, deductions, interest };
}

function ledgerInvariant(tx: LedgerTransaction): string | null {
  if (!Number.isInteger(tx.amount) || tx.amount <= 0) return "Amount must be a positive whole number of points";
  if (!tx.debitAccount || !tx.creditAccount || tx.debitAccount === tx.creditAccount) {
    return "Each transaction needs two different ledger accounts";
  }
  if (tx.direction === "credit" && !tx.creditAccount.startsWith("learner:")) {
    return "A credit must land in a learner account";
  }
  if (tx.direction === "debit" && !tx.debitAccount.startsWith("learner:")) {
    return "A debit must leave a learner account";
  }
  return null;
}

export function postTransaction(
  db: PendulaDB,
  input: {
    idempotencyKey: string;
    at?: string;
    learnerId: string;
    type: TxType;
    direction: "credit" | "debit";
    amount: number;
    reason: string;
    actor: Actor;
    approverId?: string;
    linkType?: string;
    linkId?: string;
    contra: string;
  },
): { tx?: LedgerTransaction; duplicate: boolean; error?: string } {
  const existing = db.transactions.find((t) => t.idempotencyKey === input.idempotencyKey);
  if (existing) return { tx: existing, duplicate: true };
  const learner = db.learners.find((l) => l.id === input.learnerId);
  if (!learner) return { duplicate: false, error: "Learner not found" };
  if (learner.status === "merged") return { duplicate: false, error: "This record was merged into another learner" };
  if (learner.status === "inactive" && input.direction === "credit" && input.type !== "reversal" && input.type !== "merge_transfer") {
    return { duplicate: false, error: "Inactive learners cannot earn new points" };
  }
  const amount = Math.trunc(input.amount);
  if (amount <= 0) return { duplicate: false, error: "Nothing to post" };
  if (input.direction === "debit") {
    const available = balanceOf(db, input.learnerId);
    if (amount > available) {
      return { duplicate: false, error: `That would take the balance below zero. Available points: ${available}.` };
    }
  }
  const tx: LedgerTransaction = {
    id: uid("tx"),
    idempotencyKey: input.idempotencyKey,
    at: input.at || nowIso(),
    learnerId: input.learnerId,
    type: input.type,
    direction: input.direction,
    amount,
    reason: input.reason,
    ruleVersion: db.org.policy.version,
    actorId: input.actor.id,
    approverId: input.approverId,
    linkType: input.linkType,
    linkId: input.linkId,
    debitAccount: input.direction === "credit" ? input.contra : `learner:${input.learnerId}`,
    creditAccount: input.direction === "credit" ? `learner:${input.learnerId}` : input.contra,
  };
  const problem = ledgerInvariant(tx);
  if (problem) return { duplicate: false, error: problem };
  db.transactions = [...db.transactions, tx];
  return { tx, duplicate: false };
}

export function rewardsReady(db: PendulaDB): string | null {
  if (!db.org.rewardsLive || !db.org.policy.approved) {
    return "Rewards are not live yet. An administrator must approve the points policy first.";
  }
  return null;
}

function pointsForStatus(policy: RewardPolicy, status: AttendanceStatus): number {
  if (status === "present") return policy.points.attendancePresent;
  if (status === "late") return policy.points.attendanceLate;
  return 0;
}

function netLinked(db: PendulaDB, linkType: string, linkId: string): number {
  let net = 0;
  for (const tx of db.transactions) {
    if (tx.linkType === linkType && tx.linkId === linkId) {
      net += tx.direction === "credit" ? tx.amount : -tx.amount;
    }
  }
  return net;
}

function ensureAttendanceDeduction(
  db: PendulaDB,
  learnerId: string,
  attendanceId: string,
  amount: number,
  reason: string,
  actor: Actor,
): boolean {
  if (amount <= 0) return false;
  const key = `ded-att:${attendanceId}:${amount}`;
  const existing = db.deductions.find((d) => d.idempotencyKey === key);
  if (existing) return false;
  const request: DeductionRequest = {
    id: uid("ded"),
    learnerId,
    amount,
    reason,
    category: "attendance_correction",
    status: "pending",
    requesterId: actor.id,
    createdAt: nowIso(),
    linkType: "attendance",
    linkId: attendanceId,
    idempotencyKey: key,
  };
  db.deductions = [request, ...db.deductions];
  notify(
    db,
    "admin",
    "Attendance correction needs approval",
    `${amount} points may be reversed. ${reason}`,
    learnerId,
  );
  return true;
}

function maybePerfectWeek(db: PendulaDB, learnerId: string, date: string, actor: Actor): void {
  const days = schoolDaysOfWeek(date, db.org.terms, db.org.holidays);
  if (!days.length || date !== days[days.length - 1]) return;
  const marks = days.map((day) => db.attendance.find((a) => a.learnerId === learnerId && a.date === day));
  if (marks.some((m) => !m || m.status !== "present")) return;
  const week = days[0];
  postTransaction(db, {
    idempotencyKey: `week:${learnerId}:${week}`,
    learnerId,
    type: "perfect_week",
    direction: "credit",
    amount: db.org.policy.points.perfectWeek,
    reason: `Perfect attendance for the school week of ${week}`,
    actor,
    linkType: "week",
    linkId: week,
    contra: "sys:rewards-attendance",
  });
}

export function saveAttendance(
  db: PendulaDB,
  input: {
    classId: string;
    date: string;
    marks: { learnerId: string; status: AttendanceStatus }[];
    actor: Actor;
  },
): { error?: string; posted: number; unchanged: number; corrections: number } {
  if (input.actor.role !== "admin" && input.actor.role !== "teacher") {
    return { error: "Only staff can record attendance", posted: 0, unchanged: 0, corrections: 0 };
  }
  const kind = dayKind(input.date, db.org.terms, db.org.holidays);
  if (kind !== "school") {
    const label =
      kind === "weekend" ? "a weekend" : kind === "holiday" ? "a public or school holiday" : "outside the configured term";
    return {
      error: `${input.date} is ${label}. Attendance points are not awarded. You can still note a closure from the calendar.`,
      posted: 0,
      unchanged: 0,
      corrections: 0,
    };
  }
  const blocked = rewardsReady(db);
  const cls = db.classes.find((c) => c.id === input.classId);
  if (!cls) return { error: "Class not found", posted: 0, unchanged: 0, corrections: 0 };
  if (input.actor.role === "teacher") {
    const staff = db.staff.find((s) => s.id === input.actor.id);
    if (!staff?.classIds.includes(input.classId)) {
      return { error: "This class is not assigned to you", posted: 0, unchanged: 0, corrections: 0 };
    }
  }
  let posted = 0;
  let unchanged = 0;
  let corrections = 0;
  for (const mark of input.marks) {
    const learner = db.learners.find((l) => l.id === mark.learnerId);
    if (!learner || learner.classId !== input.classId || learner.status !== "active") continue;
    let rec = db.attendance.find((a) => a.learnerId === learner.id && a.date === input.date);
    if (rec && rec.status === mark.status) {
      unchanged += 1;
      continue;
    }
    if (!rec) {
      rec = {
        id: uid("att"),
        learnerId: learner.id,
        classId: input.classId,
        date: input.date,
        status: mark.status,
        actorId: input.actor.id,
        updatedAt: nowIso(),
      };
      db.attendance = [...db.attendance, rec];
    } else {
      rec = { ...rec, status: mark.status, actorId: input.actor.id, updatedAt: nowIso() };
      db.attendance = db.attendance.map((a) => (a.id === rec!.id ? rec! : a));
    }
    pushAudit(db, input.actor, "attendance.record", rec.id, `${learner.id} ${input.date} marked ${mark.status}`);
    if (blocked) continue;
    const target = pointsForStatus(db.org.policy, mark.status);
    const net = netLinked(db, "attendance", rec.id);
    if (target > net) {
      const result = postTransaction(db, {
        idempotencyKey: `att:${learner.id}:${input.date}:credit:${net}->${target}`,
        at: `${input.date}T15:00:00.000Z`,
        learnerId: learner.id,
        type: "attendance",
        direction: "credit",
        amount: target - net,
        reason: mark.status === "late" ? `Late attendance on ${input.date}` : `Attendance on ${input.date}`,
        actor: input.actor,
        linkType: "attendance",
        linkId: rec.id,
        contra: "sys:rewards-attendance",
      });
      if (result.tx && !result.duplicate) posted += 1;
    } else if (target < net) {
      const created = ensureAttendanceDeduction(
        db,
        learner.id,
        rec.id,
        net - target,
        `Attendance on ${input.date} changed to ${mark.status}. ${net - target} points need an administrator before they leave the account.`,
        input.actor,
      );
      if (created) corrections += 1;
    }
    if (!blocked && mark.status === "present") maybePerfectWeek(db, learner.id, input.date, input.actor);
  }
  return { posted, unchanged, corrections };
}

export function percentage(score: number, max: number): number {
  if (max <= 0) return 0;
  return (score / max) * 100;
}

/** Percentage-point improvement, not a relative percentage change. */
export function improvementPoints(previousPct: number, currentPct: number, perPoint: number, cap: number): number {
  const delta = Math.floor(currentPct - previousPct + 1e-9);
  if (delta <= 0) return 0;
  return Math.min(cap, delta * perPoint);
}

export function createAssessment(
  db: PendulaDB,
  input: Omit<Assessment, "id">,
  actor: Actor,
): { error?: string; assessment?: Assessment } {
  if (actor.role !== "admin" && actor.role !== "teacher") return { error: "Only staff can create assessments" };
  if (!input.name.trim() || !input.subject.trim()) return { error: "Name and subject are required" };
  if (!Number.isFinite(input.maxScore) || input.maxScore <= 0) return { error: "Maximum score must be greater than zero" };
  const assessment: Assessment = { ...input, id: uid("asm"), name: input.name.trim(), subject: input.subject.trim() };
  db.assessments = [assessment, ...db.assessments];
  pushAudit(db, actor, "assessment.create", assessment.id, `${assessment.subject}: ${assessment.name}`);
  return { assessment };
}

export function saveResults(
  db: PendulaDB,
  assessmentId: string,
  rows: { learnerId: string; score: number; comment: string }[],
  actor: Actor,
): { error?: string; participation: number; improvement: number } {
  if (actor.role !== "admin" && actor.role !== "teacher") {
    return { error: "Only staff can mark assessments", participation: 0, improvement: 0 };
  }
  const assessment = db.assessments.find((a) => a.id === assessmentId);
  if (!assessment) return { error: "Assessment not found", participation: 0, improvement: 0 };
  const blocked = rewardsReady(db);
  for (const row of rows) {
    if (!Number.isFinite(row.score) || row.score < 0 || row.score > assessment.maxScore) {
      return { error: "A score is outside the allowed range", participation: 0, improvement: 0 };
    }
  }
  let participation = 0;
  let improvement = 0;
  for (const row of rows) {
    const learner = db.learners.find((l) => l.id === row.learnerId && l.status === "active");
    if (!learner) continue;
    const existing = db.results.find((r) => r.assessmentId === assessmentId && r.learnerId === learner.id);
    if (existing) {
      db.results = db.results.map((r) =>
        r.id === existing.id ? { ...r, score: row.score, comment: row.comment, actorId: actor.id, at: nowIso() } : r,
      );
    } else {
      const created: AssessmentResult = {
        id: uid("res"),
        assessmentId,
        learnerId: learner.id,
        score: row.score,
        comment: row.comment,
        actorId: actor.id,
        at: nowIso(),
      };
      db.results = [...db.results, created];
    }
    pushAudit(db, actor, "assessment.mark", assessmentId, `${learner.id} scored ${row.score}/${assessment.maxScore}`);
    if (blocked) continue;
    const part = postTransaction(db, {
      idempotencyKey: `ass-part:${assessmentId}:${learner.id}`,
      at: `${assessment.date}T16:00:00.000Z`,
      learnerId: learner.id,
      type: "assessment",
      direction: "credit",
      amount: db.org.policy.points.assessmentComplete,
      reason: `Completed ${assessment.subject}: ${assessment.name}`,
      actor,
      linkType: "assessment",
      linkId: assessmentId,
      contra: "sys:rewards-assessment",
    });
    if (part.tx && !part.duplicate) participation += 1;
    if (!assessment.seriesId) continue;
    const prior = previousComparable(db, assessment, learner.id);
    if (!prior) continue;
    const prevPct = percentage(prior.score, prior.maxScore);
    const currPct = percentage(row.score, assessment.maxScore);
    const award = improvementPoints(
      prevPct,
      currPct,
      db.org.policy.points.improvementPerPoint,
      db.org.policy.points.improvementCap,
    );
    if (award <= 0) continue;
    const imp = postTransaction(db, {
      idempotencyKey: `ass-imp:${assessmentId}:${learner.id}`,
      at: `${assessment.date}T16:05:00.000Z`,
      learnerId: learner.id,
      type: "improvement",
      direction: "credit",
      amount: award,
      reason: `${assessment.subject} improved by ${Math.floor(currPct - prevPct)} percentage points (capped at ${db.org.policy.points.improvementCap})`,
      actor,
      linkType: "assessment",
      linkId: assessmentId,
      contra: "sys:rewards-improvement",
    });
    if (imp.tx && !imp.duplicate) improvement += 1;
  }
  awardBadges(db);
  return { participation, improvement };
}

function previousComparable(
  db: PendulaDB,
  assessment: Assessment,
  learnerId: string,
): { score: number; maxScore: number } | null {
  const earlier = db.assessments
    .filter(
      (a) =>
        a.id !== assessment.id &&
        a.seriesId === assessment.seriesId &&
        a.subject === assessment.subject &&
        a.grade === assessment.grade &&
        a.date <= assessment.date,
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const candidate of earlier) {
    const result = db.results.find((r) => r.assessmentId === candidate.id && r.learnerId === learnerId);
    if (result) return { score: result.score, maxScore: candidate.maxScore };
  }
  return null;
}

export function recordReading(
  db: PendulaDB,
  input: { learnerId: string; stage: number; date: string; evidence: string; actor: Actor },
): { error?: string; awarded: number; stages: number[] } {
  if (input.actor.role !== "admin" && input.actor.role !== "teacher") {
    return { error: "Only staff can verify Reading Eggs progress", awarded: 0, stages: [] };
  }
  const learner = db.learners.find((l) => l.id === input.learnerId && l.status === "active");
  if (!learner) return { error: "Learner not found", awarded: 0, stages: [] };
  if (!Number.isInteger(input.stage) || input.stage < 1 || input.stage > 400) {
    return { error: "Enter a whole stage number", awarded: 0, stages: [] };
  }
  const history = db.reading.filter((r) => r.learnerId === learner.id).sort((a, b) => a.stage - b.stage);
  const previous = history.length ? Math.max(...history.map((r) => r.stage)) : 0;
  if (input.stage <= previous) {
    return {
      error: previous
        ? `Stage ${previous} is already verified. A repeated report does not earn points again.`
        : "Enter the new stage number.",
      awarded: 0,
      stages: [],
    };
  }
  const event: ReadingEvent = {
    id: uid("rd"),
    learnerId: learner.id,
    previousStage: previous,
    stage: input.stage,
    date: input.date,
    evidence: input.evidence.trim(),
    teacherId: input.actor.id,
    verified: true,
  };
  db.reading = [...db.reading, event];
  pushAudit(
    db,
    input.actor,
    "reading.verify",
    event.id,
    `${learner.id} stage ${previous} → ${input.stage}. ${input.evidence}`,
  );
  const blocked = rewardsReady(db);
  const stages: number[] = [];
  let awarded = 0;
  if (!blocked) {
    for (let stage = previous + 1; stage <= input.stage; stage++) {
      const result = postTransaction(db, {
        idempotencyKey: `read:${learner.id}:stage:${stage}`,
        at: `${input.date}T17:00:00.000Z`,
        learnerId: learner.id,
        type: "reading",
        direction: "credit",
        amount: db.org.policy.points.readingStage,
        reason: `Reading Eggs stage ${stage} verified`,
        actor: input.actor,
        linkType: "reading",
        linkId: event.id,
        contra: "sys:rewards-reading",
      });
      if (result.tx && !result.duplicate) {
        stages.push(stage);
        awarded += result.tx.amount;
      }
    }
  }
  awardBadges(db);
  return { awarded, stages };
}

export function requestDeduction(
  db: PendulaDB,
  input: { learnerId: string; amount: number; reason: string; category: string; actor: Actor },
): { error?: string; request?: DeductionRequest } {
  if (input.actor.role !== "teacher" && input.actor.role !== "admin") {
    return { error: "Only staff can request a deduction" };
  }
  const amount = Math.trunc(input.amount);
  if (amount <= 0) return { error: "Enter a positive number of points" };
  if (input.reason.trim().length < 8) return { error: "Give a clear reason (at least a short sentence)" };
  const learner = db.learners.find((l) => l.id === input.learnerId);
  if (!learner || learner.status === "merged") return { error: "Learner not found" };
  const unfair = /disab|poverty|poor|sick|illness|race|language|pregnan/i.test(input.reason);
  const request: DeductionRequest = {
    id: uid("ded"),
    learnerId: learner.id,
    amount,
    reason: input.reason.trim(),
    category: input.category || "correction",
    status: "pending",
    requesterId: input.actor.id,
    createdAt: nowIso(),
    idempotencyKey: uid("dedkey"),
  };
  db.deductions = [request, ...db.deductions];
  pushAudit(db, input.actor, "deduction.request", request.id, `${amount} points for ${learner.id}: ${request.reason}`);
  notify(db, "admin", "Deduction waiting for review", `${learnerLabel(learner)} — ${amount} points. ${request.reason}`, learner.id);
  if (unfair) {
    notify(
      db,
      "admin",
      "Check this deduction carefully",
      "The reason mentions circumstances that may be outside the learner's control. Do not deduct points for disability, poverty, illness or a protected characteristic.",
      learner.id,
    );
  }
  return { request };
}

export function reviewDeduction(
  db: PendulaDB,
  input: { requestId: string; approve: boolean; note: string; actor: Actor },
): { error?: string } {
  if (input.actor.role !== "admin") return { error: "Only an administrator can approve or reject a deduction" };
  const request = db.deductions.find((d) => d.id === input.requestId);
  if (!request) return { error: "Request not found" };
  if (request.status !== "pending") return { error: "This request has already been decided" };
  if (request.requesterId === input.actor.id) {
    return { error: "You cannot approve or reject your own request. Ask another administrator." };
  }
  if (!input.approve) {
    db.deductions = db.deductions.map((d) =>
      d.id === request.id
        ? { ...d, status: "rejected", reviewerId: input.actor.id, reviewNote: input.note, reviewedAt: nowIso() }
        : d,
    );
    pushAudit(db, input.actor, "deduction.reject", request.id, input.note || "Rejected");
    notify(db, "teacher", "Deduction not approved", input.note || "An administrator rejected the request.", request.learnerId);
    return {};
  }
  const result = postTransaction(db, {
    idempotencyKey: `ded-post:${request.id}`,
    learnerId: request.learnerId,
    type: request.category === "attendance_correction" ? "reversal" : "deduction",
    direction: "debit",
    amount: request.amount,
    reason: request.reason,
    actor: { id: request.requesterId, role: "teacher", name: "Requester" },
    approverId: input.actor.id,
    linkType: request.linkType || "deduction",
    linkId: request.linkId || request.id,
    contra: "sys:deductions",
  });
  if (result.error) return { error: result.error };
  db.deductions = db.deductions.map((d) =>
    d.id === request.id
      ? {
          ...d,
          status: "approved",
          reviewerId: input.actor.id,
          reviewNote: input.note,
          reviewedAt: nowIso(),
          txId: result.tx?.id,
        }
      : d,
  );
  pushAudit(db, input.actor, "deduction.approve", request.id, `${request.amount} points posted once`);
  notify(db, "teacher", "Deduction approved", `${request.amount} points were removed after review.`, request.learnerId);
  return {};
}

export function awardBonus(
  db: PendulaDB,
  input: { learnerId: string; amount: number; reason: string; actor: Actor },
): { error?: string } {
  if (input.actor.role !== "admin") return { error: "Only an administrator can award a discretionary bonus" };
  const blocked = rewardsReady(db);
  if (blocked) return { error: blocked };
  const amount = Math.trunc(input.amount);
  if (amount <= 0 || amount > 200) return { error: "Bonus awards must be between 1 and 200 points" };
  if (input.reason.trim().length < 8) return { error: "Record why this bonus is educationally justified" };
  const result = postTransaction(db, {
    idempotencyKey: uid("bonus"),
    learnerId: input.learnerId,
    type: "bonus",
    direction: "credit",
    amount,
    reason: input.reason.trim(),
    actor: input.actor,
    approverId: input.actor.id,
    contra: "sys:rewards-bonus",
  });
  if (result.error) return { error: result.error };
  pushAudit(db, input.actor, "bonus.award", input.learnerId, `${amount}: ${input.reason.trim()}`);
  awardBadges(db);
  return {};
}

/** Principal for simple interest: credits other than interest, minus debits, ignoring later interest. */
function principalOf(db: PendulaDB, learnerId: string, asOf: string): number {
  let total = 0;
  for (const tx of transactionsFor(db, learnerId)) {
    if (tx.at.slice(0, 10) > asOf) continue;
    if (tx.type === "interest") continue;
    total += tx.direction === "credit" ? tx.amount : -tx.amount;
  }
  return Math.max(0, total);
}

export function runInterest(
  db: PendulaDB,
  input: { throughMonth: string; actor: Actor },
): { error?: string; posted: number; skipped: number } {
  if (input.actor.role !== "admin" && input.actor.role !== "system") {
    return { error: "Only an administrator can post interest", posted: 0, skipped: 0 };
  }
  const policy = db.org.policy.interest;
  if (!policy.approved) return { error: "Approve the interest policy before posting interest", posted: 0, skipped: 0 };
  if (policy.suspended) return { error: "Interest is suspended", posted: 0, skipped: 0 };
  if (!/^\d{4}-\d{2}$/.test(input.throughMonth)) return { error: "Choose a month", posted: 0, skipped: 0 };
  const earliest = db.transactions.reduce<string | null>((min, tx) => {
    const key = monthKey(tx.at);
    if (!min || key < min) return key;
    return min;
  }, null);
  if (!earliest) return { posted: 0, skipped: 0 };
  let posted = 0;
  let skipped = 0;
  for (const key of monthsBetween(earliest, input.throughMonth)) {
    const asOf = monthEnd(key);
    if (asOf > isoDate(new Date())) break;
    for (const learner of db.learners) {
      if (learner.status !== "active") continue;
      const base = policy.mode === "simple" ? principalOf(db, learner.id, asOf) : balanceOf(db, learner.id, asOf);
      if (base < policy.minBalance) {
        skipped += 1;
        continue;
      }
      const raw = (base * policy.ratePercent) / 100;
      const award = Math.min(policy.maxAward, roundPoints(raw, policy.rounding));
      if (award <= 0) {
        skipped += 1;
        continue;
      }
      const result = postTransaction(db, {
        idempotencyKey: `int:${learner.id}:${key}`,
        at: `${asOf}T21:00:00.000Z`,
        learnerId: learner.id,
        type: "interest",
        direction: "credit",
        amount: award,
        reason: `Savings interest for ${key} at ${policy.ratePercent}% (${policy.mode}, ${policy.rounding} rounding) on ${base} points`,
        actor: input.actor,
        linkType: "interest",
        linkId: key,
        contra: "sys:interest",
      });
      if (result.error) return { error: result.error, posted, skipped };
      if (result.duplicate) skipped += 1;
      else posted += 1;
    }
  }
  if (posted) {
    pushAudit(db, input.actor, "interest.run", input.throughMonth, `${posted} interest credits posted`);
    awardBadges(db);
  }
  return { posted, skipped };
}

export function buildStatement(db: PendulaDB, learnerId: string, from: string, to: string): Statement | { error: string } {
  const learner = db.learners.find((l) => l.id === learnerId);
  if (!learner) return { error: "Learner not found" };
  const txs = transactionsFor(db, learnerId)
    .slice()
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.id < b.id ? -1 : 1));
  let running = 0;
  const lines: Statement["lines"] = [];
  for (const tx of txs) {
    const day = tx.at.slice(0, 10);
    const credit = tx.direction === "credit" ? tx.amount : 0;
    const debit = tx.direction === "debit" ? tx.amount : 0;
    running += credit - debit;
    if (day < from || day > to) continue;
    lines.push({
      date: day,
      description: tx.reason,
      credit,
      debit,
      balance: running,
      txId: tx.id,
    });
  }
  const opening = balanceOf(db, learnerId, addDaysIso(from, -1));
  const closing = lines.length ? lines[lines.length - 1].balance : opening;
  // Opening uses balance at end of previous day. Running inside the window started from zero,
  // so restate balances relative to the true opening.
  let cursor = opening;
  const restated = lines.map((line) => {
    cursor += line.credit - line.debit;
    return { ...line, balance: cursor };
  });
  const stampId = fingerprint({
    transactions: txs.filter((t) => t.at.slice(0, 10) >= from && t.at.slice(0, 10) <= to),
    learners: [learner],
    deductions: [],
  });
  return {
    reference: `STM-${learner.id}-${from.replace(/-/g, "")}-${stampId}`,
    learnerName: fullName(learner),
    learnerId: learner.id,
    accountNumber: learner.accountNumber,
    from,
    to,
    generatedAt: nowIso(),
    opening,
    closing: restated.length ? restated[restated.length - 1].balance : opening,
    lines: restated,
    disclaimer: DISCLAIMER,
  };
}

function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

export function ledgerBalanced(db: PendulaDB): { ok: boolean; problems: string[] } {
  const problems: string[] = [];
  const keys = new Set<string>();
  let debit = 0;
  let credit = 0;
  for (const tx of db.transactions) {
    if (keys.has(tx.idempotencyKey)) problems.push(`Duplicate idempotency key ${tx.idempotencyKey}`);
    keys.add(tx.idempotencyKey);
    const problem = ledgerInvariant(tx);
    if (problem) problems.push(`${tx.id}: ${problem}`);
    debit += tx.amount;
    credit += tx.amount;
    const live = balanceOf(db, tx.learnerId, "9999-12-31");
    if (live < 0) problems.push(`${tx.learnerId} balance is negative`);
  }
  if (debit !== credit) problems.push("Debits and credits diverge");
  const uniqueLearners = new Set(db.transactions.map((t) => t.learnerId));
  for (const id of uniqueLearners) {
    if (balanceOf(db, id) < 0) problems.push(`Negative balance on ${id}`);
  }
  return { ok: problems.length === 0, problems: [...new Set(problems)] };
}

const BADGES: { code: string; name: string; test: (db: PendulaDB, learnerId: string) => string | null }[] = [
  {
    code: "attendance-champion",
    name: "Attendance Champion",
    test: (db, id) => {
      const recent = db.attendance.filter((a) => a.learnerId === id).slice(-10);
      if (recent.length >= 8 && recent.every((a) => a.status === "present")) return "Eight or more recent sessions, all present";
      return null;
    },
  },
  {
    code: "reading-explorer",
    name: "Reading Explorer",
    test: (db, id) => {
      const stage = currentStage(db, id);
      return stage >= 5 ? `Reached Reading Eggs stage ${stage}` : null;
    },
  },
  {
    code: "reading-star",
    name: "Reading Star",
    test: (db, id) => (currentStage(db, id) >= 15 ? "Reached stage 15" : null),
  },
  {
    code: "assessment-achiever",
    name: "Assessment Achiever",
    test: (db, id) => {
      const n = db.results.filter((r) => r.learnerId === id).length;
      return n >= 3 ? "Completed at least three assessments" : null;
    },
  },
  {
    code: "growth-champion",
    name: "Growth Champion",
    test: (db, id) => {
      const n = db.transactions.filter((t) => t.learnerId === id && t.type === "improvement").length;
      return n >= 1 ? "Earned an assessment improvement award" : null;
    },
  },
  {
    code: "savings-star",
    name: "Savings Star",
    test: (db, id) => {
      const interest = db.transactions.filter((t) => t.learnerId === id && t.type === "interest").length;
      return interest >= 1 ? "Received savings interest" : null;
    },
  },
  {
    code: "consistency",
    name: "Consistency Champion",
    test: (db, id) =>
      db.transactions.some((t) => t.learnerId === id && t.type === "perfect_week")
        ? "Completed a perfect attendance week"
        : null,
  },
];

export function currentStage(db: PendulaDB, learnerId: string): number {
  const rows = db.reading.filter((r) => r.learnerId === learnerId);
  if (!rows.length) return 0;
  return Math.max(...rows.map((r) => r.stage));
}

export function awardBadges(db: PendulaDB): void {
  for (const learner of db.learners) {
    if (learner.status !== "active") continue;
    for (const badge of BADGES) {
      if (db.badges.some((b) => b.learnerId === learner.id && b.code === badge.code)) continue;
      const reason = badge.test(db, learner.id);
      if (!reason) continue;
      const award: BadgeAward = {
        id: uid("bdg"),
        learnerId: learner.id,
        code: badge.code,
        name: badge.name,
        reason,
        awardedAt: nowIso(),
      };
      db.badges = [award, ...db.badges];
      notify(db, "learner", badge.name, reason, learner.id);
    }
  }
}

export function readingJourney(stage: number): { id: string; label: string; reached: boolean }[] {
  const steps = [
    { id: "seed", label: "Seed", min: 0 },
    { id: "sprout", label: "Sprout", min: 1 },
    { id: "explorer", label: "Explorer", min: 5 },
    { id: "reader", label: "Reader", min: 12 },
    { id: "champion", label: "Reading Champion", min: 20 },
  ];
  return steps.map((s) => ({ id: s.id, label: s.label, reached: stage >= s.min }));
}

export function savingsJourney(balance: number): { id: string; label: string; reached: boolean }[] {
  const steps = [
    { id: "starter", label: "Starter", min: 0 },
    { id: "saver", label: "Saver", min: 100 },
    { id: "builder", label: "Builder", min: 400 },
    { id: "planner", label: "Planner", min: 1000 },
    { id: "champion", label: "Savings Champion", min: 2000 },
  ];
  return steps.map((s) => ({ id: s.id, label: s.label, reached: balance >= s.min }));
}

export function can(role: Role, action: string): boolean {
  const admin = new Set([
    "learner.write",
    "learner.deactivate",
    "learner.merge",
    "staff.write",
    "policy.write",
    "deduction.review",
    "bonus.write",
    "interest.run",
    "attendance.write",
    "assessment.write",
    "reading.write",
    "report.all",
    "audit.read",
    "support.read",
    "support.write",
    "export.all",
    "settings.write",
  ]);
  const teacher = new Set([
    "learner.write",
    "attendance.write",
    "assessment.write",
    "reading.write",
    "deduction.request",
    "report.class",
    "support.write",
    "message.send",
  ]);
  if (role === "admin") return admin.has(action) || teacher.has(action);
  if (role === "teacher") return teacher.has(action);
  if (role === "learner") return action === "goal.write" || action === "portal.read";
  if (role === "parent") return action === "portal.read";
  return false;
}

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((s, n) => s + n, 0) / values.length;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function stdev(values: number[]): number | null {
  if (values.length < 2) return null;
  const avg = mean(values)!;
  const variance = values.reduce((s, n) => s + (n - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function attendanceRate(
  records: AttendanceRecord[],
): { rate: number | null; attended: number; eligible: number; excused: number } {
  let attended = 0;
  let eligible = 0;
  let excused = 0;
  for (const record of records) {
    if (record.status === "excused" || record.status === "closed" || record.status === "unscheduled") {
      if (record.status === "excused") excused += 1;
      continue;
    }
    eligible += 1;
    if (record.status === "present" || record.status === "late") attended += 1;
  }
  return { rate: eligible ? attended / eligible : null, attended, eligible, excused };
}

export function learnerAgeBand(grade: number): "foundation" | "intermediate" | "senior" {
  if (grade <= 3) return "foundation";
  if (grade <= 7) return "intermediate";
  return "senior";
}

export { ageOn };
