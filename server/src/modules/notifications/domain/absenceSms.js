// An SMS to a parent when their child is marked absent: at most one per child
// per day, sent a while after the day is saved so a teacher's slip can be
// corrected first, and only if the child is still absent then.

export const MAX_ATTEMPTS = 3;

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";
const toBanglaDigits = (text) => text.replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)]);

/** "প্রিয় অভিভাবক, ... অনুপস্থিত।" for `name` on `date` ("YYYY-MM-DD"). */
export function absenceMessage({ name, date }) {
  const [y, m, d] = date.split("-");
  return `প্রিয় অভিভাবক, আপনার সন্তান ${name} আজ ${toBanglaDigits(`${d}-${m}-${y}`)} তারিখে বিদ্যালয়ে অনুপস্থিত। — স্টার শিক্ষা পরিবার`;
}

/** After a save: absent students to queue (due after the delay), everyone else to cancel. */
export function planAlerts({ students, now, delayMinutes }) {
  const absent = (s) => s.status === "Absent";
  return {
    queue: students.filter(absent).map((s) => s.studentId),
    cancel: students.filter((s) => !absent(s)).map((s) => s.studentId),
    dueAt: new Date(now.getTime() + delayMinutes * 60_000),
  };
}

/** When to try again after the `attempts`th failure: 2, 4, ... minutes later. */
export const retryAt = (now, attempts) => new Date(now.getTime() + 2 ** attempts * 60_000);

/** "017*****001": enough to tell numbers apart in a log, not to read them. */
export const maskPhone = (phone) => `${phone.slice(0, 3)}${"*".repeat(Math.max(phone.length - 6, 0))}${phone.slice(-3)}`;
