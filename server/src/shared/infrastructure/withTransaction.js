import db from "../../../config/db.config.js";

/** Runs `work(connection)` in one MySQL transaction: all of it is saved, or none. */
export async function withTransaction(work) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
