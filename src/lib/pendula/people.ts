import { parseSaDate } from "./calendar.ts";
import { findDuplicates, nextSequence, normaliseName, notify, pushAudit, uid } from "./engine.ts";
import type { Actor, Learner, PendulaDB, StaffMember } from "./types.ts";

export interface LearnerDraft {
  firstName: string;
  middleName?: string;
  surname: string;
  preferredName?: string;
  dob: string;
  gender?: string;
  grade: number;
  schoolId: string;
  classId: string;
  homeLanguage?: string;
  area?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  supportNote?: string;
  readingEggsId?: string;
  photoConsent?: boolean;
}

export function registerLearner(
  db: PendulaDB,
  draft: LearnerDraft,
  actor: Actor,
  options?: { ignoreDuplicate?: boolean; importKey?: string },
): { error?: string; learner?: Learner; duplicates?: ReturnType<typeof findDuplicates> } {
  if (actor.role !== "admin" && actor.role !== "teacher") return { error: "Only staff can register a learner" };
  const firstName = draft.firstName.trim();
  const surname = draft.surname.trim();
  if (!firstName || !surname) return { error: "First name and surname are required" };
  if (!Number.isInteger(draft.grade) || draft.grade < 1 || draft.grade > 12) return { error: "Grade must be from 1 to 12" };
  const parsed = parseSaDate(draft.dob);
  if (!parsed.iso) return { error: parsed.warning || "Date of birth is not valid" };
  const school = db.schools.find((s) => s.id === draft.schoolId);
  const cls = db.classes.find((c) => c.id === draft.classId);
  if (!school || !cls || cls.schoolId !== school.id) return { error: "Choose a school and a class at that school" };
  if (cls.grade !== draft.grade) return { error: "The class grade does not match the learner grade" };
  const duplicates = findDuplicates(db.learners, {
    firstName,
    surname,
    dob: parsed.iso,
    schoolId: school.id,
    grade: draft.grade,
    guardianPhone: draft.guardianPhone,
  });
  if (duplicates.length && !options?.ignoreDuplicate) {
    return { error: "Possible existing learner found. Please review before continuing.", duplicates };
  }
  const year = db.org.academicYear;
  const n = nextSequence(
    db.learners.map((l) => l.id),
    year,
    "PEN",
  );
  const seq = n.split("-")[2];
  const baseKey = options?.importKey || `${normaliseName(firstName)}|${normaliseName(surname)}|${parsed.iso}`;
  if (!options?.ignoreDuplicate && db.learners.some((l) => l.importKey === baseKey && l.status !== "merged")) {
    return { error: "This learner was already imported. Existing records were not overwritten.", duplicates };
  }
  const learner: Learner = {
    id: n,
    accountNumber: `PB-${year}-${seq}`,
    firstName,
    middleName: (draft.middleName || "").trim(),
    surname,
    preferredName: (draft.preferredName || firstName).trim(),
    dob: parsed.iso,
    gender: draft.gender || "",
    grade: draft.grade,
    schoolId: school.id,
    classId: cls.id,
    locationId: school.locationId,
    status: "active",
    homeLanguage: draft.homeLanguage || "",
    area: draft.area || "",
    address: draft.address || "",
    guardianName: draft.guardianName || "",
    guardianPhone: draft.guardianPhone || "",
    emergencyName: draft.emergencyName || draft.guardianName || "",
    emergencyPhone: draft.emergencyPhone || draft.guardianPhone || "",
    supportNote: actor.role === "admin" ? draft.supportNote || "" : "",
    readingEggsId: draft.readingEggsId || "",
    photoConsent: Boolean(draft.photoConsent),
    registeredAt: new Date().toISOString(),
    academicYear: year,
    portalPin: String(1000 + Math.floor(Math.random() * 9000)),
    importKey: options?.ignoreDuplicate ? `${baseKey}#${uid("k")}` : baseKey,
  };
  db.learners = [...db.learners, learner];
  pushAudit(db, actor, "learner.register", learner.id, `${learner.firstName} ${learner.surname}, Grade ${learner.grade}`);
  return { learner, duplicates };
}

const TEACHER_FIELDS = new Set([
  "preferredName",
  "grade",
  "schoolId",
  "classId",
  "homeLanguage",
  "area",
  "address",
  "guardianName",
  "guardianPhone",
  "emergencyName",
  "emergencyPhone",
  "readingEggsId",
  "photoConsent",
]);

export function updateLearner(
  db: PendulaDB,
  learnerId: string,
  patch: Partial<LearnerDraft> & { status?: "active" | "inactive" },
  actor: Actor,
): { error?: string } {
  const learner = db.learners.find((l) => l.id === learnerId);
  if (!learner || learner.status === "merged") return { error: "Learner not found" };
  if (actor.role === "teacher") {
    for (const key of Object.keys(patch)) {
      if (!TEACHER_FIELDS.has(key)) return { error: "Teachers cannot change that field" };
    }
  } else if (actor.role !== "admin") {
    return { error: "You cannot edit learner records" };
  }
  if (patch.status && actor.role !== "admin") return { error: "Only an administrator can deactivate a learner" };
  const next = { ...learner };
  if (patch.firstName !== undefined && actor.role === "admin") next.firstName = patch.firstName.trim();
  if (patch.middleName !== undefined && actor.role === "admin") next.middleName = patch.middleName.trim();
  if (patch.surname !== undefined && actor.role === "admin") next.surname = patch.surname.trim();
  if (patch.preferredName !== undefined) next.preferredName = patch.preferredName.trim();
  if (patch.dob !== undefined && actor.role === "admin") {
    const parsed = parseSaDate(patch.dob);
    if (!parsed.iso) return { error: parsed.warning || "Date of birth is not valid" };
    next.dob = parsed.iso;
  }
  if (patch.gender !== undefined && actor.role === "admin") next.gender = patch.gender;
  if (patch.grade !== undefined) next.grade = patch.grade;
  if (patch.schoolId !== undefined) next.schoolId = patch.schoolId;
  if (patch.classId !== undefined) next.classId = patch.classId;
  if (patch.homeLanguage !== undefined) next.homeLanguage = patch.homeLanguage;
  if (patch.area !== undefined) next.area = patch.area;
  if (patch.address !== undefined) next.address = patch.address;
  if (patch.guardianName !== undefined) next.guardianName = patch.guardianName;
  if (patch.guardianPhone !== undefined) next.guardianPhone = patch.guardianPhone;
  if (patch.emergencyName !== undefined) next.emergencyName = patch.emergencyName;
  if (patch.emergencyPhone !== undefined) next.emergencyPhone = patch.emergencyPhone;
  if (patch.readingEggsId !== undefined) next.readingEggsId = patch.readingEggsId;
  if (patch.photoConsent !== undefined) next.photoConsent = patch.photoConsent;
  if (patch.supportNote !== undefined && actor.role === "admin") next.supportNote = patch.supportNote;
  if (patch.status && actor.role === "admin") next.status = patch.status;
  const school = db.schools.find((s) => s.id === next.schoolId);
  const cls = db.classes.find((c) => c.id === next.classId);
  if (!school || !cls) return { error: "School or class is missing" };
  next.locationId = school.locationId;
  db.learners = db.learners.map((l) => (l.id === learner.id ? next : l));
  pushAudit(db, actor, patch.status === "inactive" ? "learner.deactivate" : "learner.edit", learner.id, "Record updated. History kept.");
  return {};
}

export function mergeLearners(db: PendulaDB, keepId: string, dropId: string, actor: Actor): { error?: string } {
  if (actor.role !== "admin") return { error: "Only an administrator can merge records" };
  if (keepId === dropId) return { error: "Choose two different records" };
  const keep = db.learners.find((l) => l.id === keepId);
  const drop = db.learners.find((l) => l.id === dropId);
  if (!keep || !drop || drop.status === "merged" || keep.status === "merged") return { error: "Learner not found" };
  db.attendance = db.attendance.map((a) => (a.learnerId === drop.id ? { ...a, learnerId: keep.id } : a));
  db.results = db.results.map((r) => (r.learnerId === drop.id ? { ...r, learnerId: keep.id } : r));
  db.reading = db.reading.map((r) => (r.learnerId === drop.id ? { ...r, learnerId: keep.id } : r));
  db.goals = db.goals.map((g) => (g.learnerId === drop.id ? { ...g, learnerId: keep.id } : g));
  db.badges = db.badges.map((b) => (b.learnerId === drop.id ? { ...b, learnerId: keep.id } : b));
  db.interventions = db.interventions.map((n) => (n.learnerId === drop.id ? { ...n, learnerId: keep.id } : n));
  db.parents = db.parents.map((p) => ({
    ...p,
    learnerIds: [...new Set(p.learnerIds.map((id) => (id === drop.id ? keep.id : id)))],
  }));
  db.learners = db.learners.map((l) => (l.id === drop.id ? { ...l, status: "merged", mergedInto: keep.id } : l));
  pushAudit(
    db,
    actor,
    "learner.merge",
    keep.id,
    `${drop.id} merged into ${keep.id}. Original ledger lines stay on ${drop.id} and are included in the surviving balance. Nothing was deleted.`,
  );
  return {};
}

export function addStaff(
  db: PendulaDB,
  input: { name: string; role: "admin" | "teacher"; email: string; pin: string; classIds: string[] },
  actor: Actor,
): { error?: string; staff?: StaffMember } {
  if (actor.role !== "admin") return { error: "Only an administrator can add staff" };
  if (!/^\d{4}$/.test(input.pin)) return { error: "Use a 4-digit device PIN" };
  const activeAdmins = db.staff.filter((s) => s.role === "admin" && s.active).length;
  if (input.role === "admin" && activeAdmins >= 3) {
    return { error: "Pendula allows at most three active administrators" };
  }
  const staff: StaffMember = {
    id: uid("staff"),
    name: input.name.trim(),
    role: input.role,
    email: input.email.trim(),
    pin: input.pin,
    active: true,
    classIds: input.classIds,
  };
  if (!staff.name) return { error: "Name is required" };
  db.staff = [...db.staff, staff];
  pushAudit(db, actor, "staff.create", staff.id, `${staff.role}: ${staff.name}`);
  notify(db, "admin", "Staff record added", `${staff.name} is now a ${staff.role}.`);
  return { staff };
}

export function setStaffActive(db: PendulaDB, staffId: string, active: boolean, actor: Actor): { error?: string } {
  if (actor.role !== "admin") return { error: "Only an administrator can change staff access" };
  const staff = db.staff.find((s) => s.id === staffId);
  if (!staff) return { error: "Staff member not found" };
  if (staff.role === "admin" && !active) {
    const remaining = db.staff.filter((s) => s.role === "admin" && s.active && s.id !== staff.id).length;
    if (remaining < 1) return { error: "The programme must keep one active administrator" };
  }
  if (staff.role === "admin" && active) {
    const activeAdmins = db.staff.filter((s) => s.role === "admin" && s.active).length;
    if (activeAdmins >= 3) return { error: "Pendula allows at most three active administrators" };
  }
  db.staff = db.staff.map((s) => (s.id === staffId ? { ...s, active } : s));
  pushAudit(db, actor, active ? "staff.restore" : "staff.deactivate", staffId, staff.name);
  return {};
}

export interface ImportRow {
  line: number;
  raw: Record<string, string>;
  draft?: LearnerDraft;
  errors: string[];
  warnings: string[];
  duplicates: ReturnType<typeof findDuplicates>;
}

const ALIASES: Record<string, string[]> = {
  firstName: ["first name", "firstname", "name", "learner name"],
  surname: ["surname", "last name", "lastname"],
  middleName: ["middle name", "middle"],
  preferredName: ["preferred name", "preferred"],
  dob: ["date of birth", "dob", "birth date", "birthday"],
  gender: ["gender", "sex"],
  grade: ["grade", "gr"],
  school: ["school", "campus"],
  className: ["class", "class name"],
  homeLanguage: ["home language", "language"],
  area: ["area", "residential area", "suburb"],
  guardianName: ["guardian", "guardian name", "parent", "parent name"],
  guardianPhone: ["guardian phone", "phone", "parent phone", "cell"],
  readingEggsId: ["reading eggs", "reading eggs id", "re id"],
};

function headerKey(headers: string[], field: string): string | undefined {
  const want = ALIASES[field];
  return headers.find((h) => want.includes(h.trim().toLowerCase()));
}

export function parseImportCsv(text: string, db: PendulaDB): { error?: string; rows: ImportRow[] } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) return { error: "The file needs a header row and at least one learner", rows: [] };
  const headers = splitCsv(lines[0]);
  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length && i <= 500; i++) {
    const cells = splitCsv(lines[i]);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = (cells[idx] || "").trim();
    });
    const errors: string[] = [];
    const warnings: string[] = [];
    const firstHeader = headerKey(headers, "firstName");
    const surnameHeader = headerKey(headers, "surname");
    let firstName = firstHeader ? raw[firstHeader] : "";
    let surname = surnameHeader ? raw[surnameHeader] : "";
    if (firstHeader && ALIASES.firstName.includes(firstHeader.trim().toLowerCase()) && firstHeader.trim().toLowerCase() === "name" && !surname) {
      const parts = firstName.split(/\s+/);
      surname = parts.length > 1 ? parts.pop() || "" : "";
      firstName = parts.join(" ");
      warnings.push("Split a single name column into first name and surname");
    }
    if (!headerKey(headers, "firstName")) errors.push("Missing a first name column");
    if (!firstName) errors.push("First name is empty");
    if (!surname) errors.push("Surname is empty");
    const dobRaw = headerKey(headers, "dob") ? raw[headerKey(headers, "dob")!] : "";
    const parsed = parseSaDate(dobRaw);
    if (!parsed.iso) errors.push(parsed.warning || "Date of birth is missing");
    if (parsed.warning && parsed.iso) warnings.push(parsed.warning);
    const gradeRaw = headerKey(headers, "grade") ? raw[headerKey(headers, "grade")!] : "";
    const grade = Number(gradeRaw.replace(/[^0-9]/g, ""));
    if (grade < 1 || grade > 12) errors.push("Grade must be 1–12");
    const schoolName = headerKey(headers, "school") ? raw[headerKey(headers, "school")!] : "";
    const school = db.schools.find((s) => s.name.toLowerCase() === schoolName.toLowerCase());
    if (!school) errors.push(schoolName ? `School “${schoolName}” is not configured` : "School is missing");
    const className = headerKey(headers, "className") ? raw[headerKey(headers, "className")!] : `Grade ${grade}`;
    const cls = db.classes.find(
      (c) => c.schoolId === school?.id && (c.name.toLowerCase() === className.toLowerCase() || c.grade === grade),
    );
    if (!cls) errors.push("No matching class");
    const guardianPhone = headerKey(headers, "guardianPhone") ? raw[headerKey(headers, "guardianPhone")!] : "";
    if (!guardianPhone) warnings.push("Guardian phone is empty");
    const draft: LearnerDraft | undefined =
      errors.length || !parsed.iso || !school || !cls
        ? undefined
        : {
            firstName,
            surname,
            middleName: headerKey(headers, "middleName") ? raw[headerKey(headers, "middleName")!] : "",
            preferredName: headerKey(headers, "preferredName") ? raw[headerKey(headers, "preferredName")!] : "",
            dob: parsed.iso,
            gender: headerKey(headers, "gender") ? raw[headerKey(headers, "gender")!] : "",
            grade,
            schoolId: school.id,
            classId: cls.id,
            homeLanguage: headerKey(headers, "homeLanguage") ? raw[headerKey(headers, "homeLanguage")!] : "",
            area: headerKey(headers, "area") ? raw[headerKey(headers, "area")!] : "",
            guardianName: headerKey(headers, "guardianName") ? raw[headerKey(headers, "guardianName")!] : "",
            guardianPhone,
            readingEggsId: headerKey(headers, "readingEggsId") ? raw[headerKey(headers, "readingEggsId")!] : "",
          };
    const duplicates = draft
      ? findDuplicates(db.learners, {
          firstName: draft.firstName,
          surname: draft.surname,
          dob: draft.dob,
          schoolId: draft.schoolId,
          grade: draft.grade,
          guardianPhone: draft.guardianPhone,
        })
      : [];
    if (duplicates.length) warnings.push("Possible existing learner found");
    rows.push({ line: i + 1, raw, draft, errors, warnings, duplicates });
  }
  if (lines.length - 1 > 500) return { error: "Import at most 500 learners at a time", rows };
  return { rows };
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted && ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export function commitImport(db: PendulaDB, rows: ImportRow[], actor: Actor): { added: number; skipped: number; errors: string[] } {
  let added = 0;
  let skipped = 0;
  const errors: string[] = [];
  for (const row of rows) {
    if (!row.draft || row.errors.length || row.duplicates.some((d) => d.level === "confirmed")) {
      skipped += 1;
      if (row.errors[0]) errors.push(`Line ${row.line}: ${row.errors[0]}`);
      else if (row.duplicates.length) errors.push(`Line ${row.line}: possible duplicate skipped`);
      continue;
    }
    const result = registerLearner(db, row.draft, actor, {
      ignoreDuplicate: row.duplicates.length === 0,
      importKey: `${row.draft.firstName}|${row.draft.surname}|${row.draft.dob}`.toLowerCase(),
    });
    if (result.learner) added += 1;
    else {
      skipped += 1;
      if (result.error) errors.push(`Line ${row.line}: ${result.error}`);
    }
  }
  pushAudit(db, actor, "import.commit", "learners", `${added} added, ${skipped} skipped`);
  return { added, skipped, errors };
}

export const IMPORT_TEMPLATE = `first name,surname,date of birth,grade,school,class,home language,area,guardian name,guardian phone,gender,reading eggs id
Amahle,Dlamini,2016-04-12,3,Bronberg Campus,Grade 3,isiZulu,Sunnyside,Nokuthula Dlamini,0820000000,Female,
`;
