import { t } from "../../../config/i18n.js";

const PRIVATE = /^(::ffff:)?(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|^::1$|^f[cd]/i;

/**
 * The visitor's address. Behind our own proxy (the Next.js frontend rewrites
 * /api to this server from a private address) it is the first X-Forwarded-For
 * entry; a request from anywhere else cannot choose its address that way.
 */
export function clientIp(req) {
  const remote = req.socket?.remoteAddress ?? "unknown";
  const forwarded = String(req.headers?.["x-forwarded-for"] ?? "").split(",")[0].trim();
  return PRIVATE.test(remote) && forwarded ? forwarded : remote;
}

/**
 * A small in-memory limit on how often one address may call an endpoint
 * (e.g. the public job application form). Counts reset after `windowMs`.
 * In memory, so it is per server process; enough to slow down form spam.
 */
export function rateLimit({ max, windowMs, now = Date.now }) {
  const hits = new Map(); // ip → { count, resetAt }

  return (req, res, next) => {
    const time = now();
    for (const [ip, entry] of hits) if (entry.resetAt <= time) hits.delete(ip); // forget old windows
    const ip = clientIp(req);
    const entry = hits.get(ip) ?? { count: 0, resetAt: time + windowMs };
    entry.count += 1;
    hits.set(ip, entry);
    if (entry.count <= max) return next();
    res.set("Retry-After", String(Math.ceil((entry.resetAt - time) / 1000)));
    return res.status(429).json({ success: false, message: t("too_many_requests", req.language) });
  };
}
