import { t } from "../../../config/i18n.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} from "../errors/index.js";

const STATUS_BY_ERROR = [
  [ValidationError, 400],
  [NotFoundError, 404],
  [ConflictError, 409],
  [ForbiddenError, 403],
  [UnauthorizedError, 401],
  [TooManyRequestsError, 429],
];

// Maps domain errors to HTTP responses. Unknown errors are logged and
// answered with a generic message so internals never reach the client.
export function sendError(res, error, lang, fallbackKey = "internal_server_error") {
  const match = STATUS_BY_ERROR.find(([ErrorType]) => error instanceof ErrorType);
  if (match) {
    const body = { success: false, message: t(error.code, lang) };
    if (error.details !== undefined) body.data = error.details;
    return res.status(match[1]).json(body);
  }

  // Only the code, message and stack: a database error also carries the
  // offending values (error.detail), which may hold applicants' personal details.
  console.error(`${error?.code ?? error?.name ?? "Error"}: ${error?.message ?? error}\n${error?.stack?.split("\n").slice(1).join("\n") ?? ""}`);
  return res.status(500).json({ success: false, message: t(fallbackKey, lang) });
}
