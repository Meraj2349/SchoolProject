import fs from "fs";
import multer from "multer";
import path from "path";
import { ValidationError } from "../src/shared/errors/index.js";

const FIVE_MB = 5 * 1024 * 1024;

// What each kind of file may be called and declared as. Both must match.
const FILE_TYPES = {
  jpg: { extensions: [".jpg", ".jpeg"], mimetypes: ["image/jpeg", "image/jpg"] },
  png: { extensions: [".png"], mimetypes: ["image/png"] },
  gif: { extensions: [".gif"], mimetypes: ["image/gif"] },
  webp: { extensions: [".webp"], mimetypes: ["image/webp"] },
  pdf: { extensions: [".pdf"], mimetypes: ["application/pdf"] },
};
const IMAGES = ["jpg", "png", "gif", "webp"];

/**
 * Multer-based upload that keeps one file in `dir`, named
 * "<prefix>-<unique>.<ext>". `types` are keys of FILE_TYPES; `typeError` and
 * `sizeError` are the i18n keys shown when a file is refused. Upload folders
 * are git-ignored, so the folder is created here — multer will not.
 */
export function makeLocalFileUpload({
  dir,
  prefix,
  types = IMAGES,
  maxBytes = FIVE_MB,
  typeError = "image_type_not_allowed",
  sizeError = "image_too_large",
}) {
  fs.mkdirSync(dir, { recursive: true });
  const allowed = types.map((type) => FILE_TYPES[type]);
  const upload = multer({
    storage: multer.diskStorage({
      // Made again if it was removed while the server runs (e.g. a cleaned-up folder).
      destination: (_req, _file, cb) => fs.mkdir(dir, { recursive: true }, (error) => cb(error ?? null, dir)),
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${prefix}-${unique}${path.extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const ok = allowed.some((type) => type.extensions.includes(extension) && type.mimetypes.includes(file.mimetype));
      cb(ok ? null : new ValidationError(typeError), ok);
    },
  });

  return {
    /** Middleware for one file in form field `field`; errorHandler words a size error with `sizeError`. */
    single: (field) => (req, res, next) => {
      req.fileTooLargeKey = sizeError;
      upload.single(field)(req, res, next);
    },
  };
}
