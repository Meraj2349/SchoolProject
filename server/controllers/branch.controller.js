import fs from "fs";
import { t } from "../config/i18n.js";
import {
  createBranch,
  deleteBranch,
  getAllBranches,
  getBranchById,
  getBranchStats,
  updateBranch,
} from "../models/branch.model.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.config.js";

// Get all branches
export const getAllBranchesController = async (req, res) => {
  const lang = req.language;
  try {
    const branches = await getAllBranches(lang);
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    console.error("Error in getAllBranchesController:", error);
    res.status(500).json({
      success: false,
      message: t("branch_fetch_failed", lang),
      error: error.message,
    });
  }
};

// Get branch by ID
export const getBranchByIdController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: t("branch_id_required", lang) });
    }

    const branch = await getBranchById(id);

    if (!branch) {
      return res
        .status(404)
        .json({ success: false, message: t("branch_not_found", lang) });
    }

    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    console.error("Error in getBranchByIdController:", error);
    res.status(500).json({
      success: false,
      message: t("internal_server_error", lang),
      error: error.message,
    });
  }
};

// Create a new branch
export const createBranchController = async (req, res) => {
  const lang = req.language;
  try {
    const {
      name_bn,
      name_en,
      description_bn,
      description_en,
      latitude,
      longitude,
      address_bn,
      address_en,
      is_proposed,
      established_date,
    } = req.body;

    if (!name_bn && !name_en) {
      if (req.file?.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: t("branch_name_required", lang),
      });
    }

    let image_url = null;
    let image_public_id = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "school/branches");
      image_url = result.secure_url;
      image_public_id = result.public_id;
      fs.unlinkSync(req.file.path);
    }

    const branchData = {
      name_bn: name_bn || null,
      name_en: name_en || null,
      description_bn: description_bn || null,
      description_en: description_en || null,
      image_url,
      image_public_id,
      latitude: latitude !== undefined ? parseFloat(latitude) : null,
      longitude: longitude !== undefined ? parseFloat(longitude) : null,
      address_bn: address_bn || null,
      address_en: address_en || null,
      is_proposed: is_proposed === "true" || is_proposed === true,
      established_date: established_date || null,
    };

    const result = await createBranch(branchData);

    res.status(201).json({
      success: true,
      message: t("branch_created", lang),
      data: result.data,
    });
  } catch (error) {
    console.error("Error in createBranchController:", error);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {
        // ignore cleanup errors
      }
    }

    if (
      error.message.includes("required") ||
      error.message.includes("Invalid")
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: t("internal_server_error", lang),
      error: error.message,
    });
  }
};

// Update a branch
export const updateBranchController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id) {
      if (req.file?.path) fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ success: false, message: t("branch_id_required", lang) });
    }

    const {
      name_bn,
      name_en,
      description_bn,
      description_en,
      latitude,
      longitude,
      address_bn,
      address_en,
      is_proposed,
      established_date,
    } = req.body;

    const updateData = {};

    if (name_bn !== undefined) updateData.name_bn = name_bn;
    if (name_en !== undefined) updateData.name_en = name_en;
    if (description_bn !== undefined)
      updateData.description_bn = description_bn;
    if (description_en !== undefined)
      updateData.description_en = description_en;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (address_bn !== undefined) updateData.address_bn = address_bn;
    if (address_en !== undefined) updateData.address_en = address_en;
    if (is_proposed !== undefined)
      updateData.is_proposed = is_proposed === "true" || is_proposed === true;
    if (established_date !== undefined)
      updateData.established_date = established_date;

    // Handle image replacement
    if (req.file) {
      // Fetch existing branch to delete old Cloudinary image if present
      const existing = await getBranchById(id);
      if (existing && existing.image_public_id) {
        await deleteFromCloudinary(existing.image_public_id);
      }

      const result = await uploadToCloudinary(req.file.path, "school/branches");
      updateData.image_url = result.secure_url;
      updateData.image_public_id = result.public_id;
      fs.unlinkSync(req.file.path);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: t("branch_no_fields", lang),
      });
    }

    await updateBranch(id, updateData);

    res.status(200).json({
      success: true,
      message: t("branch_updated", lang),
    });
  } catch (error) {
    console.error("Error in updateBranchController:", error);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {
        // ignore cleanup errors
      }
    }

    if (error.message.includes("not found")) {
      return res
        .status(404)
        .json({ success: false, message: t("branch_not_found", lang) });
    }

    if (
      error.message.includes("required") ||
      error.message.includes("No valid fields")
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: t("internal_server_error", lang),
      error: error.message,
    });
  }
};

// Delete a branch
export const deleteBranchController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: t("branch_id_required", lang) });
    }

    // Fetch branch first so we can clean up Cloudinary image
    const existing = await getBranchById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: t("branch_not_found", lang) });
    }

    // Delete image from Cloudinary if present
    if (existing.image_public_id) {
      await deleteFromCloudinary(existing.image_public_id);
    }

    const result = await deleteBranch(id);

    res.status(200).json({
      success: true,
      message: t("branch_deleted", lang),
      data: result.deletedBranch,
    });
  } catch (error) {
    console.error("Error in deleteBranchController:", error);

    if (error.message.includes("not found")) {
      return res
        .status(404)
        .json({ success: false, message: t("branch_not_found", lang) });
    }

    res.status(500).json({
      success: false,
      message: t("internal_server_error", lang),
      error: error.message,
    });
  }
};

// Get per-branch stats (super_admin only)
export const getBranchStatsController = async (req, res) => {
  const lang = req.language;
  try {
    const stats = await getBranchStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error in getBranchStatsController:", error);
    res.status(500).json({
      success: false,
      message: t("internal_server_error", lang),
      error: error.message,
    });
  }
};
