/**
 * branchFilter — builds a safe WHERE/AND fragment for branch scoping.
 *
 * Usage in a model:
 *   const { clause, params } = branchFilter(branchId);
 *   const sql = `SELECT * FROM Students WHERE 1=1 ${clause}`;
 *   const { rows } = await db.query(sql, [...params]);
 *
 * @param {number|null} branchId  null = super_admin (no filter), number = branch_admin
 * @param {string}      tableAlias  optional table alias prefix (e.g. "s" → "s.branch_id")
 * @returns {{ clause: string, params: Array }}
 */
export function branchFilter(branchId, tableAlias = "") {
  const col = tableAlias ? `${tableAlias}.branch_id` : "branch_id";
  if (branchId == null) return { clause: "", params: [] };
  return { clause: `AND ${col} = ?`, params: [branchId] };
}

/**
 * branchOrSchoolFilter — like branchFilter, for rows that belong to one branch
 * or to the whole school (branch_id NULL), such as website content: a chosen
 * branch sees its own rows plus the whole-school ones.
 */
export function branchOrSchoolFilter(branchId, tableAlias = "") {
  const col = tableAlias ? `${tableAlias}.branch_id` : "branch_id";
  if (branchId == null) return { clause: "", params: [] };
  return { clause: `AND (${col} = ? OR ${col} IS NULL)`, params: [branchId] };
}
