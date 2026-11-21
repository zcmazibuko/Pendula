import { addDays, isoDate, recentSchoolDays, SA_2026_HOLIDAYS, SA_2026_TERMS } from "./calendar.ts";
import {
  DEFAULT_POLICY,
  postTransaction,
  recordReading,
  requestDeduction,
  runInterest,
  saveAttendance,
  saveResults,
  stamp,
  uid,
} from "./engine.ts";
import type { Actor, ClassGroup, Learner, Organisation, PendulaDB, School, StaffMember } from "./types.ts";

const SYSTEM: Actor = { id: "system", role: "system", name: "Pendula" };

export function emptyDb(partial?: Partial<Organisation>): PendulaDB {
  const org: Organisation = {
    name: partial?.name || "Pendula Programme",
    tagline: "Learn. Grow. Earn. Thrive.",
    contactEmail: partial?.contactEmail || "",
    setupComplete: partial?.setupComplete ?? false,
    rewardsLive: false,
    academicYear: 2026,
    terms: SA_2026_TERMS,
    holidays: SA_2026_HOLIDAYS,
    policy: structuredClone(DEFAULT_POLICY),
    demoCohort: false,
    retentionNote:
      "Keep learner records only for as long as the programme needs them for education, safeguarding and the rewards ledger. Review retention with a South African privacy practitioner before a real rollout.",
  };
  return {
    version: 1,
    org,
    locations: [],
    schools: [],
    classes: [],
    staff: [],
    parents: [],
    learners: [],
    attendance: [],
    assessments: [],
    results: [],
    reading: [],
    transactions: [],
    deductions: [],
    goals: [],
    badges: [],
    interventions: [],
    messages: [],
    notifications: [],
    audit: [],
    integrity: "",
  };
}

function learner(input: {
  n: number;
  first: string;
  surname: string;
  grade: number;
  school: School;
  cls: ClassGroup;
  dob: string;
  language: string;
  area: string;
  guardian: string;
  phone: string;
  gender?: string;
  preferred?: string;
}): Learner {
  const id = `PEN-2026-${String(input.n).padStart(5, "0")}`;
  return {
    id,
    accountNumber: `PB-2026-${String(input.n).padStart(5, "0")}`,
    firstName: input.first,
    middleName: "",
    surname: input.surname,
    preferredName: input.preferred || input.first,
    dob: input.dob,
    gender: input.gender || "",
    grade: input.grade,
    schoolId: input.school.id,
    classId: input.cls.id,
    locationId: input.school.locationId,
    status: "active",
    homeLanguage: input.language,
    area: input.area,
    address: "",
    guardianName: input.guardian,
    guardianPhone: input.phone,
    emergencyName: input.guardian,
    emergencyPhone: input.phone,
    supportNote: "",
    readingEggsId: "",
    photoConsent: false,
    registeredAt: "2026-01-14T08:00:00.000Z",
    academicYear: 2026,
    portalPin: String(2400 + input.n),
    importKey: `${input.first}|${input.surname}|${input.dob}`.toLowerCase(),
  };
}

export function createDemo(founder: { name: string; pin: string; email: string }, asOf: string): PendulaDB {
  const db = emptyDb({
    name: "Pendula Learning Programme",
    contactEmail: founder.email,
    setupComplete: true,
  });
  db.org.policy = {
    ...structuredClone(DEFAULT_POLICY),
    approved: true,
    effectiveFrom: "2026-01-14",
  };
  db.org.policy.interest.approved = true;
  db.org.rewardsLive = true;
  db.org.demoCohort = true;

  db.locations = [
    { id: "loc-sunny", name: "Sunnyside", area: "Pretoria" },
    { id: "loc-arc", name: "Arcadia", area: "Pretoria" },
    { id: "loc-mam", name: "Mamelodi", area: "Tshwane" },
  ];
  const bronberg: School = { id: "sch-bron", name: "Bronberg Campus", locationId: "loc-sunny", phase: "primary" };
  const arcadia: School = { id: "sch-arc", name: "Arcadia Campus", locationId: "loc-arc", phase: "high" };
  const mamelodi: School = { id: "sch-mam", name: "Mamelodi Learning Site", locationId: "loc-mam", phase: "combined" };
  db.schools = [bronberg, arcadia, mamelodi];

  const founderStaff: StaffMember = {
    id: "staff-founder",
    name: founder.name,
    role: "admin",
    email: founder.email,
    pin: founder.pin,
    active: true,
    classIds: [],
  };
  const teachers: StaffMember[] = [
    { id: "t-jabu", name: "Jabu Mahlangu", role: "teacher", email: "jabu@pendula.example", pin: "1111", active: true, classIds: [] },
    { id: "t-elmarie", name: "Elmarie Venter", role: "teacher", email: "elmarie@pendula.example", pin: "2222", active: true, classIds: [] },
    { id: "t-thabo", name: "Thabo Selemela", role: "teacher", email: "thabo@pendula.example", pin: "3333", active: true, classIds: [] },
    { id: "t-fatima", name: "Fatima Essop", role: "teacher", email: "fatima@pendula.example", pin: "4444", active: true, classIds: [] },
  ];
  db.staff = [founderStaff, ...teachers];

  function teacherFor(grade: number, schoolId: string): string {
    if (schoolId === "sch-mam") return "t-thabo";
    if (grade <= 3) return "t-jabu";
    if (grade <= 7) return "t-elmarie";
    if (grade <= 10) return "t-thabo";
    return "t-fatima";
  }

  const classByGradeSchool = new Map<string, ClassGroup>();
  function ensureClass(grade: number, school: School): ClassGroup {
    const key = `${school.id}-${grade}`;
    const found = classByGradeSchool.get(key);
    if (found) return found;
    const teacherId = teacherFor(grade, school.id);
    const cls: ClassGroup = {
      id: `cls-${school.id}-g${grade}`,
      name: `Grade ${grade}`,
      grade,
      schoolId: school.id,
      teacherId,
    };
    classByGradeSchool.set(key, cls);
    db.classes.push(cls);
    const teacher = db.staff.find((s) => s.id === teacherId);
    if (teacher && !teacher.classIds.includes(cls.id)) teacher.classIds.push(cls.id);
    return cls;
  }

  const roster: {
    first: string;
    surname: string;
    grade: number;
    school: School;
    language: string;
    area: string;
    guardian: string;
    phone: string;
    gender: string;
    dob?: string;
  }[] = [
    { first: "Amahle", surname: "Dlamini", grade: 3, school: bronberg, language: "isiZulu", area: "Sunnyside", guardian: "Nokuthula Dlamini", phone: "0821110001", gender: "Female" },
    { first: "Karabo", surname: "Molefe", grade: 7, school: bronberg, language: "Setswana", area: "Sunnyside", guardian: "Tshepo Molefe", phone: "0821110002", gender: "Male" },
    { first: "Pieter", surname: "van Wyk", grade: 5, school: bronberg, language: "Afrikaans", area: "Arcadia", guardian: "Annelie van Wyk", phone: "0831110003", gender: "Male" },
    { first: "Lerato", surname: "Nkosi", grade: 1, school: bronberg, language: "Sesotho", area: "Sunnyside", guardian: "Dineo Nkosi", phone: "0821110004", gender: "Female" },
    { first: "Thandiwe", surname: "Mokoena", grade: 11, school: arcadia, language: "isiZulu", area: "Sunnyside", guardian: "Bongani Mokoena", phone: "0711110005", gender: "Female" },
    { first: "Yusuf", surname: "Abrahams", grade: 9, school: arcadia, language: "English", area: "Pretoria Central", guardian: "Fatima Abrahams", phone: "0841110006", gender: "Male" },
    { first: "Naledi", surname: "Khumalo", grade: 4, school: bronberg, language: "isiXhosa", area: "Sunnyside", guardian: "Lindiwe Khumalo", phone: "0821110007", gender: "Female" },
    { first: "Sipho", surname: "Ndlovu", grade: 12, school: arcadia, language: "isiZulu", area: "Mamelodi", guardian: "Zanele Ndlovu", phone: "0731110008", gender: "Male" },
    { first: "Mia", surname: "Botha", grade: 2, school: bronberg, language: "Afrikaans", area: "Sunnyside", guardian: "Hester Botha", phone: "0821110009", gender: "Female" },
    { first: "Kwame", surname: "Mensah", grade: 6, school: bronberg, language: "English", area: "Arcadia", guardian: "Abena Mensah", phone: "0821110010", gender: "Male" },
    { first: "Ayesha", surname: "Patel", grade: 8, school: arcadia, language: "English", area: "Laudium", guardian: "Rashid Patel", phone: "0821110011", gender: "Female" },
    { first: "Johan", surname: "Pretorius", grade: 10, school: arcadia, language: "Afrikaans", area: "Arcadia", guardian: "Mari Pretorius", phone: "0831110012", gender: "Male" },
    { first: "Boitumelo", surname: "Sithole", grade: 5, school: mamelodi, language: "Sepedi", area: "Mamelodi", guardian: "Kgaogelo Sithole", phone: "0721110013", gender: "Female" },
    { first: "Ethan", surname: "Jacobs", grade: 6, school: bronberg, language: "English", area: "Sunnyside", guardian: "Megan Jacobs", phone: "0821110014", gender: "Male" },
    { first: "Zinhle", surname: "Cele", grade: 8, school: mamelodi, language: "isiZulu", area: "Mamelodi", guardian: "Sibongile Cele", phone: "0711110015", gender: "Female" },
    { first: "Noah", surname: "Williams", grade: 9, school: arcadia, language: "English", area: "Arcadia", guardian: "Claire Williams", phone: "0821110016", gender: "Male" },
    { first: "Refilwe", surname: "Mahlangu", grade: 2, school: bronberg, language: "Sepedi", area: "Sunnyside", guardian: "Jabu Mahlangu", phone: "0821110017", gender: "Female" },
    { first: "Daniel", surname: "Cohen", grade: 11, school: arcadia, language: "English", area: "Pretoria", guardian: "Ruth Cohen", phone: "0821110018", gender: "Male" },
    { first: "Onthatile", surname: "Modise", grade: 7, school: bronberg, language: "Setswana", area: "Sunnyside", guardian: "Kagiso Modise", phone: "0821110019", gender: "Female" },
    { first: "Hannah", surname: "du Plessis", grade: 4, school: bronberg, language: "Afrikaans", area: "Arcadia", guardian: "Elmarie Venter", phone: "0831110020", gender: "Female" },
    { first: "Lwazi", surname: "Gumede", grade: 10, school: arcadia, language: "isiZulu", area: "Mamelodi", guardian: "Nomusa Gumede", phone: "0731110021", gender: "Male" },
    { first: "Amogelang", surname: "Tau", grade: 3, school: bronberg, language: "Setswana", area: "Sunnyside", guardian: "Palesa Tau", phone: "0821110022", gender: "Male" },
    { first: "Sarah", surname: "Naidoo", grade: 12, school: arcadia, language: "English", area: "Laudium", guardian: "Priya Naidoo", phone: "0841110023", gender: "Female" },
    { first: "Tumi", surname: "Mokwena", grade: 1, school: bronberg, language: "Sepedi", area: "Sunnyside", guardian: "Mpho Mokwena", phone: "0821110024", gender: "Female" },
  ];

  roster.forEach((row, index) => {
    const n = index + 1;
    const cls = ensureClass(row.grade, row.school);
    const birthYear = 2026 - (row.grade + 6);
    let dob = row.dob || `${birthYear}-${String((index % 12) + 1).padStart(2, "0")}-15`;
    if (row.first === "Lerato") dob = asOf.slice(0, 4).replace(/^\d{4}/, String(birthYear)) && `${birthYear}-${asOf.slice(5)}`;
    if (row.first === "Lerato") dob = `${birthYear}-${asOf.slice(5, 10)}`;
    if (row.first === "Mia") dob = `${birthYear}-${addDays(asOf, 3).slice(5, 10)}`;
    if (row.first === "Sipho") dob = `${birthYear}-${addDays(asOf, 18).slice(5, 10)}`;
    db.learners.push(
      learner({
        n,
        first: row.first,
        surname: row.surname,
        grade: row.grade,
        school: row.school,
        cls,
        dob,
        language: row.language,
        area: row.area,
        guardian: row.guardian,
        phone: row.phone,
        gender: row.gender,
      }),
    );
  });

  db.learners.find((l) => l.firstName === "Amahle")!.readingEggsId = "RE-10442";
  db.learners.find((l) => l.firstName === "Yusuf")!.readingEggsId = "RE-22810";
  db.learners.find((l) => l.firstName === "Karabo")!.supportNote =
    "Confidential: family asked that transport changes be discussed only with the guardian. Not for parent circulars or learner view.";

  const byName = (first: string) => db.learners.find((l) => l.firstName === first)!;
  const days = recentSchoolDays(12, asOf, db.org.terms, db.org.holidays);
  const older = recentSchoolDays(22, asOf, db.org.terms, db.org.holidays).slice(0, 10);

  function teacherActor(classId: string): Actor {
    const cls = db.classes.find((c) => c.id === classId)!;
    const staff = db.staff.find((s) => s.id === cls.teacherId)!;
    return { id: staff.id, role: "teacher", name: staff.name };
  }

  function markDays(learnerId: string, dates: string[], statusFor: (index: number, date: string) => "present" | "absent" | "late" | "excused") {
    const learnerRow = db.learners.find((l) => l.id === learnerId)!;
    const groups = new Map<string, { learnerId: string; status: "present" | "absent" | "late" | "excused" }[]>();
    dates.forEach((date, index) => {
      const list = groups.get(date) || [];
      list.push({ learnerId, status: statusFor(index, date) });
      groups.set(date, list);
    });
    for (const [date, marks] of groups) {
      saveAttendance(db, { classId: learnerRow.classId, date, marks, actor: teacherActor(learnerRow.classId) });
    }
  }

  // Default everyone present on the recent window, then overlay stories.
  for (const date of days) {
    const byClass = new Map<string, { learnerId: string; status: "present" }[]>();
    for (const row of db.learners) {
      const list = byClass.get(row.classId) || [];
      list.push({ learnerId: row.id, status: "present" });
      byClass.set(row.classId, list);
    }
    for (const [classId, marks] of byClass) {
      saveAttendance(db, { classId, date, marks, actor: teacherActor(classId) });
    }
  }

  const karabo = byName("Karabo");
  markDays(karabo.id, older, () => "present");
  markDays(karabo.id, days.slice(-6), (i) => (i < 4 ? "absent" : "present"));

  const naledi = byName("Naledi");
  markDays(naledi.id, days, (i) => (i % 3 === 0 ? "absent" : "present"));

  const johan = byName("Johan");
  markDays(johan.id, days, (i) => (i % 4 === 0 ? "late" : "present"));

  const tumi = byName("Tumi");
  markDays(tumi.id, days.slice(-2), () => "excused");

  const admin: Actor = { id: founderStaff.id, role: "admin", name: founder.name };
  const thandiwe = byName("Thandiwe");
  postTransaction(db, {
    idempotencyKey: "demo-open-thandiwe",
    at: "2026-10-02T10:00:00.000Z",
    learnerId: thandiwe.id,
    type: "bonus",
    direction: "credit",
    amount: 1000,
    reason: "Demonstration opening balance of 1,000 points so savings interest can be taught. Not cash.",
    actor: admin,
    approverId: admin.id,
    contra: "sys:rewards-bonus",
  });

  const pieter = byName("Pieter");
  const elmarie = teacherActor(pieter.classId);
  db.assessments.unshift({
    id: "asm-maths-1",
    name: "Mathematics check 1",
    subject: "Mathematics",
    grade: 5,
    date: days[2] || "2026-10-20",
    type: "class check",
    maxScore: 100,
    termId: "t4-2026",
    academicYear: 2026,
    teacherId: elmarie.id,
    seriesId: "maths-g5",
    outcomes: "Number, operations and fraction sense",
  });
  db.assessments.unshift({
    id: "asm-maths-2",
    name: "Mathematics check 2",
    subject: "Mathematics",
    grade: 5,
    date: days[8] || "2026-11-10",
    type: "class check",
    maxScore: 100,
    termId: "t4-2026",
    academicYear: 2026,
    teacherId: elmarie.id,
    seriesId: "maths-g5",
    outcomes: "Number, operations and fraction sense",
  });
  const grade5 = db.learners.filter((l) => l.grade === 5);
  saveResults(
    db,
    "asm-maths-1",
    grade5.map((l) => ({
      learnerId: l.id,
      score: l.id === pieter.id ? 45 : 62,
      comment: "",
    })),
    elmarie,
  );
  saveResults(
    db,
    "asm-maths-2",
    grade5.map((l) => ({
      learnerId: l.id,
      score: l.id === pieter.id ? 60 : 58,
      comment: l.id === pieter.id ? "Clear gain on fractions." : "",
    })),
    elmarie,
  );

  const amahle = byName("Amahle");
  const jabu = teacherActor(amahle.classId);
  recordReading(db, {
    learnerId: amahle.id,
    stage: 6,
    date: days[6] || asOf,
    evidence: "Teacher checked the Reading Eggs map with the learner.",
    actor: jabu,
  });
  recordReading(db, {
    learnerId: byName("Mia").id,
    stage: 3,
    date: days[7] || asOf,
    evidence: "Stage 3 lessons signed off in class.",
    actor: jabu,
  });
  const yusuf = byName("Yusuf");
  const stalledDate = addDays(asOf, -45);
  recordReading(db, {
    learnerId: yusuf.id,
    stage: 8,
    date: stalledDate,
    evidence: "Last verified map position. No new stage since.",
    actor: teacherActor(yusuf.classId),
  });

  db.goals.push({
    id: uid("goal"),
    learnerId: thandiwe.id,
    name: "My goal: 2,000 Pendula points",
    target: 2000,
    createdAt: "2026-10-03T08:00:00.000Z",
  });
  db.goals.push({
    id: uid("goal"),
    learnerId: amahle.id,
    name: "Reading Champion journey",
    target: 500,
    createdAt: "2026-11-02T08:00:00.000Z",
  });

  const fatima = db.staff.find((s) => s.id === "t-fatima")!;
  requestDeduction(db, {
    learnerId: byName("Daniel").id,
    amount: 20,
    reason: "Assessment participation points were marked for a paper Daniel did not write. Please reverse them.",
    category: "correction",
    actor: { id: fatima.id, role: "teacher", name: fatima.name },
  });

  db.interventions.push({
    id: uid("int"),
    learnerId: karabo.id,
    at: `${days[days.length - 1] || asOf}T09:00:00.000Z`,
    authorId: "t-elmarie",
    note: "Attendance has dropped. Ask the guardian about transport before suggesting any consequence. No points were removed.",
    confidential: false,
  });

  db.parents.push(
    {
      id: "par-nokuthula",
      name: "Nokuthula Dlamini",
      phone: "0821110001",
      pin: "5081",
      learnerIds: [amahle.id],
    },
    {
      id: "par-tshepo",
      name: "Tshepo Molefe",
      phone: "0821110002",
      pin: "5082",
      learnerIds: [karabo.id],
    },
    {
      id: "par-bongani",
      name: "Bongani Mokoena",
      phone: "0711110005",
      pin: "5083",
      learnerIds: [thandiwe.id],
    },
  );

  db.notifications = db.notifications.slice(0, 30);
  runInterest(db, { throughMonth: "2026-10", actor: admin });
  return stamp(db);
}

export function todayIso(): string {
  return isoDate(new Date());
}
