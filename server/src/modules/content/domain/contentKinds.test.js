import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { announcement, message, news, notice } from "./contentKinds.js";

const invalid = (code) => new ValidationError(code);

describe("notice", () => {
  it("takes a title and description, hidden unless shown", () => {
    expect(notice.toNew({ title: " Sports ", description: "Friday" })).toEqual({
      Title: "Sports",
      Description: "Friday",
      Show: false,
    });
    expect(notice.toNew({ title: "A", description: "B", show: true }).Show).toBe(true);
  });

  it("needs both a title and a description", () => {
    expect(() => notice.toNew({ title: "A" })).toThrow(invalid("notice_title_desc_required"));
    expect(() => notice.toChanges({ description: "B" })).toThrow(invalid("notice_title_desc_required"));
  });

  it("edits only the text", () => {
    expect(notice.toChanges({ title: "A", description: "B", show: true })).toEqual({ Title: "A", Description: "B" });
  });

  it("shows or hides with a true/false value", () => {
    expect(notice.toVisibility({ show: false })).toEqual({ Show: false });
    expect(() => notice.toVisibility({ show: "yes" })).toThrow(invalid("invalid_show_value"));
  });
});

describe("chairman message", () => {
  it("needs the message text", () => {
    expect(message.toNew({ messages: "Welcome", show: true })).toEqual({ Messages: "Welcome", Show: true });
    expect(() => message.toNew({ messages: "  " })).toThrow(invalid("message_content_required"));
  });

  it("edits the text and, when sent, whether it is shown", () => {
    expect(message.toChanges({ messages: "Hi" })).toEqual({ Messages: "Hi" });
    expect(message.toChanges({ messages: "Hi", show: false })).toEqual({ Messages: "Hi", Show: false });
  });

  it("shows or hides with a true/false value", () => {
    expect(() => message.toVisibility({})).toThrow(invalid("invalid_show_value"));
  });
});

describe("news", () => {
  const input = { title_bn: "খবর", title_en: "News", date: "2030-01-02" };

  it("links to the events page and is active by default", () => {
    expect(news.toNew(input)).toEqual({ ...input, link: "/events", is_active: true });
  });

  it("can be saved inactive", () => {
    expect(news.toNew({ ...input, is_active: false }).is_active).toBe(false);
    expect(news.toChanges({ ...input, is_active: "false" }).is_active).toBe(false);
  });

  it("needs both titles and a date", () => {
    expect(() => news.toNew({ ...input, title_bn: "" })).toThrow(invalid("news_required_fields"));
  });
});

describe("notice announcement", () => {
  const input = { title_bn: "ভর্তি", title_en: "Admission", category: "Admission", date: "2030-01-02" };

  it("needs an image when created", () => {
    expect(announcement.toNew({ ...input, image_url: "/uploads/a.png" })).toEqual({
      ...input,
      image_url: "/uploads/a.png",
      is_published: true,
    });
    expect(() => announcement.toNew(input)).toThrow(invalid("no_file_uploaded"));
  });

  it("keeps the current image unless a new one is sent", () => {
    expect(announcement.toChanges(input, { image_url: "/old.png" }).image_url).toBe("/old.png");
    expect(announcement.toChanges({ ...input, image_url: "/new.png" }, { image_url: "/old.png" }).image_url).toBe("/new.png");
  });

  it("checks the required fields before the category", () => {
    expect(() => announcement.toNew({ ...input, date: "" })).toThrow(invalid("notice_announcement_required_fields"));
    expect(() => announcement.toNew({ ...input, category: "Party" })).toThrow(invalid("notice_announcement_invalid_category"));
  });

  it("reads 'false' from a form as unpublished", () => {
    expect(announcement.toChanges({ ...input, is_published: "false" }, {}).is_published).toBe(false);
  });

  it("publishes or unpublishes with a true/false value", () => {
    expect(announcement.toVisibility({ is_published: true })).toEqual({ is_published: true });
    expect(() => announcement.toVisibility({ is_published: "true" })).toThrow(invalid("notice_announcement_invalid_publish"));
  });
});
