import fs from "fs/promises";
import path from "path";

/**
 * Images uploaded by multer to <publicDir>/uploads/<folder> and served as
 * /uploads/<folder>/<file>. discard() only ever deletes inside uploads/.
 */
export function makeLocalUploadStore({ publicDir, folder }) {
  const uploadsDir = path.resolve(publicDir, "uploads");
  return {
    urlFor: (file) => `/uploads/${folder}/${file.filename}`,
    async discard(url) {
      if (typeof url !== "string" || !url.startsWith("/uploads/")) return;
      const filePath = path.resolve(publicDir, `.${url}`);
      if (!filePath.startsWith(uploadsDir + path.sep)) return;
      await fs.unlink(filePath).catch(() => {}); // already gone is fine
    },
  };
}
