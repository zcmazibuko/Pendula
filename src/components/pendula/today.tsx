import { toast } from "sonner";
import { formatSaDate, isoDate, recentSchoolDays } from "@/lib/pendula/calendar";
import {
  balanceParts,
  currentStage,
  learnerAgeBand,
  learnerLabel,
  readingJourney,
  savingsJourney,
} from "@/lib/pendula/engine";
import { alertsFor, birthdays, programmeMetrics, visibleLearners, weeklyAttendanceSeries } from "@/lib/pendula/selectors";
import { usePendula } from "@/lib/pendula/store";
import { Empty, Stat } from "./ui";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function greet() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Today() {
  const session = usePendula((s) => s.session)!;
  if (session.role === "learner") return <LearnerHome />;
  if (session.role === "parent") return <ParentHome />;
  return session.role === "teacher" ? <TeacherHome /> : <AdminHome />;
}

function AdminHome() {
  const db = usePendula((s) => s.db);
  const setNav = usePendula((s) => s.setNav);
  const openLearner = usePendula((s) => s.openLearner);
  const asOf = isoDate(new Date());
  const learners = visibleLearners(db, "admin");
  const metrics = programmeMetrics(db, learners, asOf);
  const series = weeklyAttendanceSeries(db, learners.filter((l) => l.status === "active"), asOf);
  const days = birthdays(db, learners, asOf, 7);
  const alerts = alertsFor(db, learners, asOf).slice(0, 4);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-muted">{formatSaDate(asOf)}</p>
        <h1 className="display text-4xl">{greet()}. The programme at a glance.</h1>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active learners" value={metrics.active} hint={`${metrics.registered} records, merged excluded`} />
        <Stat
          label="Recent attendance"
          value={metrics.attendanceRate === null ? "—" : `${Math.round(metrics.attendanceRate * 100)}%`}
          hint={`${metrics.attended} of ${metrics.eligible} eligible marks. ${metrics.weekLabel}.`}
        />
        <Stat label="Points held" value={metrics.held.toLocaleString("en-ZA")} hint={`${metrics.issued.toLocaleString("en-ZA")} earned, ${metrics.interest} interest. Not rand.`} />
        <Stat label="Approvals waiting" value={metrics.pending} hint={`${metrics.readingMilestones} reading stage rewards posted`} />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="panel p-4">
          <h2 className="display text-2xl">Attendance on recent school days</h2>
          <p className="text-sm text-muted">Present and late, divided by present, late and absent. Excused days are left out.</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} unit="%" width={40} />
                <Tooltip />
                <Area dataKey="rate" name="Attendance %" stroke="var(--emerald)" fill="var(--emerald-soft)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-4">
          <h2 className="display text-2xl">Learners by grade</h2>
          <ul className="mt-3 space-y-2">
            {metrics.byGrade.filter((g) => g.learners).map((g) => (
              <li key={g.grade} className="flex items-center gap-2 text-sm">
                <span className="w-16">Grade {g.grade}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-blue-soft">
                  <span className="block h-full bg-action" style={{ width: `${Math.max(8, (g.learners / Math.max(metrics.active, 1)) * 100)}%` }} />
                </span>
                <span className="w-6 text-right">{g.learners}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="panel p-4">
          <h2 className="display text-2xl">Needs a person, not a label</h2>
          <div className="mt-3 space-y-3">
            {alerts.length === 0 ? <p className="text-muted">No open alerts on the current rules.</p> : null}
            {alerts.map((alert) => (
              <button key={alert.id} type="button" className="block w-full text-left" onClick={() => alert.learnerId && openLearner(alert.learnerId)}>
                <p className="font-semibold">{alert.title}</p>
                <p className="text-sm text-muted">{alert.body}</p>
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost mt-3" onClick={() => setNav("insights")}>Open insights</button>
        </section>
        <section className="panel p-4">
          <h2 className="display text-2xl">Birthdays</h2>
          {days.length === 0 ? <p className="mt-2 text-muted">None in the next seven days.</p> : null}
          <ul className="mt-2 space-y-2">
            {days.map((day) => (
              <li key={day.learner.id} className="flex items-center justify-between gap-2">
                <button type="button" className="text-left font-medium" onClick={() => openLearner(day.learner.id)}>
                  {learnerLabel(day.learner)}
                  <span className="block text-sm font-normal text-muted">
                    {day.days === 0 ? "Today" : `In ${day.days} days`} · turns {day.age}
                  </span>
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => openLearner(day.learner.id)}>Note</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function TeacherHome() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const setNav = usePendula((s) => s.setNav);
  const openLearner = usePendula((s) => s.openLearner);
  const sendMessage = usePendula((s) => s.sendMessage);
  const asOf = isoDate(new Date());
  const learners = visibleLearners(db, "teacher", session.staffId);
  const classes = db.classes.filter((c) => db.staff.find((s) => s.id === session.staffId)?.classIds.includes(c.id));
  const day = recentSchoolDays(1, asOf, db.org.terms, db.org.holidays)[0];
  const alerts = alertsFor(db, learners, asOf).slice(0, 3);
  const days = birthdays(db, learners, asOf, 7);
  const staff = db.staff.find((s) => s.id === session.staffId);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-muted">{formatSaDate(asOf)}</p>
        <h1 className="display text-4xl">{greet()}. Here is your class today.</h1>
        <p className="text-muted">{staff?.name}. Points are virtual rewards. You cannot remove them without an administrator.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {classes.map((cls) => {
          const group = learners.filter((l) => l.classId === cls.id && l.status === "active");
          const unmarked = day ? group.filter((l) => !db.attendance.some((a) => a.learnerId === l.id && a.date === day)).length : group.length;
          return (
            <article key={cls.id} className="panel p-4">
              <h2 className="display text-2xl">{cls.name}</h2>
              <p className="text-sm text-muted">{group.length} learners · {unmarked} not marked {day ? `on ${formatSaDate(day)}` : "yet"}</p>
              <button type="button" className="btn mt-3" onClick={() => setNav("attendance")}>Take attendance</button>
            </article>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          ["Register learner", "learners"],
          ["Record assessment", "assessments"],
          ["Update Reading Eggs", "reading"],
          ["View bank", "bank"],
        ].map(([label, id]) => (
          <button key={id} type="button" className="btn btn-ghost" onClick={() => setNav(id)}>{label}</button>
        ))}
      </div>
      <section className="panel p-4">
        <h2 className="display text-2xl">Follow up</h2>
        {alerts.length === 0 ? <p className="mt-2 text-muted">Nothing urgent in your classes.</p> : null}
        {alerts.map((alert) => (
          <button key={alert.id} type="button" className="mt-3 block text-left" onClick={() => alert.learnerId && openLearner(alert.learnerId)}>
            <span className="font-semibold">{alert.title}</span>
            <span className="mt-1 block text-sm text-muted">{alert.body}</span>
          </button>
        ))}
      </section>
      <section className="panel p-4">
        <h2 className="display text-2xl">Birthdays this week</h2>
        {days.length === 0 ? <p className="mt-2 text-muted">None in the next seven days.</p> : null}
        <ul className="mt-2 space-y-2">
          {days.map((dayItem) => (
            <li key={dayItem.learner.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>{learnerLabel(dayItem.learner)} · {dayItem.days === 0 ? "today" : `in ${dayItem.days} days`}</span>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => {
                  const error = sendMessage(dayItem.learner.id, "birthday", `Happy birthday, ${dayItem.learner.preferredName}. We are glad you are in class.`);
                  if (error) toast.error(error);
                  else toast.success("In-app note saved. No SMS was sent.");
                }}
              >
                Save a birthday note
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function LearnerHome() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const addGoal = usePendula((s) => s.addGoal);
  const learner = db.learners.find((l) => l.id === session.learnerId);
  if (!learner) return <Empty title="No learner selected" body="Ask a teacher to open your portal." />;
  const band = learnerAgeBand(learner.grade);
  const parts = balanceParts(db, learner.id);
  const stage = currentStage(db, learner.id);
  const goal = db.goals.find((g) => g.learnerId === learner.id);
  const journey = band === "senior" ? savingsJourney(parts.balance) : readingJourney(stage);
  const badges = db.badges.filter((b) => b.learnerId === learner.id);
  const txs = db.transactions.filter((t) => t.learnerId === learner.id).slice(-6).reverse();
  const word = band === "foundation" ? "stars" : "points";

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-muted">{band === "foundation" ? "Your Pendula stars" : "Your Pendula account"}</p>
        <h1 className="display text-4xl">Hello, {learner.preferredName}.</h1>
      </header>
      <section className="rounded-3xl bg-brand px-5 py-6 text-on-brand">
        <p className="text-sm text-brand-muted">{learner.accountNumber}</p>
        <p className="display mt-2 text-6xl text-gold">{parts.balance.toLocaleString("en-ZA")}</p>
        <p className="mt-1">{word} saved</p>
        <p className="mt-3 max-w-lg text-sm text-brand-muted">These are learning rewards, not money. You cannot spend them in a shop. Saving them shows patience.</p>
      </section>
      <section className="panel p-4">
        <h2 className="display text-2xl">{band === "senior" ? "Savings journey" : "Reading journey"}</h2>
        <ol className="mt-3 flex flex-wrap gap-2">
          {journey.map((step) => (
            <li key={step.id} className={`chip ${step.reached ? "bg-emerald-soft" : "opacity-60"}`}>{step.label}</li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-muted">A journey shows practice. It does not say what you are worth.</p>
      </section>
      <section className="panel p-4">
        <h2 className="display text-2xl">A goal</h2>
        {goal ? (
          <div className="mt-3">
            <p className="font-medium">{goal.name}</p>
            <p className="text-sm text-muted">{parts.balance} of {goal.target} {word} · {Math.min(100, Math.round((parts.balance / goal.target) * 100))}%</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-gold-soft">
              <div className="h-full bg-gold" style={{ width: `${Math.min(100, (parts.balance / goal.target) * 100)}%` }} />
            </div>
          </div>
        ) : (
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const error = addGoal(learner.id, String(data.get("name") || ""), Number(data.get("target")));
              if (error) toast.error(error);
              else e.currentTarget.reset();
            }}
          >
            <input name="name" className="field" placeholder={band === "foundation" ? "I want to save for..." : "Name your goal"} />
            <input name="target" className="field sm:max-w-32" inputMode="numeric" placeholder="500" />
            <button className="btn" type="submit">Save goal</button>
          </form>
        )}
        <p className="mt-2 text-sm text-muted">A goal does not lock or remove {word}.</p>
      </section>
      <section className="panel p-4">
        <h2 className="display text-2xl">Badges</h2>
        {badges.length === 0 ? <p className="mt-2 text-muted">Badges appear when a rule is met. They are not a ranking.</p> : null}
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {badges.map((badge) => (
            <li key={badge.id} className="rounded-xl bg-gold-soft px-3 py-2">
              <p className="font-semibold">{badge.name}</p>
              <p className="text-sm">{badge.reason}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel p-4">
        <h2 className="display text-2xl">Latest {word}</h2>
        <ul className="mt-2 divide-y divide-line">
          {txs.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>{tx.reason}</span>
              <span className={tx.direction === "credit" ? "text-emerald" : "text-danger"}>{tx.direction === "credit" ? "+" : "−"}{tx.amount}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ParentHome() {
  const db = usePendula((s) => s.db);
  const session = usePendula((s) => s.session)!;
  const setNav = usePendula((s) => s.setNav);
  const parent = db.parents.find((p) => p.id === session.parentId);
  const children = db.learners.filter((l) => parent?.learnerIds.includes(l.id));
  const focus = usePendula((s) => s.focusLearnerId);
  const openLearner = usePendula((s) => s.openLearner);
  const child = children.find((l) => l.id === focus) || children[0];
  if (!child) return <Empty title="No child is linked" body="Ask the programme to link your child's record to this parent profile." />;
  const parts = balanceParts(db, child.id);
  const asOf = isoDate(new Date());
  const rate = alertsFor(db, [child], asOf);
  const messages = db.messages.filter((m) => m.learnerId === child.id && m.kind !== "support");

  return (
    <div className="space-y-4">
      <header>
        <h1 className="display text-4xl">{child.preferredName}'s progress</h1>
        <p className="text-muted">You can see attendance, rewards and messages. Staff notes and safeguarding records stay with the school.</p>
      </header>
      {children.length > 1 ? (
        <div className="flex gap-2">
          {children.map((c) => (
            <button key={c.id} type="button" className={`btn ${c.id === child.id ? "" : "btn-ghost"}`} onClick={() => openLearner(c.id)}>{c.preferredName}</button>
          ))}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Points" value={parts.balance} hint="Virtual rewards, not rand" />
        <Stat label="Reading stage" value={currentStage(db, child.id) || "—"} hint="A Reading Eggs stage is not a school grade" />
        <Stat label="Grade" value={child.grade} hint={db.schools.find((s) => s.id === child.schoolId)?.name} />
      </div>
      <section className="panel p-4">
        <h2 className="display text-2xl">What the programme is watching</h2>
        {rate.length === 0 ? <p className="mt-2 text-muted">No attendance or progress alert on the current rules.</p> : null}
        {rate.map((alert) => (
          <p key={alert.id} className="mt-2 text-sm">{alert.body}</p>
        ))}
        <button type="button" className="btn btn-ghost mt-3" onClick={() => setNav("bank")}>Open the points statement</button>
      </section>
      <section className="panel p-4">
        <h2 className="display text-2xl">Messages</h2>
        {messages.length === 0 ? <p className="mt-2 text-muted">No in-app messages yet. Pendula does not send SMS from this screen.</p> : null}
        <ul className="mt-2 space-y-2">
          {messages.map((m) => (
            <li key={m.id} className="text-sm"><span className="font-semibold capitalize">{m.kind}.</span> {m.body}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
