import multer from "multer";
import { t } from "../../../config/i18n.js";
import { sendError } from "./sendError.js";

/**
 * Express error middleware, registered last in app.js. Catches errors raised
 * outside controllers (e.g. by multer) so the client still gets
 * { success: false, message } in its language, never an HTML page or stack.
 */
// eslint-disable-next-line no-unused-vars -- Express recognises error handlers by their four parameters
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof multer.MulterError) {
    const key = error.code === "LIMIT_FILE_SIZE" ? "image_too_large" : "upload_failed";
    return res.status(400).json({ success: false, message: t(key, req.language) });
  }
  return sendError(res, error, req.language);
}
