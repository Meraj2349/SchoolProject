import fs from "fs/promises";
import path from "path";

/**
 * Applicants' CVs, kept on disk OUTSIDE public/ so they are never served
 * statically: <root>/<circularId>/<file>. Only the admin download endpoint
 * reads them. Uploads arrive in <root>/incoming and are moved here once the
 * application is saved.
 */
export function makeCvStore({ root }) {
  const safeId = (circularId) => (Number.isInteger(Number(circularId)) && Number(circularId) > 0 ? String(Number(circularId)) : null);
  const safeName = (file) => (typeof file === "string" && file && path.basename(file) === file && !file.startsWith(".") ? file : null);

  const pathOf = (circularId, file) => {
    const id = safeId(circularId);
    const name = safeName(file);
    return id && name ? path.join(root, id, name) : null;
  };

  return {
    incomingDir: path.join(root, "incoming"),
    pathOf,

    /** Moves an uploaded file (multer's { path, filename }) under its circular; returns the stored name. */
    async keep(upload, circularId) {
      const target = pathOf(circularId, upload.filename);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.rename(upload.path, target);
      return upload.filename;
    },

    async discard(circularId, file) {
      const target = pathOf(circularId, file);
      if (target) await fs.rm(target, { force: true });
    },

    /** An upload whose application was refused. */
    async discardUpload(upload) {
      if (upload?.path) await fs.rm(upload.path, { force: true });
    },

    /** Every CV of a deleted circular (its applications are deleted with it). */
    async discardCircular(circularId) {
      const id = safeId(circularId);
      if (id) await fs.rm(path.join(root, id), { recursive: true, force: true });
    },
  };
}
