import { t } from "../../../config/i18n.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors/index.js";

const STATUS_BY_ERROR = [
  [ValidationError, 400],
  [NotFoundError, 404],
  [ConflictError, 409],
];

// Maps domain errors to HTTP responses. Unknown errors are logged and
// answered with a generic message so internals never reach the client.
export function sendError(res, error, lang, fallbackKey = "internal_server_error") {
  const match = STATUS_BY_ERROR.find(([ErrorType]) => error instanceof ErrorType);
  if (match) {
    return res.status(match[1]).json({ success: false, message: t(error.code, lang) });
  }

  console.error(error);
  return res.status(500).json({ success: false, message: t(fallbackKey, lang) });
}
