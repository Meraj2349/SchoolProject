// Minimal RFC 4180 CSV reader: quoted fields, doubled quotes, commas and line
// breaks inside quotes, CRLF and a UTF-8 byte-order mark. Returns one object
// per record, keyed by the header row.

function parseRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === "") {
      quoted = true; // a quote opens a quoted field only at its start
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseCsv(text) {
  const [header = [], ...records] = parseRows(text.replace(/^﻿/, ""));
  return records
    .filter((record) => record.some((cell) => cell.trim() !== ""))
    .map((record) => Object.fromEntries(header.map((name, i) => [name.trim(), record[i] ?? ""])));
}
