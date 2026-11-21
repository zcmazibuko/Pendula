import { useState } from "react";
import { toast } from "sonner";
import { formatSaDate, isoDate } from "@/lib/pendula/calendar";
import { downloadPdf, downloadText, statementCsv, statementPdf } from "@/lib/pendula/documents";
import { balanceParts, buildStatement, learnerLabel } from "@/lib/pendula/engine";
import { visibleLearners } from "@/lib/pendula/selectors";
import { usePendula } from "@/lib/pendula/store";
import { Empty, Field } from "./ui";

export function Bank() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const giveBonus = usePendula((s) => s.giveBonus);
  const learners = visibleLearners(db, session.role, session.staffId, session.parentId, session.learnerId).filter((l) => l.status !== "merged");
  const focus = usePendula((s) => s.focusLearnerId);
  const openLearner = usePendula((s) => s.openLearner);
  const initial = learners.find((l) => l.id === focus)?.id || learners[0]?.id || "";
  const [learnerId, setLearnerId] = useState(initial);
  const learner = learners.find((l) => l.id === learnerId) || learners[0];
  const [from, setFrom] = useState(`${db.org.academicYear}-01-01`);
  const [to, setTo] = useState(isoDate(new Date()));
  if (!learner) return <Empty title="No account yet" body="Register a learner to open a Pendula account." />;
  const parts = balanceParts(db, learner.id);
  const statement = buildStatement(db, learner.id, from, to);
  const txs = "error" in statement ? [] : statement.lines;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Pendula bank</h1>
        <p className="max-w-2xl text-muted">Virtual educational points only. Not a real bank account or monetary deposit. Balances are calculated from the ledger. Nobody types a new balance over the old one.</p>
      </header>
      {learners.length > 1 ? (
        <Field label="Account">
          <select className="field" value={learner.id} onChange={(e) => { setLearnerId(e.target.value); openLearner(e.target.value); }}>
            {learners.map((l) => <option key={l.id} value={l.id}>{learnerLabel(l)} · {l.accountNumber}</option>)}
          </select>
        </Field>
      ) : null}
      <section className="rounded-3xl bg-brand px-5 py-6 text-on-brand">
        <p className="text-sm text-brand-muted">{learner.accountNumber} · opened {formatSaDate(learner.registeredAt.slice(0, 10))}</p>
        <p className="display mt-2 text-6xl text-gold">{parts.balance.toLocaleString("en-ZA")}</p>
        <p>points held</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div><dt className="text-brand-muted">Earned</dt><dd>{parts.earned}</dd></div>
          <div><dt className="text-brand-muted">Interest</dt><dd>{parts.interest}</dd></div>
          <div><dt className="text-brand-muted">Deductions</dt><dd>{parts.deductions}</dd></div>
        </dl>
      </section>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Statement from"><input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="to"><input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
      </div>
      {"error" in statement ? <p className="text-danger">{statement.error}</p> : (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => downloadPdf(`${learner.id}-statement.pdf`, statementPdf(statement))}>Download PDF</button>
          <button type="button" className="btn btn-ghost" onClick={() => downloadText(`${learner.id}-statement.csv`, statementCsv(statement))}>Download CSV</button>
          <p className="self-center text-sm text-muted">Opening {statement.opening} · closing {statement.closing} · {statement.reference}</p>
        </div>
      )}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="text-muted">
            <tr><th className="px-3 py-2 font-medium">Date</th><th className="px-3 py-2 font-medium">Transaction</th><th className="px-3 py-2 font-medium">Credit</th><th className="px-3 py-2 font-medium">Debit</th><th className="px-3 py-2 font-medium">Balance</th></tr>
          </thead>
          <tbody>
            {txs.map((line) => (
              <tr key={line.txId} className="border-t border-line">
                <td className="px-3 py-2">{formatSaDate(line.date)}</td>
                <td className="px-3 py-2">{line.description}</td>
                <td className="px-3 py-2">{line.credit || "—"}</td>
                <td className="px-3 py-2">{line.debit || "—"}</td>
                <td className="px-3 py-2">{line.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {txs.length === 0 ? <p className="px-3 py-4 text-sm text-muted">No transactions in this period.</p> : null}
      </div>
      {session.role === "admin" ? (
        <form
          className="panel grid gap-2 p-4 sm:grid-cols-[8rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const error = giveBonus(learner.id, Number(data.get("amount")), String(data.get("reason") || ""));
            if (error) toast.error(error);
            else {
              toast.success("Bonus posted to the ledger.");
              e.currentTarget.reset();
            }
          }}
        >
          <input name="amount" className="field" inputMode="numeric" placeholder="Points" required />
          <input name="reason" className="field" placeholder="Why this bonus is educationally justified" required />
          <button className="btn btn-gold" type="submit">Award bonus</button>
        </form>
      ) : null}
    </div>
  );
}

export function Approvals() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const decide = usePendula((s) => s.decideDeduction);
  const pending = db.deductions.filter((d) => d.status === "pending");
  const decided = db.deductions.filter((d) => d.status !== "pending").slice(0, 8);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">Approvals</h1>
        <p className="text-muted">A pending request does not change a balance. You cannot approve your own request. An approved deduction posts once, and only if the balance can cover it.</p>
      </header>
      {pending.length === 0 ? <Empty title="Nothing is waiting" body="Teachers' deduction requests will appear here." /> : null}
      {pending.map((request) => {
        const learner = db.learners.find((l) => l.id === request.learnerId);
        const mine = request.requesterId === session.staffId;
        return (
          <form
            key={request.id}
            className="panel p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const submitter = (e.nativeEvent as SubmitEvent).submitter;
              const data = new FormData(e.currentTarget, submitter);
              const error = decide(request.id, (submitter as HTMLButtonElement | null)?.value === "approve", String(data.get("note") || ""));
              if (error) toast.error(error);
              else toast.success(data.get("decision") === "approve" ? "Posted to the ledger." : "Rejected. Balance unchanged.");
            }}
          >
            <p className="font-semibold">{learner ? learnerLabel(learner) : request.learnerId} · {request.amount} points</p>
            <p className="text-sm">{request.reason}</p>
            <p className="text-sm text-muted">{request.category} · requested {formatSaDate(request.createdAt.slice(0, 10))} · balance now {learner ? balanceParts(db, learner.id).balance : "—"}</p>
            {mine ? <p className="mt-2 text-sm text-danger">You requested this, so you cannot decide it.</p> : null}
            {session.role === "admin" && !mine ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <input name="note" className="field" placeholder="Decision note" />
                <button className="btn" name="decision" value="approve" type="submit">Approve</button>
                <button className="btn btn-ghost" name="decision" value="reject" type="submit">Reject</button>
              </div>
            ) : null}
          </form>
        );
      })}
      {decided.length ? (
        <section>
          <h2 className="display text-2xl">Recent decisions</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {decided.map((d) => <li key={d.id}>{d.status}: {d.amount} points — {d.reason}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
