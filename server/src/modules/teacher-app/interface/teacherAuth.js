import jwt from "jsonwebtoken";
import { t } from "../../../../config/i18n.js";

const bearerToken = (req) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
};

/** The teacher claims of a valid teacher-app token, or null (admin and quiz tokens included). */
function teacherClaims(token, secret) {
  try {
    const decoded = jwt.verify(token, secret);
    if (decoded.userType !== "teacher" || !Number.isInteger(decoded.teacherId)) return null;
    return { teacherId: decoded.teacherId, tokenVersion: decoded.tokenVersion };
  } catch {
    return null; // malformed, tampered with or expired
  }
}

/**
 * Middleware for the teacher app's routes. The token only says who the
 * teacher is: `authenticate` reloads them, so switching access off or
 * resetting the password (both bump TokenVersion) signs them out at once.
 * Sets req.teacher = { id, branchId, firstName, lastName, phone }.
 */
export function makeTeacherAuth({ authenticate, secret = () => process.env.JWT_SECRET_KEY }) {
  return async (req, res, next) => {
    const token = bearerToken(req);
    const claims = token && teacherClaims(token, secret());
    let teacher = null;
    try {
      teacher = claims ? await authenticate(claims) : null;
    } catch (error) {
      console.error("Teacher sign-in check failed:", error?.message);
      return res.status(500).json({ success: false, message: t("internal_server_error", req.language) });
    }
    if (!teacher) return res.status(401).json({ success: false, message: t("teacher_app_signed_out", req.language) });
    req.teacher = teacher;
    next();
  };
}
