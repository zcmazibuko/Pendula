import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as ShieldCheck, c as Lock, d as Landmark, f as FileChartColumnIncreasing, g as Bell, h as BookMarked, i as Sparkles, l as Library, m as BookOpen, o as Settings, p as CalendarCheck, r as Sun, s as Moon, t as Users, u as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { a as Area, c as Tooltip, i as XAxis, n as BarChart, o as Bar, r as YAxis, s as ResponsiveContainer, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C63wLP-B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isoDate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseIso(iso) {
	const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
	return new Date(y, (m || 1) - 1, d || 1);
}
function addDays(iso, days) {
	const d = parseIso(iso);
	d.setDate(d.getDate() + days);
	return isoDate(d);
}
function weekday(iso) {
	return parseIso(iso).getDay();
}
function isWeekend(iso) {
	const w = weekday(iso);
	return w === 0 || w === 6;
}
function inTerm(iso, terms) {
	return terms.find((t) => iso >= t.start && iso <= t.end);
}
function holidayOn(iso, holidays) {
	return holidays.find((h) => h.date === iso);
}
function dayKind(iso, terms, holidays) {
	if (isWeekend(iso)) return "weekend";
	if (holidayOn(iso, holidays)) return "holiday";
	if (!inTerm(iso, terms)) return "closure";
	return "school";
}
/** School days on or before `asOf`, newest last, up to `count`. */
function recentSchoolDays(count, asOf, terms, holidays) {
	const out = [];
	let cursor = asOf;
	for (let i = 0; i < 400 && out.length < count; i++) {
		if (dayKind(cursor, terms, holidays) === "school") out.push(cursor);
		cursor = addDays(cursor, -1);
	}
	return out.reverse();
}
function weekStart(iso) {
	const d = parseIso(iso);
	const day = d.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	d.setDate(d.getDate() + diff);
	return isoDate(d);
}
function schoolDaysOfWeek(iso, terms, holidays) {
	const start = weekStart(iso);
	const days = [];
	for (let i = 0; i < 5; i++) {
		const date = addDays(start, i);
		if (dayKind(date, terms, holidays) === "school") days.push(date);
	}
	return days;
}
function ageOn(dob, asOf) {
	const birth = parseIso(dob);
	const now = parseIso(asOf);
	let age = now.getFullYear() - birth.getFullYear();
	const md = now.getMonth() - birth.getMonth();
	if (md < 0 || md === 0 && now.getDate() < birth.getDate()) age -= 1;
	return age;
}
function formatSaDate(iso) {
	return parseIso(iso).toLocaleDateString("en-ZA", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function formatSaLong(iso) {
	return parseIso(iso).toLocaleDateString("en-ZA", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
}
function monthKey(iso) {
	return iso.slice(0, 7);
}
function monthEnd(key) {
	const [y, m] = key.split("-").map(Number);
	return isoDate(new Date(y, m, 0));
}
function monthsBetween(fromKey, toKey) {
	const keys = [];
	let [y, m] = fromKey.split("-").map(Number);
	const [ty, tm] = toKey.split("-").map(Number);
	while (y < ty || y === ty && m <= tm) {
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
function parseSaDate(input) {
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
	let warning;
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
	return {
		iso: date,
		warning
	};
}
function validDate(iso) {
	return isoDate(parseIso(iso)) === iso;
}
var SA_2026_TERMS = [
	{
		id: "t1-2026",
		name: "Term 1",
		start: "2026-01-14",
		end: "2026-03-27"
	},
	{
		id: "t2-2026",
		name: "Term 2",
		start: "2026-04-08",
		end: "2026-06-26"
	},
	{
		id: "t3-2026",
		name: "Term 3",
		start: "2026-07-21",
		end: "2026-09-23"
	},
	{
		id: "t4-2026",
		name: "Term 4",
		start: "2026-10-06",
		end: "2026-12-09"
	}
];
/** Public and school holidays that fall on weekdays in 2026. Inland calendar; edit if a province differs. */
var SA_2026_HOLIDAYS = [
	{
		date: "2026-01-01",
		name: "New Year's Day"
	},
	{
		date: "2026-03-21",
		name: "Human Rights Day"
	},
	{
		date: "2026-04-03",
		name: "Good Friday"
	},
	{
		date: "2026-04-06",
		name: "Family Day"
	},
	{
		date: "2026-04-27",
		name: "Freedom Day"
	},
	{
		date: "2026-05-01",
		name: "Workers' Day"
	},
	{
		date: "2026-06-15",
		name: "Special school holiday",
		schoolOnly: true
	},
	{
		date: "2026-06-16",
		name: "Youth Day"
	},
	{
		date: "2026-08-10",
		name: "National Women's Day (observed)"
	},
	{
		date: "2026-09-24",
		name: "Heritage Day"
	},
	{
		date: "2026-12-16",
		name: "Day of Reconciliation"
	},
	{
		date: "2026-12-25",
		name: "Christmas Day"
	},
	{
		date: "2026-12-26",
		name: "Day of Goodwill"
	}
];
var DISCLAIMER = "Virtual educational points only. Not a real bank account, not rand, and not a monetary deposit.";
var DEFAULT_POLICY = {
	version: "2026.1",
	effectiveFrom: "2026-01-14",
	approved: false,
	points: {
		attendancePresent: 10,
		attendanceLate: 5,
		assessmentComplete: 20,
		improvementPerPoint: 5,
		improvementCap: 50,
		readingStage: 30,
		learningMilestone: 15,
		perfectWeek: 20
	},
	interest: {
		approved: false,
		ratePercent: 1,
		mode: "compound",
		minBalance: 0,
		maxAward: 500,
		rounding: "nearest",
		suspended: false
	},
	homeworkEnabled: false,
	habitsEnabled: false,
	programmeEnabled: false
};
function uid(prefix) {
	return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function learnerLabel(l) {
	return `${l.preferredName || l.firstName} ${l.surname}`.trim();
}
function fullName(l) {
	return [
		l.firstName,
		l.middleName,
		l.surname
	].filter(Boolean).join(" ");
}
function nextSequence(existing, year, prefix) {
	let max = 0;
	const re = new RegExp(`^${prefix}-${year}-(\\d+)$`);
	for (const id of existing) {
		const m = re.exec(id);
		if (m) max = Math.max(max, Number(m[1]));
	}
	return `${prefix}-${year}-${String(max + 1).padStart(5, "0")}`;
}
function normaliseName(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
}
function levenshtein(a, b) {
	if (a === b) return 0;
	if (!a.length) return b.length;
	if (!b.length) return a.length;
	const row = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		let prev = i - 1;
		row[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const temp = row[j];
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
			prev = temp;
		}
	}
	return row[b.length];
}
function similarity(a, b) {
	if (!a && !b) return 1;
	const max = Math.max(a.length, b.length);
	if (!max) return 1;
	return 1 - levenshtein(a, b) / max;
}
function findDuplicates(learners, draft, ignoreId) {
	const first = normaliseName(draft.firstName);
	const surname = normaliseName(draft.surname);
	const phone = (draft.guardianPhone || "").replace(/\D/g, "");
	const hits = [];
	for (const learner of learners) {
		if (learner.id === ignoreId || learner.status === "merged") continue;
		const reasons = [];
		let score = 0;
		const sameDob = Boolean(draft.dob) && learner.dob === draft.dob;
		const fn = similarity(first, normaliseName(learner.firstName));
		const sn = similarity(surname, normaliseName(learner.surname));
		const pn = similarity(first, normaliseName(learner.preferredName));
		const nameScore = Math.max(fn, pn);
		if (sameDob && nameScore > .92 && sn > .92) {
			score = .97;
			reasons.push("Same date of birth and a matching name");
		} else if (sameDob && sn > .9 && nameScore > .8) {
			score = .86;
			reasons.push("Same date of birth and a very similar name");
		} else if (sameDob && sn > .84) {
			score = .72;
			reasons.push("Same date of birth and a similar surname");
		} else if (nameScore > .95 && sn > .95 && !sameDob) {
			score = .6;
			reasons.push("Name matches, but the date of birth differs — check before treating this as the same child");
		}
		const theirPhone = learner.guardianPhone.replace(/\D/g, "");
		if (phone && theirPhone && phone === theirPhone && sn > .8) {
			score = Math.max(score, .78);
			reasons.push("Guardian phone number matches");
		}
		if (score >= .55 && draft.schoolId && learner.schoolId === draft.schoolId && learner.grade === draft.grade) {
			score = Math.min(.99, score + .04);
			reasons.push("Same school and grade");
		}
		if (score >= .55) hits.push({
			learnerId: learner.id,
			confidence: Math.round(score * 100) / 100,
			level: score >= .9 ? "confirmed" : "possible",
			reasons
		});
	}
	return hits.sort((a, b) => b.confidence - a.confidence);
}
function fingerprint(db) {
	const body = db.transactions.map((t) => `${t.id}|${t.idempotencyKey}|${t.learnerId}|${t.direction}|${t.amount}|${t.type}|${t.debitAccount}|${t.creditAccount}`).join("\n");
	let h = 2166136261;
	const s = `${db.learners.length}:${db.deductions.length}:` + body;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0).toString(16).padStart(8, "0");
}
function stamp(db) {
	return {
		...db,
		integrity: fingerprint(db)
	};
}
function integrityOk(db) {
	return db.integrity === fingerprint(db);
}
function pushAudit(db, actor, action, target, detail, at = nowIso()) {
	const event = {
		id: uid("aud"),
		at,
		actorId: actor.id,
		role: actor.role,
		action,
		target,
		detail
	};
	db.audit = [event, ...db.audit].slice(0, 2e3);
	return event;
}
function notify(db, audience, title, body, learnerId) {
	db.notifications = [{
		id: uid("ntf"),
		at: nowIso(),
		audience,
		title,
		body,
		learnerId,
		read: false
	}, ...db.notifications].slice(0, 400);
}
function roundPoints(value, mode) {
	if (!Number.isFinite(value) || value <= 0) return 0;
	if (mode === "floor") return Math.floor(value + 1e-9);
	if (mode === "ceil") return Math.ceil(value - 1e-9);
	return Math.round(value);
}
function accountIdsFor(db, learnerId) {
	const ids = /* @__PURE__ */ new Set([learnerId]);
	for (const learner of db.learners) {
		if (learner.mergedInto && ids.has(learner.mergedInto)) ids.add(learner.id);
		if (learner.mergedInto === learnerId) ids.add(learner.id);
	}
	let grew = true;
	while (grew) {
		grew = false;
		for (const learner of db.learners) {
			if (learner.mergedInto && ids.has(learner.id) && !ids.has(learner.mergedInto)) {
				ids.add(learner.mergedInto);
				grew = true;
			}
			if (learner.mergedInto && ids.has(learner.mergedInto) && !ids.has(learner.id)) {
				ids.add(learner.id);
				grew = true;
			}
		}
	}
	return ids;
}
function transactionsFor(db, learnerId) {
	const ids = accountIdsFor(db, learnerId);
	return db.transactions.filter((t) => ids.has(t.learnerId));
}
function balanceOf(db, learnerId, asOf) {
	let total = 0;
	for (const tx of transactionsFor(db, learnerId)) {
		if (asOf && tx.at.slice(0, 10) > asOf) continue;
		total += tx.direction === "credit" ? tx.amount : -tx.amount;
	}
	return total;
}
function balanceParts(db, learnerId) {
	let earned = 0;
	let deductions = 0;
	let interest = 0;
	for (const tx of transactionsFor(db, learnerId)) if (tx.direction === "credit") {
		if (tx.type === "interest") interest += tx.amount;
		else earned += tx.amount;
	} else deductions += tx.amount;
	return {
		balance: earned + interest - deductions,
		earned,
		deductions,
		interest
	};
}
function ledgerInvariant(tx) {
	if (!Number.isInteger(tx.amount) || tx.amount <= 0) return "Amount must be a positive whole number of points";
	if (!tx.debitAccount || !tx.creditAccount || tx.debitAccount === tx.creditAccount) return "Each transaction needs two different ledger accounts";
	if (tx.direction === "credit" && !tx.creditAccount.startsWith("learner:")) return "A credit must land in a learner account";
	if (tx.direction === "debit" && !tx.debitAccount.startsWith("learner:")) return "A debit must leave a learner account";
	return null;
}
function postTransaction(db, input) {
	const existing = db.transactions.find((t) => t.idempotencyKey === input.idempotencyKey);
	if (existing) return {
		tx: existing,
		duplicate: true
	};
	const learner = db.learners.find((l) => l.id === input.learnerId);
	if (!learner) return {
		duplicate: false,
		error: "Learner not found"
	};
	if (learner.status === "merged") return {
		duplicate: false,
		error: "This record was merged into another learner"
	};
	if (learner.status === "inactive" && input.direction === "credit" && input.type !== "reversal" && input.type !== "merge_transfer") return {
		duplicate: false,
		error: "Inactive learners cannot earn new points"
	};
	const amount = Math.trunc(input.amount);
	if (amount <= 0) return {
		duplicate: false,
		error: "Nothing to post"
	};
	if (input.direction === "debit") {
		const available = balanceOf(db, input.learnerId);
		if (amount > available) return {
			duplicate: false,
			error: `That would take the balance below zero. Available points: ${available}.`
		};
	}
	const tx = {
		id: uid("tx"),
		idempotencyKey: input.idempotencyKey,
		at: input.at || nowIso(),
		learnerId: input.learnerId,
		type: input.type,
		direction: input.direction,
		amount,
		reason: input.reason,
		ruleVersion: db.org.policy.version,
		actorId: input.actor.id,
		approverId: input.approverId,
		linkType: input.linkType,
		linkId: input.linkId,
		debitAccount: input.direction === "credit" ? input.contra : `learner:${input.learnerId}`,
		creditAccount: input.direction === "credit" ? `learner:${input.learnerId}` : input.contra
	};
	const problem = ledgerInvariant(tx);
	if (problem) return {
		duplicate: false,
		error: problem
	};
	db.transactions = [...db.transactions, tx];
	return {
		tx,
		duplicate: false
	};
}
function rewardsReady(db) {
	if (!db.org.rewardsLive || !db.org.policy.approved) return "Rewards are not live yet. An administrator must approve the points policy first.";
	return null;
}
function pointsForStatus(policy, status) {
	if (status === "present") return policy.points.attendancePresent;
	if (status === "late") return policy.points.attendanceLate;
	return 0;
}
function netLinked(db, linkType, linkId) {
	let net = 0;
	for (const tx of db.transactions) if (tx.linkType === linkType && tx.linkId === linkId) net += tx.direction === "credit" ? tx.amount : -tx.amount;
	return net;
}
function ensureAttendanceDeduction(db, learnerId, attendanceId, amount, reason, actor) {
	if (amount <= 0) return false;
	const key = `ded-att:${attendanceId}:${amount}`;
	if (db.deductions.find((d) => d.idempotencyKey === key)) return false;
	db.deductions = [{
		id: uid("ded"),
		learnerId,
		amount,
		reason,
		category: "attendance_correction",
		status: "pending",
		requesterId: actor.id,
		createdAt: nowIso(),
		linkType: "attendance",
		linkId: attendanceId,
		idempotencyKey: key
	}, ...db.deductions];
	notify(db, "admin", "Attendance correction needs approval", `${amount} points may be reversed. ${reason}`, learnerId);
	return true;
}
function maybePerfectWeek(db, learnerId, date, actor) {
	const days = schoolDaysOfWeek(date, db.org.terms, db.org.holidays);
	if (!days.length || date !== days[days.length - 1]) return;
	if (days.map((day) => db.attendance.find((a) => a.learnerId === learnerId && a.date === day)).some((m) => !m || m.status !== "present")) return;
	const week = days[0];
	postTransaction(db, {
		idempotencyKey: `week:${learnerId}:${week}`,
		learnerId,
		type: "perfect_week",
		direction: "credit",
		amount: db.org.policy.points.perfectWeek,
		reason: `Perfect attendance for the school week of ${week}`,
		actor,
		linkType: "week",
		linkId: week,
		contra: "sys:rewards-attendance"
	});
}
function saveAttendance(db, input) {
	if (input.actor.role !== "admin" && input.actor.role !== "teacher") return {
		error: "Only staff can record attendance",
		posted: 0,
		unchanged: 0,
		corrections: 0
	};
	const kind = dayKind(input.date, db.org.terms, db.org.holidays);
	if (kind !== "school") {
		const label = kind === "weekend" ? "a weekend" : kind === "holiday" ? "a public or school holiday" : "outside the configured term";
		return {
			error: `${input.date} is ${label}. Attendance points are not awarded. You can still note a closure from the calendar.`,
			posted: 0,
			unchanged: 0,
			corrections: 0
		};
	}
	const blocked = rewardsReady(db);
	if (!db.classes.find((c) => c.id === input.classId)) return {
		error: "Class not found",
		posted: 0,
		unchanged: 0,
		corrections: 0
	};
	if (input.actor.role === "teacher") {
		if (!db.staff.find((s) => s.id === input.actor.id)?.classIds.includes(input.classId)) return {
			error: "This class is not assigned to you",
			posted: 0,
			unchanged: 0,
			corrections: 0
		};
	}
	let posted = 0;
	let unchanged = 0;
	let corrections = 0;
	for (const mark of input.marks) {
		const learner = db.learners.find((l) => l.id === mark.learnerId);
		if (!learner || learner.classId !== input.classId || learner.status !== "active") continue;
		let rec = db.attendance.find((a) => a.learnerId === learner.id && a.date === input.date);
		if (rec && rec.status === mark.status) {
			unchanged += 1;
			continue;
		}
		if (!rec) {
			rec = {
				id: uid("att"),
				learnerId: learner.id,
				classId: input.classId,
				date: input.date,
				status: mark.status,
				actorId: input.actor.id,
				updatedAt: nowIso()
			};
			db.attendance = [...db.attendance, rec];
		} else {
			rec = {
				...rec,
				status: mark.status,
				actorId: input.actor.id,
				updatedAt: nowIso()
			};
			db.attendance = db.attendance.map((a) => a.id === rec.id ? rec : a);
		}
		pushAudit(db, input.actor, "attendance.record", rec.id, `${learner.id} ${input.date} marked ${mark.status}`);
		if (blocked) continue;
		const target = pointsForStatus(db.org.policy, mark.status);
		const net = netLinked(db, "attendance", rec.id);
		if (target > net) {
			const result = postTransaction(db, {
				idempotencyKey: `att:${learner.id}:${input.date}:credit:${net}->${target}`,
				at: `${input.date}T15:00:00.000Z`,
				learnerId: learner.id,
				type: "attendance",
				direction: "credit",
				amount: target - net,
				reason: mark.status === "late" ? `Late attendance on ${input.date}` : `Attendance on ${input.date}`,
				actor: input.actor,
				linkType: "attendance",
				linkId: rec.id,
				contra: "sys:rewards-attendance"
			});
			if (result.tx && !result.duplicate) posted += 1;
		} else if (target < net) {
			if (ensureAttendanceDeduction(db, learner.id, rec.id, net - target, `Attendance on ${input.date} changed to ${mark.status}. ${net - target} points need an administrator before they leave the account.`, input.actor)) corrections += 1;
		}
		if (!blocked && mark.status === "present") maybePerfectWeek(db, learner.id, input.date, input.actor);
	}
	return {
		posted,
		unchanged,
		corrections
	};
}
function percentage(score, max) {
	if (max <= 0) return 0;
	return score / max * 100;
}
/** Percentage-point improvement, not a relative percentage change. */
function improvementPoints(previousPct, currentPct, perPoint, cap) {
	const delta = Math.floor(currentPct - previousPct + 1e-9);
	if (delta <= 0) return 0;
	return Math.min(cap, delta * perPoint);
}
function createAssessment(db, input, actor) {
	if (actor.role !== "admin" && actor.role !== "teacher") return { error: "Only staff can create assessments" };
	if (!input.name.trim() || !input.subject.trim()) return { error: "Name and subject are required" };
	if (!Number.isFinite(input.maxScore) || input.maxScore <= 0) return { error: "Maximum score must be greater than zero" };
	const assessment = {
		...input,
		id: uid("asm"),
		name: input.name.trim(),
		subject: input.subject.trim()
	};
	db.assessments = [assessment, ...db.assessments];
	pushAudit(db, actor, "assessment.create", assessment.id, `${assessment.subject}: ${assessment.name}`);
	return { assessment };
}
function saveResults(db, assessmentId, rows, actor) {
	if (actor.role !== "admin" && actor.role !== "teacher") return {
		error: "Only staff can mark assessments",
		participation: 0,
		improvement: 0
	};
	const assessment = db.assessments.find((a) => a.id === assessmentId);
	if (!assessment) return {
		error: "Assessment not found",
		participation: 0,
		improvement: 0
	};
	const blocked = rewardsReady(db);
	for (const row of rows) if (!Number.isFinite(row.score) || row.score < 0 || row.score > assessment.maxScore) return {
		error: "A score is outside the allowed range",
		participation: 0,
		improvement: 0
	};
	let participation = 0;
	let improvement = 0;
	for (const row of rows) {
		const learner = db.learners.find((l) => l.id === row.learnerId && l.status === "active");
		if (!learner) continue;
		const existing = db.results.find((r) => r.assessmentId === assessmentId && r.learnerId === learner.id);
		if (existing) db.results = db.results.map((r) => r.id === existing.id ? {
			...r,
			score: row.score,
			comment: row.comment,
			actorId: actor.id,
			at: nowIso()
		} : r);
		else {
			const created = {
				id: uid("res"),
				assessmentId,
				learnerId: learner.id,
				score: row.score,
				comment: row.comment,
				actorId: actor.id,
				at: nowIso()
			};
			db.results = [...db.results, created];
		}
		pushAudit(db, actor, "assessment.mark", assessmentId, `${learner.id} scored ${row.score}/${assessment.maxScore}`);
		if (blocked) continue;
		const part = postTransaction(db, {
			idempotencyKey: `ass-part:${assessmentId}:${learner.id}`,
			at: `${assessment.date}T16:00:00.000Z`,
			learnerId: learner.id,
			type: "assessment",
			direction: "credit",
			amount: db.org.policy.points.assessmentComplete,
			reason: `Completed ${assessment.subject}: ${assessment.name}`,
			actor,
			linkType: "assessment",
			linkId: assessmentId,
			contra: "sys:rewards-assessment"
		});
		if (part.tx && !part.duplicate) participation += 1;
		if (!assessment.seriesId) continue;
		const prior = previousComparable(db, assessment, learner.id);
		if (!prior) continue;
		const prevPct = percentage(prior.score, prior.maxScore);
		const currPct = percentage(row.score, assessment.maxScore);
		const award = improvementPoints(prevPct, currPct, db.org.policy.points.improvementPerPoint, db.org.policy.points.improvementCap);
		if (award <= 0) continue;
		const imp = postTransaction(db, {
			idempotencyKey: `ass-imp:${assessmentId}:${learner.id}`,
			at: `${assessment.date}T16:05:00.000Z`,
			learnerId: learner.id,
			type: "improvement",
			direction: "credit",
			amount: award,
			reason: `${assessment.subject} improved by ${Math.floor(currPct - prevPct)} percentage points (capped at ${db.org.policy.points.improvementCap})`,
			actor,
			linkType: "assessment",
			linkId: assessmentId,
			contra: "sys:rewards-improvement"
		});
		if (imp.tx && !imp.duplicate) improvement += 1;
	}
	awardBadges(db);
	return {
		participation,
		improvement
	};
}
function previousComparable(db, assessment, learnerId) {
	const earlier = db.assessments.filter((a) => a.id !== assessment.id && a.seriesId === assessment.seriesId && a.subject === assessment.subject && a.grade === assessment.grade && a.date <= assessment.date).sort((a, b) => a.date < b.date ? 1 : -1);
	for (const candidate of earlier) {
		const result = db.results.find((r) => r.assessmentId === candidate.id && r.learnerId === learnerId);
		if (result) return {
			score: result.score,
			maxScore: candidate.maxScore
		};
	}
	return null;
}
function recordReading(db, input) {
	if (input.actor.role !== "admin" && input.actor.role !== "teacher") return {
		error: "Only staff can verify Reading Eggs progress",
		awarded: 0,
		stages: []
	};
	const learner = db.learners.find((l) => l.id === input.learnerId && l.status === "active");
	if (!learner) return {
		error: "Learner not found",
		awarded: 0,
		stages: []
	};
	if (!Number.isInteger(input.stage) || input.stage < 1 || input.stage > 400) return {
		error: "Enter a whole stage number",
		awarded: 0,
		stages: []
	};
	const history = db.reading.filter((r) => r.learnerId === learner.id).sort((a, b) => a.stage - b.stage);
	const previous = history.length ? Math.max(...history.map((r) => r.stage)) : 0;
	if (input.stage <= previous) return {
		error: previous ? `Stage ${previous} is already verified. A repeated report does not earn points again.` : "Enter the new stage number.",
		awarded: 0,
		stages: []
	};
	const event = {
		id: uid("rd"),
		learnerId: learner.id,
		previousStage: previous,
		stage: input.stage,
		date: input.date,
		evidence: input.evidence.trim(),
		teacherId: input.actor.id,
		verified: true
	};
	db.reading = [...db.reading, event];
	pushAudit(db, input.actor, "reading.verify", event.id, `${learner.id} stage ${previous} → ${input.stage}. ${input.evidence}`);
	const blocked = rewardsReady(db);
	const stages = [];
	let awarded = 0;
	if (!blocked) for (let stage = previous + 1; stage <= input.stage; stage++) {
		const result = postTransaction(db, {
			idempotencyKey: `read:${learner.id}:stage:${stage}`,
			at: `${input.date}T17:00:00.000Z`,
			learnerId: learner.id,
			type: "reading",
			direction: "credit",
			amount: db.org.policy.points.readingStage,
			reason: `Reading Eggs stage ${stage} verified`,
			actor: input.actor,
			linkType: "reading",
			linkId: event.id,
			contra: "sys:rewards-reading"
		});
		if (result.tx && !result.duplicate) {
			stages.push(stage);
			awarded += result.tx.amount;
		}
	}
	awardBadges(db);
	return {
		awarded,
		stages
	};
}
function requestDeduction(db, input) {
	if (input.actor.role !== "teacher" && input.actor.role !== "admin") return { error: "Only staff can request a deduction" };
	const amount = Math.trunc(input.amount);
	if (amount <= 0) return { error: "Enter a positive number of points" };
	if (input.reason.trim().length < 8) return { error: "Give a clear reason (at least a short sentence)" };
	const learner = db.learners.find((l) => l.id === input.learnerId);
	if (!learner || learner.status === "merged") return { error: "Learner not found" };
	const unfair = /disab|poverty|poor|sick|illness|race|language|pregnan/i.test(input.reason);
	const request = {
		id: uid("ded"),
		learnerId: learner.id,
		amount,
		reason: input.reason.trim(),
		category: input.category || "correction",
		status: "pending",
		requesterId: input.actor.id,
		createdAt: nowIso(),
		idempotencyKey: uid("dedkey")
	};
	db.deductions = [request, ...db.deductions];
	pushAudit(db, input.actor, "deduction.request", request.id, `${amount} points for ${learner.id}: ${request.reason}`);
	notify(db, "admin", "Deduction waiting for review", `${learnerLabel(learner)} — ${amount} points. ${request.reason}`, learner.id);
	if (unfair) notify(db, "admin", "Check this deduction carefully", "The reason mentions circumstances that may be outside the learner's control. Do not deduct points for disability, poverty, illness or a protected characteristic.", learner.id);
	return { request };
}
function reviewDeduction(db, input) {
	if (input.actor.role !== "admin") return { error: "Only an administrator can approve or reject a deduction" };
	const request = db.deductions.find((d) => d.id === input.requestId);
	if (!request) return { error: "Request not found" };
	if (request.status !== "pending") return { error: "This request has already been decided" };
	if (request.requesterId === input.actor.id) return { error: "You cannot approve or reject your own request. Ask another administrator." };
	if (!input.approve) {
		db.deductions = db.deductions.map((d) => d.id === request.id ? {
			...d,
			status: "rejected",
			reviewerId: input.actor.id,
			reviewNote: input.note,
			reviewedAt: nowIso()
		} : d);
		pushAudit(db, input.actor, "deduction.reject", request.id, input.note || "Rejected");
		notify(db, "teacher", "Deduction not approved", input.note || "An administrator rejected the request.", request.learnerId);
		return {};
	}
	const result = postTransaction(db, {
		idempotencyKey: `ded-post:${request.id}`,
		learnerId: request.learnerId,
		type: request.category === "attendance_correction" ? "reversal" : "deduction",
		direction: "debit",
		amount: request.amount,
		reason: request.reason,
		actor: {
			id: request.requesterId,
			role: "teacher",
			name: "Requester"
		},
		approverId: input.actor.id,
		linkType: request.linkType || "deduction",
		linkId: request.linkId || request.id,
		contra: "sys:deductions"
	});
	if (result.error) return { error: result.error };
	db.deductions = db.deductions.map((d) => d.id === request.id ? {
		...d,
		status: "approved",
		reviewerId: input.actor.id,
		reviewNote: input.note,
		reviewedAt: nowIso(),
		txId: result.tx?.id
	} : d);
	pushAudit(db, input.actor, "deduction.approve", request.id, `${request.amount} points posted once`);
	notify(db, "teacher", "Deduction approved", `${request.amount} points were removed after review.`, request.learnerId);
	return {};
}
function awardBonus(db, input) {
	if (input.actor.role !== "admin") return { error: "Only an administrator can award a discretionary bonus" };
	const blocked = rewardsReady(db);
	if (blocked) return { error: blocked };
	const amount = Math.trunc(input.amount);
	if (amount <= 0 || amount > 200) return { error: "Bonus awards must be between 1 and 200 points" };
	if (input.reason.trim().length < 8) return { error: "Record why this bonus is educationally justified" };
	const result = postTransaction(db, {
		idempotencyKey: uid("bonus"),
		learnerId: input.learnerId,
		type: "bonus",
		direction: "credit",
		amount,
		reason: input.reason.trim(),
		actor: input.actor,
		approverId: input.actor.id,
		contra: "sys:rewards-bonus"
	});
	if (result.error) return { error: result.error };
	pushAudit(db, input.actor, "bonus.award", input.learnerId, `${amount}: ${input.reason.trim()}`);
	awardBadges(db);
	return {};
}
/** Principal for simple interest: credits other than interest, minus debits, ignoring later interest. */
function principalOf(db, learnerId, asOf) {
	let total = 0;
	for (const tx of transactionsFor(db, learnerId)) {
		if (tx.at.slice(0, 10) > asOf) continue;
		if (tx.type === "interest") continue;
		total += tx.direction === "credit" ? tx.amount : -tx.amount;
	}
	return Math.max(0, total);
}
function runInterest(db, input) {
	if (input.actor.role !== "admin" && input.actor.role !== "system") return {
		error: "Only an administrator can post interest",
		posted: 0,
		skipped: 0
	};
	const policy = db.org.policy.interest;
	if (!policy.approved) return {
		error: "Approve the interest policy before posting interest",
		posted: 0,
		skipped: 0
	};
	if (policy.suspended) return {
		error: "Interest is suspended",
		posted: 0,
		skipped: 0
	};
	if (!/^\d{4}-\d{2}$/.test(input.throughMonth)) return {
		error: "Choose a month",
		posted: 0,
		skipped: 0
	};
	const earliest = db.transactions.reduce((min, tx) => {
		const key = monthKey(tx.at);
		if (!min || key < min) return key;
		return min;
	}, null);
	if (!earliest) return {
		posted: 0,
		skipped: 0
	};
	let posted = 0;
	let skipped = 0;
	for (const key of monthsBetween(earliest, input.throughMonth)) {
		const asOf = monthEnd(key);
		if (asOf > isoDate(/* @__PURE__ */ new Date())) break;
		for (const learner of db.learners) {
			if (learner.status !== "active") continue;
			const base = policy.mode === "simple" ? principalOf(db, learner.id, asOf) : balanceOf(db, learner.id, asOf);
			if (base < policy.minBalance) {
				skipped += 1;
				continue;
			}
			const raw = base * policy.ratePercent / 100;
			const award = Math.min(policy.maxAward, roundPoints(raw, policy.rounding));
			if (award <= 0) {
				skipped += 1;
				continue;
			}
			const result = postTransaction(db, {
				idempotencyKey: `int:${learner.id}:${key}`,
				at: `${asOf}T21:00:00.000Z`,
				learnerId: learner.id,
				type: "interest",
				direction: "credit",
				amount: award,
				reason: `Savings interest for ${key} at ${policy.ratePercent}% (${policy.mode}, ${policy.rounding} rounding) on ${base} points`,
				actor: input.actor,
				linkType: "interest",
				linkId: key,
				contra: "sys:interest"
			});
			if (result.error) return {
				error: result.error,
				posted,
				skipped
			};
			if (result.duplicate) skipped += 1;
			else posted += 1;
		}
	}
	if (posted) {
		pushAudit(db, input.actor, "interest.run", input.throughMonth, `${posted} interest credits posted`);
		awardBadges(db);
	}
	return {
		posted,
		skipped
	};
}
function buildStatement(db, learnerId, from, to) {
	const learner = db.learners.find((l) => l.id === learnerId);
	if (!learner) return { error: "Learner not found" };
	const txs = transactionsFor(db, learnerId).slice().sort((a, b) => a.at < b.at ? -1 : a.at > b.at ? 1 : a.id < b.id ? -1 : 1);
	let running = 0;
	const lines = [];
	for (const tx of txs) {
		const day = tx.at.slice(0, 10);
		const credit = tx.direction === "credit" ? tx.amount : 0;
		const debit = tx.direction === "debit" ? tx.amount : 0;
		running += credit - debit;
		if (day < from || day > to) continue;
		lines.push({
			date: day,
			description: tx.reason,
			credit,
			debit,
			balance: running,
			txId: tx.id
		});
	}
	const opening = balanceOf(db, learnerId, addDaysIso(from, -1));
	lines.length && lines[lines.length - 1].balance;
	let cursor = opening;
	const restated = lines.map((line) => {
		cursor += line.credit - line.debit;
		return {
			...line,
			balance: cursor
		};
	});
	const stampId = fingerprint({
		transactions: txs.filter((t) => t.at.slice(0, 10) >= from && t.at.slice(0, 10) <= to),
		learners: [learner],
		deductions: []
	});
	return {
		reference: `STM-${learner.id}-${from.replace(/-/g, "")}-${stampId}`,
		learnerName: fullName(learner),
		learnerId: learner.id,
		accountNumber: learner.accountNumber,
		from,
		to,
		generatedAt: nowIso(),
		opening,
		closing: restated.length ? restated[restated.length - 1].balance : opening,
		lines: restated,
		disclaimer: DISCLAIMER
	};
}
function addDaysIso(iso, days) {
	const [y, m, d] = iso.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	date.setDate(date.getDate() + days);
	return isoDate(date);
}
function ledgerBalanced(db) {
	const problems = [];
	const keys = /* @__PURE__ */ new Set();
	let debit = 0;
	let credit = 0;
	for (const tx of db.transactions) {
		if (keys.has(tx.idempotencyKey)) problems.push(`Duplicate idempotency key ${tx.idempotencyKey}`);
		keys.add(tx.idempotencyKey);
		const problem = ledgerInvariant(tx);
		if (problem) problems.push(`${tx.id}: ${problem}`);
		debit += tx.amount;
		credit += tx.amount;
		if (balanceOf(db, tx.learnerId, "9999-12-31") < 0) problems.push(`${tx.learnerId} balance is negative`);
	}
	if (debit !== credit) problems.push("Debits and credits diverge");
	const uniqueLearners = new Set(db.transactions.map((t) => t.learnerId));
	for (const id of uniqueLearners) if (balanceOf(db, id) < 0) problems.push(`Negative balance on ${id}`);
	return {
		ok: problems.length === 0,
		problems: [...new Set(problems)]
	};
}
var BADGES = [
	{
		code: "attendance-champion",
		name: "Attendance Champion",
		test: (db, id) => {
			const recent = db.attendance.filter((a) => a.learnerId === id).slice(-10);
			if (recent.length >= 8 && recent.every((a) => a.status === "present")) return "Eight or more recent sessions, all present";
			return null;
		}
	},
	{
		code: "reading-explorer",
		name: "Reading Explorer",
		test: (db, id) => {
			const stage = currentStage(db, id);
			return stage >= 5 ? `Reached Reading Eggs stage ${stage}` : null;
		}
	},
	{
		code: "reading-star",
		name: "Reading Star",
		test: (db, id) => currentStage(db, id) >= 15 ? "Reached stage 15" : null
	},
	{
		code: "assessment-achiever",
		name: "Assessment Achiever",
		test: (db, id) => {
			return db.results.filter((r) => r.learnerId === id).length >= 3 ? "Completed at least three assessments" : null;
		}
	},
	{
		code: "growth-champion",
		name: "Growth Champion",
		test: (db, id) => {
			return db.transactions.filter((t) => t.learnerId === id && t.type === "improvement").length >= 1 ? "Earned an assessment improvement award" : null;
		}
	},
	{
		code: "savings-star",
		name: "Savings Star",
		test: (db, id) => {
			return db.transactions.filter((t) => t.learnerId === id && t.type === "interest").length >= 1 ? "Received savings interest" : null;
		}
	},
	{
		code: "consistency",
		name: "Consistency Champion",
		test: (db, id) => db.transactions.some((t) => t.learnerId === id && t.type === "perfect_week") ? "Completed a perfect attendance week" : null
	}
];
function currentStage(db, learnerId) {
	const rows = db.reading.filter((r) => r.learnerId === learnerId);
	if (!rows.length) return 0;
	return Math.max(...rows.map((r) => r.stage));
}
function awardBadges(db) {
	for (const learner of db.learners) {
		if (learner.status !== "active") continue;
		for (const badge of BADGES) {
			if (db.badges.some((b) => b.learnerId === learner.id && b.code === badge.code)) continue;
			const reason = badge.test(db, learner.id);
			if (!reason) continue;
			db.badges = [{
				id: uid("bdg"),
				learnerId: learner.id,
				code: badge.code,
				name: badge.name,
				reason,
				awardedAt: nowIso()
			}, ...db.badges];
			notify(db, "learner", badge.name, reason, learner.id);
		}
	}
}
function readingJourney(stage) {
	return [
		{
			id: "seed",
			label: "Seed",
			min: 0
		},
		{
			id: "sprout",
			label: "Sprout",
			min: 1
		},
		{
			id: "explorer",
			label: "Explorer",
			min: 5
		},
		{
			id: "reader",
			label: "Reader",
			min: 12
		},
		{
			id: "champion",
			label: "Reading Champion",
			min: 20
		}
	].map((s) => ({
		id: s.id,
		label: s.label,
		reached: stage >= s.min
	}));
}
function savingsJourney(balance) {
	return [
		{
			id: "starter",
			label: "Starter",
			min: 0
		},
		{
			id: "saver",
			label: "Saver",
			min: 100
		},
		{
			id: "builder",
			label: "Builder",
			min: 400
		},
		{
			id: "planner",
			label: "Planner",
			min: 1e3
		},
		{
			id: "champion",
			label: "Savings Champion",
			min: 2e3
		}
	].map((s) => ({
		id: s.id,
		label: s.label,
		reached: balance >= s.min
	}));
}
function mean(values) {
	if (!values.length) return null;
	return values.reduce((s, n) => s + n, 0) / values.length;
}
function median(values) {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2) return sorted[mid];
	return (sorted[mid - 1] + sorted[mid]) / 2;
}
function stdev(values) {
	if (values.length < 2) return null;
	const avg = mean(values);
	const variance = values.reduce((s, n) => s + (n - avg) ** 2, 0) / (values.length - 1);
	return Math.sqrt(variance);
}
function attendanceRate(records) {
	let attended = 0;
	let eligible = 0;
	let excused = 0;
	for (const record of records) {
		if (record.status === "excused" || record.status === "closed" || record.status === "unscheduled") {
			if (record.status === "excused") excused += 1;
			continue;
		}
		eligible += 1;
		if (record.status === "present" || record.status === "late") attended += 1;
	}
	return {
		rate: eligible ? attended / eligible : null,
		attended,
		eligible,
		excused
	};
}
function learnerAgeBand(grade) {
	if (grade <= 3) return "foundation";
	if (grade <= 7) return "intermediate";
	return "senior";
}
function registerLearner(db, draft, actor, options) {
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
		guardianPhone: draft.guardianPhone
	});
	if (duplicates.length && !options?.ignoreDuplicate) return {
		error: "Possible existing learner found. Please review before continuing.",
		duplicates
	};
	const year = db.org.academicYear;
	const n = nextSequence(db.learners.map((l) => l.id), year, "PEN");
	const seq = n.split("-")[2];
	const baseKey = options?.importKey || `${normaliseName(firstName)}|${normaliseName(surname)}|${parsed.iso}`;
	if (!options?.ignoreDuplicate && db.learners.some((l) => l.importKey === baseKey && l.status !== "merged")) return {
		error: "This learner was already imported. Existing records were not overwritten.",
		duplicates
	};
	const learner = {
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
		registeredAt: (/* @__PURE__ */ new Date()).toISOString(),
		academicYear: year,
		portalPin: String(1e3 + Math.floor(Math.random() * 9e3)),
		importKey: options?.ignoreDuplicate ? `${baseKey}#${uid("k")}` : baseKey
	};
	db.learners = [...db.learners, learner];
	pushAudit(db, actor, "learner.register", learner.id, `${learner.firstName} ${learner.surname}, Grade ${learner.grade}`);
	return {
		learner,
		duplicates
	};
}
var TEACHER_FIELDS = /* @__PURE__ */ new Set([
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
	"photoConsent"
]);
function updateLearner(db, learnerId, patch, actor) {
	const learner = db.learners.find((l) => l.id === learnerId);
	if (!learner || learner.status === "merged") return { error: "Learner not found" };
	if (actor.role === "teacher") {
		for (const key of Object.keys(patch)) if (!TEACHER_FIELDS.has(key)) return { error: "Teachers cannot change that field" };
	} else if (actor.role !== "admin") return { error: "You cannot edit learner records" };
	if (patch.status && actor.role !== "admin") return { error: "Only an administrator can deactivate a learner" };
	const next = { ...learner };
	if (patch.firstName !== void 0 && actor.role === "admin") next.firstName = patch.firstName.trim();
	if (patch.middleName !== void 0 && actor.role === "admin") next.middleName = patch.middleName.trim();
	if (patch.surname !== void 0 && actor.role === "admin") next.surname = patch.surname.trim();
	if (patch.preferredName !== void 0) next.preferredName = patch.preferredName.trim();
	if (patch.dob !== void 0 && actor.role === "admin") {
		const parsed = parseSaDate(patch.dob);
		if (!parsed.iso) return { error: parsed.warning || "Date of birth is not valid" };
		next.dob = parsed.iso;
	}
	if (patch.gender !== void 0 && actor.role === "admin") next.gender = patch.gender;
	if (patch.grade !== void 0) next.grade = patch.grade;
	if (patch.schoolId !== void 0) next.schoolId = patch.schoolId;
	if (patch.classId !== void 0) next.classId = patch.classId;
	if (patch.homeLanguage !== void 0) next.homeLanguage = patch.homeLanguage;
	if (patch.area !== void 0) next.area = patch.area;
	if (patch.address !== void 0) next.address = patch.address;
	if (patch.guardianName !== void 0) next.guardianName = patch.guardianName;
	if (patch.guardianPhone !== void 0) next.guardianPhone = patch.guardianPhone;
	if (patch.emergencyName !== void 0) next.emergencyName = patch.emergencyName;
	if (patch.emergencyPhone !== void 0) next.emergencyPhone = patch.emergencyPhone;
	if (patch.readingEggsId !== void 0) next.readingEggsId = patch.readingEggsId;
	if (patch.photoConsent !== void 0) next.photoConsent = patch.photoConsent;
	if (patch.supportNote !== void 0 && actor.role === "admin") next.supportNote = patch.supportNote;
	if (patch.status && actor.role === "admin") next.status = patch.status;
	const school = db.schools.find((s) => s.id === next.schoolId);
	const cls = db.classes.find((c) => c.id === next.classId);
	if (!school || !cls) return { error: "School or class is missing" };
	next.locationId = school.locationId;
	db.learners = db.learners.map((l) => l.id === learner.id ? next : l);
	pushAudit(db, actor, patch.status === "inactive" ? "learner.deactivate" : "learner.edit", learner.id, "Record updated. History kept.");
	return {};
}
function mergeLearners(db, keepId, dropId, actor) {
	if (actor.role !== "admin") return { error: "Only an administrator can merge records" };
	if (keepId === dropId) return { error: "Choose two different records" };
	const keep = db.learners.find((l) => l.id === keepId);
	const drop = db.learners.find((l) => l.id === dropId);
	if (!keep || !drop || drop.status === "merged" || keep.status === "merged") return { error: "Learner not found" };
	db.attendance = db.attendance.map((a) => a.learnerId === drop.id ? {
		...a,
		learnerId: keep.id
	} : a);
	db.results = db.results.map((r) => r.learnerId === drop.id ? {
		...r,
		learnerId: keep.id
	} : r);
	db.reading = db.reading.map((r) => r.learnerId === drop.id ? {
		...r,
		learnerId: keep.id
	} : r);
	db.goals = db.goals.map((g) => g.learnerId === drop.id ? {
		...g,
		learnerId: keep.id
	} : g);
	db.badges = db.badges.map((b) => b.learnerId === drop.id ? {
		...b,
		learnerId: keep.id
	} : b);
	db.interventions = db.interventions.map((n) => n.learnerId === drop.id ? {
		...n,
		learnerId: keep.id
	} : n);
	db.parents = db.parents.map((p) => ({
		...p,
		learnerIds: [...new Set(p.learnerIds.map((id) => id === drop.id ? keep.id : id))]
	}));
	db.learners = db.learners.map((l) => l.id === drop.id ? {
		...l,
		status: "merged",
		mergedInto: keep.id
	} : l);
	pushAudit(db, actor, "learner.merge", keep.id, `${drop.id} merged into ${keep.id}. Original ledger lines stay on ${drop.id} and are included in the surviving balance. Nothing was deleted.`);
	return {};
}
function addStaff(db, input, actor) {
	if (actor.role !== "admin") return { error: "Only an administrator can add staff" };
	if (!/^\d{4}$/.test(input.pin)) return { error: "Use a 4-digit device PIN" };
	const activeAdmins = db.staff.filter((s) => s.role === "admin" && s.active).length;
	if (input.role === "admin" && activeAdmins >= 3) return { error: "Pendula allows at most three active administrators" };
	const staff = {
		id: uid("staff"),
		name: input.name.trim(),
		role: input.role,
		email: input.email.trim(),
		pin: input.pin,
		active: true,
		classIds: input.classIds
	};
	if (!staff.name) return { error: "Name is required" };
	db.staff = [...db.staff, staff];
	pushAudit(db, actor, "staff.create", staff.id, `${staff.role}: ${staff.name}`);
	notify(db, "admin", "Staff record added", `${staff.name} is now a ${staff.role}.`);
	return { staff };
}
function setStaffActive(db, staffId, active, actor) {
	if (actor.role !== "admin") return { error: "Only an administrator can change staff access" };
	const staff = db.staff.find((s) => s.id === staffId);
	if (!staff) return { error: "Staff member not found" };
	if (staff.role === "admin" && !active) {
		if (db.staff.filter((s) => s.role === "admin" && s.active && s.id !== staff.id).length < 1) return { error: "The programme must keep one active administrator" };
	}
	if (staff.role === "admin" && active) {
		if (db.staff.filter((s) => s.role === "admin" && s.active).length >= 3) return { error: "Pendula allows at most three active administrators" };
	}
	db.staff = db.staff.map((s) => s.id === staffId ? {
		...s,
		active
	} : s);
	pushAudit(db, actor, active ? "staff.restore" : "staff.deactivate", staffId, staff.name);
	return {};
}
var ALIASES = {
	firstName: [
		"first name",
		"firstname",
		"name",
		"learner name"
	],
	surname: [
		"surname",
		"last name",
		"lastname"
	],
	middleName: ["middle name", "middle"],
	preferredName: ["preferred name", "preferred"],
	dob: [
		"date of birth",
		"dob",
		"birth date",
		"birthday"
	],
	gender: ["gender", "sex"],
	grade: ["grade", "gr"],
	school: ["school", "campus"],
	className: ["class", "class name"],
	homeLanguage: ["home language", "language"],
	area: [
		"area",
		"residential area",
		"suburb"
	],
	guardianName: [
		"guardian",
		"guardian name",
		"parent",
		"parent name"
	],
	guardianPhone: [
		"guardian phone",
		"phone",
		"parent phone",
		"cell"
	],
	readingEggsId: [
		"reading eggs",
		"reading eggs id",
		"re id"
	]
};
function headerKey(headers, field) {
	const want = ALIASES[field];
	return headers.find((h) => want.includes(h.trim().toLowerCase()));
}
function parseImportCsv(text, db) {
	const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim().length);
	if (lines.length < 2) return {
		error: "The file needs a header row and at least one learner",
		rows: []
	};
	const headers = splitCsv(lines[0]);
	const rows = [];
	for (let i = 1; i < lines.length && i <= 500; i++) {
		const cells = splitCsv(lines[i]);
		const raw = {};
		headers.forEach((h, idx) => {
			raw[h] = (cells[idx] || "").trim();
		});
		const errors = [];
		const warnings = [];
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
		const parsed = parseSaDate(headerKey(headers, "dob") ? raw[headerKey(headers, "dob")] : "");
		if (!parsed.iso) errors.push(parsed.warning || "Date of birth is missing");
		if (parsed.warning && parsed.iso) warnings.push(parsed.warning);
		const gradeRaw = headerKey(headers, "grade") ? raw[headerKey(headers, "grade")] : "";
		const grade = Number(gradeRaw.replace(/[^0-9]/g, ""));
		if (grade < 1 || grade > 12) errors.push("Grade must be 1–12");
		const schoolName = headerKey(headers, "school") ? raw[headerKey(headers, "school")] : "";
		const school = db.schools.find((s) => s.name.toLowerCase() === schoolName.toLowerCase());
		if (!school) errors.push(schoolName ? `School “${schoolName}” is not configured` : "School is missing");
		const className = headerKey(headers, "className") ? raw[headerKey(headers, "className")] : `Grade ${grade}`;
		const cls = db.classes.find((c) => c.schoolId === school?.id && (c.name.toLowerCase() === className.toLowerCase() || c.grade === grade));
		if (!cls) errors.push("No matching class");
		const guardianPhone = headerKey(headers, "guardianPhone") ? raw[headerKey(headers, "guardianPhone")] : "";
		if (!guardianPhone) warnings.push("Guardian phone is empty");
		const draft = errors.length || !parsed.iso || !school || !cls ? void 0 : {
			firstName,
			surname,
			middleName: headerKey(headers, "middleName") ? raw[headerKey(headers, "middleName")] : "",
			preferredName: headerKey(headers, "preferredName") ? raw[headerKey(headers, "preferredName")] : "",
			dob: parsed.iso,
			gender: headerKey(headers, "gender") ? raw[headerKey(headers, "gender")] : "",
			grade,
			schoolId: school.id,
			classId: cls.id,
			homeLanguage: headerKey(headers, "homeLanguage") ? raw[headerKey(headers, "homeLanguage")] : "",
			area: headerKey(headers, "area") ? raw[headerKey(headers, "area")] : "",
			guardianName: headerKey(headers, "guardianName") ? raw[headerKey(headers, "guardianName")] : "",
			guardianPhone,
			readingEggsId: headerKey(headers, "readingEggsId") ? raw[headerKey(headers, "readingEggsId")] : ""
		};
		const duplicates = draft ? findDuplicates(db.learners, {
			firstName: draft.firstName,
			surname: draft.surname,
			dob: draft.dob,
			schoolId: draft.schoolId,
			grade: draft.grade,
			guardianPhone: draft.guardianPhone
		}) : [];
		if (duplicates.length) warnings.push("Possible existing learner found");
		rows.push({
			line: i + 1,
			raw,
			draft,
			errors,
			warnings,
			duplicates
		});
	}
	if (lines.length - 1 > 500) return {
		error: "Import at most 500 learners at a time",
		rows
	};
	return { rows };
}
function splitCsv(line) {
	const out = [];
	let cur = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (quoted && ch === "\"" && line[i + 1] === "\"") {
			cur += "\"";
			i++;
		} else if (ch === "\"") quoted = !quoted;
		else if (ch === "," && !quoted) {
			out.push(cur);
			cur = "";
		} else cur += ch;
	}
	out.push(cur);
	return out.map((c) => c.trim());
}
function commitImport(db, rows, actor) {
	let added = 0;
	let skipped = 0;
	const errors = [];
	for (const row of rows) {
		if (!row.draft || row.errors.length || row.duplicates.some((d) => d.level === "confirmed")) {
			skipped += 1;
			if (row.errors[0]) errors.push(`Line ${row.line}: ${row.errors[0]}`);
			else if (row.duplicates.length) errors.push(`Line ${row.line}: possible duplicate skipped`);
			continue;
		}
		const result = registerLearner(db, row.draft, actor, {
			ignoreDuplicate: row.duplicates.length === 0,
			importKey: `${row.draft.firstName}|${row.draft.surname}|${row.draft.dob}`.toLowerCase()
		});
		if (result.learner) added += 1;
		else {
			skipped += 1;
			if (result.error) errors.push(`Line ${row.line}: ${result.error}`);
		}
	}
	pushAudit(db, actor, "import.commit", "learners", `${added} added, ${skipped} skipped`);
	return {
		added,
		skipped,
		errors
	};
}
var IMPORT_TEMPLATE = `first name,surname,date of birth,grade,school,class,home language,area,guardian name,guardian phone,gender,reading eggs id
Amahle,Dlamini,2016-04-12,3,Bronberg Campus,Grade 3,isiZulu,Sunnyside,Nokuthula Dlamini,0820000000,Female,
`;
function emptyDb(partial) {
	return {
		version: 1,
		org: {
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
			retentionNote: "Keep learner records only for as long as the programme needs them for education, safeguarding and the rewards ledger. Review retention with a South African privacy practitioner before a real rollout."
		},
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
		integrity: ""
	};
}
function learner(input) {
	return {
		id: `PEN-2026-${String(input.n).padStart(5, "0")}`,
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
		importKey: `${input.first}|${input.surname}|${input.dob}`.toLowerCase()
	};
}
function createDemo(founder, asOf) {
	const db = emptyDb({
		name: "Pendula Learning Programme",
		contactEmail: founder.email,
		setupComplete: true
	});
	db.org.policy = {
		...structuredClone(DEFAULT_POLICY),
		approved: true,
		effectiveFrom: "2026-01-14"
	};
	db.org.policy.interest.approved = true;
	db.org.rewardsLive = true;
	db.org.demoCohort = true;
	db.locations = [
		{
			id: "loc-sunny",
			name: "Sunnyside",
			area: "Pretoria"
		},
		{
			id: "loc-arc",
			name: "Arcadia",
			area: "Pretoria"
		},
		{
			id: "loc-mam",
			name: "Mamelodi",
			area: "Tshwane"
		}
	];
	const bronberg = {
		id: "sch-bron",
		name: "Bronberg Campus",
		locationId: "loc-sunny",
		phase: "primary"
	};
	const arcadia = {
		id: "sch-arc",
		name: "Arcadia Campus",
		locationId: "loc-arc",
		phase: "high"
	};
	const mamelodi = {
		id: "sch-mam",
		name: "Mamelodi Learning Site",
		locationId: "loc-mam",
		phase: "combined"
	};
	db.schools = [
		bronberg,
		arcadia,
		mamelodi
	];
	const founderStaff = {
		id: "staff-founder",
		name: founder.name,
		role: "admin",
		email: founder.email,
		pin: founder.pin,
		active: true,
		classIds: []
	};
	db.staff = [founderStaff, ...[
		{
			id: "t-jabu",
			name: "Jabu Mahlangu",
			role: "teacher",
			email: "jabu@pendula.example",
			pin: "1111",
			active: true,
			classIds: []
		},
		{
			id: "t-elmarie",
			name: "Elmarie Venter",
			role: "teacher",
			email: "elmarie@pendula.example",
			pin: "2222",
			active: true,
			classIds: []
		},
		{
			id: "t-thabo",
			name: "Thabo Selemela",
			role: "teacher",
			email: "thabo@pendula.example",
			pin: "3333",
			active: true,
			classIds: []
		},
		{
			id: "t-fatima",
			name: "Fatima Essop",
			role: "teacher",
			email: "fatima@pendula.example",
			pin: "4444",
			active: true,
			classIds: []
		}
	]];
	function teacherFor(grade, schoolId) {
		if (schoolId === "sch-mam") return "t-thabo";
		if (grade <= 3) return "t-jabu";
		if (grade <= 7) return "t-elmarie";
		if (grade <= 10) return "t-thabo";
		return "t-fatima";
	}
	const classByGradeSchool = /* @__PURE__ */ new Map();
	function ensureClass(grade, school) {
		const key = `${school.id}-${grade}`;
		const found = classByGradeSchool.get(key);
		if (found) return found;
		const teacherId = teacherFor(grade, school.id);
		const cls = {
			id: `cls-${school.id}-g${grade}`,
			name: `Grade ${grade}`,
			grade,
			schoolId: school.id,
			teacherId
		};
		classByGradeSchool.set(key, cls);
		db.classes.push(cls);
		const teacher = db.staff.find((s) => s.id === teacherId);
		if (teacher && !teacher.classIds.includes(cls.id)) teacher.classIds.push(cls.id);
		return cls;
	}
	[
		{
			first: "Amahle",
			surname: "Dlamini",
			grade: 3,
			school: bronberg,
			language: "isiZulu",
			area: "Sunnyside",
			guardian: "Nokuthula Dlamini",
			phone: "0821110001",
			gender: "Female"
		},
		{
			first: "Karabo",
			surname: "Molefe",
			grade: 7,
			school: bronberg,
			language: "Setswana",
			area: "Sunnyside",
			guardian: "Tshepo Molefe",
			phone: "0821110002",
			gender: "Male"
		},
		{
			first: "Pieter",
			surname: "van Wyk",
			grade: 5,
			school: bronberg,
			language: "Afrikaans",
			area: "Arcadia",
			guardian: "Annelie van Wyk",
			phone: "0831110003",
			gender: "Male"
		},
		{
			first: "Lerato",
			surname: "Nkosi",
			grade: 1,
			school: bronberg,
			language: "Sesotho",
			area: "Sunnyside",
			guardian: "Dineo Nkosi",
			phone: "0821110004",
			gender: "Female"
		},
		{
			first: "Thandiwe",
			surname: "Mokoena",
			grade: 11,
			school: arcadia,
			language: "isiZulu",
			area: "Sunnyside",
			guardian: "Bongani Mokoena",
			phone: "0711110005",
			gender: "Female"
		},
		{
			first: "Yusuf",
			surname: "Abrahams",
			grade: 9,
			school: arcadia,
			language: "English",
			area: "Pretoria Central",
			guardian: "Fatima Abrahams",
			phone: "0841110006",
			gender: "Male"
		},
		{
			first: "Naledi",
			surname: "Khumalo",
			grade: 4,
			school: bronberg,
			language: "isiXhosa",
			area: "Sunnyside",
			guardian: "Lindiwe Khumalo",
			phone: "0821110007",
			gender: "Female"
		},
		{
			first: "Sipho",
			surname: "Ndlovu",
			grade: 12,
			school: arcadia,
			language: "isiZulu",
			area: "Mamelodi",
			guardian: "Zanele Ndlovu",
			phone: "0731110008",
			gender: "Male"
		},
		{
			first: "Mia",
			surname: "Botha",
			grade: 2,
			school: bronberg,
			language: "Afrikaans",
			area: "Sunnyside",
			guardian: "Hester Botha",
			phone: "0821110009",
			gender: "Female"
		},
		{
			first: "Kwame",
			surname: "Mensah",
			grade: 6,
			school: bronberg,
			language: "English",
			area: "Arcadia",
			guardian: "Abena Mensah",
			phone: "0821110010",
			gender: "Male"
		},
		{
			first: "Ayesha",
			surname: "Patel",
			grade: 8,
			school: arcadia,
			language: "English",
			area: "Laudium",
			guardian: "Rashid Patel",
			phone: "0821110011",
			gender: "Female"
		},
		{
			first: "Johan",
			surname: "Pretorius",
			grade: 10,
			school: arcadia,
			language: "Afrikaans",
			area: "Arcadia",
			guardian: "Mari Pretorius",
			phone: "0831110012",
			gender: "Male"
		},
		{
			first: "Boitumelo",
			surname: "Sithole",
			grade: 5,
			school: mamelodi,
			language: "Sepedi",
			area: "Mamelodi",
			guardian: "Kgaogelo Sithole",
			phone: "0721110013",
			gender: "Female"
		},
		{
			first: "Ethan",
			surname: "Jacobs",
			grade: 6,
			school: bronberg,
			language: "English",
			area: "Sunnyside",
			guardian: "Megan Jacobs",
			phone: "0821110014",
			gender: "Male"
		},
		{
			first: "Zinhle",
			surname: "Cele",
			grade: 8,
			school: mamelodi,
			language: "isiZulu",
			area: "Mamelodi",
			guardian: "Sibongile Cele",
			phone: "0711110015",
			gender: "Female"
		},
		{
			first: "Noah",
			surname: "Williams",
			grade: 9,
			school: arcadia,
			language: "English",
			area: "Arcadia",
			guardian: "Claire Williams",
			phone: "0821110016",
			gender: "Male"
		},
		{
			first: "Refilwe",
			surname: "Mahlangu",
			grade: 2,
			school: bronberg,
			language: "Sepedi",
			area: "Sunnyside",
			guardian: "Jabu Mahlangu",
			phone: "0821110017",
			gender: "Female"
		},
		{
			first: "Daniel",
			surname: "Cohen",
			grade: 11,
			school: arcadia,
			language: "English",
			area: "Pretoria",
			guardian: "Ruth Cohen",
			phone: "0821110018",
			gender: "Male"
		},
		{
			first: "Onthatile",
			surname: "Modise",
			grade: 7,
			school: bronberg,
			language: "Setswana",
			area: "Sunnyside",
			guardian: "Kagiso Modise",
			phone: "0821110019",
			gender: "Female"
		},
		{
			first: "Hannah",
			surname: "du Plessis",
			grade: 4,
			school: bronberg,
			language: "Afrikaans",
			area: "Arcadia",
			guardian: "Elmarie Venter",
			phone: "0831110020",
			gender: "Female"
		},
		{
			first: "Lwazi",
			surname: "Gumede",
			grade: 10,
			school: arcadia,
			language: "isiZulu",
			area: "Mamelodi",
			guardian: "Nomusa Gumede",
			phone: "0731110021",
			gender: "Male"
		},
		{
			first: "Amogelang",
			surname: "Tau",
			grade: 3,
			school: bronberg,
			language: "Setswana",
			area: "Sunnyside",
			guardian: "Palesa Tau",
			phone: "0821110022",
			gender: "Male"
		},
		{
			first: "Sarah",
			surname: "Naidoo",
			grade: 12,
			school: arcadia,
			language: "English",
			area: "Laudium",
			guardian: "Priya Naidoo",
			phone: "0841110023",
			gender: "Female"
		},
		{
			first: "Tumi",
			surname: "Mokwena",
			grade: 1,
			school: bronberg,
			language: "Sepedi",
			area: "Sunnyside",
			guardian: "Mpho Mokwena",
			phone: "0821110024",
			gender: "Female"
		}
	].forEach((row, index) => {
		const n = index + 1;
		const cls = ensureClass(row.grade, row.school);
		const birthYear = 2026 - (row.grade + 6);
		let dob = row.dob || `${birthYear}-${String(index % 12 + 1).padStart(2, "0")}-15`;
		if (row.first === "Lerato") dob = asOf.slice(0, 4).replace(/^\d{4}/, String(birthYear)) && `${birthYear}-${asOf.slice(5)}`;
		if (row.first === "Lerato") dob = `${birthYear}-${asOf.slice(5, 10)}`;
		if (row.first === "Mia") dob = `${birthYear}-${addDays(asOf, 3).slice(5, 10)}`;
		if (row.first === "Sipho") dob = `${birthYear}-${addDays(asOf, 18).slice(5, 10)}`;
		db.learners.push(learner({
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
			gender: row.gender
		}));
	});
	db.learners.find((l) => l.firstName === "Amahle").readingEggsId = "RE-10442";
	db.learners.find((l) => l.firstName === "Yusuf").readingEggsId = "RE-22810";
	db.learners.find((l) => l.firstName === "Karabo").supportNote = "Confidential: family asked that transport changes be discussed only with the guardian. Not for parent circulars or learner view.";
	const byName = (first) => db.learners.find((l) => l.firstName === first);
	const days = recentSchoolDays(12, asOf, db.org.terms, db.org.holidays);
	const older = recentSchoolDays(22, asOf, db.org.terms, db.org.holidays).slice(0, 10);
	function teacherActor(classId) {
		const cls = db.classes.find((c) => c.id === classId);
		const staff = db.staff.find((s) => s.id === cls.teacherId);
		return {
			id: staff.id,
			role: "teacher",
			name: staff.name
		};
	}
	function markDays(learnerId, dates, statusFor) {
		const learnerRow = db.learners.find((l) => l.id === learnerId);
		const groups = /* @__PURE__ */ new Map();
		dates.forEach((date, index) => {
			const list = groups.get(date) || [];
			list.push({
				learnerId,
				status: statusFor(index, date)
			});
			groups.set(date, list);
		});
		for (const [date, marks] of groups) saveAttendance(db, {
			classId: learnerRow.classId,
			date,
			marks,
			actor: teacherActor(learnerRow.classId)
		});
	}
	for (const date of days) {
		const byClass = /* @__PURE__ */ new Map();
		for (const row of db.learners) {
			const list = byClass.get(row.classId) || [];
			list.push({
				learnerId: row.id,
				status: "present"
			});
			byClass.set(row.classId, list);
		}
		for (const [classId, marks] of byClass) saveAttendance(db, {
			classId,
			date,
			marks,
			actor: teacherActor(classId)
		});
	}
	const karabo = byName("Karabo");
	markDays(karabo.id, older, () => "present");
	markDays(karabo.id, days.slice(-6), (i) => i < 4 ? "absent" : "present");
	markDays(byName("Naledi").id, days, (i) => i % 3 === 0 ? "absent" : "present");
	markDays(byName("Johan").id, days, (i) => i % 4 === 0 ? "late" : "present");
	markDays(byName("Tumi").id, days.slice(-2), () => "excused");
	const admin = {
		id: founderStaff.id,
		role: "admin",
		name: founder.name
	};
	const thandiwe = byName("Thandiwe");
	postTransaction(db, {
		idempotencyKey: "demo-open-thandiwe",
		at: "2026-10-02T10:00:00.000Z",
		learnerId: thandiwe.id,
		type: "bonus",
		direction: "credit",
		amount: 1e3,
		reason: "Demonstration opening balance of 1,000 points so savings interest can be taught. Not cash.",
		actor: admin,
		approverId: admin.id,
		contra: "sys:rewards-bonus"
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
		outcomes: "Number, operations and fraction sense"
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
		outcomes: "Number, operations and fraction sense"
	});
	const grade5 = db.learners.filter((l) => l.grade === 5);
	saveResults(db, "asm-maths-1", grade5.map((l) => ({
		learnerId: l.id,
		score: l.id === pieter.id ? 45 : 62,
		comment: ""
	})), elmarie);
	saveResults(db, "asm-maths-2", grade5.map((l) => ({
		learnerId: l.id,
		score: l.id === pieter.id ? 60 : 58,
		comment: l.id === pieter.id ? "Clear gain on fractions." : ""
	})), elmarie);
	const amahle = byName("Amahle");
	const jabu = teacherActor(amahle.classId);
	recordReading(db, {
		learnerId: amahle.id,
		stage: 6,
		date: days[6] || asOf,
		evidence: "Teacher checked the Reading Eggs map with the learner.",
		actor: jabu
	});
	recordReading(db, {
		learnerId: byName("Mia").id,
		stage: 3,
		date: days[7] || asOf,
		evidence: "Stage 3 lessons signed off in class.",
		actor: jabu
	});
	const yusuf = byName("Yusuf");
	const stalledDate = addDays(asOf, -45);
	recordReading(db, {
		learnerId: yusuf.id,
		stage: 8,
		date: stalledDate,
		evidence: "Last verified map position. No new stage since.",
		actor: teacherActor(yusuf.classId)
	});
	db.goals.push({
		id: uid("goal"),
		learnerId: thandiwe.id,
		name: "My goal: 2,000 Pendula points",
		target: 2e3,
		createdAt: "2026-10-03T08:00:00.000Z"
	});
	db.goals.push({
		id: uid("goal"),
		learnerId: amahle.id,
		name: "Reading Champion journey",
		target: 500,
		createdAt: "2026-11-02T08:00:00.000Z"
	});
	const fatima = db.staff.find((s) => s.id === "t-fatima");
	requestDeduction(db, {
		learnerId: byName("Daniel").id,
		amount: 20,
		reason: "Assessment participation points were marked for a paper Daniel did not write. Please reverse them.",
		category: "correction",
		actor: {
			id: fatima.id,
			role: "teacher",
			name: fatima.name
		}
	});
	db.interventions.push({
		id: uid("int"),
		learnerId: karabo.id,
		at: `${days[days.length - 1] || asOf}T09:00:00.000Z`,
		authorId: "t-elmarie",
		note: "Attendance has dropped. Ask the guardian about transport before suggesting any consequence. No points were removed.",
		confidential: false
	});
	db.parents.push({
		id: "par-nokuthula",
		name: "Nokuthula Dlamini",
		phone: "0821110001",
		pin: "5081",
		learnerIds: [amahle.id]
	}, {
		id: "par-tshepo",
		name: "Tshepo Molefe",
		phone: "0821110002",
		pin: "5082",
		learnerIds: [karabo.id]
	}, {
		id: "par-bongani",
		name: "Bongani Mokoena",
		phone: "0711110005",
		pin: "5083",
		learnerIds: [thandiwe.id]
	});
	db.notifications = db.notifications.slice(0, 30);
	runInterest(db, {
		throughMonth: "2026-10",
		actor: admin
	});
	return stamp(db);
}
function actorFrom(db, session) {
	if (!session) return null;
	if (session.role === "admin" || session.role === "teacher") {
		const staff = db.staff.find((s) => s.id === session.staffId && s.active);
		if (!staff || staff.role !== session.role) return null;
		return {
			id: staff.id,
			role: staff.role,
			name: staff.name
		};
	}
	if (session.role === "learner") {
		const learner = db.learners.find((l) => l.id === session.learnerId);
		if (!learner) return null;
		return {
			id: learner.id,
			role: "learner",
			name: learner.preferredName
		};
	}
	if (session.role === "parent") {
		const parent = db.parents.find((p) => p.id === session.parentId);
		if (!parent) return null;
		return {
			id: parent.id,
			role: "parent",
			name: parent.name
		};
	}
	return null;
}
function commit(db) {
	awardBadges(db);
	return stamp(db);
}
var usePendula = create()(persist((set, get) => ({
	db: emptyDb(),
	session: null,
	theme: "light",
	nav: "today",
	focusLearnerId: null,
	aiUses: 0,
	aiDay: "",
	completeSetup: (input) => {
		if (!input.adminName.trim()) return "Enter the founding administrator's name";
		if (!/^\d{4}$/.test(input.pin)) return "Choose a 4-digit PIN";
		const founder = {
			name: input.adminName.trim(),
			pin: input.pin,
			email: input.email.trim()
		};
		const db = input.demo ? createDemo(founder, isoDate(/* @__PURE__ */ new Date())) : emptyDb({
			name: input.orgName.trim() || "Pendula Programme",
			contactEmail: founder.email,
			setupComplete: true
		});
		if (!input.demo) {
			db.org.setupComplete = true;
			db.org.rewardsLive = input.approveRewards;
			db.org.policy.approved = input.approveRewards;
			db.org.policy.interest.approved = input.approveInterest;
			db.org.demoCohort = false;
			db.locations = [{
				id: uid("loc"),
				name: input.location.trim() || "Main site",
				area: ""
			}];
			db.staff = [{
				id: "staff-founder",
				name: founder.name,
				role: "admin",
				email: founder.email,
				pin: founder.pin,
				active: true,
				classIds: []
			}];
		} else {
			db.org.name = input.orgName.trim() || db.org.name;
			const founderStaff = db.staff.find((s) => s.id === "staff-founder");
			if (founderStaff) {
				founderStaff.name = founder.name;
				founderStaff.pin = founder.pin;
				founderStaff.email = founder.email;
			}
			if (!input.approveInterest) db.org.policy.interest.approved = false;
		}
		set({
			db: commit(db),
			session: {
				role: "admin",
				staffId: "staff-founder"
			},
			nav: "today"
		});
		return null;
	},
	lock: () => set({
		session: null,
		nav: "today"
	}),
	signInStaff: (staffId, pin) => {
		const staff = get().db.staff.find((s) => s.id === staffId && s.active);
		if (!staff || staff.pin !== pin) return "That PIN does not match";
		set({
			session: {
				role: staff.role,
				staffId: staff.id
			},
			nav: "today"
		});
		return null;
	},
	signInLearner: (learnerId, pin) => {
		const learner = get().db.learners.find((l) => l.id === learnerId && l.status === "active");
		if (!learner || learner.portalPin !== pin) return "That portal code does not match";
		set({
			session: {
				role: "learner",
				learnerId
			},
			nav: "today",
			focusLearnerId: learnerId
		});
		return null;
	},
	signInParent: (parentId, pin) => {
		const parent = get().db.parents.find((p) => p.id === parentId);
		if (!parent || parent.pin !== pin) return "That PIN does not match";
		set({
			session: {
				role: "parent",
				parentId
			},
			nav: "today",
			focusLearnerId: parent.learnerIds[0] || null
		});
		return null;
	},
	previewRole: (session) => {
		const current = get().session;
		if (!current || current.role !== "admin" && !current.returnStaffId) return;
		const returnStaffId = current.returnStaffId || current.staffId;
		set({
			session: {
				...session,
				returnStaffId
			},
			nav: "today",
			focusLearnerId: session.learnerId || session.parentId || null
		});
	},
	returnToAdmin: () => {
		const current = get().session;
		if (!current?.returnStaffId) return;
		set({
			session: {
				role: "admin",
				staffId: current.returnStaffId
			},
			nav: "today"
		});
	},
	setTheme: (theme) => {
		set({ theme });
		document.documentElement.classList.toggle("dark", theme === "dark");
		try {
			localStorage.setItem("pendula-theme", theme);
		} catch {}
	},
	setNav: (nav) => set({ nav }),
	openLearner: (id) => set({
		focusLearnerId: id,
		nav: "learner"
	}),
	register: (draft, ignoreDuplicate) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return { error: "Sign in as staff first" };
		const result = registerLearner(db, draft, actor, { ignoreDuplicate });
		if (!result.learner) return {
			error: result.error,
			duplicates: result.duplicates
		};
		set({
			db: commit(db),
			focusLearnerId: result.learner.id,
			nav: "learner"
		});
		return {};
	},
	editLearner: (id, patch) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return "Sign in first";
		const result = updateLearner(db, id, patch, actor);
		if (result.error) return result.error;
		set({ db: commit(db) });
		return null;
	},
	merge: (keepId, dropId) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return "Sign in first";
		const result = mergeLearners(db, keepId, dropId, actor);
		if (result.error) return result.error;
		set({
			db: commit(db),
			focusLearnerId: keepId
		});
		return null;
	},
	applyImport: (rows) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return { error: "Sign in as staff first" };
		const result = commitImport(db, rows, actor);
		set({ db: commit(db) });
		return result;
	},
	saveStaff: (input) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return "Sign in first";
		const result = addStaff(db, input, actor);
		if (result.error) return result.error;
		set({ db: commit(db) });
		return null;
	},
	toggleStaff: (staffId, active) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return "Sign in first";
		const result = setStaffActive(db, staffId, active, actor);
		if (result.error) return result.error;
		set({ db: commit(db) });
		return null;
	},
	savePolicy: (policy, live) => {
		const session = get().session;
		if (session?.role !== "admin") return "Only an administrator can change policy";
		const db = structuredClone(get().db);
		const actor = actorFrom(db, session);
		if (!actor) return "Sign in first";
		db.org.policy = policy;
		db.org.rewardsLive = live && policy.approved;
		db.audit = [{
			id: uid("aud"),
			at: (/* @__PURE__ */ new Date()).toISOString(),
			actorId: actor.id,
			role: "admin",
			action: "policy.update",
			target: policy.version,
			detail: `Rewards ${db.org.rewardsLive ? "live" : "paused"}. Interest ${policy.interest.approved ? "approved" : "not approved"}. Historical transactions were not recalculated.`
		}, ...db.audit];
		set({ db: commit(db) });
		return null;
	},
	takeAttendance: (classId, date, marks) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return { error: "Sign in first" };
		const result = saveAttendance(db, {
			classId,
			date,
			marks,
			actor
		});
		if (result.error) return { error: result.error };
		set({ db: commit(db) });
		return {
			posted: result.posted,
			corrections: result.corrections
		};
	},
	addAssessment: (input) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor || actor.role !== "admin" && actor.role !== "teacher") return { error: "Only staff can create assessments" };
		const term = db.org.terms.find((t) => input.date >= t.start && input.date <= t.end);
		const result = createAssessment(db, {
			name: input.name,
			subject: input.subject,
			grade: input.grade,
			date: input.date,
			type: input.type,
			maxScore: input.maxScore,
			termId: term?.id || "",
			academicYear: db.org.academicYear,
			teacherId: actor.id,
			seriesId: input.seriesId.trim(),
			outcomes: input.outcomes.trim()
		}, actor);
		if (result.error || !result.assessment) return { error: result.error || "Could not create the assessment" };
		set({ db: commit(db) });
		return { id: result.assessment.id };
	},
	markAssessment: (assessmentId, rows) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return { error: "Sign in first" };
		const result = saveResults(db, assessmentId, rows, actor);
		if (result.error) return { error: result.error };
		set({ db: commit(db) });
		return {
			participation: result.participation,
			improvement: result.improvement
		};
	},
	verifyReading: (learnerId, stage, date, evidence) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return { error: "Sign in first" };
		const result = recordReading(db, {
			learnerId,
			stage,
			date,
			evidence,
			actor
		});
		if (result.error) return { error: result.error };
		set({ db: commit(db) });
		return { awarded: result.awarded };
	},
	askDeduction: (learnerId, amount, reason, category) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return "Sign in first";
		const result = requestDeduction(db, {
			learnerId,
			amount,
			reason,
			category,
			actor
		});
		if (result.error) return result.error;
		set({
			db: commit(db),
			nav: "approvals"
		});
		return null;
	},
	decideDeduction: (requestId, approve, note) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return "Sign in first";
		const result = reviewDeduction(db, {
			requestId,
			approve,
			note,
			actor
		});
		if (result.error) return result.error;
		set({ db: commit(db) });
		return null;
	},
	giveBonus: (learnerId, amount, reason) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return "Sign in first";
		const result = awardBonus(db, {
			learnerId,
			amount,
			reason,
			actor
		});
		if (result.error) return result.error;
		set({ db: commit(db) });
		return null;
	},
	postInterest: (throughMonth) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor) return { error: "Sign in first" };
		const result = runInterest(db, {
			throughMonth,
			actor
		});
		if (result.error) return { error: result.error };
		set({ db: commit(db) });
		return { posted: result.posted };
	},
	addGoal: (learnerId, name, target) => {
		const session = get().session;
		if (!session) return "Sign in first";
		if (session.role === "learner" && session.learnerId !== learnerId) return "You can only set your own goal";
		if (session.role === "parent") return "Parents cannot change goals";
		if (session.role === "teacher") return "Goals belong to the learner";
		const amount = Math.trunc(target);
		if (!name.trim() || amount <= 0) return "Give the goal a name and a points target";
		const db = structuredClone(get().db);
		db.goals = [{
			id: uid("goal"),
			learnerId,
			name: name.trim(),
			target: amount,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}, ...db.goals];
		set({ db: commit(db) });
		return null;
	},
	addNote: (learnerId, note, confidential) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor || actor.role !== "admin" && actor.role !== "teacher") return "Only staff can add notes";
		if (confidential && actor.role !== "admin") return "Confidential safeguarding notes are limited to administrators";
		if (note.trim().length < 8) return "Write a useful note";
		db.interventions = [{
			id: uid("int"),
			learnerId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			authorId: actor.id,
			note: note.trim(),
			confidential
		}, ...db.interventions];
		db.audit = [{
			id: uid("aud"),
			at: (/* @__PURE__ */ new Date()).toISOString(),
			actorId: actor.id,
			role: actor.role,
			action: "intervention.add",
			target: learnerId,
			detail: confidential ? "Confidential note added" : "Intervention note added"
		}, ...db.audit];
		set({ db: commit(db) });
		return null;
	},
	sendMessage: (learnerId, kind, body) => {
		const db = structuredClone(get().db);
		const actor = actorFrom(db, get().session);
		if (!actor || actor.role !== "admin" && actor.role !== "teacher") return "Only staff can send an in-app note";
		if (body.trim().length < 4) return "Write the message";
		db.messages = [{
			id: uid("msg"),
			at: (/* @__PURE__ */ new Date()).toISOString(),
			actorId: actor.id,
			learnerId,
			channel: "in-app",
			kind,
			body: body.trim()
		}, ...db.messages];
		set({ db: commit(db) });
		return null;
	},
	markNoticesRead: () => {
		const session = get().session;
		if (!session) return;
		const db = structuredClone(get().db);
		db.notifications = db.notifications.map((n) => n.audience === session.role ? {
			...n,
			read: true
		} : n);
		set({ db: commit(db) });
	},
	addSchool: (name, locationName, phase) => {
		if (get().session?.role !== "admin") return "Only an administrator can add a school";
		if (!name.trim()) return "Name the school";
		const db = structuredClone(get().db);
		let location = db.locations.find((l) => l.name.toLowerCase() === locationName.trim().toLowerCase());
		if (!location) {
			location = {
				id: uid("loc"),
				name: locationName.trim() || "Main site",
				area: ""
			};
			db.locations.push(location);
		}
		db.schools.push({
			id: uid("sch"),
			name: name.trim(),
			locationId: location.id,
			phase
		});
		set({ db: commit(db) });
		return null;
	},
	addClass: (name, grade, schoolId, teacherId) => {
		if (get().session?.role !== "admin") return "Only an administrator can add a class";
		if (grade < 1 || grade > 12) return "Grade must be 1–12";
		const db = structuredClone(get().db);
		const cls = {
			id: uid("cls"),
			name: name.trim() || `Grade ${grade}`,
			grade,
			schoolId,
			teacherId
		};
		db.classes.push(cls);
		db.staff = db.staff.map((s) => s.id === teacherId ? {
			...s,
			classIds: [...s.classIds, cls.id]
		} : s);
		set({ db: commit(db) });
		return null;
	},
	replaceBackup: (raw) => {
		if (get().session?.role !== "admin") return "Only an administrator can restore a backup";
		try {
			const parsed = JSON.parse(raw);
			if (parsed.version !== 1 || !Array.isArray(parsed.learners) || !Array.isArray(parsed.transactions)) return "That file is not a Pendula backup";
			set({
				db: stamp(parsed),
				nav: "today"
			});
			return null;
		} catch {
			return "Could not read that file";
		}
	},
	clearDemo: () => {
		const current = get().db;
		const founder = current.staff.find((s) => s.id === "staff-founder");
		if (!founder || get().session?.role !== "admin") return;
		const db = emptyDb({
			name: current.org.name,
			contactEmail: current.org.contactEmail,
			setupComplete: true
		});
		db.org.setupComplete = true;
		db.org.policy = structuredClone(current.org.policy);
		db.org.rewardsLive = current.org.rewardsLive;
		db.org.terms = current.org.terms;
		db.org.holidays = current.org.holidays;
		db.staff = [founder];
		db.locations = current.locations.slice(0, 1);
		set({
			db: commit(db),
			session: {
				role: "admin",
				staffId: founder.id
			},
			nav: "settings"
		});
	},
	noteAiUse: () => {
		const day = isoDate(/* @__PURE__ */ new Date());
		const used = get().aiDay === day ? get().aiUses : 0;
		if (used >= 12) return false;
		set({
			aiDay: day,
			aiUses: used + 1
		});
		return true;
	}
}), {
	name: "pendula-db",
	version: 1,
	partialize: (state) => ({
		db: state.db,
		session: state.session,
		theme: state.theme,
		nav: state.nav,
		focusLearnerId: state.focusLearnerId,
		aiUses: state.aiUses,
		aiDay: state.aiDay
	})
}));
function toCsv(rows) {
	return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
function csvCell(value) {
	const text = String(value ?? "");
	if (/[",\n]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
	return text;
}
function downloadText(filename, content, type = "text/csv;charset=utf-8") {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function statementCsv(statement) {
	return toCsv([
		["PENDULA EDUCATIONAL REWARDS BANK"],
		[statement.disclaimer],
		["Learner", statement.learnerName],
		["Learner ID", statement.learnerId],
		["Account", statement.accountNumber],
		["Period", `${statement.from} to ${statement.to}`],
		["Statement reference", statement.reference],
		["Generated", statement.generatedAt],
		["Opening balance", statement.opening],
		[],
		[
			"Date",
			"Transaction",
			"Credit",
			"Debit",
			"Balance"
		],
		...statement.lines.map((line) => [
			line.date,
			line.description,
			line.credit || "",
			line.debit || "",
			line.balance
		]),
		[],
		["Closing balance", statement.closing]
	]);
}
/** Minimal single-font PDF, enough for a reconciled statement. */
function statementPdf(statement) {
	const lines = [
		"PENDULA EDUCATIONAL REWARDS BANK",
		statement.disclaimer,
		"",
		`Learner: ${statement.learnerName}`,
		`Learner ID: ${statement.learnerId}`,
		`Account: ${statement.accountNumber}`,
		`Period: ${statement.from} to ${statement.to}`,
		`Reference: ${statement.reference}`,
		`Generated: ${statement.generatedAt.slice(0, 16).replace("T", " ")}`,
		"",
		`Opening balance: ${statement.opening}`,
		"",
		"Date        Transaction                                      Credit   Debit   Balance"
	];
	for (const line of statement.lines.slice(0, 28)) {
		const desc = line.description.slice(0, 44).padEnd(44, " ");
		const credit = (line.credit ? String(line.credit) : "-").padStart(6, " ");
		const debit = (line.debit ? String(line.debit) : "-").padStart(6, " ");
		const balance = String(line.balance).padStart(8, " ");
		lines.push(`${line.date}  ${desc}${credit}  ${debit}  ${balance}`);
	}
	if (statement.lines.length > 28) lines.push(`... ${statement.lines.length - 28} more lines are in the CSV.`);
	lines.push("");
	lines.push(`Closing balance: ${statement.closing}`);
	lines.push("Virtual educational points only. Not a real bank account or monetary deposit.");
	return simplePdf(lines);
}
function downloadPdf(filename, bytes) {
	const blob = new Blob([bytes.buffer], { type: "application/pdf" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function simplePdf(lines) {
	const escaped = lines.map((line) => line.replace(/[^\x20-\x7E]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"));
	let commands = "BT /F1 10 Tf 48 790 Td 14 TL\n";
	escaped.forEach((line, index) => {
		if (index === 0) commands += `/F1 14 Tf (${line}) Tj T* /F1 9 Tf\n`;
		else commands += `(${line}) Tj T*\n`;
	});
	commands += "ET";
	const objects = [
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
		`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`,
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
	];
	let pdf = "%PDF-1.4\n";
	const offsets = [0];
	objects.forEach((obj, i) => {
		offsets.push(pdf.length);
		pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
	});
	const xref = pdf.length;
	pdf += `xref\n0 ${objects.length + 1}\n`;
	pdf += "0000000000 65535 f \n";
	for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
	pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
	return new TextEncoder().encode(pdf);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var askPendula = createServerFn({ method: "POST" }).validator((input) => {
	const question = input?.question?.trim() ?? "";
	const facts = input?.facts?.trim() ?? "";
	if (question.length < 3 || question.length > 800) throw new Error("Ask a shorter question");
	if (facts.length > 12e3) throw new Error("The facts packet is too large");
	return {
		question,
		facts
	};
}).handler(createSsrRpc("82c1adcaaad3a0d8d834f053bcd9d98a222c8afb4ec6d1ef8aa77b671e8f896e"));
function visibleLearners(db, role, staffId, parentId, learnerId) {
	const active = db.learners.filter((l) => l.status !== "merged");
	if (role === "admin") return active;
	if (role === "teacher") {
		const staff = db.staff.find((s) => s.id === staffId);
		const classIds = new Set(staff?.classIds || []);
		return active.filter((l) => classIds.has(l.classId));
	}
	if (role === "learner") return active.filter((l) => l.id === learnerId);
	if (role === "parent") {
		const parent = db.parents.find((p) => p.id === parentId);
		const ids = new Set(parent?.learnerIds || []);
		return active.filter((l) => ids.has(l.id));
	}
	return [];
}
function consecutiveMisses(db, learnerId, asOf) {
	const days = recentSchoolDays(12, asOf, db.org.terms, db.org.holidays).reverse();
	let count = 0;
	for (const day of days) {
		const mark = db.attendance.find((a) => a.learnerId === learnerId && a.date === day);
		if (!mark) break;
		if (mark.status === "absent") count += 1;
		else break;
	}
	return count;
}
function rateWindow(db, learnerId, dates) {
	return attendanceRate(dates.map((date) => db.attendance.find((a) => a.learnerId === learnerId && a.date === date)).filter((a) => Boolean(a)));
}
function alertsFor(db, learners, asOf) {
	const alerts = [];
	const recent = recentSchoolDays(10, asOf, db.org.terms, db.org.holidays);
	const previous = recentSchoolDays(20, asOf, db.org.terms, db.org.holidays).slice(0, 10);
	for (const learner of learners) {
		if (learner.status !== "active") continue;
		const misses = consecutiveMisses(db, learner.id, asOf);
		if (misses >= 3) alerts.push({
			id: `miss-${learner.id}`,
			tone: "attention",
			title: `${learnerLabel(learner)} has missed ${misses} eligible sessions in a row`,
			body: "Check whether transport, health, family or the timetable is in the way before recommending any intervention. This is not a judgement about effort.",
			learnerId: learner.id
		});
		const now = rateWindow(db, learner.id, recent);
		const before = rateWindow(db, learner.id, previous);
		if (now.rate !== null && before.rate !== null && before.eligible >= 6 && now.eligible >= 6 && before.rate - now.rate >= .25) alerts.push({
			id: `drop-${learner.id}`,
			tone: "attention",
			title: `${learnerLabel(learner)}'s attendance has fallen`,
			body: `Attended ${now.attended} of the last ${now.eligible} eligible sessions (${Math.round(now.rate * 100)}%), compared with ${before.attended} of the previous ${before.eligible} (${Math.round(before.rate * 100)}%). Excused days are left out of both counts.`,
			learnerId: learner.id
		});
		else if (now.rate !== null && now.eligible >= 8 && now.rate < .7) alerts.push({
			id: `low-${learner.id}`,
			tone: "attention",
			title: `${learnerLabel(learner)} attended under 70% recently`,
			body: `${now.attended} of ${now.eligible} eligible sessions from ${recent[0]} to ${recent[recent.length - 1]}. Small samples are uncertain — read the dates, not a label.`,
			learnerId: learner.id
		});
		const stage = currentStage(db, learner.id);
		const last = db.reading.filter((r) => r.learnerId === learner.id).sort((a, b) => a.date < b.date ? 1 : -1)[0];
		if (last && stage > 0 && last.date <= addDays(asOf, -30)) alerts.push({
			id: `read-${learner.id}`,
			tone: "attention",
			title: `${learnerLabel(learner)}'s reading stage has not moved`,
			body: `Still on stage ${stage}, last verified ${last.date}. A stalled map is a prompt to look at reading time and the right level, not a diagnosis.`,
			learnerId: learner.id
		});
		const series = /* @__PURE__ */ new Map();
		for (const result of db.results.filter((r) => r.learnerId === learner.id)) {
			const assessment = db.assessments.find((a) => a.id === result.assessmentId);
			if (!assessment?.seriesId) continue;
			const list = series.get(assessment.seriesId) || [];
			list.push({
				date: assessment.date,
				pct: percentage(result.score, assessment.maxScore)
			});
			series.set(assessment.seriesId, list);
		}
		for (const points of series.values()) {
			const ordered = points.sort((a, b) => a.date < b.date ? -1 : 1);
			if (ordered.length < 2) continue;
			const delta = ordered[ordered.length - 1].pct - ordered[ordered.length - 2].pct;
			if (delta <= -10) alerts.push({
				id: `dip-${learner.id}`,
				tone: "attention",
				title: `${learnerLabel(learner)}'s comparable result dropped`,
				body: `Down ${Math.abs(Math.round(delta))} percentage points on the same assessment series. Compare only like-for-like tasks.`,
				learnerId: learner.id
			});
			else if (delta >= 10) alerts.push({
				id: `up-${learner.id}`,
				tone: "good",
				title: `${learnerLabel(learner)} improved on a comparable assessment`,
				body: `Up ${Math.floor(delta)} percentage points. Improvement points use percentage points, not a relative percentage change, and they are capped by policy.`,
				learnerId: learner.id
			});
		}
	}
	const pending = db.deductions.filter((d) => d.status === "pending");
	if (pending.length) alerts.push({
		id: "deductions",
		tone: "info",
		title: `${pending.length} deduction${pending.length === 1 ? "" : "s"} waiting`,
		body: "A pending request does not change anyone's balance. Teachers cannot approve their own requests."
	});
	return alerts;
}
function birthdays(db, learners, asOf, withinDays) {
	const out = [];
	for (const learner of learners) {
		if (learner.status !== "active" || !learner.dob) continue;
		const monthDay = learner.dob.slice(5);
		let next = `${asOf.slice(0, 4)}-${monthDay}`;
		if (next < asOf) next = `${Number(asOf.slice(0, 4)) + 1}-${monthDay}`;
		let days = 0;
		let cursor = asOf;
		while (cursor < next && days <= withinDays) {
			cursor = addDays(cursor, 1);
			days += 1;
		}
		if (next === asOf) days = 0;
		if (days <= withinDays && (next === asOf || cursor === next)) out.push({
			learner,
			date: next,
			age: ageOn(learner.dob, next),
			days
		});
	}
	return out.sort((a, b) => a.days - b.days);
}
function programmeMetrics(db, learners, asOf) {
	const active = learners.filter((l) => l.status === "active");
	const weekDays = recentSchoolDays(10, asOf, db.org.terms, db.org.holidays).filter((d) => weekStart(d) === weekStart(asOf) || d >= addDays(asOf, -6));
	const thisWeek = recentSchoolDays(5, asOf, db.org.terms, db.org.holidays);
	const rate = attendanceRate(db.attendance.filter((a) => active.some((l) => l.id === a.learnerId) && thisWeek.includes(a.date)));
	let held = 0;
	let issued = 0;
	let interest = 0;
	for (const learner of active) {
		const parts = balanceParts(db, learner.id);
		held += parts.balance;
		issued += parts.earned;
		interest += parts.interest;
	}
	const byGrade = Array.from({ length: 12 }, (_, i) => ({
		grade: i + 1,
		learners: active.filter((l) => l.grade === i + 1).length
	}));
	const scores = db.results.filter((r) => active.some((l) => l.id === r.learnerId)).map((r) => {
		const assessment = db.assessments.find((a) => a.id === r.assessmentId);
		return assessment ? percentage(r.score, assessment.maxScore) : null;
	}).filter((n) => n !== null);
	return {
		registered: learners.filter((l) => l.status !== "merged").length,
		active: active.length,
		attendanceRate: rate.rate,
		attended: rate.attended,
		eligible: rate.eligible,
		held,
		issued,
		interest,
		pending: db.deductions.filter((d) => d.status === "pending").length,
		assessments: db.results.filter((r) => active.some((l) => l.id === r.learnerId)).length,
		meanScore: mean(scores),
		medianScore: median(scores),
		sdScore: stdev(scores),
		byGrade,
		readingMilestones: db.transactions.filter((t) => t.type === "reading" && active.some((l) => l.id === t.learnerId)).length,
		weekLabel: thisWeek.length ? `${thisWeek[0]} to ${thisWeek[thisWeek.length - 1]}` : "No school days yet",
		weekDays
	};
}
function weeklyAttendanceSeries(db, learners, asOf) {
	return recentSchoolDays(15, asOf, db.org.terms, db.org.holidays).map((date) => {
		const marks = db.attendance.filter((a) => a.date === date && learners.some((l) => l.id === a.learnerId));
		const rate = attendanceRate(marks);
		return {
			date: date.slice(5),
			full: date,
			rate: rate.rate === null ? 0 : Math.round(rate.rate * 100),
			marked: marks.length
		};
	});
}
function pointsHistogram(db, learners) {
	return [
		{
			label: "0–49",
			min: 0,
			max: 49
		},
		{
			label: "50–199",
			min: 50,
			max: 199
		},
		{
			label: "200–499",
			min: 200,
			max: 499
		},
		{
			label: "500–999",
			min: 500,
			max: 999
		},
		{
			label: "1,000+",
			min: 1e3,
			max: 1e9
		}
	].map((bin) => ({
		label: bin.label,
		learners: learners.filter((l) => {
			const balance = balanceOf(db, l.id);
			return balance >= bin.min && balance <= bin.max;
		}).length
	}));
}
function dataQuality(db) {
	const learners = db.learners.filter((l) => l.status !== "merged");
	return {
		missingPhone: learners.filter((l) => !l.guardianPhone).length,
		missingLanguage: learners.filter((l) => !l.homeLanguage).length,
		inactive: learners.filter((l) => l.status === "inactive").length,
		duplicateHints: learners.filter((l, i) => learners.some((other, j) => j > i && other.dob === l.dob && other.surname.toLowerCase() === l.surname.toLowerCase() && other.firstName.toLowerCase() === l.firstName.toLowerCase())).length,
		learners: learners.length
	};
}
function answerLocally(db, session, question, asOf) {
	const q = question.toLowerCase();
	const learners = visibleLearners(db, session.role, session.staffId, session.parentId, session.learnerId).filter((l) => l.status === "active");
	const scope = session.role === "admin" ? "the whole programme" : session.role === "teacher" ? "your classes" : "your linked record";
	if (/missed three|missed 3|three sessions/.test(q)) {
		const days = recentSchoolDays(12, asOf, db.org.terms, db.org.holidays);
		const hits = learners.filter((l) => {
			return days.slice(-3).every((date) => db.attendance.some((a) => a.learnerId === l.id && a.date === date && a.status === "absent"));
		});
		return {
			title: "Three missed sessions",
			usedAi: false,
			body: hits.length ? `${hits.map((l) => learnerLabel(l)).join(", ")} ${hits.length === 1 ? "was" : "were"} absent on each of the last three eligible school days in ${scope}. Dates: ${days.slice(-3).join(", ")}. This counts marked absences only, not excused days.` : `Nobody in ${scope} was marked absent on all of the last three eligible school days (${days.slice(-3).join(", ")}).`
		};
	}
	if (/mathematic|maths/.test(q) && /improv/.test(q)) {
		const rows = learners.map((l) => {
			const results = db.results.filter((r) => r.learnerId === l.id).map((r) => ({
				r,
				a: db.assessments.find((a) => a.id === r.assessmentId)
			})).filter((x) => x.a && /math/i.test(x.a.subject) && x.a.seriesId).sort((x, y) => x.a.date < y.a.date ? -1 : 1);
			if (results.length < 2) return null;
			const prev = percentage(results[results.length - 2].r.score, results[results.length - 2].a.maxScore);
			const curr = percentage(results[results.length - 1].r.score, results[results.length - 1].a.maxScore);
			return {
				name: learnerLabel(l),
				delta: Math.floor(curr - prev),
				from: Math.round(prev),
				to: Math.round(curr)
			};
		}).filter((x) => Boolean(x && x.delta > 0)).sort((a, b) => b.delta - a.delta);
		if (!rows.length) return {
			title: "Mathematics improvement",
			usedAi: false,
			body: `No comparable mathematics series in ${scope} shows a gain yet. Improvement is only calculated when two results share a series, subject and grade.`
		};
		const top = rows[0];
		return {
			title: "Mathematics improvement",
			usedAi: false,
			body: `Largest gain in ${scope}: ${top.name}, from ${top.from}% to ${top.to}% (${top.delta} percentage points). ${rows.length} learner${rows.length === 1 ? "" : "s"} improved on a comparable mathematics series. Percentage points are not the same as a relative percentage change.`
		};
	}
	if (/reading eggs|reading/.test(q) && /not progress|stall|no progress|haven't|have not/.test(q)) {
		const stalled = learners.filter((l) => {
			const events = db.reading.filter((r) => r.learnerId === l.id);
			if (!events.length) return true;
			return events.map((e) => e.date).sort().at(-1) <= recentSchoolDays(20, asOf, db.org.terms, db.org.holidays)[0];
		});
		return {
			title: "Reading progress",
			usedAi: false,
			body: stalled.length ? `${stalled.map((l) => `${learnerLabel(l)} (stage ${currentStage(db, l.id) || "none"})`).join("; ")}. A blank stage means no teacher-verified milestone yet. Stage numbers are not school grades.` : `Every learner in ${scope} has a verified reading move inside the recent window.`
		};
	}
	if (/attendance trend|attendance/.test(q)) {
		const days = recentSchoolDays(10, asOf, db.org.terms, db.org.holidays);
		const rate = attendanceRate(db.attendance.filter((a) => days.includes(a.date) && learners.some((l) => l.id === a.learnerId)));
		const metrics = programmeMetrics(db, learners, asOf);
		return {
			title: "Attendance",
			usedAi: false,
			body: `Over ${days[0] || "—"} to ${days.at(-1) || "—"}, attendance in ${scope} was ${rate.attended} of ${rate.eligible} eligible marks (${rate.rate === null ? "no marks" : `${Math.round(rate.rate * 100)}%`}). Excused absences (${rate.excused}) are excluded from the rate. The shorter recent school week on the dashboard is ${metrics.weekLabel}.`
		};
	}
	if (/points|awarded last month|how many points/.test(q)) {
		const prev = shiftMonth(asOf.slice(0, 7), -1);
		const inMonth = db.transactions.filter((t) => t.at.slice(0, 7) === prev && t.direction === "credit" && learners.some((l) => l.id === t.learnerId));
		const total = inMonth.reduce((s, t) => s + t.amount, 0);
		return {
			title: `Points credited in ${prev}`,
			usedAi: false,
			body: `${total} points were credited across ${inMonth.length} transactions in ${scope}. This is the ledger, not an estimate. Pending deductions are not included.`
		};
	}
	if (/biggest challenge|educational challenge/.test(q) && session.role === "admin") {
		const alerts = alertsFor(db, learners, asOf).filter((a) => a.tone === "attention");
		return {
			title: "What needs attention",
			usedAi: false,
			body: alerts.length ? alerts.slice(0, 4).map((a) => `${a.title}. ${a.body}`).join(" ") : "No attendance, reading or assessment alerts are open on the current rules."
		};
	}
	if (/class progress summary|progress summary/.test(q)) {
		const scores = db.results.filter((r) => learners.some((l) => l.id === r.learnerId)).map((r) => {
			const a = db.assessments.find((x) => x.id === r.assessmentId);
			return a ? percentage(r.score, a.maxScore) : null;
		}).filter((n) => n !== null);
		const avg = mean(scores);
		return {
			title: "Class progress summary",
			usedAi: false,
			body: `${learners.length} active learners in ${scope}. ${scores.length} assessment results on file${avg === null ? "" : `, mean ${avg.toFixed(1)}%`}. ${db.reading.filter((r) => learners.some((l) => l.id === r.learnerId)).length} verified reading updates. Ask for mathematics improvement, missed sessions or reading stalls for a tighter answer.`
		};
	}
	if (/literacy activity|grade 3/.test(q)) return {
		title: "A literacy idea for Grade 3",
		usedAi: false,
		body: "Ten-minute paired reading: each child reads a familiar page aloud, then retells one event in their home language and one sentence in English. Follow with three words they want to use tomorrow. This is a classroom suggestion, not an assessment of any child."
	};
	return null;
}
function shiftMonth(key, delta) {
	const [y, m] = key.split("-").map(Number);
	const d = new Date(y, m - 1 + delta, 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
/** Aggregates only. No surnames, phones, addresses or support notes. */
function factsPacket(db, session, asOf) {
	const learners = visibleLearners(db, session.role, session.staffId, session.parentId, session.learnerId).filter((l) => l.status === "active");
	const metrics = programmeMetrics(db, learners, asOf);
	const alerts = alertsFor(db, learners, asOf).slice(0, 6);
	return JSON.stringify({
		asOf,
		role: session.role,
		learners: metrics.active,
		attendance: {
			definition: "present+late over present+late+absent; excused excluded",
			recentEligible: metrics.eligible,
			attended: metrics.attended,
			percent: metrics.attendanceRate === null ? null : Math.round(metrics.attendanceRate * 100),
			window: metrics.weekLabel
		},
		pointsHeld: metrics.held,
		pointsIssued: metrics.issued,
		interest: metrics.interest,
		assessmentResults: metrics.assessments,
		meanScore: metrics.meanScore === null ? null : Number(metrics.meanScore.toFixed(1)),
		byGrade: metrics.byGrade.filter((g) => g.learners),
		alerts: alerts.map((a) => ({
			title: a.title.replace(/[A-Z][a-z]+ [A-Z][a-z]+/g, "a learner"),
			body: a.body
		})),
		note: "Do not invent numbers. If a figure is missing, say so. Points are virtual educational rewards, not rand."
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-on-brand ring-1 ring-on-brand/40", className),
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 24 24",
			className: "size-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12 3.5v8.2",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "15.6",
				r: "3.1",
				fill: "var(--gold)"
			})]
		})
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "display mt-1 text-3xl text-ink",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: hint
			}) : null
		]
	});
}
function Empty({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel px-5 py-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "display text-2xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-md text-muted",
				children: body
			}),
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: action
			}) : null
		]
	});
}
function Modal({ title, children, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-brand/50 p-3 sm:items-center",
		role: "presentation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			className: "panel max-h-[90vh] w-full max-w-xl overflow-y-auto p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display text-2xl",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-ghost",
					onClick: onClose,
					children: "Close"
				})]
			}), children]
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-sm font-medium",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block",
			children: label
		}), children]
	});
}
function Insights() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const noteAiUse = usePendula((s) => s.noteAiUse);
	const openLearner = usePendula((s) => s.openLearner);
	const asOf = isoDate(/* @__PURE__ */ new Date());
	const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.status === "active");
	const alerts = alertsFor(db, learners, asOf);
	const metrics = programmeMetrics(db, learners, asOf);
	const histogram = pointsHistogram(db, learners);
	const notices = db.notifications.filter((n) => n.audience === session.role).slice(0, 6);
	const [question, setQuestion] = (0, import_react.useState)("Which learners have missed three sessions?");
	const [answer, setAnswer] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const ask = async (useModel) => {
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
			const result = await askPendula({ data: {
				question,
				facts: factsPacket(db, session, asOf)
			} });
			if (!result.ok) setAnswer(result.error);
			else setAnswer(result.text);
		} catch {
			setAnswer(local?.body || "The assistant is unavailable. The figures on this page are still calculated from the ledger.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display text-4xl",
				children: "Insights"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Rules and arithmetic decide balances and alerts. The assistant may only explain the figures it is given. It cannot approve a deduction or invent a statistic."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-[1.1fr_0.9fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Points held"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								learners.length,
								" active learners in your view. Mean assessment score ",
								metrics.meanScore === null ? "—" : `${metrics.meanScore.toFixed(1)}%`,
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 h-52",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: histogram,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "label",
											stroke: "var(--muted)",
											fontSize: 12,
											tickLine: false,
											axisLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											stroke: "var(--muted)",
											fontSize: 12,
											allowDecimals: false,
											width: 28,
											tickLine: false,
											axisLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "learners",
											fill: "var(--gold)",
											radius: 6
										})
									]
								})
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Pendula Intelligence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field mt-3 min-h-24",
							value: question,
							onChange: (e) => setQuestion(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn",
								onClick: () => ask(false),
								children: "Answer from the ledger"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								disabled: busy,
								onClick: () => ask(true),
								children: busy ? "Asking…" : "Explain with the model"
							})]
						}),
						answer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm",
							children: answer
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "space-y-3",
				children: alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "panel block w-full px-4 py-3 text-left",
					onClick: () => alert.learnerId && openLearner(alert.learnerId),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: alert.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: alert.body
					})]
				}, alert.id))
			}),
			notices.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display text-2xl",
					children: "Notices"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2 text-sm",
					children: notices.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold",
							children: [n.title, "."]
						}),
						" ",
						n.body
					] }, n.id))
				})]
			}) : null
		]
	});
}
function Reports() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const asOf = isoDate(/* @__PURE__ */ new Date());
	const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.status !== "merged");
	const download = (name, rows) => downloadText(`${name}.csv`, toCsv(rows));
	const items = [
		{
			name: "Learner register",
			blurb: "Identity, grade, school and status.",
			run: () => download("learners", [[
				"Learner ID",
				"Account",
				"Name",
				"Surname",
				"DOB",
				"Grade",
				"School",
				"Status"
			], ...learners.map((l) => [
				l.id,
				l.accountNumber,
				l.firstName,
				l.surname,
				l.dob,
				l.grade,
				db.schools.find((s) => s.id === l.schoolId)?.name || "",
				l.status
			])])
		},
		{
			name: "Attendance",
			blurb: "Every mark you are allowed to see.",
			run: () => download("attendance", [[
				"Date",
				"Learner ID",
				"Status",
				"Class"
			], ...db.attendance.filter((a) => learners.some((l) => l.id === a.learnerId)).map((a) => [
				a.date,
				a.learnerId,
				a.status,
				a.classId
			])])
		},
		{
			name: "Assessment progress",
			blurb: "Scores and percentages.",
			run: () => download("assessments", [[
				"Date",
				"Learner ID",
				"Subject",
				"Assessment",
				"Score",
				"Max",
				"Percent"
			], ...db.results.filter((r) => learners.some((l) => l.id === r.learnerId)).map((r) => {
				const a = db.assessments.find((x) => x.id === r.assessmentId);
				return [
					a?.date || "",
					r.learnerId,
					a?.subject || "",
					a?.name || "",
					r.score,
					a?.maxScore || "",
					a ? Math.round(percentage(r.score, a.maxScore)) : ""
				];
			})])
		},
		{
			name: "Reading Eggs",
			blurb: "Teacher-verified stages.",
			run: () => download("reading", [[
				"Date",
				"Learner ID",
				"From",
				"To",
				"Evidence"
			], ...db.reading.filter((r) => learners.some((l) => l.id === r.learnerId)).map((r) => [
				r.date,
				r.learnerId,
				r.previousStage,
				r.stage,
				r.evidence
			])])
		},
		{
			name: "Points ledger",
			blurb: "Every credit and debit in scope.",
			run: () => download("ledger", [[
				"When",
				"Learner ID",
				"Type",
				"Direction",
				"Amount",
				"Reason",
				"Key"
			], ...db.transactions.filter((t) => learners.some((l) => l.id === t.learnerId)).map((t) => [
				t.at,
				t.learnerId,
				t.type,
				t.direction,
				t.amount,
				t.reason,
				t.idempotencyKey
			])])
		},
		{
			name: "Interest",
			blurb: "Interest credits only.",
			run: () => download("interest", [[
				"When",
				"Learner ID",
				"Amount",
				"Reason"
			], ...db.transactions.filter((t) => t.type === "interest" && learners.some((l) => l.id === t.learnerId)).map((t) => [
				t.at,
				t.learnerId,
				t.amount,
				t.reason
			])])
		},
		{
			name: "Programme snapshot",
			blurb: "Counts, attendance definition and points held.",
			run: () => {
				const m = programmeMetrics(db, learners, asOf);
				download("programme", [
					[
						"Metric",
						"Value",
						"Note"
					],
					[
						"Active learners",
						m.active,
						""
					],
					[
						"Attendance percent",
						m.attendanceRate === null ? "" : Math.round(m.attendanceRate * 100),
						"present+late over present+late+absent; excused excluded"
					],
					[
						"Eligible marks",
						m.eligible,
						m.weekLabel
					],
					[
						"Points held",
						m.held,
						"virtual points, not rand"
					],
					[
						"Interest posted",
						m.interest,
						""
					],
					[
						"Mean assessment %",
						m.meanScore === null ? "" : m.meanScore.toFixed(1),
						""
					]
				]);
			}
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
					["Integrity stamp", integrityOk(db) ? "matches" : "failed"]
				]);
			}
		}
	];
	if (session.role === "admin") items.push({
		name: "Audit trail",
		blurb: "Append-only actions. Staff cannot delete this from the app.",
		run: () => download("audit", [[
			"When",
			"Actor",
			"Role",
			"Action",
			"Target",
			"Detail"
		], ...db.audit.map((a) => [
			a.at,
			a.actorId,
			a.role,
			a.action,
			a.target,
			a.detail
		])])
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "display text-4xl",
			children: "Reports"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "CSV opens in Excel. Statements with the Pendula heading are on the Bank page as PDF and CSV. Teachers only receive rows in their classes."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: item.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: item.blurb
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn mt-3",
						onClick: item.run,
						children: "Download CSV"
					})
				]
			}, item.name))
		})]
	});
}
function SettingsView() {
	const db = usePendula((s) => s.db);
	const savePolicy = usePendula((s) => s.savePolicy);
	const postInterest = usePendula((s) => s.postInterest);
	const saveStaff = usePendula((s) => s.saveStaff);
	const toggleStaff = usePendula((s) => s.toggleStaff);
	const addSchool = usePendula((s) => s.addSchool);
	const addClass = usePendula((s) => s.addClass);
	const replaceBackup = usePendula((s) => s.replaceBackup);
	const clearDemo = usePendula((s) => s.clearDemo);
	const [policy, setPolicy] = (0, import_react.useState)(db.org.policy);
	const [pin, setPin] = (0, import_react.useState)("");
	const quality = dataQuality(db);
	const ledger = ledgerBalanced(db);
	const month = isoDate(/* @__PURE__ */ new Date()).slice(0, 7);
	const setPoints = (key, value) => {
		setPolicy({
			...policy,
			points: {
				...policy.points,
				[key]: value
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display text-4xl",
				children: "Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-muted",
				children: [
					"Policy changes apply to future rewards only. ",
					formatSaDate(policy.effectiveFrom),
					" is the current version ",
					policy.version,
					"."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel grid gap-3 p-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl sm:col-span-2",
						children: "Reward policy"
					}),
					[
						["attendancePresent", "Present"],
						["attendanceLate", "Late"],
						["assessmentComplete", "Assessment"],
						["improvementPerPoint", "Per improvement point"],
						["improvementCap", "Improvement cap"],
						["readingStage", "Reading stage"],
						["perfectWeek", "Perfect week"],
						["learningMilestone", "Other milestone"]
					].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							inputMode: "numeric",
							value: policy.points[key],
							onChange: (e) => setPoints(key, Number(e.target.value))
						})
					}, key)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Interest percent per month",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							inputMode: "decimal",
							value: policy.interest.ratePercent,
							onChange: (e) => setPolicy({
								...policy,
								interest: {
									...policy.interest,
									ratePercent: Number(e.target.value)
								}
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Rounding",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "field",
							value: policy.interest.rounding,
							onChange: (e) => setPolicy({
								...policy,
								interest: {
									...policy.interest,
									rounding: e.target.value
								}
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "nearest",
									children: "Nearest whole point"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "floor",
									children: "Round down"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "ceil",
									children: "Round up"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mr-2",
							checked: policy.approved,
							onChange: (e) => setPolicy({
								...policy,
								approved: e.target.checked
							})
						}), "Reward policy approved"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mr-2",
							checked: policy.interest.approved,
							onChange: (e) => setPolicy({
								...policy,
								interest: {
									...policy.interest,
									approved: e.target.checked
								}
							})
						}), "Interest policy approved"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mr-2",
							checked: policy.interest.suspended,
							onChange: (e) => setPolicy({
								...policy,
								interest: {
									...policy.interest,
									suspended: e.target.checked
								}
							})
						}), "Suspend future interest"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn w-fit",
						onClick: () => {
							const error = savePolicy(policy, policy.approved);
							if (error) toast.error(error);
							else toast.success("Policy saved. Old transactions were left as they were.");
						},
						children: "Save policy"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel flex flex-wrap items-end gap-2 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Post interest through month",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "interest-month",
							className: "field",
							defaultValue: month
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn",
						onClick: () => {
							const value = document.getElementById("interest-month").value;
							const result = postInterest(value);
							if (result.error) toast.error(result.error);
							else toast.success(`${result.posted || 0} interest credits posted. Running it again will not double-pay.`);
						},
						children: "Run interest"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "1,000 points at 1% posts 10 points. 1,010 the next month is 10.1, which rounds to 10 on “nearest”. A month only posts after it has ended. This runs when an administrator presses the button, because a browser cannot be the clock."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel grid gap-3 p-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl sm:col-span-2",
						children: "Schools and classes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							const d = new FormData(e.currentTarget);
							const error = addSchool(String(d.get("name")), String(d.get("area")), "combined");
							if (error) toast.error(error);
							else e.currentTarget.reset();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								className: "field",
								placeholder: "School name",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "area",
								className: "field",
								placeholder: "Site or suburb"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								type: "submit",
								children: "Add school"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							const d = new FormData(e.currentTarget);
							const error = addClass(String(d.get("name")), Number(d.get("grade")), String(d.get("school")), String(d.get("teacher")));
							if (error) toast.error(error);
							else e.currentTarget.reset();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								className: "field",
								placeholder: "Class name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "grade",
								className: "field",
								inputMode: "numeric",
								placeholder: "Grade",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								name: "school",
								className: "field",
								children: db.schools.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.name
								}, s.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								name: "teacher",
								className: "field",
								children: db.staff.filter((s) => s.active).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.name
								}, s.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								type: "submit",
								children: "Add class"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "text-sm sm:col-span-2",
						children: db.classes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							c.name,
							" · Grade ",
							c.grade,
							" · ",
							db.schools.find((s) => s.id === c.schoolId)?.name,
							" · ",
							db.staff.find((s) => s.id === c.teacherId)?.name
						] }, c.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Staff"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "At most three active administrators. PINs stay on this device. They are a shared-tablet control, not multi-factor authentication."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-sm",
						children: db.staff.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								s.name,
								" · ",
								s.role,
								" · ",
								s.active ? "active" : "inactive",
								db.org.demoCohort && s.id !== "staff-founder" ? ` · PIN ${s.pin}` : ""
							] }), s.id !== "staff-founder" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: () => {
									const error = toggleStaff(s.id, !s.active);
									if (error) toast.error(error);
								},
								children: s.active ? "Deactivate" : "Restore"
							}) : null]
						}, s.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 grid gap-2 sm:grid-cols-4",
						onSubmit: (e) => {
							e.preventDefault();
							const d = new FormData(e.currentTarget);
							const error = saveStaff({
								name: String(d.get("name")),
								role: String(d.get("role")),
								email: String(d.get("email") || ""),
								pin,
								classIds: []
							});
							if (error) toast.error(error);
							else {
								toast.success("Staff added");
								e.currentTarget.reset();
								setPin("");
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								className: "field",
								placeholder: "Name",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "role",
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "teacher",
									children: "Teacher"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "admin",
									children: "Administrator"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								inputMode: "numeric",
								maxLength: 4,
								placeholder: "PIN",
								value: pin,
								onChange: (e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn",
								type: "submit",
								children: "Add"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Data quality"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2",
						children: [
							"Missing phones ",
							quality.missingPhone,
							". Missing language ",
							quality.missingLanguage,
							". Inactive ",
							quality.inactive,
							". Exact duplicate name and birth date ",
							quality.duplicateHints,
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Ledger ",
						ledger.ok ? "balances" : `problem: ${ledger.problems[0]}`,
						". Integrity stamp ",
						integrityOk(db) ? "matches" : "does not match",
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2",
						children: [
							"Calendar in use: ",
							db.org.terms.map((t) => `${t.name} ${formatSaDate(t.start)}–${formatSaDate(t.end)}`).join("; "),
							". Public holidays include Freedom Day, Workers' Day, Youth Day and the observed Women's Day. Edit is not a full provincial editor yet — confirm dates against the Government Gazette if a site differs."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Backup"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2",
						children: "Export the whole programme, including the ledger. Restoring replaces this device's copy."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn",
								onClick: () => downloadText(`pendula-backup-${isoDate(/* @__PURE__ */ new Date())}.json`, JSON.stringify(db), "application/json"),
								children: "Export backup"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "btn btn-ghost",
								children: ["Restore", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "application/json",
									className: "sr-only",
									onChange: async (e) => {
										const file = e.target.files?.[0];
										if (!file) return;
										const error = replaceBackup(await file.text());
										if (error) toast.error(error);
										else toast.success("Backup restored");
									}
								})]
							}),
							db.org.demoCohort ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-danger",
								onClick: () => {
									if (confirm("Remove the demonstration cohort from this device? This cannot be undone without a backup.")) clearDemo();
								},
								children: "Remove demonstration data"
							}) : null
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "How this copy runs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2",
						children: "This Pendula is an installable web app. The ledger, registers and reports work on this device without a Google bill. It is not connected to Firebase, and it does not send children's names to the assistant — model questions receive counts and definitions only."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2",
						children: "A multi-school cloud with real sign-in, server-side security rules and scheduled interest needs a Google Cloud project in your own account. That step is not switched on here, because it needs your authorisation and can require billing even inside a free allowance. Until then, treat the backup file as the recovery copy and do not put real children's records on a shared browser."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2",
						children: "At the demonstration size the ledger is a few hundred transactions. Five hundred learner records were exercised in the automated check without duplicate rewards. Expect the browser copy to stay comfortable at that size. Push notifications, SMS and WhatsApp are not connected."
					})
				]
			})
		]
	});
}
function Manuals() {
	const [tab, setTab] = (0, import_react.useState)("admin");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display text-4xl",
				children: "Manuals"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "South African English. Written for the people who will actually use the register."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					["admin", "Administrators"],
					["teacher", "Teachers"],
					["bank", "Banking"],
					["privacy", "Privacy"],
					["recovery", "Backup"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `btn ${tab === id ? "" : "btn-ghost"}`,
					onClick: () => setTab(id),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "panel space-y-3 p-5 text-sm leading-6",
				children: [
					tab === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Administrator manual"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Finish setup before rewards go live. Approve the points table and, separately, the interest rule. Add schools, classes and at most three active administrators. Assign each class to a teacher. Import learners from the CSV template, or register them one by one. If Pendula says a child may already exist, stop and look. Do not merge on a similar name." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Deactivate a learner rather than hoping the history disappears. History stays. Deductions wait in Approvals. You cannot approve a request you made yourself. Run interest after a month has ended. Export a backup the same day you register real children." })
					] }) : null,
					tab === "teacher" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Teacher manual"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Open Today, then Take attendance. Mark the class and save. Saving twice does not pay twice. If you change a present mark to absent, Pendula asks an administrator before any points leave the account." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Create an assessment, then enter scores. Put the same series id on tasks that are fair to compare. A child who moves from 45% to 60% has improved by 15 percentage points, not by “33% more”. Reading Eggs stages are verified by you. There is no hidden connection to the Reading Eggs website. You may request a correction. You may not delete a transaction, a learner, or another teacher." })
					] }) : null,
					tab === "bank" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Banking manual"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Every learner receives an account when they are registered. The balance is the sum of credits minus approved debits. Attendance, assessment participation, assessment improvement, reading stages, perfect weeks, administrator bonuses and interest are the credit types. Debits exist only after approval, or as the other side of a balanced ledger entry." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Interest at 1% on 1,000 points is 10 points. The next month, 1% of 1,010 is 10.1, which becomes 10 points when the rule says nearest whole point. Statements show opening balance, each line, and a closing balance that matches the ledger. The footer always says the points are not rand." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Goals do not lock points. Badges follow published rules. Leaderboards are not shown, so children are not ranked against each other in public." })
					] }) : null,
					tab === "privacy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Privacy and safeguarding"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This programme processes children's personal information. POPIA expects a lawful basis, a clear purpose, as little data as possible, and special care for children. Ordinary “the parent said yes” does not answer every legal question. Have a qualified South African privacy practitioner review a real deployment before you collect production records." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Pendula does not ask for identity numbers. Gender is optional. Support notes marked confidential stay with administrators. Parents do not see them. The assistant is sent counts and definitions, not surnames, phones or notes. There is no facial recognition. There is no public dashboard." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Do not deduct points for poverty, illness, disability or any protected characteristic. The approval screen warns when a reason appears to do that. Alerts describe attendance and scores. They do not diagnose a child." })
					] }) : null,
					tab === "recovery" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Backup and recovery"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Settings, Export backup, saves a JSON file. Keep it somewhere the school controls. To recover this device, choose Restore and pick that file. If the integrity warning appears, stop and restore a backup you trust. Do not keep editing a ledger that no longer matches its stamp." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Demonstration learners are fictional. Remove them before a real register is imported. This copy does not sync itself to another phone. The backup file is the copy that moves." })
					] }) : null
				]
			})
		]
	});
}
function Bank() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const giveBonus = usePendula((s) => s.giveBonus);
	const learners = visibleLearners(db, session.role, session.staffId, session.parentId, session.learnerId).filter((l) => l.status !== "merged");
	const focus = usePendula((s) => s.focusLearnerId);
	const openLearner = usePendula((s) => s.openLearner);
	const initial = learners.find((l) => l.id === focus)?.id || learners[0]?.id || "";
	const [learnerId, setLearnerId] = (0, import_react.useState)(initial);
	const learner = learners.find((l) => l.id === learnerId) || learners[0];
	const [from, setFrom] = (0, import_react.useState)(`${db.org.academicYear}-01-01`);
	const [to, setTo] = (0, import_react.useState)(isoDate(/* @__PURE__ */ new Date()));
	if (!learner) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "No account yet",
		body: "Register a learner to open a Pendula account."
	});
	const parts = balanceParts(db, learner.id);
	const statement = buildStatement(db, learner.id, from, to);
	const txs = "error" in statement ? [] : statement.lines;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display text-4xl",
				children: "Pendula bank"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-muted",
				children: "Virtual educational points only. Not a real bank account or monetary deposit. Balances are calculated from the ledger. Nobody types a new balance over the old one."
			})] }),
			learners.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Account",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "field",
					value: learner.id,
					onChange: (e) => {
						setLearnerId(e.target.value);
						openLearner(e.target.value);
					},
					children: learners.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: l.id,
						children: [
							learnerLabel(l),
							" · ",
							l.accountNumber
						]
					}, l.id))
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl bg-brand px-5 py-6 text-on-brand",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-brand-muted",
						children: [
							learner.accountNumber,
							" · opened ",
							formatSaDate(learner.registeredAt.slice(0, 10))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "display mt-2 text-6xl text-gold",
						children: parts.balance.toLocaleString("en-ZA")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "points held" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid grid-cols-3 gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-brand-muted",
								children: "Earned"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: parts.earned })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-brand-muted",
								children: "Interest"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: parts.interest })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-brand-muted",
								children: "Deductions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: parts.deductions })] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Statement from",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: "field",
						value: from,
						onChange: (e) => setFrom(e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "to",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: "field",
						value: to,
						onChange: (e) => setTo(e.target.value)
					})
				})]
			}),
			"error" in statement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-danger",
				children: statement.error
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn",
						onClick: () => downloadPdf(`${learner.id}-statement.pdf`, statementPdf(statement)),
						children: "Download PDF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						onClick: () => downloadText(`${learner.id}-statement.csv`, statementCsv(statement)),
						children: "Download CSV"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "self-center text-sm text-muted",
						children: [
							"Opening ",
							statement.opening,
							" · closing ",
							statement.closing,
							" · ",
							statement.reference
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel overflow-x-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Transaction"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Credit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Debit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Balance"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: txs.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: formatSaDate(line.date)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: line.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: line.credit || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: line.debit || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: line.balance
							})
						]
					}, line.txId)) })]
				}), txs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-4 text-sm text-muted",
					children: "No transactions in this period."
				}) : null]
			}),
			session.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "panel grid gap-2 p-4 sm:grid-cols-[8rem_1fr_auto]",
				onSubmit: (e) => {
					e.preventDefault();
					const data = new FormData(e.currentTarget);
					const error = giveBonus(learner.id, Number(data.get("amount")), String(data.get("reason") || ""));
					if (error) toast.error(error);
					else {
						toast.success("Bonus posted to the ledger.");
						e.currentTarget.reset();
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "amount",
						className: "field",
						inputMode: "numeric",
						placeholder: "Points",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "reason",
						className: "field",
						placeholder: "Why this bonus is educationally justified",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-gold",
						type: "submit",
						children: "Award bonus"
					})
				]
			}) : null
		]
	});
}
function Approvals() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const decide = usePendula((s) => s.decideDeduction);
	const pending = db.deductions.filter((d) => d.status === "pending");
	const decided = db.deductions.filter((d) => d.status !== "pending").slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display text-4xl",
				children: "Approvals"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "A pending request does not change a balance. You cannot approve your own request. An approved deduction posts once, and only if the balance can cover it."
			})] }),
			pending.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: "Nothing is waiting",
				body: "Teachers' deduction requests will appear here."
			}) : null,
			pending.map((request) => {
				const learner = db.learners.find((l) => l.id === request.learnerId);
				const mine = request.requesterId === session.staffId;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "panel p-4",
					onSubmit: (e) => {
						e.preventDefault();
						const submitter = e.nativeEvent.submitter;
						const data = new FormData(e.currentTarget, submitter);
						const error = decide(request.id, submitter?.value === "approve", String(data.get("note") || ""));
						if (error) toast.error(error);
						else toast.success(data.get("decision") === "approve" ? "Posted to the ledger." : "Rejected. Balance unchanged.");
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold",
							children: [
								learner ? learnerLabel(learner) : request.learnerId,
								" · ",
								request.amount,
								" points"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: request.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								request.category,
								" · requested ",
								formatSaDate(request.createdAt.slice(0, 10)),
								" · balance now ",
								learner ? balanceParts(db, learner.id).balance : "—"
							]
						}),
						mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-danger",
							children: "You requested this, so you cannot decide it."
						}) : null,
						session.role === "admin" && !mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "note",
									className: "field",
									placeholder: "Decision note"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn",
									name: "decision",
									value: "approve",
									type: "submit",
									children: "Approve"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									name: "decision",
									value: "reject",
									type: "submit",
									children: "Reject"
								})
							]
						}) : null
					]
				}, request.id);
			}),
			decided.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "display text-2xl",
				children: "Recent decisions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1 text-sm",
				children: decided.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					d.status,
					": ",
					d.amount,
					" points — ",
					d.reason
				] }, d.id))
			})] }) : null
		]
	});
}
var STATUSES = [
	"present",
	"late",
	"absent",
	"excused"
];
function Attendance() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const takeAttendance = usePendula((s) => s.takeAttendance);
	const staff = db.staff.find((s) => s.id === session.staffId);
	const classes = db.classes.filter((c) => session.role === "admin" || staff?.classIds.includes(c.id));
	const asOf = isoDate(/* @__PURE__ */ new Date());
	const suggested = recentSchoolDays(1, asOf, db.org.terms, db.org.holidays)[0] || asOf;
	const [classId, setClassId] = (0, import_react.useState)(classes[0]?.id || "");
	const [date, setDate] = (0, import_react.useState)(suggested);
	const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.classId === classId && l.status === "active");
	const initial = (0, import_react.useMemo)(() => {
		const map = {};
		for (const learner of learners) map[learner.id] = db.attendance.find((a) => a.learnerId === learner.id && a.date === date)?.status || "present";
		return map;
	}, [
		db.attendance,
		learners,
		date
	]);
	const [marks, setMarks] = (0, import_react.useState)(initial);
	const [lookup, setLookup] = (0, import_react.useState)("");
	const shown = lookup.trim() ? learners.filter((l) => `${l.id} ${l.firstName} ${l.surname}`.toLowerCase().includes(lookup.toLowerCase())) : learners;
	if (!classes.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "No class assigned",
		body: "An administrator needs to add a class and assign it to you."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display text-4xl",
				children: "Attendance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "One attendance reward per learner per school day. A second save does not pay again. Changing present to absent asks an administrator before points move."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Class",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "field",
							value: classId,
							onChange: (e) => {
								setClassId(e.target.value);
								setMarks({});
							},
							children: classes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: c.id,
								children: [
									c.name,
									" · ",
									db.schools.find((s) => s.id === c.schoolId)?.name
								]
							}, c.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							className: "field",
							value: date,
							onChange: (e) => {
								setDate(e.target.value);
								setMarks({});
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Find ID or name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							value: lookup,
							onChange: (e) => setLookup(e.target.value),
							placeholder: "PEN-2026-00001"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-quiet",
					onClick: () => setMarks(Object.fromEntries(learners.map((l) => [l.id, "present"]))),
					children: "Mark all present"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn",
					onClick: () => {
						const payload = learners.map((l) => ({
							learnerId: l.id,
							status: marks[l.id] || initial[l.id] || "present"
						}));
						const result = takeAttendance(classId, date, payload);
						if (result.error) toast.error(result.error);
						else toast.success(`${result.posted || 0} new rewards. ${result.corrections || 0} corrections sent for approval.`);
					},
					children: "Save register"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: shown.map((learner) => {
					const status = marks[learner.id] || initial[learner.id] || "present";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "panel flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: learnerLabel(learner)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: learner.id
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: STATUSES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `btn ${status === item ? "" : "btn-ghost"} px-3`,
								onClick: () => setMarks((m) => ({
									...initial,
									...m,
									[learner.id]: item
								})),
								children: item
							}, item))
						})]
					}, learner.id);
				})
			})
		]
	});
}
function Assessments() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const addAssessment = usePendula((s) => s.addAssessment);
	const markAssessment = usePendula((s) => s.markAssessment);
	const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.status === "active");
	const [selected, setSelected] = (0, import_react.useState)(db.assessments[0]?.id || "");
	const [grade, setGrade] = (0, import_react.useState)(5);
	const assessment = db.assessments.find((a) => a.id === selected);
	const cohort = learners.filter((l) => assessment && l.grade === assessment.grade);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display text-4xl",
				children: "Assessments"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Participation points post once. Improvement points need the same series, subject and grade. 45% then 60% is 15 percentage points, times 5, capped at 50."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "panel grid gap-3 p-4 sm:grid-cols-2",
				onSubmit: (e) => {
					e.preventDefault();
					const data = new FormData(e.currentTarget);
					const result = addAssessment({
						name: String(data.get("name") || ""),
						subject: String(data.get("subject") || ""),
						grade: Number(data.get("grade")),
						date: String(data.get("date") || isoDate(/* @__PURE__ */ new Date())),
						type: String(data.get("type") || "class check"),
						maxScore: Number(data.get("max") || 100),
						seriesId: String(data.get("series") || ""),
						outcomes: String(data.get("outcomes") || "")
					});
					if (result.error) toast.error(result.error);
					else {
						toast.success("Assessment created. Mark it to award points.");
						if (result.id) setSelected(result.id);
						e.currentTarget.reset();
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "name",
							className: "field",
							required: true,
							placeholder: "Mathematics check 3"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Subject",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "subject",
							className: "field",
							required: true,
							defaultValue: "Mathematics"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Grade",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							name: "grade",
							className: "field",
							value: grade,
							onChange: (e) => setGrade(Number(e.target.value)),
							children: Array.from({ length: 12 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: i + 1 }, i + 1))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "date",
							type: "date",
							className: "field",
							defaultValue: isoDate(/* @__PURE__ */ new Date())
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Maximum score",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "max",
							className: "field",
							defaultValue: 100,
							inputMode: "numeric"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Series id (needed for improvement)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "series",
							className: "field",
							placeholder: "maths-g5"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Type",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "type",
							className: "field",
							defaultValue: "class check"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Learning outcome",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "outcomes",
							className: "field",
							placeholder: "What this task shows"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn sm:col-span-2 w-fit",
						type: "submit",
						children: "Create assessment"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Mark an assessment",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "field",
					value: selected,
					onChange: (e) => setSelected(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Choose"
					}), db.assessments.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: a.id,
						children: [
							a.date,
							" · Grade ",
							a.grade,
							" · ",
							a.subject,
							" · ",
							a.name
						]
					}, a.id))]
				})
			}),
			assessment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-2",
				onSubmit: (e) => {
					e.preventDefault();
					const data = new FormData(e.currentTarget);
					const rows = cohort.map((l) => ({
						learnerId: l.id,
						score: Number(data.get(`score-${l.id}`)),
						comment: String(data.get(`comment-${l.id}`) || "")
					})).filter((r) => Number.isFinite(r.score));
					const result = markAssessment(assessment.id, rows);
					if (result.error) toast.error(result.error);
					else toast.success(`${result.participation || 0} participation rewards, ${result.improvement || 0} improvement rewards. Repeats do not pay again.`);
				},
				children: [cohort.map((l) => {
					const existing = db.results.find((r) => r.assessmentId === assessment.id && r.learnerId === l.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel grid gap-2 px-3 py-3 sm:grid-cols-[1fr_7rem_1fr] sm:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: learnerLabel(l)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: existing ? `${existing.score}/${assessment.maxScore} · ${Math.round(percentage(existing.score, assessment.maxScore))}%` : "Not marked"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: `score-${l.id}`,
								className: "field",
								inputMode: "decimal",
								defaultValue: existing?.score ?? "",
								placeholder: `0–${assessment.maxScore}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: `comment-${l.id}`,
								className: "field",
								defaultValue: existing?.comment || "",
								placeholder: "Comment"
							})
						]
					}, l.id);
				}), cohort.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "No active learners in this grade are in your classes."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn",
					type: "submit",
					children: "Save marks"
				})]
			}) : null
		]
	});
}
function Reading() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const verifyReading = usePendula((s) => s.verifyReading);
	const learners = visibleLearners(db, session.role, session.staffId).filter((l) => l.status === "active");
	const [learnerId, setLearnerId] = (0, import_react.useState)(learners[0]?.id || "");
	const stage = currentStage(db, learnerId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display text-4xl",
				children: "Reading Eggs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "There is no official feed in this copy. A teacher verifies a stage. Each new stage pays once. Uploading the same stage again pays nothing. Stages are not school grades."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "panel grid gap-3 p-4 sm:grid-cols-2",
				onSubmit: (e) => {
					e.preventDefault();
					const data = new FormData(e.currentTarget);
					const result = verifyReading(learnerId, Number(data.get("stage")), String(data.get("date") || isoDate(/* @__PURE__ */ new Date())), String(data.get("evidence") || ""));
					if (result.error) toast.error(result.error);
					else toast.success(result.awarded ? `${result.awarded} points for newly verified stages.` : "Recorded. No new stage reward.");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Learner",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "field",
							value: learnerId,
							onChange: (e) => setLearnerId(e.target.value),
							children: learners.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: l.id,
								children: [
									learnerLabel(l),
									" · stage ",
									currentStage(db, l.id) || "none"
								]
							}, l.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `New stage (current ${stage || "none"})`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "stage",
							className: "field",
							inputMode: "numeric",
							required: true,
							placeholder: String(stage + 1)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Date seen",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "date",
							type: "date",
							className: "field",
							defaultValue: isoDate(/* @__PURE__ */ new Date())
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Evidence",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "evidence",
							className: "field",
							required: true,
							placeholder: "Checked the map with the learner"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn w-fit",
						type: "submit",
						children: "Verify stage"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display text-2xl",
					children: "Latest verifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2 text-sm",
					children: db.reading.slice(-8).reverse().map((event) => {
						const learner = db.learners.find((l) => l.id === event.learnerId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							formatSaDate(event.date),
							" · ",
							learner ? learnerLabel(learner) : event.learnerId,
							" · stage ",
							event.previousStage,
							" to ",
							event.stage,
							". ",
							event.evidence
						] }, event.id);
					})
				})]
			})
		]
	});
}
function Learners() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const nav = usePendula((s) => s.nav);
	const focus = usePendula((s) => s.focusLearnerId);
	const openLearner = usePendula((s) => s.openLearner);
	const [q, setQ] = (0, import_react.useState)("");
	const [grade, setGrade] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(0);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [showImport, setShowImport] = (0, import_react.useState)(false);
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
	if (nav === "learner" && selected) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Profile, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "display text-4xl",
					children: "Learners"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted",
					children: [filtered.length, " in view. Names are never the only identifier."]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						onClick: () => setShowImport(true),
						children: "Import"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn",
						onClick: () => setShowForm(true),
						children: "Register"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-[1fr_10rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					placeholder: "Search name, Pendula ID, account or school",
					value: q,
					onChange: (e) => {
						setQ(e.target.value);
						setPage(0);
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "field",
					value: grade,
					onChange: (e) => {
						setGrade(e.target.value);
						setPage(0);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "All grades"
					}), Array.from({ length: 12 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: i + 1,
						children: ["Grade ", i + 1]
					}, i + 1))]
				})]
			}),
			slice.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: "No learners match",
				body: "Register a child, or clear the search. An empty programme is ready for a real import."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: slice.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "panel flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-left",
					onClick: () => openLearner(l.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: learnerLabel(l)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-0.5 block text-sm text-muted",
						children: [
							l.id,
							" · Grade ",
							l.grade,
							" · ",
							db.schools.find((s) => s.id === l.schoolId)?.name,
							" · ",
							l.status
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "display text-2xl text-gold",
						children: balanceParts(db, l.id).balance
					})]
				}, l.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						disabled: page === 0,
						onClick: () => setPage((p) => p - 1),
						children: "Previous"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Page ",
						page + 1,
						" of ",
						pages
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						disabled: page + 1 >= pages,
						onClick: () => setPage((p) => p + 1),
						children: "Next"
					})
				]
			}),
			showForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Register, { onClose: () => setShowForm(false) }) : null,
			showImport ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportBox, { onClose: () => setShowImport(false) }) : null
		]
	});
}
function Register({ onClose }) {
	const db = usePendula((s) => s.db);
	const register = usePendula((s) => s.register);
	const [schoolId, setSchoolId] = (0, import_react.useState)(db.schools[0]?.id || "");
	const classes = db.classes.filter((c) => c.schoolId === schoolId);
	const [dupes, setDupes] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const submit = (ignore) => (e) => {
		e?.preventDefault();
		const form = e?.currentTarget || document.getElementById("register-form");
		const data = new FormData(form);
		const classId = String(data.get("classId") || "");
		const cls = db.classes.find((c) => c.id === classId);
		const next = {
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
			readingEggsId: String(data.get("readingEggsId") || "")
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		title: "Register a learner",
		onClose,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			id: "register-form",
			className: "grid gap-3 sm:grid-cols-2",
			onSubmit: submit(false),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "First name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "firstName",
						className: "field",
						required: true,
						defaultValue: draft?.firstName
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Surname",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "surname",
						className: "field",
						required: true,
						defaultValue: draft?.surname
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Preferred name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "preferredName",
						className: "field",
						defaultValue: draft?.preferredName
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date of birth",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "dob",
						type: "date",
						className: "field",
						required: true,
						defaultValue: draft?.dob
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Gender (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "gender",
						className: "field",
						defaultValue: draft?.gender
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Home language",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "homeLanguage",
						className: "field",
						defaultValue: draft?.homeLanguage
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "School",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						name: "schoolId",
						className: "field",
						value: schoolId,
						onChange: (e) => setSchoolId(e.target.value),
						children: db.schools.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name
						}, s.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Grade",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						name: "grade",
						className: "field",
						defaultValue: classes[0]?.grade || 1,
						children: Array.from({ length: 12 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: i + 1 }, i + 1))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Class",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						name: "classId",
						className: "field",
						children: classes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Area",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "area",
						className: "field"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Guardian",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "guardianName",
						className: "field"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Guardian phone",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "guardianPhone",
						className: "field"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Reading Eggs ID",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "readingEggsId",
						className: "field"
					})
				}),
				dupes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sm:col-span-2 rounded-xl bg-gold-soft p-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: "Possible existing learner found. Please review before continuing."
						}),
						dupes.map((d) => {
							const person = db.learners.find((l) => l.id === d.learnerId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1",
								children: [
									person ? `${learnerLabel(person)} · ${person.id} · ${person.dob}` : d.learnerId,
									" — ",
									d.level,
									". ",
									d.reasons.join(" ")
								]
							}, d.learnerId);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-gold mt-3",
							onClick: () => submit(true)(),
							children: "I reviewed this. Register a different child."
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sm:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn",
						type: "submit",
						children: "Check and register"
					})
				})
			]
		}), db.schools.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: "Add a school and class in Settings before registering."
		}) : null]
	});
}
function ImportBox({ onClose }) {
	const db = usePendula((s) => s.db);
	const applyImport = usePendula((s) => s.applyImport);
	const [rows, setRows] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		title: "Import learners",
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "CSV, up to 500 rows. Existing records are never overwritten. Confirmed duplicates are skipped."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-ghost mt-3",
				onClick: () => downloadText("pendula-learner-template.csv", IMPORT_TEMPLATE),
				children: "Download template"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "mt-3 block w-full text-sm",
				type: "file",
				accept: ".csv,text/csv",
				onChange: async (e) => {
					const file = e.target.files?.[0];
					if (!file) return;
					const text = await file.text();
					setRows(parseImportCsv(text, db));
				}
			}),
			rows?.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: rows.error
			}) : null,
			rows?.rows ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 max-h-64 overflow-auto text-sm",
				children: rows.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "border-b border-line py-1",
					children: [
						"Line ",
						row.line,
						": ",
						row.errors[0] || row.warnings[0] || "Ready",
						" ",
						row.draft ? `· ${row.draft.firstName} ${row.draft.surname}` : ""
					]
				}, row.line))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn mt-4",
				disabled: !rows?.rows?.length,
				onClick: () => {
					if (!rows?.rows) return;
					const result = applyImport(rows.rows);
					if (result.error) toast.error(result.error);
					else {
						toast.success(`${result.added || 0} added, ${result.skipped || 0} skipped`);
						onClose();
					}
				},
				children: "Import ready rows"
			})
		]
	});
}
function Profile() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const id = usePendula((s) => s.focusLearnerId);
	const learner = db.learners.find((l) => l.id === id);
	const editLearner = usePendula((s) => s.editLearner);
	const askDeduction = usePendula((s) => s.askDeduction);
	const addNote = usePendula((s) => s.addNote);
	const sendMessage = usePendula((s) => s.sendMessage);
	const merge = usePendula((s) => s.merge);
	const setNav = usePendula((s) => s.setNav);
	const asOf = isoDate(/* @__PURE__ */ new Date());
	const [mergeId, setMergeId] = (0, import_react.useState)("");
	const dupes = (0, import_react.useMemo)(() => learner ? findDuplicates(db.learners, {
		firstName: learner.firstName,
		surname: learner.surname,
		dob: learner.dob,
		guardianPhone: learner.guardianPhone
	}, learner.id) : [], [db.learners, learner]);
	if (!learner) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "Learner not found",
		body: "They may have been merged.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "btn",
			type: "button",
			onClick: () => setNav("learners"),
			children: "Back"
		})
	});
	const parts = balanceParts(db, learner.id);
	const school = db.schools.find((s) => s.id === learner.schoolId);
	const notes = db.interventions.filter((n) => n.learnerId === learner.id && (session.role === "admin" || !n.confidential));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-ghost",
				onClick: () => setNav("learners"),
				children: "All learners"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							learner.id,
							" · ",
							learner.accountNumber
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display text-4xl",
						children: learnerLabel(learner)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							"Grade ",
							learner.grade,
							" · ",
							school?.name,
							" · age ",
							ageOn(learner.dob, asOf),
							" · ",
							learner.status
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "display text-5xl text-gold",
					children: parts.balance
				})]
			}),
			dupes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-xl bg-gold-soft px-3 py-2 text-sm",
				children: [
					"Possible existing learner found. ",
					dupes.map((d) => d.learnerId).join(", "),
					". Review before any merge. Do not merge on a name alone."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-4 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Record"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2",
							children: [
								"Born ",
								formatSaDate(learner.dob),
								" · ",
								learner.homeLanguage || "language not captured",
								" · ",
								learner.area || "area not captured"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Guardian: ",
							learner.guardianName || "—",
							" ",
							learner.guardianPhone
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Reading Eggs: ",
							learner.readingEggsId || "not linked",
							" · portal code ",
							session.role === "admin" || session.role === "teacher" ? learner.portalPin : "hidden"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-muted",
							children: [
								"Registered ",
								formatSaDate(learner.registeredAt.slice(0, 10)),
								". Photo consent: ",
								learner.photoConsent ? "yes" : "no",
								". No photograph is stored."
							]
						}),
						session.role === "admin" && learner.supportNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 rounded-xl bg-danger-soft p-2",
							children: ["Confidential support note: ", learner.supportNote]
						}) : null,
						session.role === "teacher" && learner.supportNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: "A confidential support note is on file with administrators."
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Points"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Earned ",
								parts.earned,
								" · interest ",
								parts.interest,
								" · approved deductions ",
								parts.deductions,
								". The balance is the ledger, not an editable number."
							]
						}),
						(session.role === "teacher" || session.role === "admin") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 grid gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								const data = new FormData(e.currentTarget);
								const error = askDeduction(learner.id, Number(data.get("amount")), String(data.get("reason") || ""), "correction");
								if (error) toast.error(error);
								else toast.success("Request sent. The balance is unchanged until an administrator approves it.");
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Ask to remove points",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "amount",
										className: "field",
										inputMode: "numeric",
										required: true
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Reason",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "reason",
										className: "field",
										required: true,
										placeholder: "What should be corrected, and why"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-danger",
									type: "submit",
									children: "Submit for approval"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Notes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2 text-sm",
						children: notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [formatSaDate(n.at.slice(0, 10)), "."]
							}),
							" ",
							n.note,
							" ",
							n.confidential ? "(confidential)" : ""
						] }, n.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 grid gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							const data = new FormData(e.currentTarget);
							const error = addNote(learner.id, String(data.get("note") || ""), Boolean(data.get("confidential")));
							if (error) toast.error(error);
							else e.currentTarget.reset();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								name: "note",
								className: "field min-h-20",
								placeholder: "What should the next adult know?"
							}),
							session.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									name: "confidential",
									className: "mr-2"
								}), "Confidential safeguarding note (administrators only)"]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost w-fit",
								type: "submit",
								children: "Save note"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						onSubmit: (e) => {
							e.preventDefault();
							const data = new FormData(e.currentTarget);
							const error = sendMessage(learner.id, "progress", String(data.get("body") || ""));
							if (error) toast.error(error);
							else {
								toast.success("In-app message saved. Nothing was texted.");
								e.currentTarget.reset();
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "body",
							className: "field",
							placeholder: "A short progress note for the family"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-quiet",
							type: "submit",
							children: "Save family note"
						})]
					})
				]
			}),
			session.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Administrator"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: learner.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-danger",
							onClick: () => {
								const error = editLearner(learner.id, { status: "inactive" });
								if (error) toast.error(error);
								else toast.success("Deactivated. History kept.");
							},
							children: "Deactivate"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn",
							onClick: () => editLearner(learner.id, { status: "active" }),
							children: "Restore"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "field",
							value: mergeId,
							onChange: (e) => setMergeId(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Merge another record into this one"
							}), db.learners.filter((l) => l.id !== learner.id && l.status !== "merged").map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: l.id,
								children: [
									l.id,
									" · ",
									learnerLabel(l)
								]
							}, l.id))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-gold",
							onClick: () => {
								if (!mergeId) return;
								const error = merge(learner.id, mergeId);
								if (error) toast.error(error);
								else toast.success("Merged. Ledger lines were kept and included in this balance.");
							},
							children: "Merge"
						})]
					})
				]
			}) : null
		]
	});
}
function greet() {
	const hour = (/* @__PURE__ */ new Date()).getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}
function Today() {
	const session = usePendula((s) => s.session);
	if (session.role === "learner") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LearnerHome, {});
	if (session.role === "parent") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentHome, {});
	return session.role === "teacher" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeacherHome, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminHome, {});
}
function AdminHome() {
	const db = usePendula((s) => s.db);
	const setNav = usePendula((s) => s.setNav);
	const openLearner = usePendula((s) => s.openLearner);
	const asOf = isoDate(/* @__PURE__ */ new Date());
	const learners = visibleLearners(db, "admin");
	const metrics = programmeMetrics(db, learners, asOf);
	const series = weeklyAttendanceSeries(db, learners.filter((l) => l.status === "active"), asOf);
	const days = birthdays(db, learners, asOf, 7);
	const alerts = alertsFor(db, learners, asOf).slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: formatSaDate(asOf)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "display text-4xl",
				children: [greet(), ". The programme at a glance."]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Active learners",
						value: metrics.active,
						hint: `${metrics.registered} records, merged excluded`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Recent attendance",
						value: metrics.attendanceRate === null ? "—" : `${Math.round(metrics.attendanceRate * 100)}%`,
						hint: `${metrics.attended} of ${metrics.eligible} eligible marks. ${metrics.weekLabel}.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Points held",
						value: metrics.held.toLocaleString("en-ZA"),
						hint: `${metrics.issued.toLocaleString("en-ZA")} earned, ${metrics.interest} interest. Not rand.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Approvals waiting",
						value: metrics.pending,
						hint: `${metrics.readingMilestones} reading stage rewards posted`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-[1.4fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Attendance on recent school days"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Present and late, divided by present, late and absent. Excused days are left out."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 h-56",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
									data: series,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "date",
											stroke: "var(--muted)",
											fontSize: 12,
											tickLine: false,
											axisLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											stroke: "var(--muted)",
											fontSize: 12,
											tickLine: false,
											axisLine: false,
											unit: "%",
											width: 40
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											dataKey: "rate",
											name: "Attendance %",
											stroke: "var(--emerald)",
											fill: "var(--emerald-soft)",
											strokeWidth: 2
										})
									]
								})
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Learners by grade"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: metrics.byGrade.filter((g) => g.learners).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "w-16",
									children: ["Grade ", g.grade]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-2 flex-1 overflow-hidden rounded-full bg-blue-soft",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block h-full bg-action",
										style: { width: `${Math.max(8, g.learners / Math.max(metrics.active, 1) * 100)}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-6 text-right",
									children: g.learners
								})
							]
						}, g.grade))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Needs a person, not a label"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 space-y-3",
							children: [alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "No open alerts on the current rules."
							}) : null, alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "block w-full text-left",
								onClick: () => alert.learnerId && openLearner(alert.learnerId),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: alert.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: alert.body
								})]
							}, alert.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-ghost mt-3",
							onClick: () => setNav("insights"),
							children: "Open insights"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-2xl",
							children: "Birthdays"
						}),
						days.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: "None in the next seven days."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2",
							children: days.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "text-left font-medium",
									onClick: () => openLearner(day.learner.id),
									children: [learnerLabel(day.learner), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block text-sm font-normal text-muted",
										children: [
											day.days === 0 ? "Today" : `In ${day.days} days`,
											" · turns ",
											day.age
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "btn btn-quiet",
									onClick: () => openLearner(day.learner.id),
									children: "Note"
								})]
							}, day.learner.id))
						})
					]
				})]
			})
		]
	});
}
function TeacherHome() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const setNav = usePendula((s) => s.setNav);
	const openLearner = usePendula((s) => s.openLearner);
	const sendMessage = usePendula((s) => s.sendMessage);
	const asOf = isoDate(/* @__PURE__ */ new Date());
	const learners = visibleLearners(db, "teacher", session.staffId);
	const classes = db.classes.filter((c) => db.staff.find((s) => s.id === session.staffId)?.classIds.includes(c.id));
	const day = recentSchoolDays(1, asOf, db.org.terms, db.org.holidays)[0];
	const alerts = alertsFor(db, learners, asOf).slice(0, 3);
	const days = birthdays(db, learners, asOf, 7);
	const staff = db.staff.find((s) => s.id === session.staffId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: formatSaDate(asOf)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "display text-4xl",
					children: [greet(), ". Here is your class today."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted",
					children: [staff?.name, ". Points are virtual rewards. You cannot remove them without an administrator."]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: classes.map((cls) => {
					const group = learners.filter((l) => l.classId === cls.id && l.status === "active");
					const unmarked = day ? group.filter((l) => !db.attendance.some((a) => a.learnerId === l.id && a.date === day)).length : group.length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "panel p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "display text-2xl",
								children: cls.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									group.length,
									" learners · ",
									unmarked,
									" not marked ",
									day ? `on ${formatSaDate(day)}` : "yet"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn mt-3",
								onClick: () => setNav("attendance"),
								children: "Take attendance"
							})
						]
					}, cls.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					["Register learner", "learners"],
					["Record assessment", "assessments"],
					["Update Reading Eggs", "reading"],
					["View bank", "bank"]
				].map(([label, id]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-ghost",
					onClick: () => setNav(id),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Follow up"
					}),
					alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "Nothing urgent in your classes."
					}) : null,
					alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "mt-3 block text-left",
						onClick: () => alert.learnerId && openLearner(alert.learnerId),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: alert.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted",
							children: alert.body
						})]
					}, alert.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Birthdays this week"
					}),
					days.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "None in the next seven days."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2",
						children: days.map((dayItem) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								learnerLabel(dayItem.learner),
								" · ",
								dayItem.days === 0 ? "today" : `in ${dayItem.days} days`
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-quiet",
								onClick: () => {
									const error = sendMessage(dayItem.learner.id, "birthday", `Happy birthday, ${dayItem.learner.preferredName}. We are glad you are in class.`);
									if (error) toast.error(error);
									else toast.success("In-app note saved. No SMS was sent.");
								},
								children: "Save a birthday note"
							})]
						}, dayItem.learner.id))
					})
				]
			})
		]
	});
}
function LearnerHome() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const addGoal = usePendula((s) => s.addGoal);
	const learner = db.learners.find((l) => l.id === session.learnerId);
	if (!learner) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "No learner selected",
		body: "Ask a teacher to open your portal."
	});
	const band = learnerAgeBand(learner.grade);
	const parts = balanceParts(db, learner.id);
	const stage = currentStage(db, learner.id);
	const goal = db.goals.find((g) => g.learnerId === learner.id);
	const journey = band === "senior" ? savingsJourney(parts.balance) : readingJourney(stage);
	const badges = db.badges.filter((b) => b.learnerId === learner.id);
	const txs = db.transactions.filter((t) => t.learnerId === learner.id).slice(-6).reverse();
	const word = band === "foundation" ? "stars" : "points";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: band === "foundation" ? "Your Pendula stars" : "Your Pendula account"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "display text-4xl",
				children: [
					"Hello, ",
					learner.preferredName,
					"."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl bg-brand px-5 py-6 text-on-brand",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-brand-muted",
						children: learner.accountNumber
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "display mt-2 text-6xl text-gold",
						children: parts.balance.toLocaleString("en-ZA")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1",
						children: [word, " saved"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-lg text-sm text-brand-muted",
						children: "These are learning rewards, not money. You cannot spend them in a shop. Saving them shows patience."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: band === "senior" ? "Savings journey" : "Reading journey"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 flex flex-wrap gap-2",
						children: journey.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: `chip ${step.reached ? "bg-emerald-soft" : "opacity-60"}`,
							children: step.label
						}, step.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "A journey shows practice. It does not say what you are worth."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "A goal"
					}),
					goal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: goal.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									parts.balance,
									" of ",
									goal.target,
									" ",
									word,
									" · ",
									Math.min(100, Math.round(parts.balance / goal.target * 100)),
									"%"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-3 overflow-hidden rounded-full bg-gold-soft",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-gold",
									style: { width: `${Math.min(100, parts.balance / goal.target * 100)}%` }
								})
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						onSubmit: (e) => {
							e.preventDefault();
							const data = new FormData(e.currentTarget);
							const error = addGoal(learner.id, String(data.get("name") || ""), Number(data.get("target")));
							if (error) toast.error(error);
							else e.currentTarget.reset();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								className: "field",
								placeholder: band === "foundation" ? "I want to save for..." : "Name your goal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "target",
								className: "field sm:max-w-32",
								inputMode: "numeric",
								placeholder: "500"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn",
								type: "submit",
								children: "Save goal"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"A goal does not lock or remove ",
							word,
							"."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Badges"
					}),
					badges.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "Badges appear when a rule is met. They are not a ranking."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 grid gap-2 sm:grid-cols-2",
						children: badges.map((badge) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl bg-gold-soft px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: badge.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: badge.reason
							})]
						}, badge.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "display text-2xl",
					children: ["Latest ", word]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-line",
					children: txs.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tx.reason }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: tx.direction === "credit" ? "text-emerald" : "text-danger",
							children: [tx.direction === "credit" ? "+" : "−", tx.amount]
						})]
					}, tx.id))
				})]
			})
		]
	});
}
function ParentHome() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const setNav = usePendula((s) => s.setNav);
	const parent = db.parents.find((p) => p.id === session.parentId);
	const children = db.learners.filter((l) => parent?.learnerIds.includes(l.id));
	const focus = usePendula((s) => s.focusLearnerId);
	const openLearner = usePendula((s) => s.openLearner);
	const child = children.find((l) => l.id === focus) || children[0];
	if (!child) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "No child is linked",
		body: "Ask the programme to link your child's record to this parent profile."
	});
	const parts = balanceParts(db, child.id);
	const asOf = isoDate(/* @__PURE__ */ new Date());
	const rate = alertsFor(db, [child], asOf);
	const messages = db.messages.filter((m) => m.learnerId === child.id && m.kind !== "support");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "display text-4xl",
				children: [child.preferredName, "'s progress"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "You can see attendance, rewards and messages. Staff notes and safeguarding records stay with the school."
			})] }),
			children.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: children.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `btn ${c.id === child.id ? "" : "btn-ghost"}`,
					onClick: () => openLearner(c.id),
					children: c.preferredName
				}, c.id))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Points",
						value: parts.balance,
						hint: "Virtual rewards, not rand"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Reading stage",
						value: currentStage(db, child.id) || "—",
						hint: "A Reading Eggs stage is not a school grade"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Grade",
						value: child.grade,
						hint: db.schools.find((s) => s.id === child.schoolId)?.name
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "What the programme is watching"
					}),
					rate.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "No attendance or progress alert on the current rules."
					}) : null,
					rate.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: alert.body
					}, alert.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost mt-3",
						onClick: () => setNav("bank"),
						children: "Open the points statement"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "Messages"
					}),
					messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "No in-app messages yet. Pendula does not send SMS from this screen."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2",
						children: messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold capitalize",
									children: [m.kind, "."]
								}),
								" ",
								m.body
							]
						}, m.id))
					})
				]
			})
		]
	});
}
var NAV = [
	{
		id: "today",
		label: "Today",
		icon: LayoutDashboard,
		roles: [
			"admin",
			"teacher",
			"learner",
			"parent"
		]
	},
	{
		id: "learners",
		label: "Learners",
		icon: Users,
		roles: ["admin", "teacher"]
	},
	{
		id: "attendance",
		label: "Attendance",
		icon: CalendarCheck,
		roles: ["admin", "teacher"]
	},
	{
		id: "assessments",
		label: "Assessments",
		icon: BookOpen,
		roles: ["admin", "teacher"]
	},
	{
		id: "reading",
		label: "Reading Eggs",
		icon: Library,
		roles: ["admin", "teacher"]
	},
	{
		id: "bank",
		label: "Bank",
		icon: Landmark,
		roles: [
			"admin",
			"teacher",
			"learner",
			"parent"
		]
	},
	{
		id: "approvals",
		label: "Approvals",
		icon: ShieldCheck,
		roles: ["admin", "teacher"]
	},
	{
		id: "insights",
		label: "Insights",
		icon: Sparkles,
		roles: ["admin", "teacher"]
	},
	{
		id: "reports",
		label: "Reports",
		icon: FileChartColumnIncreasing,
		roles: ["admin", "teacher"]
	},
	{
		id: "manuals",
		label: "Manuals",
		icon: BookMarked,
		roles: [
			"admin",
			"teacher",
			"learner",
			"parent"
		]
	},
	{
		id: "settings",
		label: "Settings",
		icon: Settings,
		roles: ["admin"]
	}
];
function PendulaApp() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const theme = usePendula((s) => s.theme);
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	(0, import_react.useEffect)(() => {
		const finish = () => setReady(true);
		const unsub = usePendula.persist.onFinishHydration(finish);
		if (usePendula.persist.hasHydrated()) finish();
		return unsub;
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme, ready]);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-brand text-on-brand",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "display text-3xl",
				children: "Pendula"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-brand-muted",
				children: "Learn. Grow. Earn. Thrive."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, { position: "top-center" }), !db.org.setupComplete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Setup, {}) : !session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockScreen, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {})] });
}
function Setup() {
	const completeSetup = usePendula((s) => s.completeSetup);
	const [step, setStep] = (0, import_react.useState)(0);
	const [orgName, setOrgName] = (0, import_react.useState)("Pendula Learning Programme");
	const [location, setLocation] = (0, import_react.useState)("Sunnyside");
	const [email, setEmail] = (0, import_react.useState)("");
	const [adminName, setAdminName] = (0, import_react.useState)("");
	const [pin, setPin] = (0, import_react.useState)("");
	const [rewards, setRewards] = (0, import_react.useState)(true);
	const [interest, setInterest] = (0, import_react.useState)(true);
	const [demo, setDemo] = (0, import_react.useState)(true);
	const finish = () => {
		const error = completeSetup({
			orgName,
			email,
			adminName,
			pin,
			approveRewards: rewards,
			approveInterest: interest,
			demo,
			location
		});
		if (error) toast.error(error);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-paper text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-14",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl bg-brand px-6 py-8 text-on-brand",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-sm uppercase tracking-[0.18em] text-brand-muted",
						children: "Educational rewards bank"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display mt-3 text-5xl",
						children: "Pendula"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-md text-lg text-brand-muted",
						children: "Learn. Grow. Earn. Thrive. Attendance, assessments and reading become a virtual points account a child can understand — never rand, and never a real bank."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-8 space-y-2 text-sm text-brand-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1. Name the programme and the founding administrator." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2. Approve the points rules before anything is earned." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3. Open a demonstration cohort, or start empty." })
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-6",
				children: [
					step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-3xl",
							children: "Set up this device"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: "Pendula keeps the programme ledger on this device and in the backup you export. Up to three administrators. Teachers cannot deduct points without approval."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Programme name",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										value: orgName,
										onChange: (e) => setOrgName(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Main site",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										value: location,
										onChange: (e) => setLocation(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Your name",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										value: adminName,
										onChange: (e) => setAdminName(e.target.value),
										autoComplete: "name"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Contact email (optional)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										autoComplete: "email"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "4-digit administrator PIN",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										inputMode: "numeric",
										maxLength: 4,
										value: pin,
										onChange: (e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn mt-5",
							onClick: () => adminName.trim() && pin.length === 4 ? setStep(1) : toast.error("Enter your name and a 4-digit PIN"),
							children: "Continue"
						})
					] }) : null,
					step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-3xl",
							children: "Approve the rules"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: "Nothing is earned until you approve. Historical transactions are never recalculated when you change the rules later."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-4 space-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "panel px-3 py-2",
									children: "Daily attendance — 10 points. Late — 5."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "panel px-3 py-2",
									children: "Completed assessment — 20. Improvement — 5 per percentage point, capped at 50."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "panel px-3 py-2",
									children: "New Reading Eggs stage — 30. Perfect school week — 20."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "panel px-3 py-2",
									children: "Savings interest — 1% a month, nearest whole point, compound."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-4 flex items-start gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "mt-1 size-4",
								checked: rewards,
								onChange: (e) => setRewards(e.target.checked)
							}), "I approve these reward amounts and I understand points have no cash value."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-2 flex items-start gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "mt-1 size-4",
								checked: interest,
								onChange: (e) => setInterest(e.target.checked)
							}), "I approve 1% monthly virtual interest."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: () => setStep(0),
								children: "Back"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn",
								onClick: () => setStep(2),
								children: "Continue"
							})]
						})
					] }) : null,
					step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-3xl",
							children: "How should we start?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `panel p-4 text-left ${demo ? "ring-2 ring-action" : ""}`,
								onClick: () => setDemo(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Demonstration cohort" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Fictional learners, a real ledger, and an interest example of 1,000 points. Remove it before any real children are registered."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `panel p-4 text-left ${!demo ? "ring-2 ring-action" : ""}`,
								onClick: () => setDemo(false),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Empty programme" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Add schools, classes and teachers, then register or import learners. The 2026 public-school calendar is already loaded for you to edit."
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted",
							children: "Children's information needs a lawful basis under POPIA. This setup is not legal advice. Have a South African privacy practitioner review a real rollout."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: () => setStep(1),
								children: "Back"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn",
								onClick: finish,
								children: "Open Pendula"
							})]
						})
					] }) : null
				]
			})]
		})
	});
}
function LockScreen() {
	const db = usePendula((s) => s.db);
	const signInStaff = usePendula((s) => s.signInStaff);
	const signInLearner = usePendula((s) => s.signInLearner);
	const signInParent = usePendula((s) => s.signInParent);
	const [mode, setMode] = (0, import_react.useState)("staff");
	const [id, setId] = (0, import_react.useState)(db.staff.find((s) => s.role === "admin" && s.active)?.id || "");
	const [pin, setPin] = (0, import_react.useState)("");
	const submit = () => {
		const error = mode === "staff" ? signInStaff(id, pin) : mode === "learner" ? signInLearner(id, pin) : signInParent(id, pin);
		if (error) toast.error(error);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "display text-3xl",
					children: db.org.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: formatSaLong(isoDate(/* @__PURE__ */ new Date()))
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display text-2xl",
						children: "Who is using this device?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2",
						children: [
							"staff",
							"learner",
							"parent"
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `btn ${mode === item ? "" : "btn-ghost"}`,
							onClick: () => {
								setMode(item);
								setId("");
								setPin("");
							},
							children: item[0].toUpperCase() + item.slice(1)
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: mode === "staff" ? "Staff member" : mode === "learner" ? "Learner" : "Parent or guardian",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "field",
								value: id,
								onChange: (e) => setId(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Choose"
									}),
									mode === "staff" ? db.staff.filter((s) => s.active).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: s.id,
										children: [
											s.name,
											" · ",
											s.role
										]
									}, s.id)) : null,
									mode === "learner" ? db.learners.filter((l) => l.status === "active").map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: l.id,
										children: [
											learnerLabel(l),
											" · ",
											l.id
										]
									}, l.id)) : null,
									mode === "parent" ? db.parents.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: p.id,
										children: p.name
									}, p.id)) : null
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: mode === "learner" ? "Portal code" : "PIN",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									type: "password",
									inputMode: "numeric",
									value: pin,
									onChange: (e) => setPin(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Enter") submit();
									}
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn mt-4 w-full",
						onClick: submit,
						children: "Unlock"
					}),
					db.org.demoCohort ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Demonstration codes — remove before real learner data" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2",
							children: "Teachers: Jabu 1111, Elmarie 2222, Thabo 3333, Fatima 4444. Parents: Nokuthula 5081, Tshepo 5082, Bongani 5083. Learner portal codes are on each profile after you sign in as administrator. Your administrator PIN is the one you chose during setup."
						})]
					}) : null
				]
			})]
		})
	});
}
function Shell() {
	const db = usePendula((s) => s.db);
	const session = usePendula((s) => s.session);
	const nav = usePendula((s) => s.nav);
	const setNav = usePendula((s) => s.setNav);
	const theme = usePendula((s) => s.theme);
	const setTheme = usePendula((s) => s.setTheme);
	const lock = usePendula((s) => s.lock);
	const previewRole = usePendula((s) => s.previewRole);
	const returnToAdmin = usePendula((s) => s.returnToAdmin);
	const markNoticesRead = usePendula((s) => s.markNoticesRead);
	const [more, setMore] = (0, import_react.useState)(false);
	const [online, setOnline] = (0, import_react.useState)(true);
	const [who, setWho] = (0, import_react.useState)(false);
	const items = NAV.filter((item) => item.roles.includes(session.role));
	const unread = db.notifications.filter((n) => n.audience === session.role && !n.read).length;
	const sound = integrityOk(db);
	(0, import_react.useEffect)(() => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-brand px-3 py-4 text-on-brand lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "display text-2xl leading-none",
							children: "Pendula"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-brand-muted",
							children: "Learn. Grow. Earn. Thrive."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-6 flex flex-1 flex-col gap-1 overflow-y-auto",
						"aria-label": "Primary",
						children: items.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "nav-btn",
								"data-active": nav === item.id,
								onClick: () => setNav(item.id),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										"aria-hidden": true
									}),
									item.label,
									item.id === "approvals" && db.deductions.some((d) => d.status === "pending") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto rounded-full bg-gold px-2 text-xs text-on-gold",
										children: db.deductions.filter((d) => d.status === "pending").length
									}) : null
								]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 text-xs text-brand-muted",
						children: "Virtual points only. Not a bank."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:pl-64",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-paper/95 px-3 py-3 backdrop-blur",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm text-muted",
									children: db.org.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-semibold",
									children: identity
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "btn btn-ghost px-3",
								"aria-label": "Notifications",
								onClick: () => {
									setNav("insights");
									markNoticesRead();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: unread
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost px-3",
								"aria-label": "Switch appearance",
								onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
								children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
							}),
							(session.role === "admin" || session.returnStaffId) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost hidden sm:inline-flex",
								onClick: () => setWho(true),
								children: "View as"
							}),
							session.returnStaffId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-quiet hidden sm:inline-flex",
								onClick: returnToAdmin,
								children: "Return"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost px-3",
								onClick: lock,
								"aria-label": "Lock",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" })
							})
						]
					}),
					!online ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "bg-gold-soft px-4 py-2 text-sm text-ink",
						children: "Offline. This device still has the register and the ledger. Another computer will not see it until you export a backup."
					}) : null,
					!sound ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "bg-danger-soft px-4 py-2 text-sm",
						children: "Ledger integrity check failed. Restore a backup before you trust these balances."
					}) : null,
					!db.org.rewardsLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "bg-gold-soft px-4 py-2 text-sm",
						children: "Rewards are paused. Attendance and marks can still be recorded. Points post after an administrator approves the policy."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "px-3 py-4 pb-24 sm:px-6 lg:pb-8",
						children: [
							nav === "today" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Today, {}) : null,
							nav === "learners" || nav === "learner" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Learners, {}) : null,
							nav === "attendance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Attendance, {}) : null,
							nav === "assessments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Assessments, {}) : null,
							nav === "reading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reading, {}) : null,
							nav === "bank" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bank, {}) : null,
							nav === "approvals" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Approvals, {}) : null,
							nav === "insights" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Insights, {}) : null,
							nav === "reports" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reports, {}) : null,
							nav === "manuals" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Manuals, {}) : null,
							nav === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsView, {}) : null
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-card lg:hidden",
				"aria-label": "Mobile",
				children: [items.slice(0, 4).map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `flex min-h-14 flex-1 flex-col items-center justify-center text-xs ${nav === item.id ? "text-action" : "text-muted"}`,
						onClick: () => setNav(item.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), item.label]
					}, item.id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex min-h-14 flex-1 flex-col items-center justify-center text-xs text-muted",
					onClick: () => setMore(true),
					children: "More"
				})]
			}),
			more ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-30 bg-brand/40 lg:hidden",
				onClick: () => setMore(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel absolute inset-x-3 bottom-3 p-3",
					onClick: (e) => e.stopPropagation(),
					role: "menu",
					children: [items.slice(4).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "nav-btn text-ink",
						onClick: () => {
							setNav(item.id);
							setMore(false);
						},
						children: item.label
					}, item.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "nav-btn text-ink",
						onClick: () => {
							setWho(true);
							setMore(false);
						},
						children: "View as"
					})]
				})
			}) : null,
			who ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Who, {
				onClose: () => setWho(false),
				onPick: (next) => {
					previewRole(next);
					setWho(false);
				}
			}) : null
		]
	});
}
function describeSession(staff, learners, parents, session) {
	if (session.role === "admin" || session.role === "teacher") return staff.find((s) => s.id === session.staffId)?.name || "Staff";
	if (session.role === "learner") {
		const learner = learners.find((l) => l.id === session.learnerId);
		return learner ? `${learner.preferredName || learner.firstName} ${learner.surname}` : "Learner";
	}
	return parents.find((p) => p.id === session.parentId)?.name || "Parent";
}
function Who({ onClose, onPick }) {
	const db = usePendula((s) => s.db);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-brand/50 p-3 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel max-h-[80vh] w-full max-w-lg overflow-y-auto p-5",
			role: "dialog",
			"aria-label": "View as",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-2xl",
						children: "View as"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						onClick: onClose,
						children: "Close"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "An administrator can preview another role. The preview uses that role's limits. This is a device control, not a substitute for separate accounts on a shared cloud."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-4 font-semibold",
					children: "Staff"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid gap-2",
					children: db.staff.filter((s) => s.active).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "btn btn-ghost justify-start",
						onClick: () => onPick({
							role: s.role,
							staffId: s.id
						}),
						children: [
							s.name,
							" · ",
							s.role
						]
					}, s.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-4 font-semibold",
					children: "Learners"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid gap-2",
					children: db.learners.filter((l) => l.status === "active").slice(0, 8).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "btn btn-ghost justify-start",
						onClick: () => onPick({
							role: "learner",
							learnerId: l.id
						}),
						children: [
							learnerLabel(l),
							" · Grade ",
							l.grade
						]
					}, l.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-4 font-semibold",
					children: "Parents"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid gap-2",
					children: db.parents.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost justify-start",
						onClick: () => onPick({
							role: "parent",
							parentId: p.id
						}),
						children: p.name
					}, p.id))
				})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendulaApp, {});
}
//#endregion
export { Home as component };
