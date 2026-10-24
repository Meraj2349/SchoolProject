// The app writes `?` placeholders (MySQL style); PostgreSQL wants $1, $2, …
// A `?` inside a string, a quoted identifier or a comment is not a placeholder.
export function toPositional(sql) {
  let out = "";
  let n = 0;
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    const next = sql[i + 1];
    if (c === "'" || c === '"') {
      // Quoted text runs to the closing quote; a doubled quote is an escaped one.
      let j = i + 1;
      while (j < sql.length && !(sql[j] === c && sql[j + 1] !== c)) j += sql[j] === c ? 2 : 1;
      out += sql.slice(i, j + 1);
      i = j + 1;
    } else if (c === "-" && next === "-") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? sql.length : end;
      out += sql.slice(i, stop);
      i = stop;
    } else if (c === "/" && next === "*") {
      const end = sql.indexOf("*/", i + 2);
      const stop = end === -1 ? sql.length : end + 2;
      out += sql.slice(i, stop);
      i = stop;
    } else if (c === "?") {
      n += 1;
      out += `$${n}`;
      i += 1;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}
