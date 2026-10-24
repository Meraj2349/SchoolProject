import path from "path";
import { fileURLToPath } from "url";
import { makeContentUseCases } from "./application/content.usecases.js";
import { achievement } from "./domain/achievement.js";
import { jobCircular } from "./domain/jobCircular.js";
import { jobApplicationCvs } from "../job-applications/index.js";
import { announcement, message, news, notice } from "./domain/contentKinds.js";
import { makeLocalUploadStore } from "./infrastructure/localUploadStore.js";
import { makeMysqlContentRepository } from "./infrastructure/mysql-content.repository.js";
import { makeContentController } from "./interface/content.controller.js";

// Composition root for the website content: notices, the chairman's messages,
// news and notice announcements. Each belongs to a branch or the whole school.

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../public");

const controllerFor = ({ kind, table, messages, files, onRemoved }) =>
  makeContentController({
    useCases: makeContentUseCases({ kind, repository: makeMysqlContentRepository(table), onRemoved }),
    messages,
    files,
  });

export const noticesController = controllerFor({
  kind: notice,
  table: { table: "Notices", idColumn: "NoticeID", visibleColumn: "Show", orderBy: '"NoticeID"' },
  messages: { created: "notice_added", updated: "notice_updated", deleted: "notice_deleted", visibility: "notice_visibility_updated" },
});

export const messagesController = controllerFor({
  kind: message,
  table: { table: "Messages", idColumn: "MessageID", visibleColumn: "Show", orderBy: '"MessageID"' },
  messages: { created: "message_added", updated: "message_updated", deleted: "message_deleted", visibility: "message_visibility_updated" },
});

export const newsController = controllerFor({
  kind: news,
  table: { table: "News", idColumn: "id", visibleColumn: "is_active", orderBy: "date DESC, id DESC" },
  messages: { created: "news_created", updated: "news_updated", deleted: "news_deleted" },
});

export const NOTICE_ANNOUNCEMENT_UPLOADS = path.join(PUBLIC_DIR, "uploads", "notice-announcements");

export const announcementsController = controllerFor({
  kind: announcement,
  table: { table: "NoticeAnnouncements", idColumn: "id", visibleColumn: "is_published", orderBy: "date DESC, id DESC" },
  messages: {
    created: "notice_announcement_created",
    updated: "notice_announcement_updated",
    deleted: "notice_announcement_deleted",
    visibility: "notice_announcement_publish_toggled",
  },
  files: makeLocalUploadStore({ publicDir: PUBLIC_DIR, folder: "notice-announcements" }),
});

export const ACHIEVEMENT_UPLOADS = path.join(PUBLIC_DIR, "uploads", "achievements");

export const achievementsController = controllerFor({
  kind: achievement,
  table: { table: "Achievements", idColumn: "id", visibleColumn: "is_published", orderBy: "is_featured DESC, year DESC, id DESC" },
  messages: {
    created: "achievement_created",
    updated: "achievement_updated",
    deleted: "achievement_deleted",
    visibility: "achievement_publish_toggled",
  },
  files: makeLocalUploadStore({ publicDir: PUBLIC_DIR, folder: "achievements" }),
});

// Job circulars: posts, dates and a poster (an image or a PDF). Deleting one
// deletes its applications (ON DELETE CASCADE) and, here, their CV files.
export const JOB_CIRCULAR_UPLOADS = path.join(PUBLIC_DIR, "uploads", "job-circulars");
export const jobCircularsController = controllerFor({
  kind: jobCircular,
  table: { table: "JobCirculars", idColumn: "id", visibleColumn: "is_published", orderBy: "is_open DESC, circular_date DESC, id DESC" },
  messages: { created: "job_circular_created", updated: "job_circular_updated", deleted: "job_circular_deleted", visibility: "job_circular_publish_toggled" },
  files: makeLocalUploadStore({ publicDir: PUBLIC_DIR, folder: "job-circulars" }),
  onRemoved: (row) => jobApplicationCvs.discardCircular(row.id),
});

