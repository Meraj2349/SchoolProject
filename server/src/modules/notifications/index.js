import { makeAbsenceSmsUseCases } from "./application/absenceSms.usecases.js";
import { postgresAbsenceSmsRepository } from "./infrastructure/postgres-absenceSms.repository.js";
import { makeLogSmsSender, makeSmsSender } from "./infrastructure/smsSenders.js";
import { makeAbsenceSmsController } from "./interface/absenceSms.controller.js";

// Composition root for SMS to parents of absent children. Settings (see .env.example):
//   ATTENDANCE_SMS_ENABLED=true        queue messages at all (off by default)
//   ATTENDANCE_SMS_DELAY_MINUTES=15    wait this long after a save
//   SMS_PROVIDER=log|bulksmsbd         log only, or send through BulkSMSBD
//   SMS_API_URL, SMS_API_KEY, SMS_SENDER_ID   the provider's settings
//   SMS_SIGNATURE                      who the SMS is from (default স্টার শিক্ষা পরিবার)

const WORKER_INTERVAL_MS = 60_000;

function senderFromEnv() {
  try {
    return makeSmsSender(process.env);
  } catch (error) {
    // A wrong setting must not take the whole API down: log, and send nothing.
    console.error(`Absence SMS: ${error.message}. Messages are only logged until this is fixed.`);
    return makeLogSmsSender();
  }
}

const delay = Number(process.env.ATTENDANCE_SMS_DELAY_MINUTES);

export const absenceSms = makeAbsenceSmsUseCases({
  repository: postgresAbsenceSmsRepository,
  sender: senderFromEnv(),
  clock: { now: () => new Date() },
  enabled: process.env.ATTENDANCE_SMS_ENABLED === "true",
  delayMinutes: Number.isFinite(delay) && delay >= 0 ? delay : 15,
  signature: process.env.SMS_SIGNATURE ?? "স্টার শিক্ষা পরিবার",
});

export const absenceSmsController = makeAbsenceSmsController({ useCases: absenceSms });

/** Sends due messages every minute, inside the API process. Runs never overlap. */
export function startAbsenceSmsWorker({ intervalMs = WORKER_INTERVAL_MS } = {}) {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await absenceSms.sendDue();
    } catch (error) {
      console.error(`Absence SMS worker: ${error?.code ?? ""} ${error?.message ?? error}`);
    } finally {
      running = false;
    }
  }, intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}
