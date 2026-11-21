import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ageOn, formatSaDate, isoDate } from "@/lib/pendula/calendar";
import { balanceParts, findDuplicates, learnerLabel } from "@/lib/pendula/engine";
import { IMPORT_TEMPLATE, parseImportCsv, type LearnerDraft } from "@/lib/pendula/people";
import { visibleLearners } from "@/lib/pendula/selectors";
import { usePendula } from "@/lib/pendula/store";
import { downloadText } from "@/lib/pendula/documents";
import { Empty, Field, Modal } from "./ui";

export function Learners() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const nav = usePendula((s) => s.nav);
  const focus = usePendula((s) => s.focusLearnerId);
  const openLearner = usePendula((s) => s.openLearner);
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const learners = visibleLearners(db, session.role, session.staffId, session.parentId, session.learnerId).filter((l) => l.status !== "merged");
  const filtered = learners.filter((l) => {
    const school = db.schools.find((s) => s.id === l.schoolId)?.name || "";
    const blob = `${l.firstName} ${l.surname} ${l.preferredName} ${l.id} ${l.accountNumber} ${school} ${l.grade}`.toLowerCase();
    if (grade !== "all" && String(l.grade) !== grade) return false;
    return blob.includes(q.toLowerCase().trim());
  });
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const slice = filtered.slice(page * 8, page * 8 + 8);
  const selected = learners.find((l) => l.id === focus);

  if (nav === "learner" && selected) return <Profile />;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-4xl">Learners</h1>
          <p className="text-muted">{filtered.length} in view. Names are never the only identifier.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setShowImport(true)}>Import</button>
          <button type="button" className="btn" onClick={() => setShowForm(true)}>Register</button>
        </div>
      </header>
      <div className="grid gap-2 sm:grid-cols-[1fr_10rem]">
        <input className="field" placeholder="Search name, Pendula ID, account or school" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        <select className="field" value={grade} onChange={(e) => { setGrade(e.target.value); setPage(0); }}>
          <option value="all">All grades</option>
          {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Grade {i + 1}</option>)}
        </select>
      </div>
      {slice.length === 0 ? (
        <Empty title="No learners match" body="Register a child, or clear the search. An empty programme is ready for a real import." />
      ) : (
        <div className="grid gap-2">
          {slice.map((l) => (
            <button key={l.id} type="button" className="panel flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-left" onClick={() => openLearner(l.id)}>
              <span>
                <span className="font-semibold">{learnerLabel(l)}</span>
                <span className="mt-0.5 block text-sm text-muted">{l.id} · Grade {l.grade} · {db.schools.find((s) => s.id === l.schoolId)?.name} · {l.status}</span>
              </span>
              <span className="display text-2xl text-gold">{balanceParts(db, l.id).balance}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <button type="button" className="btn btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
        <span>Page {page + 1} of {pages}</span>
        <button type="button" className="btn btn-ghost" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
      {showForm ? <Register onClose={() => setShowForm(false)} /> : null}
      {showImport ? <ImportBox onClose={() => setShowImport(false)} /> : null}
    </div>
  );
}

function Register({ onClose }: { onClose: () => void }) {
  const db = usePendula((s) => s.db);
  const register = usePendula((s) => s.register);
  const [schoolId, setSchoolId] = useState(db.schools[0]?.id || "");
  const classes = db.classes.filter((c) => c.schoolId === schoolId);
  const [dupes, setDupes] = useState<{ learnerId: string; level: string; reasons: string[] }[]>([]);
  const [draft, setDraft] = useState<LearnerDraft | null>(null);

  const submit = (ignore: boolean) => (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const form = (e?.currentTarget || document.getElementById("register-form")) as HTMLFormElement;
    const data = new FormData(form);
    const classId = String(data.get("classId") || "");
    const cls = db.classes.find((c) => c.id === classId);
    const next: LearnerDraft = {
      firstName: String(data.get("firstName") || ""),
      surname: String(data.get("surname") || ""),
      preferredName: String(data.get("preferredName") || ""),
      dob: String(data.get("dob") || ""),
      gender: String(data.get("gender") || ""),
      grade: cls?.grade || Number(data.get("grade")),
      schoolId: String(data.get("schoolId") || ""),
      classId,
      homeLanguage: String(data.get("homeLanguage") || ""),
      area: String(data.get("area") || ""),
      guardianName: String(data.get("guardianName") || ""),
      guardianPhone: String(data.get("guardianPhone") || ""),
      readingEggsId: String(data.get("readingEggsId") || ""),
    };
    setDraft(next);
    const result = register(next, ignore);
    if (result.duplicates?.length && !ignore) {
      setDupes(result.duplicates);
      toast.message("Possible existing learner found. Please review before continuing.");
      return;
    }
    if (result.error) toast.error(result.error);
    else onClose();
  };

  return (
    <Modal title="Register a learner" onClose={onClose}>
      <form id="register-form" className="grid gap-3 sm:grid-cols-2" onSubmit={submit(false)}>
        <Field label="First name"><input name="firstName" className="field" required defaultValue={draft?.firstName} /></Field>
        <Field label="Surname"><input name="surname" className="field" required defaultValue={draft?.surname} /></Field>
        <Field label="Preferred name"><input name="preferredName" className="field" defaultValue={draft?.preferredName} /></Field>
        <Field label="Date of birth"><input name="dob" type="date" className="field" required defaultValue={draft?.dob} /></Field>
        <Field label="Gender (optional)"><input name="gender" className="field" defaultValue={draft?.gender} /></Field>
        <Field label="Home language"><input name="homeLanguage" className="field" defaultValue={draft?.homeLanguage} /></Field>
        <Field label="School">
          <select name="schoolId" className="field" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
            {db.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Grade">
          <select name="grade" className="field" defaultValue={classes[0]?.grade || 1}>
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
          </select>
        </Field>
        <Field label="Class">
          <select name="classId" className="field">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Area"><input name="area" className="field" /></Field>
        <Field label="Guardian"><input name="guardianName" className="field" /></Field>
        <Field label="Guardian phone"><input name="guardianPhone" className="field" /></Field>
        <Field label="Reading Eggs ID"><input name="readingEggsId" className="field" /></Field>
        {dupes.length ? (
          <div className="sm:col-span-2 rounded-xl bg-gold-soft p-3 text-sm">
            <p className="font-semibold">Possible existing learner found. Please review before continuing.</p>
            {dupes.map((d) => {
              const person = db.learners.find((l) => l.id === d.learnerId);
              return <p key={d.learnerId} className="mt-1">{person ? `${learnerLabel(person)} · ${person.id} · ${person.dob}` : d.learnerId} — {d.level}. {d.reasons.join(" ")}</p>;
            })}
            <button type="button" className="btn btn-gold mt-3" onClick={() => submit(true)()}>I reviewed this. Register a different child.</button>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <button className="btn" type="submit">Check and register</button>
        </div>
      </form>
      {db.schools.length === 0 ? <p className="mt-3 text-sm text-danger">Add a school and class in Settings before registering.</p> : null}
    </Modal>
  );
}

function ImportBox({ onClose }: { onClose: () => void }) {
  const db = usePendula((s) => s.db);
  const applyImport = usePendula((s) => s.applyImport);
  const [rows, setRows] = useState<ReturnType<typeof parseImportCsv> | null>(null);

  return (
    <Modal title="Import learners" onClose={onClose}>
      <p className="text-sm text-muted">CSV, up to 500 rows. Existing records are never overwritten. Confirmed duplicates are skipped.</p>
      <button type="button" className="btn btn-ghost mt-3" onClick={() => downloadText("pendula-learner-template.csv", IMPORT_TEMPLATE)}>Download template</button>
      <input
        className="mt-3 block w-full text-sm"
        type="file"
        accept=".csv,text/csv"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          setRows(parseImportCsv(text, db));
        }}
      />
      {rows?.error ? <p className="mt-3 text-sm text-danger">{rows.error}</p> : null}
      {rows?.rows ? (
        <div className="mt-3 max-h-64 overflow-auto text-sm">
          {rows.rows.map((row) => (
            <p key={row.line} className="border-b border-line py-1">
              Line {row.line}: {row.errors[0] || row.warnings[0] || "Ready"} {row.draft ? `· ${row.draft.firstName} ${row.draft.surname}` : ""}
            </p>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        className="btn mt-4"
        disabled={!rows?.rows?.length}
        onClick={() => {
          if (!rows?.rows) return;
          const result = applyImport(rows.rows);
          if (result.error) toast.error(result.error);
          else {
            toast.success(`${result.added || 0} added, ${result.skipped || 0} skipped`);
            onClose();
          }
        }}
      >
        Import ready rows
      </button>
    </Modal>
  );
}

function Profile() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const id = usePendula((s) => s.focusLearnerId)!;
  const learner = db.learners.find((l) => l.id === id);
  const editLearner = usePendula((s) => s.editLearner);
  const askDeduction = usePendula((s) => s.askDeduction);
  const addNote = usePendula((s) => s.addNote);
  const sendMessage = usePendula((s) => s.sendMessage);
  const merge = usePendula((s) => s.merge);
  const setNav = usePendula((s) => s.setNav);
  const asOf = isoDate(new Date());
  const [mergeId, setMergeId] = useState("");
  const dupes = useMemo(
    () => (learner ? findDuplicates(db.learners, { firstName: learner.firstName, surname: learner.surname, dob: learner.dob, guardianPhone: learner.guardianPhone }, learner.id) : []),
    [db.learners, learner],
  );
  if (!learner) return <Empty title="Learner not found" body="They may have been merged." action={<button className="btn" type="button" onClick={() => setNav("learners")}>Back</button>} />;
  const parts = balanceParts(db, learner.id);
  const school = db.schools.find((s) => s.id === learner.schoolId);
  const notes = db.interventions.filter((n) => n.learnerId === learner.id && (session.role === "admin" || !n.confidential));

  return (
    <div className="space-y-4">
      <button type="button" className="btn btn-ghost" onClick={() => setNav("learners")}>All learners</button>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{learner.id} · {learner.accountNumber}</p>
          <h1 className="display text-4xl">{learnerLabel(learner)}</h1>
          <p className="text-muted">Grade {learner.grade} · {school?.name} · age {ageOn(learner.dob, asOf)} · {learner.status}</p>
        </div>
        <p className="display text-5xl text-gold">{parts.balance}</p>
      </header>
      {dupes.length ? (
        <p className="rounded-xl bg-gold-soft px-3 py-2 text-sm">Possible existing learner found. {dupes.map((d) => d.learnerId).join(", ")}. Review before any merge. Do not merge on a name alone.</p>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="panel p-4 text-sm">
          <h2 className="display text-2xl">Record</h2>
          <p className="mt-2">Born {formatSaDate(learner.dob)} · {learner.homeLanguage || "language not captured"} · {learner.area || "area not captured"}</p>
          <p>Guardian: {learner.guardianName || "—"} {learner.guardianPhone}</p>
          <p>Reading Eggs: {learner.readingEggsId || "not linked"} · portal code {session.role === "admin" || session.role === "teacher" ? learner.portalPin : "hidden"}</p>
          <p className="mt-2 text-muted">Registered {formatSaDate(learner.registeredAt.slice(0, 10))}. Photo consent: {learner.photoConsent ? "yes" : "no"}. No photograph is stored.</p>
          {session.role === "admin" && learner.supportNote ? <p className="mt-2 rounded-xl bg-danger-soft p-2">Confidential support note: {learner.supportNote}</p> : null}
          {session.role === "teacher" && learner.supportNote ? <p className="mt-2 text-muted">A confidential support note is on file with administrators.</p> : null}
        </section>
        <section className="panel p-4">
          <h2 className="display text-2xl">Points</h2>
          <p className="text-sm text-muted">Earned {parts.earned} · interest {parts.interest} · approved deductions {parts.deductions}. The balance is the ledger, not an editable number.</p>
          {(session.role === "teacher" || session.role === "admin") && (
            <form
              className="mt-3 grid gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const error = askDeduction(learner.id, Number(data.get("amount")), String(data.get("reason") || ""), "correction");
                if (error) toast.error(error);
                else toast.success("Request sent. The balance is unchanged until an administrator approves it.");
              }}
            >
              <Field label="Ask to remove points"><input name="amount" className="field" inputMode="numeric" required /></Field>
              <Field label="Reason"><input name="reason" className="field" required placeholder="What should be corrected, and why" /></Field>
              <button className="btn btn-danger" type="submit">Submit for approval</button>
            </form>
          )}
        </section>
      </div>
      <section className="panel p-4">
        <h2 className="display text-2xl">Notes</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {notes.map((n) => <li key={n.id}><span className="text-muted">{formatSaDate(n.at.slice(0, 10))}.</span> {n.note} {n.confidential ? "(confidential)" : ""}</li>)}
        </ul>
        <form
          className="mt-3 grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const error = addNote(learner.id, String(data.get("note") || ""), Boolean(data.get("confidential")));
            if (error) toast.error(error);
            else e.currentTarget.reset();
          }}
        >
          <textarea name="note" className="field min-h-20" placeholder="What should the next adult know?" />
          {session.role === "admin" ? <label className="text-sm"><input type="checkbox" name="confidential" className="mr-2" />Confidential safeguarding note (administrators only)</label> : null}
          <button className="btn btn-ghost w-fit" type="submit">Save note</button>
        </form>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const error = sendMessage(learner.id, "progress", String(data.get("body") || ""));
            if (error) toast.error(error);
            else {
              toast.success("In-app message saved. Nothing was texted.");
              e.currentTarget.reset();
            }
          }}
        >
          <input name="body" className="field" placeholder="A short progress note for the family" />
          <button className="btn btn-quiet" type="submit">Save family note</button>
        </form>
      </section>
      {session.role === "admin" ? (
        <section className="panel p-4">
          <h2 className="display text-2xl">Administrator</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {learner.status === "active" ? (
              <button type="button" className="btn btn-danger" onClick={() => { const error = editLearner(learner.id, { status: "inactive" }); if (error) toast.error(error); else toast.success("Deactivated. History kept."); }}>Deactivate</button>
            ) : (
              <button type="button" className="btn" onClick={() => editLearner(learner.id, { status: "active" })}>Restore</button>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select className="field" value={mergeId} onChange={(e) => setMergeId(e.target.value)}>
              <option value="">Merge another record into this one</option>
              {db.learners.filter((l) => l.id !== learner.id && l.status !== "merged").map((l) => <option key={l.id} value={l.id}>{l.id} · {learnerLabel(l)}</option>)}
            </select>
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => {
                if (!mergeId) return;
                const error = merge(learner.id, mergeId);
                if (error) toast.error(error);
                else toast.success("Merged. Ledger lines were kept and included in this balance.");
              }}
            >
              Merge
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
