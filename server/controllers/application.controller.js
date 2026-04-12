import { t } from "../config/i18n.js";
import {
  createApplication,
  deleteApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
} from "../models/application.model.js";

const VALID_STATUSES = ["pending", "reviewed", "accepted", "rejected"];

// PUBLIC — submit a new application
const submitApplicationController = async (req, res) => {
  const lang = req.language;
  try {
    const {
      applicant_name,
      date_of_birth,
      gender,
      applying_for_class,
      parent_name,
      parent_contact,
    } = req.body;

    if (
      !applicant_name ||
      !date_of_birth ||
      !gender ||
      !applying_for_class ||
      !parent_name ||
      !parent_contact
    ) {
      return res.status(400).json({
        success: false,
        message: t("application_all_required", lang),
      });
    }

    const result = await createApplication(req.body);

    res.status(201).json({
      success: true,
      message: t("application_submitted", lang),
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PROTECTED — get all applications (admin)
const getAllApplicationsController = async (req, res) => {
  try {
    const applications = await getAllApplications();
    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PROTECTED — get single application by id
const getApplicationByIdController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: t("application_not_found", lang),
      });
    }

    const application = await getApplicationById(parseInt(id));

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: t("application_not_found", lang),
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PROTECTED — update application status only
const updateApplicationStatusController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: t("application_not_found", lang),
      });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: t("application_invalid_status", lang),
      });
    }

    const result = await updateApplicationStatus(parseInt(id), status);

    res.status(200).json({
      success: true,
      message: t("application_status_updated", lang),
      data: result,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: t("application_not_found", lang),
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PROTECTED — delete an application
const deleteApplicationController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: t("application_not_found", lang),
      });
    }

    await deleteApplication(parseInt(id));

    res.status(200).json({
      success: true,
      message: t("application_deleted", lang),
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: t("application_not_found", lang),
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  submitApplicationController,
  getAllApplicationsController,
  getApplicationByIdController,
  updateApplicationStatusController,
  deleteApplicationController,
};
