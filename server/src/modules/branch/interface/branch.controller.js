import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter: translates requests into use-case calls and results into
// responses. No business rules or SQL belong here.
export function makeBranchController({ useCases, removeFile }) {
  const imageFrom = (req) => (req.file ? { path: req.file.path } : null);

  // Multer writes uploads to disk; delete the temp file whatever happens.
  const withUploadCleanup = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } finally {
      if (req.file?.path) await removeFile(req.file.path).catch(() => {});
    }
  };

  const handle = (handler, fallbackKey) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language, fallbackKey);
    }
  };

  return {
    list: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.listBranches() });
    }, "branch_fetch_failed"),

    stats: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.getBranchStats() });
    }),

    // Super admins: counts plus this month's fees per branch.
    overview: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.getBranchOverview() });
    }),

    getById: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.getBranch(req.params.id) });
    }),

    create: withUploadCleanup(
      handle(async (req, res) => {
        const branch = await useCases.createBranch({ input: req.body, image: imageFrom(req) });
        res.status(201).json({
          success: true,
          message: t("branch_created", req.language),
          data: branch,
        });
      }),
    ),

    update: withUploadCleanup(
      handle(async (req, res) => {
        await useCases.updateBranch({
          id: req.params.id,
          input: req.body,
          image: imageFrom(req),
        });
        res.status(200).json({ success: true, message: t("branch_updated", req.language) });
      }),
    ),

    remove: handle(async (req, res) => {
      const deleted = await useCases.deleteBranch(req.params.id);
      res.status(200).json({
        success: true,
        message: t("branch_deleted", req.language),
        data: deleted,
      });
    }),
  };
}
