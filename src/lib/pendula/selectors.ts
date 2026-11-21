import { addDays, ageOn, dayKind, recentSchoolDays, weekStart } from "./calendar.ts";
import { attendanceRate, balanceOf, balanceParts, currentStage, learnerLabel, mean, median, percentage, stdev } from "./engine.ts";
import type { AttendanceRecord, Learner, PendulaDB, Role } from "./types.ts";

export interface Alert {
  id: string;
  tone: "attention" | "good" | "info";
  title: string;
  body: string;
  learnerId?: string;
}

export function visibleLearners(db: PendulaDB, role: Role, staffId?: string, parentId?: string, learnerId?: string): Learner[] {
  const active = db.learners.filter((l) => l.status !== "merged");
  if (role === "admin") return active;
  if (role === "teacher") {
    const staff = db.staff.find((s) => s.id === staffId);
    const classIds = new Set(staff?.classIds || []);
    return active.filter((l) => classIds.has(l.classId));
  }
  if (role === "learner") return active.filter((l) => l.id === learnerId);
  if (role === "parent") {
    const parent = db.parents.find((p) => p.id === parentId);
    const ids = new Set(parent?.learnerIds || []);
    return active.filter((l) => ids.has(l.id));
  }
  return [];
}

export function consecutiveMisses(db: PendulaDB, learnerId: string, asOf: string): number {
  const days = recentSchoolDays(12, asOf, db.org.terms, db.org.holidays).reverse();
  let count = 0;
  for (const day of days) {
    const mark = db.attendance.find((a) => a.learnerId === learnerId && a.date === day);
    if (!mark) break;
    if (mark.status === "absent") count += 1;
    else break;
  }
  return count;
}

export function rateWindow(db: PendulaDB, learnerId: string, dates: string[]): ReturnType<typeof attendanceRate> {
  const records = dates
    .map((date) => db.attendance.find((a) => a.learnerId === learnerId && a.date === date))
    .filter((a): a is AttendanceRecord => Boolean(a));
  return attendanceRate(records);
}

export function alertsFor(db: PendulaDB, learners: Learner[], asOf: string): Alert[] {
  const alerts: Alert[] = [];
  const recent = recentSchoolDays(10, asOf, db.org.terms, db.org.holidays);
  const previous = recentSchoolDays(20, asOf, db.org.terms, db.org.holidays).slice(0, 10);
  for (const learner of learners) {
    if (learner.status !== "active") continue;
    const misses = consecutiveMisses(db, learner.id, asOf);
    if (misses >= 3) {
      alerts.push({
        id: `miss-${learner.id}`,
        tone: "attention",
        title: `${learnerLabel(learner)} has missed ${misses} eligible sessions in a row`,
        body: "Check whether transport, health, family or the timetable is in the way before recommending any intervention. This is not a judgement about effort.",
        learnerId: learner.id,
      });
    }
    const now = rateWindow(db, learner.id, recent);
    const before = rateWindow(db, learner.id, previous);
    if (now.rate !== null && before.rate !== null && before.eligible >= 6 && now.eligible >= 6 && before.rate - now.rate >= 0.25) {
      alerts.push({
        id: `drop-${learner.id}`,
        tone: "attention",
        title: `${learnerLabel(learner)}'s attendance has fallen`,
        body: `Attended ${now.attended} of the last ${now.eligible} eligible sessions (${Math.round(now.rate * 100)}%), compared with ${before.attended} of the previous ${before.eligible} (${Math.round(before.rate * 100)}%). Excused days are left out of both counts.`,
        learnerId: learner.id,
      });
    } else if (now.rate !== null && now.eligible >= 8 && now.rate < 0.7) {
      alerts.push({
        id: `low-${learner.id}`,
        tone: "attention",
        title: `${learnerLabel(learner)} attended under 70% recently`,
        body: `${now.attended} of ${now.eligible} eligible sessions from ${recent[0]} to ${recent[recent.length - 1]}. Small samples are uncertain — read the dates, not a label.`,
        learnerId: learner.id,
      });
    }
    const stage = currentStage(db, learner.id);
    const last = db.reading.filter((r) => r.learnerId === learner.id).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    if (last && stage > 0 && last.date <= addDays(asOf, -30)) {
      alerts.push({
        id: `read-${learner.id}`,
        tone: "attention",
        title: `${learnerLabel(learner)}'s reading stage has not moved`,
        body: `Still on stage ${stage}, last verified ${last.date}. A stalled map is a prompt to look at reading time and the right level, not a diagnosis.`,
        learnerId: learner.id,
      });
    }
    const series = new Map<string, { date: string; pct: number }[]>();
    for (const result of db.results.filter((r) => r.learnerId === learner.id)) {
      const assessment = db.assessments.find((a) => a.id === result.assessmentId);
      if (!assessment?.seriesId) continue;
      const list = series.get(assessment.seriesId) || [];
      list.push({ date: assessment.date, pct: percentage(result.score, assessment.maxScore) });
      series.set(assessment.seriesId, list);
    }
    for (const points of series.values()) {
      const ordered = points.sort((a, b) => (a.date < b.date ? -1 : 1));
      if (ordered.length < 2) continue;
      const delta = ordered[ordered.length - 1].pct - ordered[ordered.length - 2].pct;
      if (delta <= -10) {
        alerts.push({
          id: `dip-${learner.id}`,
          tone: "attention",
          title: `${learnerLabel(learner)}'s comparable result dropped`,
          body: `Down ${Math.abs(Math.round(delta))} percentage points on the same assessment series. Compare only like-for-like tasks.`,
          learnerId: learner.id,
        });
      } else if (delta >= 10) {
        alerts.push({
          id: `up-${learner.id}`,
          tone: "good",
          title: `${learnerLabel(learner)} improved on a comparable assessment`,
          body: `Up ${Math.floor(delta)} percentage points. Improvement points use percentage points, not a relative percentage change, and they are capped by policy.`,
          learnerId: learner.id,
        });
      }
    }
  }
  const pending = db.deductions.filter((d) => d.status === "pending");
  if (pending.length) {
    alerts.push({
      id: "deductions",
      tone: "info",
      title: `${pending.length} deduction${pending.length === 1 ? "" : "s"} waiting`,
      body: "A pending request does not change anyone's balance. Teachers cannot approve their own requests.",
    });
  }
  return alerts;
}

export function birthdays(db: PendulaDB, learners: Learner[], asOf: string, withinDays: number): { learner: Learner; date: string; age: number; days: number }[] {
  const out: { learner: Learner; date: string; age: number; days: number }[] = [];
  for (const learner of learners) {
    if (learner.status !== "active" || !learner.dob) continue;
    const monthDay = learner.dob.slice(5);
    let next = `${asOf.slice(0, 4)}-${monthDay}`;
    if (next < asOf) next = `${Number(asOf.slice(0, 4)) + 1}-${monthDay}`;
    let days = 0;
    let cursor = asOf;
    while (cursor < next && days <= withinDays) {
      cursor = addDays(cursor, 1);
      days += 1;
    }
    if (next === asOf) days = 0;
    if (days <= withinDays && (next === asOf || cursor === next)) {
      out.push({ learner, date: next, age: ageOn(learner.dob, next), days });
    }
  }
  return out.sort((a, b) => a.days - b.days);
}

export function programmeMetrics(db: PendulaDB, learners: Learner[], asOf: string) {
  const active = learners.filter((l) => l.status === "active");
  const weekDays = recentSchoolDays(10, asOf, db.org.terms, db.org.holidays).filter((d) => weekStart(d) === weekStart(asOf) || d >= addDays(asOf, -6));
  const thisWeek = recentSchoolDays(5, asOf, db.org.terms, db.org.holidays);
  const marks = db.attendance.filter((a) => active.some((l) => l.id === a.learnerId) && thisWeek.includes(a.date));
  const rate = attendanceRate(marks);
  let held = 0;
  let issued = 0;
  let interest = 0;
  for (const learner of active) {
    const parts = balanceParts(db, learner.id);
    held += parts.balance;
    issued += parts.earned;
    interest += parts.interest;
  }
  const byGrade = Array.from({ length: 12 }, (_, i) => ({
    grade: i + 1,
    learners: active.filter((l) => l.grade === i + 1).length,
  }));
  const scores = db.results
    .filter((r) => active.some((l) => l.id === r.learnerId))
    .map((r) => {
      const assessment = db.assessments.find((a) => a.id === r.assessmentId);
      return assessment ? percentage(r.score, assessment.maxScore) : null;
    })
    .filter((n): n is number => n !== null);
  return {
    registered: learners.filter((l) => l.status !== "merged").length,
    active: active.length,
    attendanceRate: rate.rate,
    attended: rate.attended,
    eligible: rate.eligible,
    held,
    issued,
    interest,
    pending: db.deductions.filter((d) => d.status === "pending").length,
    assessments: db.results.filter((r) => active.some((l) => l.id === r.learnerId)).length,
    meanScore: mean(scores),
    medianScore: median(scores),
    sdScore: stdev(scores),
    byGrade,
    readingMilestones: db.transactions.filter((t) => t.type === "reading" && active.some((l) => l.id === t.learnerId)).length,
    weekLabel: thisWeek.length ? `${thisWeek[0]} to ${thisWeek[thisWeek.length - 1]}` : "No school days yet",
    weekDays,
  };
}

export function weeklyAttendanceSeries(db: PendulaDB, learners: Learner[], asOf: string) {
  const days = recentSchoolDays(15, asOf, db.org.terms, db.org.holidays);
  return days.map((date) => {
    const marks = db.attendance.filter((a) => a.date === date && learners.some((l) => l.id === a.learnerId));
    const rate = attendanceRate(marks);
    return {
      date: date.slice(5),
      full: date,
      rate: rate.rate === null ? 0 : Math.round(rate.rate * 100),
      marked: marks.length,
    };
  });
}

export function pointsHistogram(db: PendulaDB, learners: Learner[]) {
  const bins = [
    { label: "0–49", min: 0, max: 49 },
    { label: "50–199", min: 50, max: 199 },
    { label: "200–499", min: 200, max: 499 },
    { label: "500–999", min: 500, max: 999 },
    { label: "1,000+", min: 1000, max: 1e9 },
  ];
  return bins.map((bin) => ({
    label: bin.label,
    learners: learners.filter((l) => {
      const balance = balanceOf(db, l.id);
      return balance >= bin.min && balance <= bin.max;
    }).length,
  }));
}

export function isSchoolDay(db: PendulaDB, iso: string): boolean {
  return dayKind(iso, db.org.terms, db.org.holidays) === "school";
}

export function dataQuality(db: PendulaDB) {
  const learners = db.learners.filter((l) => l.status !== "merged");
  const missingPhone = learners.filter((l) => !l.guardianPhone).length;
  const missingLanguage = learners.filter((l) => !l.homeLanguage).length;
  const inactive = learners.filter((l) => l.status === "inactive").length;
  const duplicateHints = learners.filter((l, i) =>
    learners.some(
      (other, j) =>
        j > i &&
        other.dob === l.dob &&
        other.surname.toLowerCase() === l.surname.toLowerCase() &&
        other.firstName.toLowerCase() === l.firstName.toLowerCase(),
    ),
  ).length;
  return { missingPhone, missingLanguage, inactive, duplicateHints, learners: learners.length };
}
