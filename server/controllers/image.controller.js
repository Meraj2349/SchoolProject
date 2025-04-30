import * as ImageService from "../services/image.service.js";
import fs from "fs";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { description, imageType } = req.body;
    if (!imageType) {
      return res.status(400).json({ message: "Image type is required" });
    }

    const image = await ImageService.uploadImage(req.file, {
      Description: description,
      ImageType: imageType
    });

    fs.unlinkSync(req.file.path);
    res.status(201).json(image);
  } catch (error) {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, imageType } = req.body;

    const updatedImage = await ImageService.updateImageData(id, {
      Description: description,
      ImageType: imageType
    });

    res.status(200).json(updatedImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const replaceImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
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
  try {
    const { id } = req.params;
    await ImageService.deleteImage(id);
    res.status(200).json({ message: "Image deleted successfully" });
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
  try {
    const { id } = req.params;
    const image = await ImageService.getImageDetails(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};