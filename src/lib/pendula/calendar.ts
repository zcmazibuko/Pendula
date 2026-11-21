import type { Holiday, Term } from "./types.ts";

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso: string, days: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function weekday(iso: string): number {
  return parseIso(iso).getDay();
}

export function isWeekend(iso: string): boolean {
  const w = weekday(iso);
  return w === 0 || w === 6;
}

export function inTerm(iso: string, terms: Term[]): Term | undefined {
  return terms.find((t) => iso >= t.start && iso <= t.end);
}

export function holidayOn(iso: string, holidays: Holiday[]): Holiday | undefined {
  return holidays.find((h) => h.date === iso);
}

export type DayKind = "school" | "weekend" | "holiday" | "closure";

export function dayKind(iso: string, terms: Term[], holidays: Holiday[]): DayKind {
  if (isWeekend(iso)) return "weekend";
  const holiday = holidayOn(iso, holidays);
  if (holiday) return "holiday";
  if (!inTerm(iso, terms)) return "closure";
  return "school";
}

/** School days on or before `asOf`, newest last, up to `count`. */
export function recentSchoolDays(
  count: number,
  asOf: string,
  terms: Term[],
  holidays: Holiday[],
): string[] {
  const out: string[] = [];
  let cursor = asOf;
  for (let i = 0; i < 400 && out.length < count; i++) {
    if (dayKind(cursor, terms, holidays) === "school") out.push(cursor);
    cursor = addDays(cursor, -1);
  }
  return out.reverse();
}

export function weekStart(iso: string): string {
  const d = parseIso(iso);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return isoDate(d);
}

export function schoolDaysOfWeek(iso: string, terms: Term[], holidays: Holiday[]): string[] {
  const start = weekStart(iso);
  const days: string[] = [];
  for (let i = 0; i < 5; i++) {
    const date = addDays(start, i);
    if (dayKind(date, terms, holidays) === "school") days.push(date);
  }
  return days;
}

export function ageOn(dob: string, asOf: string): number {
  const birth = parseIso(dob);
  const now = parseIso(asOf);
  let age = now.getFullYear() - birth.getFullYear();
  const md = now.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function formatSaDate(iso: string): string {
  return parseIso(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatSaLong(iso: string): string {
  return parseIso(iso).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthEnd(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m, 0);
  return isoDate(d);
}

export function monthsBetween(fromKey: string, toKey: string): string[] {
  const keys: string[] = [];
  let [y, m] = fromKey.split("-").map(Number);
  const [ty, tm] = toKey.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    keys.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m === 13) {
      m = 1;
      y += 1;
    }
  }
  return keys;
}

/** Accept ISO and common South African day-first formats. */
export function parseSaDate(input: string): { iso?: string; warning?: string } {
  const raw = input.trim();
  if (!raw) return { warning: "Date is empty" };
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) {
    const date = `${iso[1]}-${iso[2]}-${iso[3]}`;
    if (!validDate(date)) return { warning: "That date does not exist" };
    return { iso: date };
  }
  const slash = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(raw);
  if (!slash) return { warning: "Use YYYY-MM-DD or DD/MM/YYYY" };
  const a = Number(slash[1]);
  const b = Number(slash[2]);
  const y = slash[3];
  let day = a;
  let month = b;
  let warning: string | undefined;
  if (a > 12 && b <= 12) {
    day = a;
    month = b;
  } else if (b > 12 && a <= 12) {
    day = b;
    month = a;
    warning = "Interpreted as DD/MM/YYYY";
  } else {
    day = a;
    month = b;
    warning = "Read as DD/MM/YYYY (South African date order)";
  }
  const date = `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (!validDate(date)) return { warning: "That date does not exist" };
  return { iso: date, warning };
}

function validDate(iso: string): boolean {
  const d = parseIso(iso);
  return isoDate(d) === iso;
}

export const SA_2026_TERMS: Term[] = [
  { id: "t1-2026", name: "Term 1", start: "2026-01-14", end: "2026-03-27" },
  { id: "t2-2026", name: "Term 2", start: "2026-04-08", end: "2026-06-26" },
  { id: "t3-2026", name: "Term 3", start: "2026-07-21", end: "2026-09-23" },
  { id: "t4-2026", name: "Term 4", start: "2026-10-06", end: "2026-12-09" },
];

/** Public and school holidays that fall on weekdays in 2026. Inland calendar; edit if a province differs. */
export const SA_2026_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-03-21", name: "Human Rights Day" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Family Day" },
  { date: "2026-04-27", name: "Freedom Day" },
  { date: "2026-05-01", name: "Workers' Day" },
  { date: "2026-06-15", name: "Special school holiday", schoolOnly: true },
  { date: "2026-06-16", name: "Youth Day" },
  { date: "2026-08-10", name: "National Women's Day (observed)" },
  { date: "2026-09-24", name: "Heritage Day" },
  { date: "2026-12-16", name: "Day of Reconciliation" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-26", name: "Day of Goodwill" },
];
