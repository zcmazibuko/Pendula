import type { Statement } from "./types.ts";

export function toCsv(rows: (string | number)[][]): string {
  const lines = rows.map((row) => row.map(csvCell).join(","));
  return `\uFEFF${lines.join("\r\n")}`;
}

function csvCell(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function downloadText(filename: string, content: string, type = "text/csv;charset=utf-8"): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function statementCsv(statement: Statement): string {
  const rows: (string | number)[][] = [
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
    ["Date", "Transaction", "Credit", "Debit", "Balance"],
    ...statement.lines.map((line) => [
      line.date,
      line.description,
      line.credit || "",
      line.debit || "",
      line.balance,
    ]),
    [],
    ["Closing balance", statement.closing],
  ];
  return toCsv(rows);
}

/** Minimal single-font PDF, enough for a reconciled statement. */
export function statementPdf(statement: Statement): Uint8Array {
  const lines: string[] = [
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
    "Date        Transaction                                      Credit   Debit   Balance",
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

export function downloadPdf(filename: string, bytes: Uint8Array): void {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function simplePdf(lines: string[]): Uint8Array {
  const escaped = lines.map((line) =>
    line.replace(/[^\x20-\x7E]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"),
  );
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
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
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
