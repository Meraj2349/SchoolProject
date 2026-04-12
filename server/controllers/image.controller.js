import fs from "fs";
import { t } from "../config/i18n.js";
import * as ImageService from "../services/image.service.js";

export const uploadImage = async (req, res) => {
  const lang = req.language;
  try {
    if (!req.file) {
      return res.status(400).json({ message: t("no_file_uploaded", lang) });
    }

    const { description, imageType, studentId, teacherId, associatedId } =
      req.body;
    if (!imageType) {
      return res.status(400).json({ message: t("image_type_required", lang) });
    }

    if (imageType === "student" && !studentId) {
      return res.status(400).json({ message: t("student_id_required", lang) });
    }
    if (imageType === "teacher" && !teacherId) {
      return res.status(400).json({ message: t("teacher_id_required", lang) });
    }

    const image = await ImageService.uploadImage(req.file, {
      Description: description,
      ImageType: imageType,
      StudentID: studentId,
      TeacherID: teacherId,
      AssociatedID: associatedId,
    });

    fs.unlinkSync(req.file.path);
    res.status(201).json(image);
  } catch (error) {
    console.error("Upload error:", error);
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, imageType, studentId, teacherId, associatedId } =
      req.body;

    const updatedImage = await ImageService.updateImageData(id, {
      Description: description,
      ImageType: imageType,
      StudentID: studentId,
      TeacherID: teacherId,
      AssociatedID: associatedId,
    });

    res.status(200).json(updatedImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const replaceImageFile = async (req, res) => {
  const lang = req.language;
  try {
    if (!req.file) {
      return res.status(400).json({ message: t("no_file_uploaded", lang) });
    }

    const { id } = req.params;
    const updatedImage = await ImageService.replaceImage(id, req.file);

    fs.unlinkSync(req.file.path);
    res.status(200).json(updatedImage);
  } catch (error) {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;
    await ImageService.deleteImage(id);
    res.status(200).json({ message: t("image_deleted", lang) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getImagesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const images = await ImageService.getImagesByType(type);
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getImage = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;
    const image = await ImageService.getImageDetails(id);
    if (!image) {
      return res.status(404).json({ message: t("image_not_found", lang) });
    }
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getImagesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const images = await ImageService.getImagesByStudentId(studentId);
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getImagesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const images = await ImageService.getImagesByTeacherId(teacherId);
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllImagesWithDetails = async (req, res) => {
  try {
    const { type } = req.query;
    const images = await ImageService.getImagesWithDetails(type);
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
