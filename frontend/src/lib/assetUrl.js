// Files uploaded to the API server (/uploads/...) are served by it, not by
// Next.js; everything else (full URLs, /images/...) is used as it is.
const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

export function assetUrl(path) {
  if (!path) return null;
  return path.startsWith("/uploads/") ? `${SERVER_URL}${path}` : path;
}

/**
 * Full-URL images (API uploads, Cloudinary) are given to next/image as
 * `unoptimized`: the Next.js optimiser refuses to fetch from private
 * addresses such as a localhost API, and Cloudinary already optimises.
 */
export const isRemoteImage = (src) => typeof src === "string" && /^https?:\/\//.test(src);
