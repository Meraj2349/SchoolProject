import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../../config/cloudinary.config.js";

// Cloudinary adapter for the image storage port used by use cases.
export const cloudinaryImageStorage = {
  async upload(filePath, folder) {
    const result = await uploadToCloudinary(filePath, folder);
    return { url: result.secure_url, publicId: result.public_id };
  },
  remove: (publicId) => deleteFromCloudinary(publicId),
};
