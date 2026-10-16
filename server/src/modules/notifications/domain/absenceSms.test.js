import { describe, expect, it } from "@jest/globals";
import { absenceMessage, maskPhone, planAlerts, retryAt, MAX_ATTEMPTS } from "./absenceSms.js";

const NOW = new Date("2026-03-10T04:00:00Z");

describe("absence SMS", () => {
  it("tells the parent in Bangla, with the date in Bangla digits", () => {
    expect(absenceMessage({ name: "Rahim Uddin", date: "2026-03-10" })).toBe(
      "প্রিয় অভিভাবক, আপনার সন্তান Rahim Uddin আজ ১০-০৩-২০২৬ তারিখে বিদ্যালয়ে অনুপস্থিত। — স্টার শিক্ষা পরিবার",
    );
  });

  it("queues absent students for after the delay and cancels the others", () => {
    const plan = planAlerts({
      students: [
        { studentId: 1, status: "Absent" },
        { studentId: 2, status: "Present" },
        { studentId: 3, status: "Leave" },
        { studentId: 4, status: null },
        { studentId: 5, status: "Absent" },
      ],
      now: NOW,
      delayMinutes: 15,
    });

    expect(plan).toEqual({ queue: [1, 5], cancel: [2, 3, 4], dueAt: new Date("2026-03-10T04:15:00Z") });
  });

  it("waits longer before each retry, up to three attempts", () => {
    expect(MAX_ATTEMPTS).toBe(3);
    expect(retryAt(NOW, 1)).toEqual(new Date("2026-03-10T04:02:00Z"));
    expect(retryAt(NOW, 2)).toEqual(new Date("2026-03-10T04:04:00Z"));
  });

  it("hides most of a phone number in logs", () => {
    expect(maskPhone("01711000001")).toBe("017*****001");
  });
});
