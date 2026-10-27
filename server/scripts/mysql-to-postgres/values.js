// How each value moves from MySQL to PostgreSQL, and the canonical form both
// sides are compared in. Types are PostgreSQL's information_schema data_type
// of the target column.
//
// MySQL is read with dateStrings, bigNumberStrings and its session time_zone
// set to `offset`, so DATETIME and TIMESTAMP both arrive as wall-clock text
// ("2026-10-27 08:15:00") in that offset.

const TIMESTAMP = "timestamp with time zone";

/** "+06:00" from MySQL's TIMEDIFF(NOW(), UTC_TIMESTAMP()) ("06:00:00") or an offset. */
export function formatOffset(text) {
  const match = /^([+-]?)(\d{1,2}):(\d{2})(?::00)?$/.exec(String(text).trim());
  if (!match) throw new Error(`"${text}" is not a UTC offset like +06:00`);
  return `${match[1] || "+"}${match[2].padStart(2, "0")}:${match[3]}`;
}

const wallClockToInstant = (text, offset) => `${text}${offset}`;

/** The parameter to insert into PostgreSQL for a value read from MySQL. */
export function toPostgres(value, type, offset) {
  if (value === null || value === undefined) return null;
  switch (type) {
    case "boolean":
      return Number(value) !== 0;
    case "jsonb":
    case "json":
      // An object would be sent as-is, and an array as a PostgreSQL array.
      return typeof value === "string" ? value : JSON.stringify(value);
    case TIMESTAMP:
      return wallClockToInstant(value, offset);
    default:
      return value;
  }
}

/** A value read from MySQL, in the form verify compares. */
export function fromMysql(value, type, offset) {
  if (value === null || value === undefined) return null;
  switch (type) {
    case TIMESTAMP:
      return String(Date.parse(wallClockToInstant(value, offset).replace(" ", "T")));
    case "jsonb":
    case "json":
      return canonicalJson(typeof value === "string" ? JSON.parse(value) : value);
    default:
      return common(value, type);
  }
}

/** A value read from PostgreSQL (pg's default parsers, DATE as text), in the form verify compares. */
export function fromPostgres(value, type) {
  if (value === null || value === undefined) return null;
  switch (type) {
    case TIMESTAMP:
      return String(value.getTime());
    case "jsonb":
    case "json":
      return canonicalJson(value);
    default:
      return common(value, type);
  }
}

function common(value, type) {
  switch (type) {
    case "boolean":
      return value === true || (value !== false && Number(value) !== 0) ? "1" : "0";
    case "numeric":
      return canonicalDecimal(String(value));
    case "character":
      // PostgreSQL pads CHAR(n) with spaces; MySQL strips them when reading.
      return String(value).replace(/ +$/, "");
    default:
      return String(value);
  }
}

function canonicalDecimal(text) {
  const trimmed = text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
  return trimmed === "-0" ? "0" : trimmed;
}

function canonicalJson(value) {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])]),
    );
  }
  return value;
}

/** One row as text, in column order; equal rows give equal text on both sides. */
export function canonicalRow(row, columns, side, offset) {
  return JSON.stringify(
    columns.map(({ name, type }) =>
      side === "mysql" ? fromMysql(row[name], type, offset) : fromPostgres(row[name], type),
    ),
  );
}
