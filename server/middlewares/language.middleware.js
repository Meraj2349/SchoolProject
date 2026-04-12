/**
 * Language detection middleware.
 *
 * Reads the `Accept-Language` header and attaches `req.language` ("en" | "bn")
 * to every request.  Defaults to "bn" when the header is absent or carries an
 * unsupported value.
 *
 * Supported values (case-insensitive):
 *   Accept-Language: en        → req.language = "en"
 *   Accept-Language: bn        → req.language = "bn"
 *   Accept-Language: en-US     → req.language = "en"  (prefix match)
 *   <absent / anything else>   → req.language = "bn"  (default)
 */

const SUPPORTED = ["en", "bn"];
const DEFAULT_LANG = "bn";

export function languageMiddleware(req, res, next) {
  const header = req.headers["accept-language"] || "";
  // Take the first tag (e.g. "en-US,en;q=0.9" → "en")
  const primary = header
    .split(",")[0]
    .split(";")[0]
    .split("-")[0]
    .toLowerCase()
    .trim();
  req.language = SUPPORTED.includes(primary) ? primary : DEFAULT_LANG;
  next();
}

export default languageMiddleware;
