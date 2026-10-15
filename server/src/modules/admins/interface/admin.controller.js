import { t } from "../../../../config/i18n.js";
import { requireRole } from "../../../shared/http/requireRole.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for managing admin accounts. No business rules or SQL here.
export function makeAdminController({ useCases }) {
  const handle = (handler, fallbackKey) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language, fallbackKey);
    }
  };

  return {
    // Middleware for account management, after authMiddleware.
    requireSuperAdmin: requireRole("super_admin"),

    list: handle(async (req, res) => {
      const admins = await useCases.listAdmins({ currentAdminId: req.adminId });
      res.status(200).json({ success: true, data: admins });
    }, "admin_fetch_failed"),

    create: handle(async (req, res) => {
      const admin = await useCases.createAdmin(req.body);
      res.status(201).json({ success: true, message: t("admin_created", req.language), data: admin });
    }),

    update: handle(async (req, res) => {
      const admin = await useCases.updateAdmin({
        id: req.params.id,
        input: req.body,
        currentAdminId: req.adminId,
      });
      res.status(200).json({ success: true, message: t("admin_updated", req.language), data: admin });
    }),

    remove: handle(async (req, res) => {
      const admin = await useCases.deleteAdmin({ id: req.params.id, currentAdminId: req.adminId });
      res.status(200).json({ success: true, message: t("admin_deleted", req.language), data: admin });
    }),
  };
}
