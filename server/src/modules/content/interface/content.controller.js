import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

/**
 * HTTP adapter for one kind of website content. `messages` holds the i18n
 * keys for the success messages. `files` (optional, for kinds with an uploaded
 * image) is { urlFor(uploadedFile), discard(url) }.
 */
export function makeContentController({ useCases, messages, files = null }) {
  const viewerOf = (req) => ({ role: req.role, branchId: req.branchId ?? null });
  const uploadedUrl = (req) => (files && req.file ? files.urlFor(req.file) : undefined);
  const inputOf = (req) => {
    const url = uploadedUrl(req);
    return url ? { ...req.body, image_url: url } : req.body;
  };
  const discard = async (url) => {
    if (files && url) await files.discard(url).catch(() => {});
  };

  const handle = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      await discard(uploadedUrl(req)); // a failed save must not leave the upload behind
      sendError(res, error, req.language);
    }
  };

  const list = (onlyVisible) =>
    handle(async (req, res) => {
      res.status(200).json({ success: true, data: await useCases.list({ viewer: viewerOf(req), onlyVisible }) });
    });

  return {
    list: list(false),
    /** Public lists that never show hidden items, even to admins. */
    listVisible: list(true),

    create: handle(async (req, res) => {
      const id = await useCases.create({ admin: viewerOf(req), input: inputOf(req) });
      res.status(201).json({ success: true, message: t(messages.created, req.language), data: { id } });
    }),

    update: handle(async (req, res) => {
      const previous = await useCases.update({ admin: viewerOf(req), id: req.params.id, input: inputOf(req) });
      if (uploadedUrl(req)) await discard(previous.image_url);
      res.status(200).json({ success: true, message: t(messages.updated, req.language) });
    }),

    setVisibility: handle(async (req, res) => {
      await useCases.setVisibility({ admin: viewerOf(req), id: req.params.id, input: req.body });
      res.status(200).json({ success: true, message: t(messages.visibility, req.language) });
    }),

    /** Shows the item: the same as setting visibility to true. */
    show: handle(async (req, res) => {
      await useCases.setVisibility({ admin: viewerOf(req), id: req.params.id, input: { show: true } });
      res.status(200).json({ success: true, message: t(messages.visibility, req.language) });
    }),

    remove: handle(async (req, res) => {
      const removed = await useCases.remove({ admin: viewerOf(req), id: req.params.id });
      await discard(removed.image_url);
      res.status(200).json({ success: true, message: t(messages.deleted, req.language) });
    }),
  };
}
