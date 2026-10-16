import net from "net";
import { t } from "../../../config/i18n.js";

/**
 * The TRUST_PROXY setting for Express's "trust proxy": unset or "false" →
 * trust nothing (req.ip is the connecting address); a number → that many
 * proxy hops; anything else (e.g. "loopback, uniquelocal") as Express reads it.
 * Set it only when a proxy you run sits in front and writes X-Forwarded-For.
 */
export function parseTrustProxy(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "false") return false;
  if (text === "true") return true;
  return /^\d+$/.test(text) ? Number(text) : text;
}

/** The first four groups of an IPv6 address, written in full. */
function ipv6Prefix64(address) {
  const [head, tail = ""] = address.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = address.includes("::")
    ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right]
    : left;
  return groups.slice(0, 4).map((g) => g.padStart(4, "0").toLowerCase()).join(":");
}

/**
 * Who a request counts against: the IPv4 address, or the IPv6 /64 network
 * (one home or phone network gets a whole /64, so single IPv6 addresses
 * would be free to change).
 */
export function clientKey(ip) {
  const address = String(ip ?? "");
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  if (mapped) return mapped[1];
  if (net.isIPv4(address)) return address;
  if (net.isIPv6(address)) return `${ipv6Prefix64(address)}::/64`;
  return "unknown";
}

/**
 * A small in-memory limit on how often one address may call an endpoint
 * (e.g. the public job application form). The address is Express's req.ip
 * (an IPv6 address counts as its /64, see clientKey),
 * so X-Forwarded-For counts only from proxies the app trusts. At most
 * `maxKeys` addresses are remembered (the oldest are dropped), and expired
 * windows are swept on a timer, so made-up addresses cannot grow memory.
 */
export function rateLimit({ max, windowMs, maxKeys = 10_000, now = Date.now }) {
  const hits = new Map(); // address → { count, resetAt }, oldest first

  const sweep = setInterval(() => {
    const time = now();
    for (const [key, entry] of hits) if (entry.resetAt <= time) hits.delete(key);
  }, Math.min(windowMs, 10 * 60 * 1000));
  sweep.unref?.(); // never keeps the process (or a test run) alive

  const middleware = (req, res, next) => {
    const time = now();
    const key = clientKey(req.ip);
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= time) {
      hits.delete(key);
      if (hits.size >= maxKeys) hits.delete(hits.keys().next().value);
      entry = { count: 0, resetAt: time + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count <= max) return next();
    res.set("Retry-After", String(Math.ceil((entry.resetAt - time) / 1000)));
    return res.status(429).json({ success: false, message: t("too_many_requests", req.language) });
  };
  middleware.size = () => hits.size;
  return middleware;
}
