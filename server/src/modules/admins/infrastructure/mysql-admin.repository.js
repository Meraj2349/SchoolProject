import db from "../../../../config/db.config.js";

// MySQL adapter for the admin repository port. Maps Admin rows to
// { id, username, email, role, branchId, branchName, password? }.

const SELECT_ADMIN = `
  SELECT a.AdminID, a.Username, a.Email, a.role, a.branch_id,
         COALESCE(b.name_en, b.name_bn) AS branch_name
  FROM Admin a
  LEFT JOIN Branches b ON b.id = a.branch_id`;

const toAdmin = (row) => ({
  id: row.AdminID,
  username: row.Username,
  email: row.Email,
  role: row.role,
  branchId: row.branch_id,
  branchName: row.branch_name ?? null,
});

const COLUMNS = {
  username: "Username",
  email: "Email",
  password: "Password",
  role: "role",
  branchId: "branch_id",
};

export const mysqlAdminRepository = {
  async findAll() {
    const [rows] = await db.query(
      `${SELECT_ADMIN} ORDER BY a.role = 'super_admin' DESC, branch_name, a.Username, a.AdminID`,
    );
    return rows.map(toAdmin);
  },

  async findById(id) {
    const [rows] = await db.query(`${SELECT_ADMIN} WHERE a.AdminID = ?`, [id]);
    return rows[0] ? toAdmin(rows[0]) : null;
  },

  // Same lookup the login uses: email + role + branch (NULL-safe).
  async findByLogin({ email, role, branchId }) {
    const [rows] = await db.query(`${SELECT_ADMIN} WHERE a.Email = ? AND a.role = ? AND a.branch_id <=> ?`, [
      email,
      role,
      branchId,
    ]);
    return rows.map(toAdmin);
  },

  async countSuperAdmins() {
    const [[row]] = await db.query("SELECT COUNT(*) AS total FROM Admin WHERE role = 'super_admin'");
    return Number(row.total);
  },

  async create({ username, email, password, role, branchId }) {
    const [result] = await db.query(
      "INSERT INTO Admin (Username, Email, Password, role, branch_id) VALUES (?, ?, ?, ?, ?)",
      [username, email, password, role, branchId],
    );
    return mysqlAdminRepository.findById(result.insertId);
  },

  async update(id, changes) {
    const fields = Object.keys(COLUMNS).filter((key) => changes[key] !== undefined);
    if (fields.length === 0) return;
    await db.query(`UPDATE Admin SET ${fields.map((key) => `${COLUMNS[key]} = ?`).join(", ")} WHERE AdminID = ?`, [
      ...fields.map((key) => changes[key]),
      id,
    ]);
  },

  async remove(id) {
    await db.query("DELETE FROM Admin WHERE AdminID = ?", [id]);
  },
};
