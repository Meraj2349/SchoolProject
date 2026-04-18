import jwt from "jsonwebtoken";

export default function quizStudentMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing quiz token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.userType !== "quiz") {
      return res.status(401).json({ error: "Invalid token type" });
    }
    req.quizStudentId = decoded.studentId;
    req.quizBranchId = decoded.branch_id ?? null;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired quiz token" });
  }
}
