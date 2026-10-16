import { maskPhone } from "../domain/absenceSms.js";

// Adapters for the SMS sender port: send({ to: "01XXXXXXXXX", text }) → { ref }.
// Another provider is one more make...Sender plus a line in makeSmsSender.

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Sends nothing, only logs that it would (SMS_PROVIDER=log, the default). The
 * text names a child and their absence, so it stays out of the log.
 */
export function makeLogSmsSender() {
  return {
    name: "log",
    async send({ to, text }) {
      console.log(`[SMS log only] to ${maskPhone(to)}: ${[...text].length} characters`);
      return { ref: `log-${Date.now()}` };
    },
  };
}

/** BulkSMSBD (bulksmsbd.net): a form POST; response_code 202 means accepted. */
export function makeBulkSmsBdSender({ url, apiKey, senderId, fetchImpl = fetch }) {
  return {
    name: "bulksmsbd",
    async send({ to, text }) {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ api_key: apiKey, type: "text", senderid: senderId, number: `88${to}`, message: text }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`BulkSMSBD HTTP ${response.status}`);
      const reply = await response.json().catch(() => ({}));
      if (Number(reply.response_code) !== 202) {
        throw new Error(`BulkSMSBD ${reply.response_code ?? "?"}: ${String(reply.error_message ?? "not accepted").slice(0, 150)}`);
      }
      return { ref: reply.message_id == null ? null : String(reply.message_id) };
    },
  };
}

/** The sender chosen in the environment (SMS_PROVIDER and its settings). */
export function makeSmsSender(env) {
  const provider = (env.SMS_PROVIDER || "log").trim().toLowerCase();
  if (provider === "log") return makeLogSmsSender();
  if (provider === "bulksmsbd") {
    if (!env.SMS_API_KEY || !env.SMS_SENDER_ID) throw new Error("SMS_PROVIDER=bulksmsbd needs SMS_API_KEY and SMS_SENDER_ID");
    return makeBulkSmsBdSender({
      url: env.SMS_API_URL || "https://bulksmsbd.net/api/smsapi",
      apiKey: env.SMS_API_KEY,
      senderId: env.SMS_SENDER_ID,
    });
  }
  throw new Error(`Unknown SMS_PROVIDER "${provider}" (use log or bulksmsbd)`);
}
