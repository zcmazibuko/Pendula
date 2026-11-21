import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatSaDate, isoDate, recentSchoolDays } from "@/lib/pendula/calendar";
import { currentStage, learnerLabel, percentage } from "@/lib/pendula/engine";
import { visibleLearners } from "@/lib/pendula/selectors";
import { usePendula } from "@/lib/pendula/store";
import type { AttendanceStatus } from "@/lib/pendula/types";
import { Empty, Field } from "./ui";

const STATUSES: AttendanceStatus[] = ["present", "late", "absent", "excused"];

export function Attendance() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const takeAttendance = usePendula((s) => s.takeAttendance);
  const staff = db.staff.find((s) => s.id === session.staffId);
  const classes = db.classes.filter((c) => session.role === "admin" || staff?.classIds.includes(c.id));
  const asOf = isoDate(new Date());
  const suggested = recentSchoolDays(1, asOf, db.org.terms, db.org.holidays)[0] || asOf;
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [date, setDate] = useState(suggested);
  const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.classId === classId && l.status === "active");
  const initial = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    for (const learner of learners) {
      map[learner.id] = db.attendance.find((a) => a.learnerId === learner.id && a.date === date)?.status || "present";
    }
    return map;
  }, [db.attendance, learners, date]);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(initial);
  const [lookup, setLookup] = useState("");

  const shown = lookup.trim()
    ? learners.filter((l) => `${l.id} ${l.firstName} ${l.surname}`.toLowerCase().includes(lookup.toLowerCase()))
    : learners;

  if (!classes.length) return <Empty title="No class assigned" body="An administrator needs to add a class and assign it to you." />;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Attendance</h1>
        <p className="text-muted">One attendance reward per learner per school day. A second save does not pay again. Changing present to absent asks an administrator before points move.</p>
      </header>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="Class">
          <select className="field" value={classId} onChange={(e) => { setClassId(e.target.value); setMarks({}); }}>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name} · {db.schools.find((s) => s.id === c.schoolId)?.name}</option>)}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" className="field" value={date} onChange={(e) => { setDate(e.target.value); setMarks({}); }} />
        </Field>
        <Field label="Find ID or name">
          <input className="field" value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="PEN-2026-00001" />
        </Field>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-quiet" onClick={() => setMarks(Object.fromEntries(learners.map((l) => [l.id, "present"])))}>Mark all present</button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            const payload = learners.map((l) => ({ learnerId: l.id, status: marks[l.id] || initial[l.id] || "present" }));
            const result = takeAttendance(classId, date, payload);
            if (result.error) toast.error(result.error);
            else toast.success(`${result.posted || 0} new rewards. ${result.corrections || 0} corrections sent for approval.`);
          }}
        >
          Save register
        </button>
      </div>
      <ul className="space-y-2">
        {shown.map((learner) => {
          const status = marks[learner.id] || initial[learner.id] || "present";
          return (
            <li key={learner.id} className="panel flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{learnerLabel(learner)}</p>
                <p className="text-sm text-muted">{learner.id}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {STATUSES.map((item) => (
                  <button key={item} type="button" className={`btn ${status === item ? "" : "btn-ghost"} px-3`} onClick={() => setMarks((m) => ({ ...initial, ...m, [learner.id]: item }))}>
                    {item}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Assessments() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const addAssessment = usePendula((s) => s.addAssessment);
  const markAssessment = usePendula((s) => s.markAssessment);
  const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.status === "active");
  const [selected, setSelected] = useState(db.assessments[0]?.id || "");
  const [grade, setGrade] = useState(5);
  const assessment = db.assessments.find((a) => a.id === selected);
  const cohort = learners.filter((l) => assessment && l.grade === assessment.grade);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Assessments</h1>
        <p className="text-muted">Participation points post once. Improvement points need the same series, subject and grade. 45% then 60% is 15 percentage points, times 5, capped at 50.</p>
      </header>
      <form
        className="panel grid gap-3 p-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const result = addAssessment({
            name: String(data.get("name") || ""),
            subject: String(data.get("subject") || ""),
            grade: Number(data.get("grade")),
            date: String(data.get("date") || isoDate(new Date())),
            type: String(data.get("type") || "class check"),
            maxScore: Number(data.get("max") || 100),
            seriesId: String(data.get("series") || ""),
            outcomes: String(data.get("outcomes") || ""),
          });
          if (result.error) toast.error(result.error);
          else {
            toast.success("Assessment created. Mark it to award points.");
            if (result.id) setSelected(result.id);
            e.currentTarget.reset();
          }
        }}
      >
        <Field label="Name"><input name="name" className="field" required placeholder="Mathematics check 3" /></Field>
        <Field label="Subject"><input name="subject" className="field" required defaultValue="Mathematics" /></Field>
        <Field label="Grade">
          <select name="grade" className="field" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
          </select>
        </Field>
        <Field label="Date"><input name="date" type="date" className="field" defaultValue={isoDate(new Date())} /></Field>
        <Field label="Maximum score"><input name="max" className="field" defaultValue={100} inputMode="numeric" /></Field>
        <Field label="Series id (needed for improvement)"><input name="series" className="field" placeholder="maths-g5" /></Field>
        <Field label="Type"><input name="type" className="field" defaultValue="class check" /></Field>
        <Field label="Learning outcome"><input name="outcomes" className="field" placeholder="What this task shows" /></Field>
        <button className="btn sm:col-span-2 w-fit" type="submit">Create assessment</button>
      </form>
      <Field label="Mark an assessment">
        <select className="field" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Choose</option>
          {db.assessments.map((a) => <option key={a.id} value={a.id}>{a.date} · Grade {a.grade} · {a.subject} · {a.name}</option>)}
        </select>
      </Field>
      {assessment ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const rows = cohort.map((l) => ({
              learnerId: l.id,
              score: Number(data.get(`score-${l.id}`)),
              comment: String(data.get(`comment-${l.id}`) || ""),
            })).filter((r) => Number.isFinite(r.score));
            const result = markAssessment(assessment.id, rows);
            if (result.error) toast.error(result.error);
            else toast.success(`${result.participation || 0} participation rewards, ${result.improvement || 0} improvement rewards. Repeats do not pay again.`);
          }}
        >
          {cohort.map((l) => {
            const existing = db.results.find((r) => r.assessmentId === assessment.id && r.learnerId === l.id);
            return (
              <div key={l.id} className="panel grid gap-2 px-3 py-3 sm:grid-cols-[1fr_7rem_1fr] sm:items-center">
                <div>
                  <p className="font-semibold">{learnerLabel(l)}</p>
                  <p className="text-sm text-muted">{existing ? `${existing.score}/${assessment.maxScore} · ${Math.round(percentage(existing.score, assessment.maxScore))}%` : "Not marked"}</p>
                </div>
                <input name={`score-${l.id}`} className="field" inputMode="decimal" defaultValue={existing?.score ?? ""} placeholder={`0–${assessment.maxScore}`} />
                <input name={`comment-${l.id}`} className="field" defaultValue={existing?.comment || ""} placeholder="Comment" />
              </div>
            );
          })}
          {cohort.length === 0 ? <p className="text-muted">No active learners in this grade are in your classes.</p> : <button className="btn" type="submit">Save marks</button>}
        </form>
      ) : null}
    </div>
  );
}

export function Reading() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const verifyReading = usePendula((s) => s.verifyReading);
  const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.status === "active");
  const [learnerId, setLearnerId] = useState(learners[0]?.id || "");
  const stage = currentStage(db, learnerId);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Reading Eggs</h1>
        <p className="text-muted">There is no official feed in this copy. A teacher verifies a stage. Each new stage pays once. Uploading the same stage again pays nothing. Stages are not school grades.</p>
      </header>
      <form
        className="panel grid gap-3 p-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const result = verifyReading(learnerId, Number(data.get("stage")), String(data.get("date") || isoDate(new Date())), String(data.get("evidence") || ""));
          if (result.error) toast.error(result.error);
          else toast.success(result.awarded ? `${result.awarded} points for newly verified stages.` : "Recorded. No new stage reward.");
        }}
      >
        <Field label="Learner">
          <select className="field" value={learnerId} onChange={(e) => setLearnerId(e.target.value)}>
            {learners.map((l) => <option key={l.id} value={l.id}>{learnerLabel(l)} · stage {currentStage(db, l.id) || "none"}</option>)}
          </select>
        </Field>
        <Field label={`New stage (current ${stage || "none"})`}>
          <input name="stage" className="field" inputMode="numeric" required placeholder={String(stage + 1)} />
        </Field>
        <Field label="Date seen"><input name="date" type="date" className="field" defaultValue={isoDate(new Date())} /></Field>
        <Field label="Evidence"><input name="evidence" className="field" required placeholder="Checked the map with the learner" /></Field>
        <button className="btn w-fit" type="submit">Verify stage</button>
      </form>
      <section className="panel p-4">
        <h2 className="display text-2xl">Latest verifications</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {db.reading.slice(-8).reverse().map((event) => {
            const learner = db.learners.find((l) => l.id === event.learnerId);
            return <li key={event.id}>{formatSaDate(event.date)} · {learner ? learnerLabel(learner) : event.learnerId} · stage {event.previousStage} to {event.stage}. {event.evidence}</li>;
          })}
        </ul>
      </section>
    </div>
  );
}
