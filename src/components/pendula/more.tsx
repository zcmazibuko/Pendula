import { useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatSaDate, isoDate } from "@/lib/pendula/calendar";
import { downloadText, toCsv } from "@/lib/pendula/documents";
import { askPendula } from "@/lib/pendula/ask";
import { answerLocally, factsPacket } from "@/lib/pendula/intelligence";
import { integrityOk, ledgerBalanced, percentage } from "@/lib/pendula/engine";
import { alertsFor, dataQuality, pointsHistogram, programmeMetrics, visibleLearners } from "@/lib/pendula/selectors";
import { usePendula } from "@/lib/pendula/store";
import type { RewardPolicy } from "@/lib/pendula/types";
import { Field } from "./ui";

export function Insights() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const noteAiUse = usePendula((s) => s.noteAiUse);
  const openLearner = usePendula((s) => s.openLearner);
  const asOf = isoDate(new Date());
  const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.status === "active");
  const alerts = alertsFor(db, learners, asOf);
  const metrics = programmeMetrics(db, learners, asOf);
  const histogram = pointsHistogram(db, learners);
  const notices = db.notifications.filter((n) => n.audience === session.role).slice(0, 6);
  const [question, setQuestion] = useState("Which learners have missed three sessions?");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  const ask = async (useModel: boolean) => {
    const local = answerLocally(db, session, question, asOf);
    if (!useModel) {
      setAnswer(local?.body || "I can answer attendance, mathematics improvement, reading stalls, points last month, and a class summary from the ledger. Try one of those, or ask the model to explain the figures.");
      return;
    }
    if (!noteAiUse()) {
      toast.error("The daily assistant limit on this device is 12 questions.");
      return;
    }
    setBusy(true);
    try {
      const result = await askPendula({ data: { question, facts: factsPacket(db, session, asOf) } });
      if (!result.ok) setAnswer(result.error);
      else setAnswer(result.text);
    } catch {
      setAnswer(local?.body || "The assistant is unavailable. The figures on this page are still calculated from the ledger.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Insights</h1>
        <p className="text-muted">Rules and arithmetic decide balances and alerts. The assistant may only explain the figures it is given. It cannot approve a deduction or invent a statistic.</p>
      </header>
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-4">
          <h2 className="display text-2xl">Points held</h2>
          <p className="text-sm text-muted">{learners.length} active learners in your view. Mean assessment score {metrics.meanScore === null ? "—" : `${metrics.meanScore.toFixed(1)}%`}.</p>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogram}>
                <XAxis dataKey="label" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} width={28} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="learners" fill="var(--gold)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-4">
          <h2 className="display text-2xl">Pendula Intelligence</h2>
          <textarea className="field mt-3 min-h-24" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={() => ask(false)}>Answer from the ledger</button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => ask(true)}>{busy ? "Asking…" : "Explain with the model"}</button>
          </div>
          {answer ? <p className="mt-3 text-sm">{answer}</p> : null}
        </section>
      </div>
      <section className="space-y-3">
        {alerts.map((alert) => (
          <button key={alert.id} type="button" className="panel block w-full px-4 py-3 text-left" onClick={() => alert.learnerId && openLearner(alert.learnerId)}>
            <p className="font-semibold">{alert.title}</p>
            <p className="text-sm text-muted">{alert.body}</p>
          </button>
        ))}
      </section>
      {notices.length ? (
        <section className="panel p-4">
          <h2 className="display text-2xl">Notices</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {notices.map((n) => <li key={n.id}><span className="font-semibold">{n.title}.</span> {n.body}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function Reports() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const asOf = isoDate(new Date());
  const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.status !== "merged");

  const download = (name: string, rows: (string | number)[][]) => downloadText(`${name}.csv`, toCsv(rows));

  const items: { name: string; blurb: string; run: () => void }[] = [
    {
      name: "Learner register",
      blurb: "Identity, grade, school and status.",
      run: () => download("learners", [
        ["Learner ID", "Account", "Name", "Surname", "DOB", "Grade", "School", "Status"],
        ...learners.map((l) => [l.id, l.accountNumber, l.firstName, l.surname, l.dob, l.grade, db.schools.find((s) => s.id === l.schoolId)?.name || "", l.status]),
      ]),
    },
    {
      name: "Attendance",
      blurb: "Every mark you are allowed to see.",
      run: () => download("attendance", [
        ["Date", "Learner ID", "Status", "Class"],
        ...db.attendance.filter((a) => learners.some((l) => l.id === a.learnerId)).map((a) => [a.date, a.learnerId, a.status, a.classId]),
      ]),
    },
    {
      name: "Assessment progress",
      blurb: "Scores and percentages.",
      run: () => download("assessments", [
        ["Date", "Learner ID", "Subject", "Assessment", "Score", "Max", "Percent"],
        ...db.results.filter((r) => learners.some((l) => l.id === r.learnerId)).map((r) => {
          const a = db.assessments.find((x) => x.id === r.assessmentId);
          return [a?.date || "", r.learnerId, a?.subject || "", a?.name || "", r.score, a?.maxScore || "", a ? Math.round(percentage(r.score, a.maxScore)) : ""];
        }),
      ]),
    },
    {
      name: "Reading Eggs",
      blurb: "Teacher-verified stages.",
      run: () => download("reading", [["Date", "Learner ID", "From", "To", "Evidence"], ...db.reading.filter((r) => learners.some((l) => l.id === r.learnerId)).map((r) => [r.date, r.learnerId, r.previousStage, r.stage, r.evidence])]),
    },
    {
      name: "Points ledger",
      blurb: "Every credit and debit in scope.",
      run: () => download("ledger", [["When", "Learner ID", "Type", "Direction", "Amount", "Reason", "Key"], ...db.transactions.filter((t) => learners.some((l) => l.id === t.learnerId)).map((t) => [t.at, t.learnerId, t.type, t.direction, t.amount, t.reason, t.idempotencyKey])]),
    },
    {
      name: "Interest",
      blurb: "Interest credits only.",
      run: () => download("interest", [["When", "Learner ID", "Amount", "Reason"], ...db.transactions.filter((t) => t.type === "interest" && learners.some((l) => l.id === t.learnerId)).map((t) => [t.at, t.learnerId, t.amount, t.reason])]),
    },
    {
      name: "Programme snapshot",
      blurb: "Counts, attendance definition and points held.",
      run: () => {
        const m = programmeMetrics(db, learners, asOf);
        download("programme", [
          ["Metric", "Value", "Note"],
          ["Active learners", m.active, ""],
          ["Attendance percent", m.attendanceRate === null ? "" : Math.round(m.attendanceRate * 100), "present+late over present+late+absent; excused excluded"],
          ["Eligible marks", m.eligible, m.weekLabel],
          ["Points held", m.held, "virtual points, not rand"],
          ["Interest posted", m.interest, ""],
          ["Mean assessment %", m.meanScore === null ? "" : m.meanScore.toFixed(1), ""],
        ]);
      },
    },
    {
      name: "Data quality",
      blurb: "Missing fields and the ledger check.",
      run: () => {
        const q = dataQuality(db);
        const ledger = ledgerBalanced(db);
        download("data-quality", [
          ["Check", "Value"],
          ["Missing guardian phone", q.missingPhone],
          ["Missing home language", q.missingLanguage],
          ["Inactive", q.inactive],
          ["Exact duplicate name and date of birth", q.duplicateHints],
          ["Ledger balanced", ledger.ok ? "yes" : "no"],
          ["Integrity stamp", integrityOk(db) ? "matches" : "failed"],
        ]);
      },
    },
  ];

  if (session.role === "admin") {
    items.push({
      name: "Audit trail",
      blurb: "Append-only actions. Staff cannot delete this from the app.",
      run: () => download("audit", [["When", "Actor", "Role", "Action", "Target", "Detail"], ...db.audit.map((a) => [a.at, a.actorId, a.role, a.action, a.target, a.detail])]),
    });
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Reports</h1>
        <p className="text-muted">CSV opens in Excel. Statements with the Pendula heading are on the Bank page as PDF and CSV. Teachers only receive rows in their classes.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item.name} className="panel p-4">
            <h2 className="display text-2xl">{item.name}</h2>
            <p className="text-sm text-muted">{item.blurb}</p>
            <button type="button" className="btn mt-3" onClick={item.run}>Download CSV</button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function SettingsView() {
  const db = usePendula((s) => s.db);
  const savePolicy = usePendula((s) => s.savePolicy);
  const postInterest = usePendula((s) => s.postInterest);
  const saveStaff = usePendula((s) => s.saveStaff);
  const toggleStaff = usePendula((s) => s.toggleStaff);
  const addSchool = usePendula((s) => s.addSchool);
  const addClass = usePendula((s) => s.addClass);
  const replaceBackup = usePendula((s) => s.replaceBackup);
  const clearDemo = usePendula((s) => s.clearDemo);
  const [policy, setPolicy] = useState<RewardPolicy>(db.org.policy);
  const [pin, setPin] = useState("");
  const quality = dataQuality(db);
  const ledger = ledgerBalanced(db);
  const month = isoDate(new Date()).slice(0, 7);

  const setPoints = (key: keyof RewardPolicy["points"], value: number) => {
    setPolicy({ ...policy, points: { ...policy.points, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Settings</h1>
        <p className="text-muted">Policy changes apply to future rewards only. {formatSaDate(policy.effectiveFrom)} is the current version {policy.version}.</p>
      </header>
      <section className="panel grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="display text-2xl sm:col-span-2">Reward policy</h2>
        {(
          [
            ["attendancePresent", "Present"],
            ["attendanceLate", "Late"],
            ["assessmentComplete", "Assessment"],
            ["improvementPerPoint", "Per improvement point"],
            ["improvementCap", "Improvement cap"],
            ["readingStage", "Reading stage"],
            ["perfectWeek", "Perfect week"],
            ["learningMilestone", "Other milestone"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <input className="field" inputMode="numeric" value={policy.points[key]} onChange={(e) => setPoints(key, Number(e.target.value))} />
          </Field>
        ))}
        <Field label="Interest percent per month">
          <input className="field" inputMode="decimal" value={policy.interest.ratePercent} onChange={(e) => setPolicy({ ...policy, interest: { ...policy.interest, ratePercent: Number(e.target.value) } })} />
        </Field>
        <Field label="Rounding">
          <select className="field" value={policy.interest.rounding} onChange={(e) => setPolicy({ ...policy, interest: { ...policy.interest, rounding: e.target.value as RewardPolicy["interest"]["rounding"] } })}>
            <option value="nearest">Nearest whole point</option>
            <option value="floor">Round down</option>
            <option value="ceil">Round up</option>
          </select>
        </Field>
        <label className="text-sm"><input type="checkbox" className="mr-2" checked={policy.approved} onChange={(e) => setPolicy({ ...policy, approved: e.target.checked })} />Reward policy approved</label>
        <label className="text-sm"><input type="checkbox" className="mr-2" checked={policy.interest.approved} onChange={(e) => setPolicy({ ...policy, interest: { ...policy.interest, approved: e.target.checked } })} />Interest policy approved</label>
        <label className="text-sm"><input type="checkbox" className="mr-2" checked={policy.interest.suspended} onChange={(e) => setPolicy({ ...policy, interest: { ...policy.interest, suspended: e.target.checked } })} />Suspend future interest</label>
        <button type="button" className="btn w-fit" onClick={() => { const error = savePolicy(policy, policy.approved); if (error) toast.error(error); else toast.success("Policy saved. Old transactions were left as they were."); }}>Save policy</button>
      </section>
      <section className="panel flex flex-wrap items-end gap-2 p-4">
        <Field label="Post interest through month">
          <input id="interest-month" className="field" defaultValue={month} />
        </Field>
        <button
          type="button"
          className="btn"
          onClick={() => {
            const value = (document.getElementById("interest-month") as HTMLInputElement).value;
            const result = postInterest(value);
            if (result.error) toast.error(result.error);
            else toast.success(`${result.posted || 0} interest credits posted. Running it again will not double-pay.`);
          }}
        >
          Run interest
        </button>
        <p className="text-sm text-muted">1,000 points at 1% posts 10 points. 1,010 the next month is 10.1, which rounds to 10 on “nearest”. A month only posts after it has ended. This runs when an administrator presses the button, because a browser cannot be the clock.</p>
      </section>
      <section className="panel grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="display text-2xl sm:col-span-2">Schools and classes</h2>
        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); const error = addSchool(String(d.get("name")), String(d.get("area")), "combined"); if (error) toast.error(error); else e.currentTarget.reset(); }}>
          <input name="name" className="field" placeholder="School name" required />
          <input name="area" className="field" placeholder="Site or suburb" />
          <button className="btn btn-ghost" type="submit">Add school</button>
        </form>
        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); const error = addClass(String(d.get("name")), Number(d.get("grade")), String(d.get("school")), String(d.get("teacher"))); if (error) toast.error(error); else e.currentTarget.reset(); }}>
          <input name="name" className="field" placeholder="Class name" />
          <input name="grade" className="field" inputMode="numeric" placeholder="Grade" required />
          <select name="school" className="field">{db.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select name="teacher" className="field">{db.staff.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <button className="btn btn-ghost" type="submit">Add class</button>
        </form>
        <ul className="text-sm sm:col-span-2">
          {db.classes.map((c) => <li key={c.id}>{c.name} · Grade {c.grade} · {db.schools.find((s) => s.id === c.schoolId)?.name} · {db.staff.find((s) => s.id === c.teacherId)?.name}</li>)}
        </ul>
      </section>
      <section className="panel p-4">
        <h2 className="display text-2xl">Staff</h2>
        <p className="text-sm text-muted">At most three active administrators. PINs stay on this device. They are a shared-tablet control, not multi-factor authentication.</p>
        <ul className="mt-2 space-y-1 text-sm">
          {db.staff.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2">
              <span>{s.name} · {s.role} · {s.active ? "active" : "inactive"}{db.org.demoCohort && s.id !== "staff-founder" ? ` · PIN ${s.pin}` : ""}</span>
              {s.id !== "staff-founder" ? <button type="button" className="btn btn-ghost" onClick={() => { const error = toggleStaff(s.id, !s.active); if (error) toast.error(error); }}>{s.active ? "Deactivate" : "Restore"}</button> : null}
            </li>
          ))}
        </ul>
        <form className="mt-3 grid gap-2 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); const error = saveStaff({ name: String(d.get("name")), role: String(d.get("role")) as "admin" | "teacher", email: String(d.get("email") || ""), pin, classIds: [] }); if (error) toast.error(error); else { toast.success("Staff added"); e.currentTarget.reset(); setPin(""); } }}>
          <input name="name" className="field" placeholder="Name" required />
          <select name="role" className="field"><option value="teacher">Teacher</option><option value="admin">Administrator</option></select>
          <input className="field" inputMode="numeric" maxLength={4} placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          <button className="btn" type="submit">Add</button>
        </form>
      </section>
      <section className="panel p-4 text-sm">
        <h2 className="display text-2xl">Data quality</h2>
        <p className="mt-2">Missing phones {quality.missingPhone}. Missing language {quality.missingLanguage}. Inactive {quality.inactive}. Exact duplicate name and birth date {quality.duplicateHints}.</p>
        <p>Ledger {ledger.ok ? "balances" : `problem: ${ledger.problems[0]}`}. Integrity stamp {integrityOk(db) ? "matches" : "does not match"}.</p>
        <p className="mt-2">Calendar in use: {db.org.terms.map((t) => `${t.name} ${formatSaDate(t.start)}–${formatSaDate(t.end)}`).join("; ")}. Public holidays include Freedom Day, Workers' Day, Youth Day and the observed Women's Day. Edit is not a full provincial editor yet — confirm dates against the Government Gazette if a site differs.</p>
      </section>
      <section className="panel p-4 text-sm">
        <h2 className="display text-2xl">Backup</h2>
        <p className="mt-2">Export the whole programme, including the ledger. Restoring replaces this device's copy.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => downloadText(`pendula-backup-${isoDate(new Date())}.json`, JSON.stringify(db), "application/json")}>Export backup</button>
          <label className="btn btn-ghost">
            Restore
            <input type="file" accept="application/json" className="sr-only" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const error = replaceBackup(await file.text()); if (error) toast.error(error); else toast.success("Backup restored"); }} />
          </label>
          {db.org.demoCohort ? <button type="button" className="btn btn-danger" onClick={() => { if (confirm("Remove the demonstration cohort from this device? This cannot be undone without a backup.")) clearDemo(); }}>Remove demonstration data</button> : null}
        </div>
      </section>
      <section className="panel p-4 text-sm">
        <h2 className="display text-2xl">How this copy runs</h2>
        <p className="mt-2">This Pendula is an installable web app. The ledger, registers and reports work on this device without a Google bill. It is not connected to Firebase, and it does not send children's names to the assistant — model questions receive counts and definitions only.</p>
        <p className="mt-2">A multi-school cloud with real sign-in, server-side security rules and scheduled interest needs a Google Cloud project in your own account. That step is not switched on here, because it needs your authorisation and can require billing even inside a free allowance. Until then, treat the backup file as the recovery copy and do not put real children's records on a shared browser.</p>
        <p className="mt-2">At the demonstration size the ledger is a few hundred transactions. Five hundred learner records were exercised in the automated check without duplicate rewards. Expect the browser copy to stay comfortable at that size. Push notifications, SMS and WhatsApp are not connected.</p>
      </section>
    </div>
  );
}

export function Manuals() {
  const [tab, setTab] = useState("admin");
  const tabs = [
    ["admin", "Administrators"],
    ["teacher", "Teachers"],
    ["bank", "Banking"],
    ["privacy", "Privacy"],
    ["recovery", "Backup"],
  ] as const;
  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Manuals</h1>
        <p className="text-muted">South African English. Written for the people who will actually use the register.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => <button key={id} type="button" className={`btn ${tab === id ? "" : "btn-ghost"}`} onClick={() => setTab(id)}>{label}</button>)}
      </div>
      <article className="panel space-y-3 p-5 text-sm leading-6">
        {tab === "admin" ? (
          <>
            <h2 className="display text-2xl">Administrator manual</h2>
            <p>Finish setup before rewards go live. Approve the points table and, separately, the interest rule. Add schools, classes and at most three active administrators. Assign each class to a teacher. Import learners from the CSV template, or register them one by one. If Pendula says a child may already exist, stop and look. Do not merge on a similar name.</p>
            <p>Deactivate a learner rather than hoping the history disappears. History stays. Deductions wait in Approvals. You cannot approve a request you made yourself. Run interest after a month has ended. Export a backup the same day you register real children.</p>
          </>
        ) : null}
        {tab === "teacher" ? (
          <>
            <h2 className="display text-2xl">Teacher manual</h2>
            <p>Open Today, then Take attendance. Mark the class and save. Saving twice does not pay twice. If you change a present mark to absent, Pendula asks an administrator before any points leave the account.</p>
            <p>Create an assessment, then enter scores. Put the same series id on tasks that are fair to compare. A child who moves from 45% to 60% has improved by 15 percentage points, not by “33% more”. Reading Eggs stages are verified by you. There is no hidden connection to the Reading Eggs website. You may request a correction. You may not delete a transaction, a learner, or another teacher.</p>
          </>
        ) : null}
        {tab === "bank" ? (
          <>
            <h2 className="display text-2xl">Banking manual</h2>
            <p>Every learner receives an account when they are registered. The balance is the sum of credits minus approved debits. Attendance, assessment participation, assessment improvement, reading stages, perfect weeks, administrator bonuses and interest are the credit types. Debits exist only after approval, or as the other side of a balanced ledger entry.</p>
            <p>Interest at 1% on 1,000 points is 10 points. The next month, 1% of 1,010 is 10.1, which becomes 10 points when the rule says nearest whole point. Statements show opening balance, each line, and a closing balance that matches the ledger. The footer always says the points are not rand.</p>
            <p>Goals do not lock points. Badges follow published rules. Leaderboards are not shown, so children are not ranked against each other in public.</p>
          </>
        ) : null}
        {tab === "privacy" ? (
          <>
            <h2 className="display text-2xl">Privacy and safeguarding</h2>
            <p>This programme processes children's personal information. POPIA expects a lawful basis, a clear purpose, as little data as possible, and special care for children. Ordinary “the parent said yes” does not answer every legal question. Have a qualified South African privacy practitioner review a real deployment before you collect production records.</p>
            <p>Pendula does not ask for identity numbers. Gender is optional. Support notes marked confidential stay with administrators. Parents do not see them. The assistant is sent counts and definitions, not surnames, phones or notes. There is no facial recognition. There is no public dashboard.</p>
            <p>Do not deduct points for poverty, illness, disability or any protected characteristic. The approval screen warns when a reason appears to do that. Alerts describe attendance and scores. They do not diagnose a child.</p>
          </>
        ) : null}
        {tab === "recovery" ? (
          <>
            <h2 className="display text-2xl">Backup and recovery</h2>
            <p>Settings, Export backup, saves a JSON file. Keep it somewhere the school controls. To recover this device, choose Restore and pick that file. If the integrity warning appears, stop and restore a backup you trust. Do not keep editing a ledger that no longer matches its stamp.</p>
            <p>Demonstration learners are fictional. Remove them before a real register is imported. This copy does not sync itself to another phone. The backup file is the copy that moves.</p>
          </>
        ) : null}
      </article>
    </div>
  );
}
