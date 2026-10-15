import fs from "fs";
import multer from "multer";
import path from "path";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = /^\.(jpe?g|png|gif|webp)$/;
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

/**
 * Multer middleware factory that keeps uploaded images in `dir` (served from
 * public/uploads), named "<prefix>-<unique>.<ext>". Upload folders are
 * git-ignored, so the folder is created here — multer will not.
 */
export function makeLocalImageUpload({ dir, prefix }) {
  fs.mkdirSync(dir, { recursive: true });
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dir),
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${prefix}-${unique}${path.extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: MAX_IMAGE_BYTES },
    fileFilter: (_req, file, cb) => {
      const isImage = IMAGE_EXTENSIONS.test(path.extname(file.originalname).toLowerCase()) && IMAGE_TYPES.includes(file.mimetype);
      if (isImage) return cb(null, true);
      cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed"));
    },
  });
}
