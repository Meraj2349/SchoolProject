// Framework-free helpers for the public home page sections.
import { ACHIEVEMENT_CATEGORIES } from "./achievements";

const isOn = (value) => value === true || value === 1;
const MAX_HERO_SLIDES = 5;
const HERO_IMAGE_TYPES = ["school", "event"];

/**
 * "At a glance" numbers: the chosen branch's students, teachers and classes
 * (all active branches added up when none is chosen), plus how many active
 * branches the school has. Proposed branches are not counted.
 */
export function summariseStats(branches = [], branchId = null) {
  const active = branches.filter((b) => !isOn(b.is_proposed));
  const scoped = branchId == null ? active : active.filter((b) => b.id === branchId);
  const total = (field) => scoped.reduce((sum, b) => sum + (Number(b[field]) || 0), 0);
  return {
    students: total("studentCount"),
    teachers: total("teacherCount"),
    classes: total("classCount"),
    branches: active.length,
  };
}

/** The school's own photo first, then school and event photos from the gallery. */
export function heroSlides(images = [], fallback) {
  const gallery = images
    .filter((image) => HERO_IMAGE_TYPES.includes(image.ImageType) && image.ImagePath)
    .map((image) => ({ src: image.ImagePath, alt: image.Description || fallback.alt }));
  return [fallback, ...gallery].slice(0, MAX_HERO_SLIDES);
}

/** The achievement shown large at the top of the honours board, or null. */
export const spotlightOf = (achievements = []) => achievements.find((a) => isOn(a.is_featured)) ?? null;

/** Board exam results, newest year first. */
export const boardResultHighlights = (achievements = [], limit = 3) =>
  achievements
    .filter((a) => a.category === "board_result")
    .sort((a, b) => b.year - a.year)
    .slice(0, limit);

/** Categories that have at least one achievement, in the usual order. */
export const categoriesPresent = (achievements = []) =>
  ACHIEVEMENT_CATEGORIES.filter((category) => achievements.some((a) => a.category === category));

export const inCategory = (achievements = [], category) =>
  category === "all" ? achievements : achievements.filter((a) => a.category === category);

/** Notices marked to show on the website, newest first. */
export const visibleNotices = (notices = [], limit = Infinity) =>
  notices
    .filter((n) => isOn(n.Show))
    .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
    .slice(0, limit);

/** Events that have not ended, soonest first; if none, the most recent past ones. */
export function upcomingEvents(events = [], now = new Date(), limit = 4) {
  const upcoming = events
    .filter((e) => new Date(e.EndDate ?? e.StartDate) >= now)
    .sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
  if (upcoming.length > 0) return upcoming.slice(0, limit);
  return [...events].sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate)).slice(0, limit);
}

const NUMBER_LOCALES = { en: "en-IN", bn: "bn-BD" };

/** 1,240 or ১,২৪০. */
export const formatNumber = (value, language = "en") =>
  new Intl.NumberFormat(NUMBER_LOCALES[language] ?? NUMBER_LOCALES.en).format(Number(value) || 0);

/** item.<field>_bn or item.<field>_en for the reader's language, falling back to the other. */
export function localized(item, field, language) {
  const [first, second] = language === "bn" ? ["bn", "en"] : ["en", "bn"];
  return item?.[`${field}_${first}`] || item?.[`${field}_${second}`] || "";
}

const DATE_LOCALES = { en: "en-GB", bn: "bn-BD" };

/** 2025 or ২০২৫ (no thousands separator). */
export const formatYear = (year, language = "en") =>
  new Intl.NumberFormat(NUMBER_LOCALES[language] ?? NUMBER_LOCALES.en, { useGrouping: false }).format(Number(year) || 0);

/** { day: "05", month: "Oct" } for a calendar-style date badge, in the reader's language. */
export function dayAndMonth(value, language = "en") {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const locale = DATE_LOCALES[language] ?? DATE_LOCALES.en;
  return {
    day: date.toLocaleDateString(locale, { day: "2-digit" }),
    month: date.toLocaleDateString(locale, { month: "short" }),
  };
}

/** "5 Oct 2026" (or Bangla); "" for a missing or broken date. */
export function formatDate(value, language = "en", options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(DATE_LOCALES[language] ?? DATE_LOCALES.en, options);
}
