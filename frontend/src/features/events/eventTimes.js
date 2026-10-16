// Pure date rules for the events page.

// The calendar day of a date from the API ("2026-10-15" or "2026-10-15T00:00:00.000Z").
const dayOf = (value) => String(value ?? "").slice(0, 10);
const startOf = (event) => new Date(`${dayOf(event.StartDate)}T00:00:00`);

/** An event lasts until the end of its last day (or its start day if it has no end). */
export const endOf = (event) => new Date(`${dayOf(event.EndDate || event.StartDate)}T23:59:59`);

/** Upcoming events (not yet ended), soonest first; past events, latest first. */
export function splitEvents(events = [], now = new Date()) {
  const upcoming = events.filter((e) => endOf(e) >= now).sort((a, b) => startOf(a) - startOf(b));
  const past = events.filter((e) => endOf(e) < now).sort((a, b) => startOf(b) - startOf(a));
  return { upcoming, past };
}

export const isHappening = (event, now = new Date()) => startOf(event) <= now && now <= endOf(event);

/** Days, hours, minutes and seconds until `end`, or null once it has passed. */
export function countdown(end, now = new Date()) {
  const ms = end - now;
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
  };
}
