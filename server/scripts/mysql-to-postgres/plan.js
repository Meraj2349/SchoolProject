// What to copy, and in which order.

/**
 * Tables ordered so each comes after the tables its foreign keys reference
 * (alphabetical among equals, so every run copies in the same order).
 * `foreignKeys` is [{ table, references }].
 */
export function copyOrder(tables, foreignKeys) {
  const needs = new Map(tables.map((table) => [table, new Set()]));
  for (const { table, references } of foreignKeys) {
    if (table !== references && needs.has(table) && needs.has(references)) needs.get(table).add(references);
  }

  const order = [];
  const done = new Set();
  while (order.length < tables.length) {
    const ready = [...needs.keys()]
      .filter((table) => !done.has(table) && [...needs.get(table)].every((other) => done.has(other)))
      .sort();
    if (ready.length === 0) {
      const stuck = [...needs.keys()].filter((table) => !done.has(table)).sort();
      throw new Error(`Foreign keys form a cycle between: ${stuck.join(", ")}`);
    }
    for (const table of ready) {
      done.add(table);
      order.push(table);
    }
  }
  return order;
}

const RUN_MIGRATIONS = " (run the Sql/ migrations first)";

/**
 * Differences between MySQL's and PostgreSQL's tables and columns, each
 * { table: [column, ...] }. Every row and column must have a place to go,
 * and every PostgreSQL column must get its value from MySQL.
 */
export function compareSchemas(mysql, postgres) {
  const problems = [];
  const tables = [...new Set([...Object.keys(mysql), ...Object.keys(postgres)])].sort();
  for (const table of tables) {
    if (!postgres[table]) {
      problems.push(`${table}: table missing in PostgreSQL`);
      continue;
    }
    if (!mysql[table]) {
      problems.push(`${table}: table missing in MySQL${RUN_MIGRATIONS}`);
      continue;
    }
    const columns = [...new Set([...mysql[table], ...postgres[table]])].sort();
    for (const column of columns) {
      if (!postgres[table].includes(column)) problems.push(`${table}."${column}": column missing in PostgreSQL`);
      else if (!mysql[table].includes(column)) {
        problems.push(`${table}."${column}": column missing in MySQL${RUN_MIGRATIONS}`);
      }
    }
  }
  return problems;
}
