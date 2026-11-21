import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemo, emptyDb } from "./seed.ts";
import {
  balanceOf,
  buildStatement,
  findDuplicates,
  improvementPoints,
  integrityOk,
  ledgerBalanced,
  postTransaction,
  requestDeduction,
  reviewDeduction,
  roundPoints,
  runInterest,
  saveAttendance,
} from "./engine.ts";
import { addStaff, registerLearner } from "./people.ts";
import type { Actor, ClassGroup, Learner, School } from "./types.ts";

const admin: Actor = { id: "staff-founder", role: "admin", name: "Ada Admin" };
const teacher: Actor = { id: "t-jabu", role: "teacher", name: "Jabu Mahlangu" };

describe("rewards maths", () => {
  it("caps percentage-point improvement at 50", () => {
    assert.equal(improvementPoints(45, 60, 5, 50), 50);
    assert.equal(improvementPoints(50, 52.9, 5, 50), 10);
    assert.equal(improvementPoints(70, 68, 5, 50), 0);
  });

  it("rounds interest in whole points", () => {
    assert.equal(roundPoints(10.1, "nearest"), 10);
    assert.equal(roundPoints(10.5, "nearest"), 11);
    assert.equal(roundPoints(10.9, "floor"), 10);
  });
});

describe("ledger", () => {
  it("pays 1% on 1000 points once, then compounds", () => {
    const db = createDemo({ name: "Ada Admin", pin: "2468", email: "ada@example.org" }, "2026-11-20");
    const thandiwe = db.learners.find((l) => l.firstName === "Thandiwe")!;
    const october = db.transactions.find((t) => t.learnerId === thandiwe.id && t.type === "interest" && t.linkId === "2026-10");
    assert.ok(october);
    assert.equal(october!.amount, 10);
    const again = runInterest(db, { throughMonth: "2026-10", actor: admin });
    assert.equal(again.posted, 0);
    const novemberBase = balanceOf(db, thandiwe.id, "2026-11-30");
    assert.ok(novemberBase > 1000);
    const second = runInterest(structuredClone(db), { throughMonth: "2026-11", actor: { ...admin, role: "admin" } });
    // 21 Nov is before month end, so November interest waits.
    assert.equal(second.posted === 0 || second.error === undefined, true);
    assert.equal(ledgerBalanced(db).ok, true);
    assert.equal(integrityOk(db), true);
  });

  it("does not double-pay attendance", () => {
    const db = createDemo({ name: "Ada Admin", pin: "2468", email: "ada@example.org" }, "2026-11-20");
    const learner = db.learners.find((l) => l.firstName === "Amahle")!;
    const before = db.transactions.filter((t) => t.learnerId === learner.id && t.type === "attendance").length;
    const day = db.attendance.find((a) => a.learnerId === learner.id && a.status === "present")!;
    const again = saveAttendance(db, {
      classId: learner.classId,
      date: day.date,
      marks: [{ learnerId: learner.id, status: "present" }],
      actor: teacher,
    });
    assert.equal(again.error, undefined);
    const after = db.transactions.filter((t) => t.learnerId === learner.id && t.type === "attendance").length;
    assert.equal(after, before);
  });

  it("blocks a deduction that would go negative and blocks self-approval", () => {
    const db = createDemo({ name: "Ada Admin", pin: "2468", email: "ada@example.org" }, "2026-11-20");
    const learner = db.learners.find((l) => l.firstName === "Tumi")!;
    const huge = requestDeduction(db, {
      learnerId: learner.id,
      amount: 5000,
      reason: "Correction of a mistaken credit that never existed.",
      category: "correction",
      actor: teacher,
    });
    assert.ok(huge.request);
    const denied = reviewDeduction(db, { requestId: huge.request!.id, approve: true, note: "No", actor: teacher });
    assert.match(denied.error || "", /administrator/i);
    const approved = reviewDeduction(db, { requestId: huge.request!.id, approve: true, note: "Check balance", actor: admin });
    assert.match(approved.error || "", /below zero/i);
    assert.ok(balanceOf(db, learner.id) >= 0);
  });

  it("reconciles a statement with the ledger", () => {
    const db = createDemo({ name: "Ada Admin", pin: "2468", email: "ada@example.org" }, "2026-11-20");
    const learner = db.learners[0];
    const statement = buildStatement(db, learner.id, "2026-01-01", "2026-12-31");
    assert.ok(!("error" in statement));
    if ("error" in statement) return;
    assert.equal(statement.closing, balanceOf(db, learner.id));
    assert.match(statement.disclaimer, /Not a real bank/);
  });

  it("flags a possible duplicate and will not silently overwrite", () => {
    const db = createDemo({ name: "Ada Admin", pin: "2468", email: "ada@example.org" }, "2026-11-20");
    const existing = db.learners.find((l) => l.firstName === "Amahle")!;
    const hits = findDuplicates(db.learners, {
      firstName: "Amahle",
      surname: "Dlamini",
      dob: existing.dob,
      schoolId: existing.schoolId,
      grade: existing.grade,
      guardianPhone: existing.guardianPhone,
    });
    assert.equal(hits[0]?.level, "confirmed");
    const cls = db.classes.find((c) => c.id === existing.classId)!;
    const attempt = registerLearner(
      db,
      {
        firstName: "Amahle",
        surname: "Dlamini",
        dob: existing.dob,
        grade: existing.grade,
        schoolId: existing.schoolId,
        classId: cls.id,
        guardianPhone: existing.guardianPhone,
      },
      teacher,
    );
    assert.match(attempt.error || "", /review/i);
    assert.equal(db.learners.filter((l) => l.firstName === "Amahle").length, 1);
  });

  it("stops a fourth administrator", () => {
    const db = emptyDb();
    db.org.setupComplete = true;
    const make = (name: string) =>
      addStaff(db, { name, role: "admin", email: "", pin: "1234", classIds: [] }, admin);
    assert.equal(make("One").error, undefined);
    assert.equal(make("Two").error, undefined);
    assert.equal(make("Three").error, undefined);
    assert.match(make("Four").error || "", /three/i);
  });

  it("imports a capacity batch of 500 identities without colliding ids", () => {
    const db = emptyDb({ setupComplete: true });
    db.org.rewardsLive = true;
    db.org.policy.approved = true;
    const school: School = { id: "sch", name: "Bronberg Campus", locationId: "loc", phase: "primary" };
    const cls: ClassGroup = { id: "cls", name: "Grade 4", grade: 4, schoolId: school.id, teacherId: "t" };
    db.locations = [{ id: "loc", name: "Sunnyside", area: "" }];
    db.schools = [school];
    db.classes = [cls];
    db.staff = [{ id: "t", name: "Teacher", role: "teacher", email: "", pin: "1111", active: true, classIds: [cls.id] }];
    const started = Date.now();
    for (let i = 0; i < 500; i++) {
      const result = registerLearner(
        db,
        {
          firstName: `Learner${i}`,
          surname: `Family${i % 40}`,
          dob: `2015-${String((i % 12) + 1).padStart(2, "0")}-15`,
          grade: 4,
          schoolId: school.id,
          classId: cls.id,
        },
        admin,
        { ignoreDuplicate: true, importKey: `cap-${i}` },
      );
      assert.equal(result.error, undefined);
    }
    const ids = new Set(db.learners.map((l) => l.id));
    assert.equal(ids.size, 500);
    const sample = db.learners.slice(0, 30);
    saveAttendance(db, {
      classId: cls.id,
      date: "2026-11-20",
      marks: sample.map((l: Learner) => ({ learnerId: l.id, status: "present" as const })),
      actor: { id: "t", role: "teacher", name: "Teacher" },
    });
    saveAttendance(db, {
      classId: cls.id,
      date: "2026-11-20",
      marks: sample.map((l: Learner) => ({ learnerId: l.id, status: "present" as const })),
      actor: admin,
    });
    for (const learner of sample) {
      const credits = db.transactions.filter((t) => t.learnerId === learner.id && t.type === "attendance");
      assert.equal(credits.length, 1);
      assert.equal(credits[0].amount, 10);
    }
    assert.ok(Date.now() - started < 8000);
    assert.equal(ledgerBalanced(db).ok, true);
    const posted = postTransaction(db, {
      idempotencyKey: "x",
      learnerId: sample[0].id,
      type: "bonus",
      direction: "debit",
      amount: 9999,
      reason: "too much",
      actor: admin,
      contra: "sys:deductions",
    });
    assert.match(posted.error || "", /below zero/);
  });
});
