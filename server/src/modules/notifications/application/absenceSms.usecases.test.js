import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { makeAbsenceSmsUseCases } from "./absenceSms.usecases.js";
import { makeFakeAbsenceSmsRepository, makeFakeSmsSender } from "./fakeAbsenceSmsRepository.js";

const SAVED_AT = new Date("2026-03-10T04:00:00Z"); // 10:00 in Dhaka
const TODAY = "2026-03-10";
const minutesAfter = (minutes) => new Date(SAVED_AT.getTime() + minutes * 60_000);

let repository;
let sender;
let clock;

const build = (overrides = {}) =>
  makeAbsenceSmsUseCases({
    repository,
    sender,
    clock: { now: () => clock.now() },
    enabled: true,
    delayMinutes: 15,
    signature: "স্টার শিক্ষা পরিবার",
    ...overrides,
  });

beforeEach(() => {
  repository = makeFakeAbsenceSmsRepository({
    students: [
      { id: 1, name: "Rahim Uddin", parentPhone: "01711-000001", statusOn: { [TODAY]: "Absent" } },
      { id: 2, name: "Karim Uddin", parentPhone: "", statusOn: { [TODAY]: "Absent" } },
      { id: 3, name: "Nadia Akter", parentPhone: "01711000003", statusOn: { [TODAY]: "Present" } },
    ],
  });
  sender = makeFakeSmsSender();
  clock = { now: () => SAVED_AT };
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

const saveDay = (sms, students) => sms.daySaved({ branchId: 1, date: TODAY, now: SAVED_AT, students });

describe("queueing", () => {
  it("queues absent students 15 minutes after the save and cancels a child marked present again", async () => {
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }, { studentId: 3, status: "Absent" }]);
    await saveDay(sms, [{ studentId: 3, status: "Present" }]);

    expect(repository.state.messages.map((m) => [m.studentId, m.status, m.dueAt])).toEqual([
      [1, "pending", minutesAfter(15)],
      [3, "cancelled", minutesAfter(15)],
    ]);
  });

  it("queues nothing when absence SMS are switched off", async () => {
    const sms = build({ enabled: false });
    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);

    expect(repository.state.messages).toEqual([]);
  });
});

describe("sending", () => {
  it("sends nothing before the delay is over", async () => {
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);

    clock.now = () => minutesAfter(14);
    await sms.sendDue();

    expect(sender.sent).toEqual([]);
  });

  it("sends one Bangla SMS per child per day, to the parent's number", async () => {
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);
    clock.now = () => minutesAfter(15);
    await sms.sendDue();

    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);
    clock.now = () => minutesAfter(40);
    await sms.sendDue();

    expect(sender.sent).toEqual([{ to: "01711000001", text: expect.stringMatching(/Rahim Uddin .* — স্টার শিক্ষা পরিবার$/) }]);
    expect(repository.state.messages[0]).toMatchObject({ status: "sent", phone: "01711000001", providerRef: "ref-1", sentAt: minutesAfter(15) });
  });

  it("does not message the parent of a child who was marked present after all", async () => {
    repository.state.students[0].statusOn[TODAY] = "Present"; // corrected some other way, e.g. by an admin
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);
    clock.now = () => minutesAfter(15);

    await sms.sendDue();

    expect(sender.sent).toEqual([]);
    expect(repository.state.messages[0].status).toBe("cancelled");
  });

  it("skips a child with no valid parent number", async () => {
    const sms = build();
    await saveDay(sms, [{ studentId: 2, status: "Absent" }]);
    clock.now = () => minutesAfter(15);

    await sms.sendDue();

    expect(repository.state.messages[0]).toMatchObject({ status: "skipped", error: "no_parent_phone" });
  });

  it("does not send yesterday's message today", async () => {
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);
    clock.now = () => minutesAfter(24 * 60);

    await sms.sendDue();

    expect(sender.sent).toEqual([]);
    expect(repository.state.messages[0]).toMatchObject({ status: "skipped", error: "day_over" });
  });

  it("tries again after a failure, and gives up after three attempts", async () => {
    sender = makeFakeSmsSender({ failures: 5 });
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);

    clock.now = () => minutesAfter(15);
    await sms.sendDue();
    expect(repository.state.messages[0]).toMatchObject({ status: "pending", attempts: 1, dueAt: minutesAfter(17) });

    clock.now = () => minutesAfter(17);
    await sms.sendDue();
    clock.now = () => minutesAfter(21);
    await sms.sendDue();

    expect(repository.state.messages[0]).toMatchObject({ status: "failed", attempts: 3, error: "gateway down" });
  });

  it("gives up on a message left half-sent by a crash, rather than risk sending it twice", async () => {
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);
    Object.assign(repository.state.messages[0], { status: "sending", stale: true });
    clock.now = () => minutesAfter(30);

    await sms.sendDue();

    expect(repository.state.messages[0]).toMatchObject({ status: "failed", error: "interrupted" });
    expect(sender.sent).toEqual([]);
  });

  it("goes on with the other messages when one breaks", async () => {
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }, { studentId: 3, status: "Absent" }]);
    repository.state.students[2].statusOn[TODAY] = "Absent";
    const details = repository.details;
    repository.details = async (id) => (id === 1 ? Promise.reject(new Error("lost connection")) : details(id));
    jest.spyOn(console, "error").mockImplementation(() => {});
    clock.now = () => minutesAfter(15);

    await sms.sendDue();

    expect(sender.sent.map((m) => m.to)).toEqual(["01711000003"]);
  });

  it("never sends the same message twice when two runs overlap", async () => {
    const sms = build();
    await saveDay(sms, [{ studentId: 1, status: "Absent" }]);
    clock.now = () => minutesAfter(15);

    await Promise.all([sms.sendDue(), sms.sendDue()]);

    expect(sender.sent).toHaveLength(1);
  });
});

it("lists a day's messages of the branch", async () => {
  const sms = build();
  await saveDay(sms, [{ studentId: 1, status: "Absent" }]);

  expect(await sms.list({ branchId: 2, date: TODAY })).toEqual([]);
  expect((await sms.list({ branchId: 1, date: TODAY })).map((m) => m.status)).toEqual(["pending"]);
});
