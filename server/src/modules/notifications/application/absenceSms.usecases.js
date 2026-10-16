import { normalizeBdMobile } from "../../../shared/bdMobile.js";
import { schoolToday } from "../../../shared/schoolDate.js";
import { MAX_ATTEMPTS, absenceMessage, maskPhone, planAlerts, retryAt } from "../domain/absenceSms.js";

const BATCH_SIZE = 50;
const MAX_ERROR_LENGTH = 255;

/**
 * SMS to parents of absent children.
 *
 * daySaved (called by the attendance use cases after today's statuses change)
 * queues an SMS for each absent child, due `delayMinutes` later, and cancels
 * queued ones for children who are no longer absent. sendDue (run by the
 * worker every minute) sends what is due, if the child is still absent then.
 *
 * @param {object} deps
 * @param {object} deps.repository  see fakeAbsenceSmsRepository.js for the port
 * @param {{ send: ({ to, text }) => Promise<{ ref?: string }> }} deps.sender
 * @param {{ now: () => Date }} deps.clock
 * @param {boolean} deps.enabled    false: queue nothing (ATTENDANCE_SMS_ENABLED)
 * @param {number} deps.delayMinutes
 * @param {string} deps.signature   who the SMS is from, at its end (SMS_SIGNATURE)
 */
export function makeAbsenceSmsUseCases({ repository, sender, clock, enabled, delayMinutes, signature }) {
  async function sendOne(id, now) {
    const message = await repository.details(id);
    if (message.date !== schoolToday(now)) return repository.finish(id, { status: "skipped", error: "day_over" });
    if (message.attendanceStatus !== "Absent") return repository.finish(id, { status: "cancelled" });
    const phone = normalizeBdMobile(message.parentPhone ?? "");
    if (!phone) return repository.finish(id, { status: "skipped", error: "no_parent_phone" });

    try {
      const { ref } = await sender.send({ to: phone, text: absenceMessage({ name: message.name, date: message.date, signature }) });
      return repository.finish(id, { status: "sent", phone, providerRef: ref ?? null, sentAt: now, error: null });
    } catch (error) {
      const reason = String(error?.message ?? error).slice(0, MAX_ERROR_LENGTH);
      console.warn(`Absence SMS to ${maskPhone(phone)} failed (attempt ${message.attempts}): ${reason}`);
      if (message.attempts >= MAX_ATTEMPTS) return repository.finish(id, { status: "failed", phone, error: reason });
      return repository.finish(id, { status: "pending", phone, error: reason, dueAt: retryAt(now, message.attempts) });
    }
  }

  return {
    async daySaved({ branchId, date, now, students }) {
      if (!enabled) return;
      const { queue, cancel, dueAt } = planAlerts({ students, now, delayMinutes });
      if (queue.length) await repository.queue({ studentIds: queue, date, branchId, dueAt });
      if (cancel.length) await repository.cancel({ studentIds: cancel, date });
    },

    /**
     * Sends every message that is due. Overlapping runs never send one twice
     * (claim is atomic). A message left "sending" by a crash is given up, not
     * retried: it may already have reached the parent. One broken message
     * does not hold up the others.
     */
    async sendDue() {
      await repository.failInterrupted();
      const now = clock.now();
      for (const id of await repository.dueIds(now, BATCH_SIZE)) {
        try {
          if (await repository.claim(id)) await sendOne(id, now);
        } catch (error) {
          console.error(`Absence SMS ${id}: ${error?.code ?? ""} ${error?.message ?? error}`);
        }
      }
    },

    /** A day's messages in the branch (null = all), for the admin website. */
    list: ({ branchId, date }) => repository.list({ branchId, date }),
  };
}
