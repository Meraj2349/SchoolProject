import { t } from "../../../config/i18n.js";

/**
 * Middleware, after authMiddleware: only the given admin roles may continue.
 * authMiddleware loads req.role from the database, so a demotion applies at once.
 */
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ success: false, message: t("forbidden", req.language) });
    }
    next();
  };
