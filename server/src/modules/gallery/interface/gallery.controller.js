import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for the gallery. Multer writes uploads to disk; the temp file
// is removed whatever happens.
export function makeGalleryController({ useCases, removeFile }) {
  const viewerOf = (req) => ({ role: req.role, branchId: req.branchId ?? null });

  const handle = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language);
    } finally {
      if (req.file?.path) await removeFile(req.file.path).catch(() => {});
    }
  };

  const listBy = (filterOf) =>
    handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.list({ viewer: viewerOf(req), filter: filterOf(req) }) });
    });

  return {
    list: listBy((req) => ({ type: req.query.type })),
    byType: listBy((req) => ({ type: req.params.type })),
    byStudent: listBy((req) => ({ studentId: req.params.studentId })),
    byTeacher: listBy((req) => ({ teacherId: req.params.teacherId })),

    get: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.get({ viewer: viewerOf(req), id: req.params.id }) });
    }),

    upload: handle(async (req, res) => {
      const image = await useCases.upload({ admin: viewerOf(req), input: req.body, file: req.file });
      res.status(201).json({ success: true, message: t("image_uploaded", req.language), data: image });
    }),

    update: handle(async (req, res) => {
      const image = await useCases.update({ admin: viewerOf(req), id: req.params.id, input: req.body });
      res.status(200).json({ success: true, message: t("image_updated", req.language), data: image });
    }),

    replaceFile: handle(async (req, res) => {
      const image = await useCases.replaceFile({ admin: viewerOf(req), id: req.params.id, file: req.file });
      res.status(200).json({ success: true, message: t("image_updated", req.language), data: image });
    }),

    remove: handle(async (req, res) => {
      await useCases.remove({ admin: viewerOf(req), id: req.params.id });
      res.status(200).json({ success: true, message: t("image_deleted", req.language) });
    }),
  };
}
