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

// `sql` is the pool, or one connection inside a transaction.
function makeRepository(sql) {
  const repository = {
    async findAll() {
      const [rows] = await sql.query(
        `${SELECT_ADMIN} ORDER BY a.role = 'super_admin' DESC, branch_name, a.Username, a.AdminID`,
      );
      return rows.map(toAdmin);
    },

    async findById(id) {
      const [rows] = await sql.query(`${SELECT_ADMIN} WHERE a.AdminID = ?`, [id]);
      return rows[0] ? toAdmin(rows[0]) : null;
    },

    // Same lookup the login uses: email + role + branch (NULL-safe).
    async findByLogin({ email, role, branchId }) {
      const [rows] = await sql.query(`${SELECT_ADMIN} WHERE a.Email = ? AND a.role = ? AND a.branch_id <=> ?`, [
        email,
        role,
        branchId,
      ]);
      return rows.map(toAdmin);
    },

    // FOR UPDATE: inside a transaction this locks the super admin rows until commit.
    async countSuperAdmins() {
      const [rows] = await sql.query("SELECT AdminID FROM Admin WHERE role = 'super_admin' FOR UPDATE");
      return rows.length;
    },

    async create({ username, email, password, role, branchId }) {
      const [result] = await sql.query(
        "INSERT INTO Admin (Username, Email, Password, role, branch_id) VALUES (?, ?, ?, ?, ?)",
        [username, email, password, role, branchId],
      );
      return repository.findById(result.insertId);
    },

    async update(id, changes) {
      const fields = Object.keys(COLUMNS).filter((key) => changes[key] !== undefined);
      if (fields.length === 0) return;
      await sql.query(`UPDATE Admin SET ${fields.map((key) => `${COLUMNS[key]} = ?`).join(", ")} WHERE AdminID = ?`, [
        ...fields.map((key) => changes[key]),
        id,
      ]);
    },

    async remove(id) {
      await sql.query("DELETE FROM Admin WHERE AdminID = ?", [id]);
    },

    // Runs `work(repository)` on one connection in a transaction.
    async transaction(work) {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const result = await work(makeRepository(connection));
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
  };
  return repository;
}

export const mysqlAdminRepository = makeRepository(db);
