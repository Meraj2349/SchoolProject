import db, { assignments, insertList } from "../../../shared/db/index.js";
import { branchOrSchoolFilter } from "../../../../utils/branchFilter.js";

// Images with the name of the student or teacher they show.
const DETAILS = `
  SELECT i.*,
         s."FirstName" AS "StudentFirstName", s."LastName" AS "StudentLastName", s."RollNumber",
         t."FirstName" AS "TeacherFirstName", t."LastName" AS "TeacherLastName", t."Subject"
    FROM "Images" i
    LEFT JOIN "Students" s ON s."StudentID" = i."StudentID"
    LEFT JOIN "Teachers" t ON t."TeacherID" = i."TeacherID"`;

export const postgresGalleryRepository = {
  async list({ branchId, type, studentId, teacherId }) {
    const { clause, params } = branchOrSchoolFilter(branchId, "i");
    const filters = [
      [`i."ImageType" = ?`, type && type !== "all" ? type : null],
      [`i."StudentID" = ?`, studentId],
      [`i."TeacherID" = ?`, teacherId],
    ].filter(([, value]) => value != null);
    const extra = filters.map(([condition]) => `AND ${condition}`).join(" ");
    const { rows } = await db.query(
      `${DETAILS} WHERE 1=1 ${clause} ${extra} ORDER BY i."UploadDate" DESC, i."ImageID" DESC`,
      [...params, ...filters.map(([, value]) => value)],
    );
    return rows;
  },

  async find(id) {
    const { rows } = await db.query(`${DETAILS} WHERE i."ImageID" = ?`, [id]);
    return rows[0] ?? null;
  },

  async insert(row) {
    const values = insertList(row, db.ident);
    return db.insert(`INSERT INTO "Images" ${values.sql}`, values.params, "ImageID");
  },

  async update(id, changes) {
    const set = assignments(changes, db.ident);
    await db.query(`UPDATE "Images" SET ${set.sql} WHERE "ImageID" = ?`, [...set.params, id]);
  },

  async remove(id) {
    await db.query(`DELETE FROM "Images" WHERE "ImageID" = ?`, [id]);
  },
};

const PEOPLE = { student: `SELECT branch_id FROM "Students" WHERE "StudentID" = ?`, teacher: `SELECT branch_id FROM "Teachers" WHERE "TeacherID" = ?` };

export const postgresPeople = {
  async branchOf(kind, id) {
    const { rows } = await db.query(PEOPLE[kind], [id]);
    return rows[0]?.branch_id ?? null;
  },
};
