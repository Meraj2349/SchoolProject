import { t } from "../../../../config/i18n.js";
import { NotFoundError } from "../../../shared/errors/index.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for online job applications.
export function makeJobApplicationController({ useCases }) {
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
      const created = await useCases.submit({ input: req.body ?? {}, upload: req.file ?? null });
      res.status(201).json({ success: true, message: t("job_application_submitted", req.language), data: created });
    }),

    list: handle(async (req, res) => {
      const applications = await useCases.list({ admin: adminOf(req), circularId: req.query.circular_id, status: req.query.status });
      res.status(200).json({ success: true, data: applications });
    }),

    counts: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.counts({ admin: adminOf(req) }) });
    }),

    get: handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.get({ admin: adminOf(req), id: req.params.id }) });
    }),

    /** The CV as a download only: never shown inline, never cached. */
    cv: handle(async (req, res) => {
      const { path, downloadName } = await useCases.cv({ admin: adminOf(req), id: req.params.id });
      res.set({ "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" });
      await new Promise((resolve, reject) =>
        res.download(path, downloadName, (error) => {
          if (!error || res.headersSent) return resolve(); // nothing more can be sent once the file has started
          reject(error.code === "ENOENT" ? new NotFoundError("job_application_no_cv") : error);
        }),
      );
    }),

    setStatus: handle(async (req, res) => {
      const result = await useCases.setStatus({ admin: adminOf(req), id: req.params.id, status: req.body?.status });
      res.status(200).json({ success: true, message: t("job_application_status_updated", req.language), data: result });
    }),

    remove: handle(async (req, res) => {
      await useCases.remove({ admin: adminOf(req), id: req.params.id });
      res.status(200).json({ success: true, message: t("job_application_deleted", req.language) });
    }),
  };
}
