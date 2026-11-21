import { useEffect, useState } from "react";
import {
  Bell,
  BookMarked,
  BookOpen,
  CalendarCheck,
  FileBarChart,
  Landmark,
  LayoutDashboard,
  Library,
  Lock,
  Moon,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { formatSaLong, isoDate } from "@/lib/pendula/calendar";
import { integrityOk, learnerLabel } from "@/lib/pendula/engine";
import { usePendula } from "@/lib/pendula/store";
import type { Session } from "@/lib/pendula/types";
import { Insights, Manuals, Reports, SettingsView } from "./more";
import { Approvals, Bank } from "./money";
import { Assessments, Attendance, Reading } from "./operate";
import { Learners } from "./people";
import { Today } from "./today";
import { Field, Mark } from "./ui";

const NAV = [
  { id: "today", label: "Today", icon: LayoutDashboard, roles: ["admin", "teacher", "learner", "parent"] },
  { id: "learners", label: "Learners", icon: Users, roles: ["admin", "teacher"] },
  { id: "attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "teacher"] },
  { id: "assessments", label: "Assessments", icon: BookOpen, roles: ["admin", "teacher"] },
  { id: "reading", label: "Reading Eggs", icon: Library, roles: ["admin", "teacher"] },
  { id: "bank", label: "Bank", icon: Landmark, roles: ["admin", "teacher", "learner", "parent"] },
  { id: "approvals", label: "Approvals", icon: ShieldCheck, roles: ["admin", "teacher"] },
  { id: "insights", label: "Insights", icon: Sparkles, roles: ["admin", "teacher"] },
  { id: "reports", label: "Reports", icon: FileBarChart, roles: ["admin", "teacher"] },
  { id: "manuals", label: "Manuals", icon: BookMarked, roles: ["admin", "teacher", "learner", "parent"] },
  { id: "settings", label: "Settings", icon: Settings, roles: ["admin"] },
] as const;

export function PendulaApp() {
  const [ready, setReady] = useState(false);
  const theme = usePendula((s) => s.theme);
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session);

  useEffect(() => {
    const finish = () => setReady(true);
    const unsub = usePendula.persist.onFinishHydration(finish);
    if (usePendula.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, ready]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-brand text-on-brand">
        <div className="flex items-center gap-3">
          <Mark />
          <div>
            <p className="display text-3xl">Pendula</p>
            <p className="text-brand-muted">Learn. Grow. Earn. Thrive.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      {!db.org.setupComplete ? <Setup /> : !session ? <LockScreen /> : <Shell />}
    </>
  );
}

function Setup() {
  const completeSetup = usePendula((s) => s.completeSetup);
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("Pendula Learning Programme");
  const [location, setLocation] = useState("Sunnyside");
  const [email, setEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [pin, setPin] = useState("");
  const [rewards, setRewards] = useState(true);
  const [interest, setInterest] = useState(true);
  const [demo, setDemo] = useState(true);

  const finish = () => {
    const error = completeSetup({
      orgName,
      email,
      adminName,
      pin,
      approveRewards: rewards,
      approveInterest: interest,
      demo,
      location,
    });
    if (error) toast.error(error);
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
        <section className="rounded-3xl bg-brand px-6 py-8 text-on-brand">
          <Mark />
          <p className="mt-6 text-sm uppercase tracking-[0.18em] text-brand-muted">Educational rewards bank</p>
          <h1 className="display mt-3 text-5xl">Pendula</h1>
          <p className="mt-4 max-w-md text-lg text-brand-muted">
            Learn. Grow. Earn. Thrive. Attendance, assessments and reading become a virtual points account a child can understand — never rand, and never a real bank.
          </p>
          <ol className="mt-8 space-y-2 text-sm text-brand-muted">
            <li>1. Name the programme and the founding administrator.</li>
            <li>2. Approve the points rules before anything is earned.</li>
            <li>3. Open a demonstration cohort, or start empty.</li>
          </ol>
        </section>
        <section className="panel p-6">
          {step === 0 ? (
            <div>
              <h2 className="display text-3xl">Set up this device</h2>
              <p className="mt-2 text-muted">
                Pendula keeps the programme ledger on this device and in the backup you export. Up to three administrators. Teachers cannot deduct points without approval.
              </p>
              <div className="mt-6 grid gap-3">
                <Field label="Programme name">
                  <input className="field" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </Field>
                <Field label="Main site">
                  <input className="field" value={location} onChange={(e) => setLocation(e.target.value)} />
                </Field>
                <Field label="Your name">
                  <input className="field" value={adminName} onChange={(e) => setAdminName(e.target.value)} autoComplete="name" />
                </Field>
                <Field label="Contact email (optional)">
                  <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </Field>
                <Field label="4-digit administrator PIN">
                  <input className="field" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                </Field>
              </div>
              <button type="button" className="btn mt-5" onClick={() => (adminName.trim() && pin.length === 4 ? setStep(1) : toast.error("Enter your name and a 4-digit PIN"))}>
                Continue
              </button>
            </div>
          ) : null}
          {step === 1 ? (
            <div>
              <h2 className="display text-3xl">Approve the rules</h2>
              <p className="mt-2 text-muted">Nothing is earned until you approve. Historical transactions are never recalculated when you change the rules later.</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="panel px-3 py-2">Daily attendance — 10 points. Late — 5.</li>
                <li className="panel px-3 py-2">Completed assessment — 20. Improvement — 5 per percentage point, capped at 50.</li>
                <li className="panel px-3 py-2">New Reading Eggs stage — 30. Perfect school week — 20.</li>
                <li className="panel px-3 py-2">Savings interest — 1% a month, nearest whole point, compound.</li>
              </ul>
              <label className="mt-4 flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 size-4" checked={rewards} onChange={(e) => setRewards(e.target.checked)} />
                I approve these reward amounts and I understand points have no cash value.
              </label>
              <label className="mt-2 flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 size-4" checked={interest} onChange={(e) => setInterest(e.target.checked)} />
                I approve 1% monthly virtual interest.
              </label>
              <div className="mt-5 flex gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
                <button type="button" className="btn" onClick={() => setStep(2)}>Continue</button>
              </div>
            </div>
          ) : null}
          {step === 2 ? (
            <div>
              <h2 className="display text-3xl">How should we start?</h2>
              <div className="mt-4 grid gap-3">
                <button type="button" className={`panel p-4 text-left ${demo ? "ring-2 ring-action" : ""}`} onClick={() => setDemo(true)}>
                  <strong>Demonstration cohort</strong>
                  <p className="text-sm text-muted">Fictional learners, a real ledger, and an interest example of 1,000 points. Remove it before any real children are registered.</p>
                </button>
                <button type="button" className={`panel p-4 text-left ${!demo ? "ring-2 ring-action" : ""}`} onClick={() => setDemo(false)}>
                  <strong>Empty programme</strong>
                  <p className="text-sm text-muted">Add schools, classes and teachers, then register or import learners. The 2026 public-school calendar is already loaded for you to edit.</p>
                </button>
              </div>
              <p className="mt-4 text-sm text-muted">
                Children's information needs a lawful basis under POPIA. This setup is not legal advice. Have a South African privacy practitioner review a real rollout.
              </p>
              <div className="mt-5 flex gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="btn" onClick={finish}>Open Pendula</button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function LockScreen() {
  const db = usePendula((s) => s.db);
  const signInStaff = usePendula((s) => s.signInStaff);
  const signInLearner = usePendula((s) => s.signInLearner);
  const signInParent = usePendula((s) => s.signInParent);
  const [mode, setMode] = useState<"staff" | "learner" | "parent">("staff");
  const [id, setId] = useState(db.staff.find((s) => s.role === "admin" && s.active)?.id || "");
  const [pin, setPin] = useState("");

  const submit = () => {
    const error =
      mode === "staff" ? signInStaff(id, pin) : mode === "learner" ? signInLearner(id, pin) : signInParent(id, pin);
    if (error) toast.error(error);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Mark />
          <div>
            <p className="display text-3xl">{db.org.name}</p>
            <p className="text-sm text-muted">{formatSaLong(isoDate(new Date()))}</p>
          </div>
        </div>
        <div className="panel p-5">
          <h1 className="display text-2xl">Who is using this device?</h1>
          <div className="mt-3 flex gap-2">
            {(["staff", "learner", "parent"] as const).map((item) => (
              <button key={item} type="button" className={`btn ${mode === item ? "" : "btn-ghost"}`} onClick={() => { setMode(item); setId(""); setPin(""); }}>
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Field label={mode === "staff" ? "Staff member" : mode === "learner" ? "Learner" : "Parent or guardian"}>
              <select className="field" value={id} onChange={(e) => setId(e.target.value)}>
                <option value="">Choose</option>
                {mode === "staff"
                  ? db.staff.filter((s) => s.active).map((s) => (
                      <option key={s.id} value={s.id}>{s.name} · {s.role}</option>
                    ))
                  : null}
                {mode === "learner"
                  ? db.learners.filter((l) => l.status === "active").map((l) => (
                      <option key={l.id} value={l.id}>{learnerLabel(l)} · {l.id}</option>
                    ))
                  : null}
                {mode === "parent"
                  ? db.parents.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  : null}
              </select>
            </Field>
            <div className="mt-3">
              <Field label={mode === "learner" ? "Portal code" : "PIN"}>
                <input className="field" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
              </Field>
            </div>
          </div>
          <button type="button" className="btn mt-4 w-full" onClick={submit}>Unlock</button>
          {db.org.demoCohort ? (
            <details className="mt-4 text-sm text-muted">
              <summary>Demonstration codes — remove before real learner data</summary>
              <p className="mt-2">Teachers: Jabu 1111, Elmarie 2222, Thabo 3333, Fatima 4444. Parents: Nokuthula 5081, Tshepo 5082, Bongani 5083. Learner portal codes are on each profile after you sign in as administrator. Your administrator PIN is the one you chose during setup.</p>
            </details>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Shell() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const nav = usePendula((s) => s.nav);
  const setNav = usePendula((s) => s.setNav);
  const theme = usePendula((s) => s.theme);
  const setTheme = usePendula((s) => s.setTheme);
  const lock = usePendula((s) => s.lock);
  const previewRole = usePendula((s) => s.previewRole);
  const returnToAdmin = usePendula((s) => s.returnToAdmin);
  const markNoticesRead = usePendula((s) => s.markNoticesRead);
  const [more, setMore] = useState(false);
  const [online, setOnline] = useState(true);
  const [who, setWho] = useState(false);
  const items = NAV.filter((item) => (item.roles as readonly string[]).includes(session.role));
  const unread = db.notifications.filter((n) => n.audience === session.role && !n.read).length;
  const sound = integrityOk(db);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const identity = describeSession(db.staff, db.learners, db.parents, session);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-brand px-3 py-4 text-on-brand lg:flex">
        <div className="flex items-center gap-3 px-2">
          <Mark />
          <div>
            <p className="display text-2xl leading-none">Pendula</p>
            <p className="text-xs text-brand-muted">Learn. Grow. Earn. Thrive.</p>
          </div>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Primary">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" className="nav-btn" data-active={nav === item.id} onClick={() => setNav(item.id)}>
                <Icon className="size-4" aria-hidden />
                {item.label}
                {item.id === "approvals" && db.deductions.some((d) => d.status === "pending") ? (
                  <span className="ml-auto rounded-full bg-gold px-2 text-xs text-on-gold">{db.deductions.filter((d) => d.status === "pending").length}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <p className="px-2 text-xs text-brand-muted">Virtual points only. Not a bank.</p>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-paper/95 px-3 py-3 backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-muted">{db.org.name}</p>
            <p className="truncate font-semibold">{identity}</p>
          </div>
          <button type="button" className="btn btn-ghost px-3" aria-label="Notifications" onClick={() => { setNav("insights"); markNoticesRead(); }}>
            <Bell className="size-4" />
            {unread ? <span className="text-sm">{unread}</span> : null}
          </button>
          <button type="button" className="btn btn-ghost px-3" aria-label="Switch appearance" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {(session.role === "admin" || session.returnStaffId) && (
            <button type="button" className="btn btn-ghost hidden sm:inline-flex" onClick={() => setWho(true)}>View as</button>
          )}
          {session.returnStaffId ? (
            <button type="button" className="btn btn-quiet hidden sm:inline-flex" onClick={returnToAdmin}>Return</button>
          ) : null}
          <button type="button" className="btn btn-ghost px-3" onClick={lock} aria-label="Lock">
            <Lock className="size-4" />
          </button>
        </header>
        {!online ? (
          <p className="bg-gold-soft px-4 py-2 text-sm text-ink">Offline. This device still has the register and the ledger. Another computer will not see it until you export a backup.</p>
        ) : null}
        {!sound ? (
          <p className="bg-danger-soft px-4 py-2 text-sm">Ledger integrity check failed. Restore a backup before you trust these balances.</p>
        ) : null}
        {!db.org.rewardsLive ? (
          <p className="bg-gold-soft px-4 py-2 text-sm">Rewards are paused. Attendance and marks can still be recorded. Points post after an administrator approves the policy.</p>
        ) : null}
        <main className="px-3 py-4 pb-24 sm:px-6 lg:pb-8">
          {nav === "today" ? <Today /> : null}
          {nav === "learners" || nav === "learner" ? <Learners /> : null}
          {nav === "attendance" ? <Attendance /> : null}
          {nav === "assessments" ? <Assessments /> : null}
          {nav === "reading" ? <Reading /> : null}
          {nav === "bank" ? <Bank /> : null}
          {nav === "approvals" ? <Approvals /> : null}
          {nav === "insights" ? <Insights /> : null}
          {nav === "reports" ? <Reports /> : null}
          {nav === "manuals" ? <Manuals /> : null}
          {nav === "settings" ? <SettingsView /> : null}
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-card lg:hidden" aria-label="Mobile">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" className={`flex min-h-14 flex-1 flex-col items-center justify-center text-xs ${nav === item.id ? "text-action" : "text-muted"}`} onClick={() => setNav(item.id)}>
              <Icon className="size-5" />
              {item.label}
            </button>
          );
        })}
        <button type="button" className="flex min-h-14 flex-1 flex-col items-center justify-center text-xs text-muted" onClick={() => setMore(true)}>
          More
        </button>
      </nav>
      {more ? (
        <div className="fixed inset-0 z-30 bg-brand/40 lg:hidden" onClick={() => setMore(false)}>
          <div className="panel absolute inset-x-3 bottom-3 p-3" onClick={(e) => e.stopPropagation()} role="menu">
            {items.slice(4).map((item) => (
              <button key={item.id} type="button" className="nav-btn text-ink" onClick={() => { setNav(item.id); setMore(false); }}>
                {item.label}
              </button>
            ))}
            <button type="button" className="nav-btn text-ink" onClick={() => { setWho(true); setMore(false); }}>View as</button>
          </div>
        </div>
      ) : null}
      {who ? <Who onClose={() => setWho(false)} onPick={(next) => { previewRole(next); setWho(false); }} /> : null}
    </div>
  );
}

function describeSession(
  staff: { id: string; name: string; role: string }[],
  learners: { id: string; preferredName: string; firstName: string; surname: string }[],
  parents: { id: string; name: string }[],
  session: Session,
): string {
  if (session.role === "admin" || session.role === "teacher") {
    return staff.find((s) => s.id === session.staffId)?.name || "Staff";
  }
  if (session.role === "learner") {
    const learner = learners.find((l) => l.id === session.learnerId);
    return learner ? `${learner.preferredName || learner.firstName} ${learner.surname}` : "Learner";
  }
  return parents.find((p) => p.id === session.parentId)?.name || "Parent";
}

function Who({ onClose, onPick }: { onClose: () => void; onPick: (session: Session) => void }) {
  const db = usePendula((s) => s.db);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-brand/50 p-3 sm:items-center">
      <div className="panel max-h-[80vh] w-full max-w-lg overflow-y-auto p-5" role="dialog" aria-label="View as">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="display text-2xl">View as</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        <p className="text-sm text-muted">An administrator can preview another role. The preview uses that role's limits. This is a device control, not a substitute for separate accounts on a shared cloud.</p>
        <h3 className="mt-4 font-semibold">Staff</h3>
        <div className="mt-2 grid gap-2">
          {db.staff.filter((s) => s.active).map((s) => (
            <button key={s.id} type="button" className="btn btn-ghost justify-start" onClick={() => onPick({ role: s.role, staffId: s.id })}>
              {s.name} · {s.role}
            </button>
          ))}
        </div>
        <h3 className="mt-4 font-semibold">Learners</h3>
        <div className="mt-2 grid gap-2">
          {db.learners.filter((l) => l.status === "active").slice(0, 8).map((l) => (
            <button key={l.id} type="button" className="btn btn-ghost justify-start" onClick={() => onPick({ role: "learner", learnerId: l.id })}>
              {learnerLabel(l)} · Grade {l.grade}
            </button>
          ))}
        </div>
        <h3 className="mt-4 font-semibold">Parents</h3>
        <div className="mt-2 grid gap-2">
          {db.parents.map((p) => (
            <button key={p.id} type="button" className="btn btn-ghost justify-start" onClick={() => onPick({ role: "parent", parentId: p.id })}>
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
