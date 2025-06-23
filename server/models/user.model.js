import db from "../config/db.config.js";
const getAllUser = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM Users");
    return rows;
  } catch (error) {
    throw new Error("Error fetching students: " + error.message);
  }
};

export { getAllUser };
