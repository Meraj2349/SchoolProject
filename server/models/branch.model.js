import db from "../config/db.config.js";

// Get all branches
export const getAllBranches = async () => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name_bn,
        name_en,
        description_bn,
        description_en,
        image_url,
        latitude,
        longitude,
        address_bn,
        address_en,
        is_proposed,
        established_date,
        created_at,
        updated_at
      FROM Branches
      ORDER BY created_at DESC
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching branches: " + err.message);
  }
};

// Get branch by ID
export const getBranchById = async (id) => {
  try {
    if (!id) {
      throw new Error("Branch ID is required");
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        name_bn,
        name_en,
        description_bn,
        description_en,
        image_url,
        image_public_id,
        latitude,
        longitude,
        address_bn,
        address_en,
        is_proposed,
        established_date,
        created_at,
        updated_at
      FROM Branches
      WHERE id = ?
      `,
      [id],
    );

    return rows[0] || null;
  } catch (err) {
    throw new Error("Error fetching branch by ID: " + err.message);
  }
};

// Create a new branch
export const createBranch = async (data) => {
  try {
    const {
      name_bn,
      name_en,
      description_bn,
      description_en,
      image_url,
      image_public_id,
      latitude,
      longitude,
      address_bn,
      address_en,
      is_proposed,
      established_date,
    } = data;

    if (!name_bn && !name_en) {
      throw new Error(
        "At least one branch name (name_bn or name_en) is required",
      );
    }

    const [result] = await db.query(
      `
      INSERT INTO Branches (
        name_bn, name_en, description_bn, description_en,
        image_url, image_public_id, latitude, longitude,
        address_bn, address_en, is_proposed, established_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name_bn || null,
        name_en || null,
        description_bn || null,
        description_en || null,
        image_url || null,
        image_public_id || null,
        latitude !== undefined ? latitude : null,
        longitude !== undefined ? longitude : null,
        address_bn || null,
        address_en || null,
        is_proposed !== undefined ? is_proposed : false,
        established_date || null,
      ],
    );

    return {
      success: true,
      id: result.insertId,
      data: {
        id: result.insertId,
        name_bn: name_bn || null,
        name_en: name_en || null,
        description_bn: description_bn || null,
        description_en: description_en || null,
        image_url: image_url || null,
        latitude: latitude !== undefined ? latitude : null,
        longitude: longitude !== undefined ? longitude : null,
        address_bn: address_bn || null,
        address_en: address_en || null,
        is_proposed: is_proposed !== undefined ? is_proposed : false,
        established_date: established_date || null,
      },
    };
  } catch (err) {
    throw new Error("Error creating branch: " + err.message);
  }
};

// Update a branch by ID
export const updateBranch = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Branch ID is required");
    }

    // Check if branch exists
    const existing = await getBranchById(id);
    if (!existing) {
      throw new Error("Branch not found");
    }

    const allowedFields = [
      "name_bn",
      "name_en",
      "description_bn",
      "description_en",
      "image_url",
      "image_public_id",
      "latitude",
      "longitude",
      "address_bn",
      "address_en",
      "is_proposed",
      "established_date",
    ];

    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    params.push(id);
    const [result] = await db.query(
      `UPDATE Branches SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    if (result.affectedRows === 0) {
      throw new Error("No rows were updated");
    }

    return {
      success: true,
      message: "Branch updated successfully",
      affectedRows: result.affectedRows,
    };
  } catch (err) {
    throw new Error("Error updating branch: " + err.message);
  }
};

// Delete a branch by ID
export const deleteBranch = async (id) => {
  try {
    if (!id) {
      throw new Error("Branch ID is required");
    }

    const branch = await getBranchById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }

    const [result] = await db.query(`DELETE FROM Branches WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      throw new Error("No branch was deleted");
    }

    return {
      success: true,
      message: "Branch deleted successfully",
      deletedBranch: branch,
    };
  } catch (err) {
    throw new Error("Error deleting branch: " + err.message);
  }
};

// Get per-branch stats: student count, teacher count
export const getBranchStats = async () => {
  try {
    // Fetch all branches
    const [branches] = await db.query(`
      SELECT id, name_bn, name_en, is_proposed, established_date, image_url
      FROM Branches
      ORDER BY created_at DESC
    `);

    if (branches.length === 0) return [];

    // Student counts per branch
    const [studentCounts] = await db.query(`
      SELECT branch_id, COUNT(*) AS total
      FROM Students
      WHERE branch_id IS NOT NULL
      GROUP BY branch_id
    `);

    // Teacher counts per branch
    const [teacherCounts] = await db.query(`
      SELECT branch_id, COUNT(*) AS total
      FROM Teachers
      WHERE branch_id IS NOT NULL
      GROUP BY branch_id
    `);

    // Class counts per branch
    const [classCounts] = await db.query(`
      SELECT branch_id, COUNT(*) AS total
      FROM Classes
      WHERE branch_id IS NOT NULL
      GROUP BY branch_id
    `);

    const studentMap = Object.fromEntries(
      studentCounts.map((r) => [r.branch_id, Number(r.total)])
    );
    const teacherMap = Object.fromEntries(
      teacherCounts.map((r) => [r.branch_id, Number(r.total)])
    );
    const classMap = Object.fromEntries(
      classCounts.map((r) => [r.branch_id, Number(r.total)])
    );

    return branches.map((b) => ({
      id: b.id,
      name_bn: b.name_bn,
      name_en: b.name_en,
      is_proposed: b.is_proposed,
      established_date: b.established_date,
      image_url: b.image_url,
      studentCount: studentMap[b.id] ?? 0,
      teacherCount: teacherMap[b.id] ?? 0,
      classCount: classMap[b.id] ?? 0,
    }));
  } catch (err) {
    throw new Error("Error fetching branch stats: " + err.message);
  }
};
