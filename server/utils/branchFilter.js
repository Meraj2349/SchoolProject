/**
 * branchFilter — builds a safe WHERE/AND fragment for branch scoping.
 *
 * Usage in a model:
 *   const { clause, params } = branchFilter(branchId);
 *   const sql = `SELECT * FROM Students WHERE 1=1 ${clause}`;
 *   const [rows] = await db.query(sql, [...params]);
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
