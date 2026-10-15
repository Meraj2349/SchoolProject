import fs from "fs/promises";
import path from "path";

/**
 * Images uploaded by multer to <publicDir>/uploads/<folder> and served as
 * /uploads/<folder>/<file>. discard() only ever deletes inside that folder.
 */
export function makeLocalUploadStore({ publicDir, folder }) {
  const folderDir = path.resolve(publicDir, "uploads", folder);
  return {
    urlFor: (file) => `/uploads/${folder}/${file.filename}`,
    async discard(url) {
      if (typeof url !== "string" || !url.startsWith("/uploads/")) return;
      const filePath = path.resolve(publicDir, `.${url}`);
      if (!filePath.startsWith(folderDir + path.sep)) return;
      await fs.unlink(filePath).catch(() => {}); // already gone is fine
    },
  };
}
