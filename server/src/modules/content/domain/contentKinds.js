import { ValidationError } from "../../../shared/errors/index.js";

// The kinds of website content. Each turns request input into the fields to
// save (named like the table's columns) and throws ValidationError with an
// i18n code when the input is unusable. `notFound` is the i18n code for a
// missing item.

const text = (value) => (typeof value === "string" ? value.trim() : "");
const sent = (value) => value !== undefined;
// Forms send booleans as strings; anything but false/"false" counts as true.
const flag = (value) => !(value === false || value === "false");

function requireBoolean(value, code) {
  if (typeof value !== "boolean") throw new ValidationError(code);
  return value;
}

function noticeText(input) {
  const Title = text(input.title);
  const Description = text(input.description);
  if (!Title || !Description) throw new ValidationError("notice_title_desc_required");
  return { Title, Description };
}

export const notice = {
  notFound: "notice_not_found",
  toNew: (input) => ({ ...noticeText(input), Show: input.show === true }),
  toChanges: (input) => noticeText(input),
  toVisibility: (input) => ({ Show: requireBoolean(input.show, "invalid_show_value") }),
};

function messageText(input) {
  const Messages = text(input.messages);
  if (!Messages) throw new ValidationError("message_content_required");
  return Messages;
}

/** The chairman's messages shown on the website. */
export const message = {
  notFound: "message_not_found",
  toNew: (input) => ({ Messages: messageText(input), Show: Boolean(input.show) }),
  toChanges: (input) => ({ Messages: messageText(input), ...(sent(input.show) && { Show: Boolean(input.show) }) }),
  toVisibility: (input) => ({ Show: requireBoolean(input.show, "invalid_show_value") }),
};

// A page of this site ("/events", not "//other.host") or a web address.
const SAFE_LINK = /^(\/(?!\/)|https?:\/\/)/i;

function newsLink(value) {
  const link = text(value) || "/events";
  if (!SAFE_LINK.test(link)) throw new ValidationError("news_link_invalid");
  return link;
}

function newsFields(input) {
  const fields = { title_bn: text(input.title_bn), title_en: text(input.title_en), date: text(input.date) };
  if (!fields.title_bn || !fields.title_en || !fields.date) throw new ValidationError("news_required_fields");
  return { ...fields, link: newsLink(input.link), is_active: flag(input.is_active) };
}

export const news = {
  notFound: "news_not_found",
  toNew: newsFields,
  toChanges: newsFields,
  toVisibility: null, // news is shown or hidden with a normal edit
};

const CATEGORIES = ["Admission", "Exam", "Notice", "Event"];

function announcementFields(input) {
  const fields = {
    title_bn: text(input.title_bn),
    title_en: text(input.title_en),
    category: text(input.category),
    date: text(input.date),
  };
  if (!fields.title_bn || !fields.title_en || !fields.category || !fields.date) {
    throw new ValidationError("notice_announcement_required_fields");
  }
  if (!CATEGORIES.includes(fields.category)) throw new ValidationError("notice_announcement_invalid_category");
  return { ...fields, is_published: flag(input.is_published) };
}

/** Image notices (admission, exam, ...). `image_url` is set from the upload. */
export const announcement = {
  notFound: "notice_announcement_not_found",
  toNew: (input) => {
    const fields = announcementFields(input);
    if (!input.image_url) throw new ValidationError("no_file_uploaded");
    return { ...fields, image_url: input.image_url };
  },
  toChanges: (input, existing) => ({ ...announcementFields(input), image_url: input.image_url ?? existing.image_url }),
  toVisibility: (input) => ({ is_published: requireBoolean(input.is_published, "notice_announcement_invalid_publish") }),
};
