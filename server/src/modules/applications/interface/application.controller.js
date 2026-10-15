import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for admission applications.
export function makeApplicationController({ useCases }) {
  const adminOf = (req) => ({ role: req.role, branchId: req.branchId ?? null });

  const handle = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language);
    }
  };

  return {
    submit: handle(async (req, res) => {
      const created = await useCases.submit({ input: req.body });
      res.status(201).json({ success: true, message: t("application_submitted", req.language), data: created });
    }),

    list: handle(async (req, res) => {
      const applications = await useCases.list({ admin: adminOf(req) });
      res.status(200).json({ success: true, data: applications, count: applications.length });
    }),

    get: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.get({ admin: adminOf(req), id: req.params.id }) });
    }),

    setStatus: handle(async (req, res) => {
      const result = await useCases.setStatus({ admin: adminOf(req), id: req.params.id, status: req.body.status });
      res.status(200).json({ success: true, message: t("application_status_updated", req.language), data: result });
    }),

    remove: handle(async (req, res) => {
      await useCases.remove({ admin: adminOf(req), id: req.params.id });
      res.status(200).json({ success: true, message: t("application_deleted", req.language) });
    }),
  };
}
