import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.config.js";
import * as ImageModel from "../models/image.model.js";

export const uploadImage = async (file, imageData) => {
  const result = await uploadToCloudinary(file.path, `school/${imageData.ImageType}s`);
  
  const image = await ImageModel.createImage({
    ImagePath: result.secure_url,
    PublicID: result.public_id,
    Description: imageData.Description,
    ImageType: imageData.ImageType
  });

  return image;
};

export const updateImageData = async (id, updateData) => {
  return await ImageModel.updateImage(id, updateData);
};

export const replaceImage = async (id, file) => {
  const existingImage = await ImageModel.getImageById(id);
  if (!existingImage) throw new Error('Image not found');

  // Upload new image
  const result = await uploadToCloudinary(file.path, `school/${existingImage.ImageType}s`);
  
  // Update database
  const updatedImage = await ImageModel.updateImage(id, {
    ImagePath: result.secure_url,
    PublicID: result.public_id,
    Description: existingImage.Description,
    ImageType: existingImage.ImageType
  });

  // Delete old image from Cloudinary
  await deleteFromCloudinary(existingImage.PublicID);

  return updatedImage;
};

export const deleteImage = async (id) => {
  const image = await ImageModel.getImageById(id);
  if (!image) throw new Error('Image not found');

  await deleteFromCloudinary(image.PublicID);
  await ImageModel.deleteImage(id);

  return true;
};

export const getImagesByType = async (type) => {
  return await ImageModel.getImagesByType(type);
};

export const getImageDetails = async (id) => {
  return await ImageModel.getImageById(id);
};