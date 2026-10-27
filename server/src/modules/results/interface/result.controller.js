import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for /api/results: requests in, { success, message?, data? } out.
export function makeResultController({ useCases }) {
  const handle = (handler, fallbackKey) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language, fallbackKey);
    }
  };
  const branchOf = (req) => req.branchId ?? null;

  return {
    search: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.search({ branchId: branchOf(req), query: req.query }) });
    }, "result_fetch_failed"),

    create: handle(async (req, res) => {
      const resultId = await useCases.addResult({ branchId: branchOf(req), input: req.body });
      res.status(201).json({ success: true, message: t("result_created", req.language), data: { resultId } });
    }),

    update: handle(async (req, res) => {
      await useCases.changeMarks({ branchId: branchOf(req), id: req.params.id, input: req.body });
      res.status(200).json({ success: true, message: t("result_updated", req.language) });
    }),

    remove: handle(async (req, res) => {
      await useCases.removeResult({ branchId: branchOf(req), id: req.params.id });
      res.status(200).json({ success: true, message: t("result_deleted", req.language) });
    }),
  };
}
