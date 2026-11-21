import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isoDate } from "./calendar.ts";
import {
  awardBonus,
  awardBadges,
  createAssessment,
  recordReading,
  requestDeduction,
  reviewDeduction,
  runInterest,
  saveAttendance,
  saveResults,
  stamp,
  uid,
} from "./engine.ts";
import { addStaff, commitImport, mergeLearners, registerLearner, setStaffActive, updateLearner, type ImportRow, type LearnerDraft } from "./people.ts";
import { createDemo, emptyDb } from "./seed.ts";
import type { Actor, AttendanceStatus, PendulaDB, RewardPolicy, Role, Session, StaffMember } from "./types.ts";

export interface SetupInput {
  orgName: string;
  email: string;
  adminName: string;
  pin: string;
  approveRewards: boolean;
  approveInterest: boolean;
  demo: boolean;
  location: string;
}

interface PendulaState {
  db: PendulaDB;
  session: Session | null;
  theme: "light" | "dark";
  nav: string;
  focusLearnerId: string | null;
  aiUses: number;
  aiDay: string;
  completeSetup: (input: SetupInput) => string | null;
  lock: () => void;
  signInStaff: (staffId: string, pin: string) => string | null;
  signInLearner: (learnerId: string, pin: string) => string | null;
  signInParent: (parentId: string, pin: string) => string | null;
  previewRole: (session: Session) => void;
  returnToAdmin: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setNav: (nav: string) => void;
  openLearner: (id: string) => void;
  register: (draft: LearnerDraft, ignoreDuplicate?: boolean) => { error?: string; duplicates?: { learnerId: string; level: string; reasons: string[] }[] };
  editLearner: (id: string, patch: Partial<LearnerDraft> & { status?: "active" | "inactive" }) => string | null;
  merge: (keepId: string, dropId: string) => string | null;
  applyImport: (rows: ImportRow[]) => { error?: string; added?: number; skipped?: number; errors?: string[] };
  saveStaff: (input: { name: string; role: "admin" | "teacher"; email: string; pin: string; classIds: string[] }) => string | null;
  toggleStaff: (staffId: string, active: boolean) => string | null;
  savePolicy: (policy: RewardPolicy, live: boolean) => string | null;
  takeAttendance: (classId: string, date: string, marks: { learnerId: string; status: AttendanceStatus }[]) => { error?: string; posted?: number; corrections?: number };
  addAssessment: (input: {
    name: string;
    subject: string;
    grade: number;
    date: string;
    type: string;
    maxScore: number;
    seriesId: string;
    outcomes: string;
  }) => { error?: string; id?: string };
  markAssessment: (assessmentId: string, rows: { learnerId: string; score: number; comment: string }[]) => { error?: string; participation?: number; improvement?: number };
  verifyReading: (learnerId: string, stage: number, date: string, evidence: string) => { error?: string; awarded?: number };
  askDeduction: (learnerId: string, amount: number, reason: string, category: string) => string | null;
  decideDeduction: (requestId: string, approve: boolean, note: string) => string | null;
  giveBonus: (learnerId: string, amount: number, reason: string) => string | null;
  postInterest: (throughMonth: string) => { error?: string; posted?: number };
  addGoal: (learnerId: string, name: string, target: number) => string | null;
  addNote: (learnerId: string, note: string, confidential: boolean) => string | null;
  sendMessage: (learnerId: string, kind: "birthday" | "progress" | "support" | "meeting", body: string) => string | null;
  markNoticesRead: () => void;
  addSchool: (name: string, locationName: string, phase: "primary" | "high" | "combined") => string | null;
  addClass: (name: string, grade: number, schoolId: string, teacherId: string) => string | null;
  replaceBackup: (raw: string) => string | null;
  clearDemo: () => void;
  noteAiUse: () => boolean;
}

function actorFrom(db: PendulaDB, session: Session | null): Actor | null {
  if (!session) return null;
  if (session.role === "admin" || session.role === "teacher") {
    const staff = db.staff.find((s) => s.id === session.staffId && s.active);
    if (!staff || staff.role !== session.role) return null;
    return { id: staff.id, role: staff.role, name: staff.name };
  }
  if (session.role === "learner") {
    const learner = db.learners.find((l) => l.id === session.learnerId);
    if (!learner) return null;
    return { id: learner.id, role: "learner", name: learner.preferredName };
  }
  if (session.role === "parent") {
    const parent = db.parents.find((p) => p.id === session.parentId);
    if (!parent) return null;
    return { id: parent.id, role: "parent", name: parent.name };
  }
  return null;
}

function commit(db: PendulaDB): PendulaDB {
  awardBadges(db);
  return stamp(db);
}

export const usePendula = create<PendulaState>()(
  persist(
    (set, get) => ({
      db: emptyDb(),
      session: null,
      theme: "light",
      nav: "today",
      focusLearnerId: null,
      aiUses: 0,
      aiDay: "",
      completeSetup: (input) => {
        if (!input.adminName.trim()) return "Enter the founding administrator's name";
        if (!/^\d{4}$/.test(input.pin)) return "Choose a 4-digit PIN";
        const founder = { name: input.adminName.trim(), pin: input.pin, email: input.email.trim() };
        const db = input.demo
          ? createDemo(founder, isoDate(new Date()))
          : emptyDb({ name: input.orgName.trim() || "Pendula Programme", contactEmail: founder.email, setupComplete: true });
        if (!input.demo) {
          db.org.setupComplete = true;
          db.org.rewardsLive = input.approveRewards;
          db.org.policy.approved = input.approveRewards;
          db.org.policy.interest.approved = input.approveInterest;
          db.org.demoCohort = false;
          const locationId = uid("loc");
          db.locations = [{ id: locationId, name: input.location.trim() || "Main site", area: "" }];
          db.staff = [
            {
              id: "staff-founder",
              name: founder.name,
              role: "admin",
              email: founder.email,
              pin: founder.pin,
              active: true,
              classIds: [],
            },
          ];
        } else {
          db.org.name = input.orgName.trim() || db.org.name;
          const founderStaff = db.staff.find((s) => s.id === "staff-founder");
          if (founderStaff) {
            founderStaff.name = founder.name;
            founderStaff.pin = founder.pin;
            founderStaff.email = founder.email;
          }
          if (!input.approveInterest) db.org.policy.interest.approved = false;
        }
        set({
          db: commit(db),
          session: { role: "admin", staffId: "staff-founder" },
          nav: "today",
        });
        return null;
      },
      lock: () => set({ session: null, nav: "today" }),
      signInStaff: (staffId, pin) => {
        const staff = get().db.staff.find((s) => s.id === staffId && s.active);
        if (!staff || staff.pin !== pin) return "That PIN does not match";
        set({ session: { role: staff.role, staffId: staff.id }, nav: "today" });
        return null;
      },
      signInLearner: (learnerId, pin) => {
        const learner = get().db.learners.find((l) => l.id === learnerId && l.status === "active");
        if (!learner || learner.portalPin !== pin) return "That portal code does not match";
        set({ session: { role: "learner", learnerId }, nav: "today", focusLearnerId: learnerId });
        return null;
      },
      signInParent: (parentId, pin) => {
        const parent = get().db.parents.find((p) => p.id === parentId);
        if (!parent || parent.pin !== pin) return "That PIN does not match";
        set({ session: { role: "parent", parentId }, nav: "today", focusLearnerId: parent.learnerIds[0] || null });
        return null;
      },
      previewRole: (session) => {
        const current = get().session;
        if (!current || current.role !== "admin" && !current.returnStaffId) return;
        const returnStaffId = current.returnStaffId || current.staffId;
        set({ session: { ...session, returnStaffId }, nav: "today", focusLearnerId: session.learnerId || session.parentId || null });
      },
      returnToAdmin: () => {
        const current = get().session;
        if (!current?.returnStaffId) return;
        set({ session: { role: "admin", staffId: current.returnStaffId }, nav: "today" });
      },
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle("dark", theme === "dark");
        try {
          localStorage.setItem("pendula-theme", theme);
        } catch {
          /* ignore */
        }
      },
      setNav: (nav) => set({ nav }),
      openLearner: (id) => set({ focusLearnerId: id, nav: "learner" }),
      register: (draft, ignoreDuplicate) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return { error: "Sign in as staff first" };
        const result = registerLearner(db, draft, actor, { ignoreDuplicate });
        if (!result.learner) return { error: result.error, duplicates: result.duplicates };
        set({ db: commit(db), focusLearnerId: result.learner.id, nav: "learner" });
        return {};
      },
      editLearner: (id, patch) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return "Sign in first";
        const result = updateLearner(db, id, patch, actor);
        if (result.error) return result.error;
        set({ db: commit(db) });
        return null;
      },
      merge: (keepId, dropId) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return "Sign in first";
        const result = mergeLearners(db, keepId, dropId, actor);
        if (result.error) return result.error;
        set({ db: commit(db), focusLearnerId: keepId });
        return null;
      },
      applyImport: (rows) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return { error: "Sign in as staff first" };
        const result = commitImport(db, rows, actor);
        set({ db: commit(db) });
        return result;
      },
      saveStaff: (input) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return "Sign in first";
        const result = addStaff(db, input, actor);
        if (result.error) return result.error;
        set({ db: commit(db) });
        return null;
      },
      toggleStaff: (staffId, active) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return "Sign in first";
        const result = setStaffActive(db, staffId, active, actor);
        if (result.error) return result.error;
        set({ db: commit(db) });
        return null;
      },
      savePolicy: (policy, live) => {
        const session = get().session;
        if (session?.role !== "admin") return "Only an administrator can change policy";
        const db = structuredClone(get().db);
        const actor = actorFrom(db, session);
        if (!actor) return "Sign in first";
        db.org.policy = policy;
        db.org.rewardsLive = live && policy.approved;
        db.audit = [
          {
            id: uid("aud"),
            at: new Date().toISOString(),
            actorId: actor.id,
            role: "admin",
            action: "policy.update",
            target: policy.version,
            detail: `Rewards ${db.org.rewardsLive ? "live" : "paused"}. Interest ${policy.interest.approved ? "approved" : "not approved"}. Historical transactions were not recalculated.`,
          },
          ...db.audit,
        ];
        set({ db: commit(db) });
        return null;
      },
      takeAttendance: (classId, date, marks) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return { error: "Sign in first" };
        const result = saveAttendance(db, { classId, date, marks, actor });
        if (result.error) return { error: result.error };
        set({ db: commit(db) });
        return { posted: result.posted, corrections: result.corrections };
      },
      addAssessment: (input) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor || (actor.role !== "admin" && actor.role !== "teacher")) return { error: "Only staff can create assessments" };
        const term = db.org.terms.find((t) => input.date >= t.start && input.date <= t.end);
        const result = createAssessment(
          db,
          {
            name: input.name,
            subject: input.subject,
            grade: input.grade,
            date: input.date,
            type: input.type,
            maxScore: input.maxScore,
            termId: term?.id || "",
            academicYear: db.org.academicYear,
            teacherId: actor.id,
            seriesId: input.seriesId.trim(),
            outcomes: input.outcomes.trim(),
          },
          actor,
        );
        if (result.error || !result.assessment) return { error: result.error || "Could not create the assessment" };
        set({ db: commit(db) });
        return { id: result.assessment.id };
      },
      markAssessment: (assessmentId, rows) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return { error: "Sign in first" };
        const result = saveResults(db, assessmentId, rows, actor);
        if (result.error) return { error: result.error };
        set({ db: commit(db) });
        return { participation: result.participation, improvement: result.improvement };
      },
      verifyReading: (learnerId, stage, date, evidence) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return { error: "Sign in first" };
        const result = recordReading(db, { learnerId, stage, date, evidence, actor });
        if (result.error) return { error: result.error };
        set({ db: commit(db) });
        return { awarded: result.awarded };
      },
      askDeduction: (learnerId, amount, reason, category) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return "Sign in first";
        const result = requestDeduction(db, { learnerId, amount, reason, category, actor });
        if (result.error) return result.error;
        set({ db: commit(db), nav: "approvals" });
        return null;
      },
      decideDeduction: (requestId, approve, note) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return "Sign in first";
        const result = reviewDeduction(db, { requestId, approve, note, actor });
        if (result.error) return result.error;
        set({ db: commit(db) });
        return null;
      },
      giveBonus: (learnerId, amount, reason) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return "Sign in first";
        const result = awardBonus(db, { learnerId, amount, reason, actor });
        if (result.error) return result.error;
        set({ db: commit(db) });
        return null;
      },
      postInterest: (throughMonth) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor) return { error: "Sign in first" };
        const result = runInterest(db, { throughMonth, actor });
        if (result.error) return { error: result.error };
        set({ db: commit(db) });
        return { posted: result.posted };
      },
      addGoal: (learnerId, name, target) => {
        const session = get().session;
        if (!session) return "Sign in first";
        if (session.role === "learner" && session.learnerId !== learnerId) return "You can only set your own goal";
        if (session.role === "parent") return "Parents cannot change goals";
        if (session.role === "teacher") return "Goals belong to the learner";
        const amount = Math.trunc(target);
        if (!name.trim() || amount <= 0) return "Give the goal a name and a points target";
        const db = structuredClone(get().db);
        db.goals = [{ id: uid("goal"), learnerId, name: name.trim(), target: amount, createdAt: new Date().toISOString() }, ...db.goals];
        set({ db: commit(db) });
        return null;
      },
      addNote: (learnerId, note, confidential) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor || (actor.role !== "admin" && actor.role !== "teacher")) return "Only staff can add notes";
        if (confidential && actor.role !== "admin") return "Confidential safeguarding notes are limited to administrators";
        if (note.trim().length < 8) return "Write a useful note";
        db.interventions = [
          { id: uid("int"), learnerId, at: new Date().toISOString(), authorId: actor.id, note: note.trim(), confidential },
          ...db.interventions,
        ];
        db.audit = [
          {
            id: uid("aud"),
            at: new Date().toISOString(),
            actorId: actor.id,
            role: actor.role as Role,
            action: "intervention.add",
            target: learnerId,
            detail: confidential ? "Confidential note added" : "Intervention note added",
          },
          ...db.audit,
        ];
        set({ db: commit(db) });
        return null;
      },
      sendMessage: (learnerId, kind, body) => {
        const db = structuredClone(get().db);
        const actor = actorFrom(db, get().session);
        if (!actor || (actor.role !== "admin" && actor.role !== "teacher")) return "Only staff can send an in-app note";
        if (body.trim().length < 4) return "Write the message";
        db.messages = [
          { id: uid("msg"), at: new Date().toISOString(), actorId: actor.id, learnerId, channel: "in-app", kind, body: body.trim() },
          ...db.messages,
        ];
        set({ db: commit(db) });
        return null;
      },
      markNoticesRead: () => {
        const session = get().session;
        if (!session) return;
        const db = structuredClone(get().db);
        db.notifications = db.notifications.map((n) => (n.audience === session.role ? { ...n, read: true } : n));
        set({ db: commit(db) });
      },
      addSchool: (name, locationName, phase) => {
        if (get().session?.role !== "admin") return "Only an administrator can add a school";
        if (!name.trim()) return "Name the school";
        const db = structuredClone(get().db);
        let location = db.locations.find((l) => l.name.toLowerCase() === locationName.trim().toLowerCase());
        if (!location) {
          location = { id: uid("loc"), name: locationName.trim() || "Main site", area: "" };
          db.locations.push(location);
        }
        db.schools.push({ id: uid("sch"), name: name.trim(), locationId: location.id, phase });
        set({ db: commit(db) });
        return null;
      },
      addClass: (name, grade, schoolId, teacherId) => {
        if (get().session?.role !== "admin") return "Only an administrator can add a class";
        if (grade < 1 || grade > 12) return "Grade must be 1–12";
        const db = structuredClone(get().db);
        const cls = { id: uid("cls"), name: name.trim() || `Grade ${grade}`, grade, schoolId, teacherId };
        db.classes.push(cls);
        db.staff = db.staff.map((s) => (s.id === teacherId ? { ...s, classIds: [...s.classIds, cls.id] } : s));
        set({ db: commit(db) });
        return null;
      },
      replaceBackup: (raw) => {
        if (get().session?.role !== "admin") return "Only an administrator can restore a backup";
        try {
          const parsed = JSON.parse(raw) as PendulaDB;
          if (parsed.version !== 1 || !Array.isArray(parsed.learners) || !Array.isArray(parsed.transactions)) {
            return "That file is not a Pendula backup";
          }
          set({ db: stamp(parsed), nav: "today" });
          return null;
        } catch {
          return "Could not read that file";
        }
      },
      clearDemo: () => {
        const current = get().db;
        const founder = current.staff.find((s) => s.id === "staff-founder");
        if (!founder || get().session?.role !== "admin") return;
        const db = emptyDb({ name: current.org.name, contactEmail: current.org.contactEmail, setupComplete: true });
        db.org.setupComplete = true;
        db.org.policy = structuredClone(current.org.policy);
        db.org.rewardsLive = current.org.rewardsLive;
        db.org.terms = current.org.terms;
        db.org.holidays = current.org.holidays;
        db.staff = [founder];
        db.locations = current.locations.slice(0, 1);
        set({ db: commit(db), session: { role: "admin", staffId: founder.id }, nav: "settings" });
      },
      noteAiUse: () => {
        const day = isoDate(new Date());
        const used = get().aiDay === day ? get().aiUses : 0;
        if (used >= 12) return false;
        set({ aiDay: day, aiUses: used + 1 });
        return true;
      },
    }),
    {
      name: "pendula-db",
      version: 1,
      partialize: (state) => ({
        db: state.db,
        session: state.session,
        theme: state.theme,
        nav: state.nav,
        focusLearnerId: state.focusLearnerId,
        aiUses: state.aiUses,
        aiDay: state.aiDay,
      }),
    },
  ),
);

export function currentStaff(db: PendulaDB, session: Session | null): StaffMember | undefined {
  if (!session?.staffId) return undefined;
  return db.staff.find((s) => s.id === session.staffId);
}

export type { Role };
