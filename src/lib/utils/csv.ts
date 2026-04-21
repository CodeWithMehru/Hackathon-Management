function escapeCsv(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(
  headers: string[],
  rows: Array<Record<string, unknown>>
) {
  const lines: string[] = [];
  lines.push(headers.map(escapeCsv).join(","));
  for (const r of rows) {
    lines.push(headers.map((h) => escapeCsv(r[h])).join(","));
  }
  return lines.join("\n") + "\n";
}

