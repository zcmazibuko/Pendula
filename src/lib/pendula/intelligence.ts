import { recentSchoolDays } from "./calendar.ts";
import { attendanceRate, currentStage, learnerLabel, mean, percentage } from "./engine.ts";
import type { PendulaDB } from "./types.ts";
import { alertsFor, programmeMetrics, visibleLearners } from "./selectors.ts";
import type { Session } from "./types.ts";

export interface GroundedAnswer {
  title: string;
  body: string;
  usedAi: boolean;
}

export function answerLocally(db: PendulaDB, session: Session, question: string, asOf: string): GroundedAnswer | null {
  const q = question.toLowerCase();
  const learners = visibleLearners(db, session.role, session.staffId, session.parentId, session.learnerId).filter(
    (l) => l.status === "active",
  );
  const scope =
    session.role === "admin" ? "the whole programme" : session.role === "teacher" ? "your classes" : "your linked record";

  if (/missed three|missed 3|three sessions/.test(q)) {
    const days = recentSchoolDays(12, asOf, db.org.terms, db.org.holidays);
    const hits = learners.filter((l) => {
      const recent = days.slice(-3);
      return recent.every((date) => db.attendance.some((a) => a.learnerId === l.id && a.date === date && a.status === "absent"));
    });
    return {
      title: "Three missed sessions",
      usedAi: false,
      body: hits.length
        ? `${hits.map((l) => learnerLabel(l)).join(", ")} ${hits.length === 1 ? "was" : "were"} absent on each of the last three eligible school days in ${scope}. Dates: ${days.slice(-3).join(", ")}. This counts marked absences only, not excused days.`
        : `Nobody in ${scope} was marked absent on all of the last three eligible school days (${days.slice(-3).join(", ")}).`,
    };
  }

  if (/mathematic|maths/.test(q) && /improv/.test(q)) {
    const rows = learners
      .map((l) => {
        const results = db.results
          .filter((r) => r.learnerId === l.id)
          .map((r) => ({ r, a: db.assessments.find((a) => a.id === r.assessmentId) }))
          .filter((x) => x.a && /math/i.test(x.a.subject) && x.a.seriesId)
          .sort((x, y) => (x.a!.date < y.a!.date ? -1 : 1));
        if (results.length < 2) return null;
        const prev = percentage(results[results.length - 2].r.score, results[results.length - 2].a!.maxScore);
        const curr = percentage(results[results.length - 1].r.score, results[results.length - 1].a!.maxScore);
        return { name: learnerLabel(l), delta: Math.floor(curr - prev), from: Math.round(prev), to: Math.round(curr) };
      })
      .filter((x): x is { name: string; delta: number; from: number; to: number } => Boolean(x && x.delta > 0))
      .sort((a, b) => b.delta - a.delta);
    if (!rows.length) {
      return {
        title: "Mathematics improvement",
        usedAi: false,
        body: `No comparable mathematics series in ${scope} shows a gain yet. Improvement is only calculated when two results share a series, subject and grade.`,
      };
    }
    const top = rows[0];
    return {
      title: "Mathematics improvement",
      usedAi: false,
      body: `Largest gain in ${scope}: ${top.name}, from ${top.from}% to ${top.to}% (${top.delta} percentage points). ${rows.length} learner${rows.length === 1 ? "" : "s"} improved on a comparable mathematics series. Percentage points are not the same as a relative percentage change.`,
    };
  }

  if (/reading eggs|reading/.test(q) && /not progress|stall|no progress|haven't|have not/.test(q)) {
    const stalled = learners.filter((l) => {
      const events = db.reading.filter((r) => r.learnerId === l.id);
      if (!events.length) return true;
      const last = events.map((e) => e.date).sort().at(-1)!;
      return last <= recentSchoolDays(20, asOf, db.org.terms, db.org.holidays)[0];
    });
    return {
      title: "Reading progress",
      usedAi: false,
      body: stalled.length
        ? `${stalled.map((l) => `${learnerLabel(l)} (stage ${currentStage(db, l.id) || "none"})`).join("; ")}. A blank stage means no teacher-verified milestone yet. Stage numbers are not school grades.`
        : `Every learner in ${scope} has a verified reading move inside the recent window.`,
    };
  }

  if (/attendance trend|attendance/.test(q)) {
    const days = recentSchoolDays(10, asOf, db.org.terms, db.org.holidays);
    const marks = db.attendance.filter((a) => days.includes(a.date) && learners.some((l) => l.id === a.learnerId));
    const rate = attendanceRate(marks);
    const metrics = programmeMetrics(db, learners, asOf);
    return {
      title: "Attendance",
      usedAi: false,
      body: `Over ${days[0] || "—"} to ${days.at(-1) || "—"}, attendance in ${scope} was ${rate.attended} of ${rate.eligible} eligible marks (${rate.rate === null ? "no marks" : `${Math.round(rate.rate * 100)}%`}). Excused absences (${rate.excused}) are excluded from the rate. The shorter recent school week on the dashboard is ${metrics.weekLabel}.`,
    };
  }

  if (/points|awarded last month|how many points/.test(q)) {
    const month = asOf.slice(0, 7);
    const prev = shiftMonth(month, -1);
    const inMonth = db.transactions.filter(
      (t) => t.at.slice(0, 7) === prev && t.direction === "credit" && learners.some((l) => l.id === t.learnerId),
    );
    const total = inMonth.reduce((s, t) => s + t.amount, 0);
    return {
      title: `Points credited in ${prev}`,
      usedAi: false,
      body: `${total} points were credited across ${inMonth.length} transactions in ${scope}. This is the ledger, not an estimate. Pending deductions are not included.`,
    };
  }

  if (/biggest challenge|educational challenge/.test(q) && session.role === "admin") {
    const alerts = alertsFor(db, learners, asOf).filter((a) => a.tone === "attention");
    return {
      title: "What needs attention",
      usedAi: false,
      body: alerts.length
        ? alerts
            .slice(0, 4)
            .map((a) => `${a.title}. ${a.body}`)
            .join(" ")
        : "No attendance, reading or assessment alerts are open on the current rules.",
    };
  }

  if (/class progress summary|progress summary/.test(q)) {
    const scores = db.results
      .filter((r) => learners.some((l) => l.id === r.learnerId))
      .map((r) => {
        const a = db.assessments.find((x) => x.id === r.assessmentId);
        return a ? percentage(r.score, a.maxScore) : null;
      })
      .filter((n): n is number => n !== null);
    const avg = mean(scores);
    return {
      title: "Class progress summary",
      usedAi: false,
      body: `${learners.length} active learners in ${scope}. ${scores.length} assessment results on file${avg === null ? "" : `, mean ${avg.toFixed(1)}%`}. ${db.reading.filter((r) => learners.some((l) => l.id === r.learnerId)).length} verified reading updates. Ask for mathematics improvement, missed sessions or reading stalls for a tighter answer.`,
    };
  }

  if (/literacy activity|grade 3/.test(q)) {
    return {
      title: "A literacy idea for Grade 3",
      usedAi: false,
      body: "Ten-minute paired reading: each child reads a familiar page aloud, then retells one event in their home language and one sentence in English. Follow with three words they want to use tomorrow. This is a classroom suggestion, not an assessment of any child.",
    };
  }

  return null;
}

function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Aggregates only. No surnames, phones, addresses or support notes. */
export function factsPacket(db: PendulaDB, session: Session, asOf: string): string {
  const learners = visibleLearners(db, session.role, session.staffId, session.parentId, session.learnerId).filter(
    (l) => l.status === "active",
  );
  const metrics = programmeMetrics(db, learners, asOf);
  const alerts = alertsFor(db, learners, asOf).slice(0, 6);
  return JSON.stringify({
    asOf,
    role: session.role,
    learners: metrics.active,
    attendance: {
      definition: "present+late over present+late+absent; excused excluded",
      recentEligible: metrics.eligible,
      attended: metrics.attended,
      percent: metrics.attendanceRate === null ? null : Math.round(metrics.attendanceRate * 100),
      window: metrics.weekLabel,
    },
    pointsHeld: metrics.held,
    pointsIssued: metrics.issued,
    interest: metrics.interest,
    assessmentResults: metrics.assessments,
    meanScore: metrics.meanScore === null ? null : Number(metrics.meanScore.toFixed(1)),
    byGrade: metrics.byGrade.filter((g) => g.learners),
    alerts: alerts.map((a) => ({ title: a.title.replace(/[A-Z][a-z]+ [A-Z][a-z]+/g, "a learner"), body: a.body })),
    note: "Do not invent numbers. If a figure is missing, say so. Points are virtual educational rewards, not rand.",
  });
}
