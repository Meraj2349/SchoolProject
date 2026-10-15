import fs from "fs";
import {
  getChairmanProfile,
  getChairmanImagePublicId,
  updateChairmanProfile,
} from "../models/chairman.model.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.config.js";

// GET /api/chairman  — public
export const getChairmanProfileController = async (req, res) => {
  try {
    const profile = await getChairmanProfile();
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("Error fetching chairman profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/chairman  — protected (auth middleware applied in route)
export const updateChairmanProfileController = async (req, res) => {
  try {
    const {
      name_en, name_bn,
      title_en, title_bn,
      institution_en, institution_bn,
    } = req.body;

    const fields = {};
    if (name_en !== undefined)        fields.name_en = name_en;
    if (name_bn !== undefined)        fields.name_bn = name_bn;
    if (title_en !== undefined)       fields.title_en = title_en;
    if (title_bn !== undefined)       fields.title_bn = title_bn;
    if (institution_en !== undefined) fields.institution_en = institution_en;
    if (institution_bn !== undefined) fields.institution_bn = institution_bn;

    // Handle image upload. Upload first: if it fails, the current photo stays.
    const oldPublicId = req.file ? await getChairmanImagePublicId() : null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "chairman");
      fields.image_url = result.secure_url;
      fields.image_public_id = result.public_id;

      // Remove temp file
      fs.unlinkSync(req.file.path);
    }

    await updateChairmanProfile(fields);

    // The profile now points at the new photo; remove the old one.
    if (oldPublicId && fields.image_public_id) {
      await deleteFromCloudinary(oldPublicId).catch(() => {});
    }

    const updated = await getChairmanProfile();
    res.status(200).json({
      success: true,
      message: "Chairman profile updated successfully",
      data: updated,
    });
  } catch (error) {
    // Clean up uploaded file if DB update failed
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error updating chairman profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
