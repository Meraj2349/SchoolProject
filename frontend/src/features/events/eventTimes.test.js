import { describe, expect, it } from "vitest";
import { countdown, endOf, isHappening, splitEvents } from "./eventTimes";

const now = new Date("2026-10-15T12:00:00");

describe("event times", () => {
  it("ends an event at the end of its last day, whether or not the date has a time", () => {
    expect(endOf({ EndDate: "2026-10-15" }).getTime()).toBe(new Date("2026-10-15T23:59:59").getTime());
    expect(endOf({ EndDate: "2026-10-15T00:00:00.000Z" }).getTime()).toBe(new Date("2026-10-15T23:59:59").getTime());
    expect(endOf({ StartDate: "2026-10-20" }).getTime()).toBe(new Date("2026-10-20T23:59:59").getTime());
  });

  it("splits events into upcoming (soonest first) and past (latest first)", () => {
    const events = [
      { EventID: 1, StartDate: "2026-11-01", EndDate: "2026-11-01" },
      { EventID: 2, StartDate: "2026-10-15", EndDate: "2026-10-15T00:00:00.000Z" },
      { EventID: 3, StartDate: "2026-09-01", EndDate: "2026-09-02" },
      { EventID: 4, StartDate: "2026-10-01", EndDate: "2026-10-01" },
    ];

    const { upcoming, past } = splitEvents(events, now);

    expect(upcoming.map((e) => e.EventID)).toEqual([2, 1]);
    expect(past.map((e) => e.EventID)).toEqual([4, 3]);
  });

  it("knows when an event is happening now", () => {
    expect(isHappening({ StartDate: "2026-10-14", EndDate: "2026-10-16" }, now)).toBe(true);
    expect(isHappening({ StartDate: "2026-10-16", EndDate: "2026-10-16" }, now)).toBe(false);
  });

  it("counts down to the end, and stops at zero", () => {
    expect(countdown(new Date("2026-10-16T13:01:02"), now)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 2 });
    expect(countdown(new Date("2026-10-15T11:00:00"), now)).toBeNull();
  });
});
