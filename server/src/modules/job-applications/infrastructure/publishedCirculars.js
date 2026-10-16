import db from "../../../../config/db.config.js";
import { jobCircular } from "../../content/domain/jobCircular.js";

/** The circulars port: a published circular as the website shows it (posts, accepting), or null. */
export const publishedCirculars = {
  async find(id) {
    const [rows] = await db.query("SELECT * FROM JobCirculars WHERE id = ? AND is_published = TRUE", [id]);
    return rows[0] ? jobCircular.present(rows[0]) : null;
  },
};
