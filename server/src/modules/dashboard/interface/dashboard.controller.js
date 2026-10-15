import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for the dashboard. req.branchId comes from the auth middleware.
export function makeDashboardController({ useCases }) {
  return {
    async summary(req, res) {
      try {
        res.status(200).json({ success: true, data: await useCases.summary({ branchId: req.branchId ?? null }) });
      } catch (error) {
        sendError(res, error, req.language);
      }
    },
  };
}
