import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import http from "http";
import { makeBulkSmsBdSender, makeLogSmsSender, makeSmsSender } from "./smsSenders.js";

// A stand-in for the BulkSMSBD gateway: records requests, answers with `reply`.
let server;
let url;
let requests = [];
let reply = { status: 200, body: { response_code: 202, message_id: 5150, success_message: "SMS Submitted Successfully" } };

beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      requests.push({ method: req.method, type: req.headers["content-type"], body: Object.fromEntries(new URLSearchParams(body)) });
      res.writeHead(reply.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(reply.body));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  url = `http://127.0.0.1:${server.address().port}/api/smsapi`;
});
afterAll(() => new Promise((resolve) => server.close(resolve)));

describe("BulkSMSBD sender", () => {
  const sender = () => makeBulkSmsBdSender({ url, apiKey: "KEY-123", senderId: "8809617000000" });

  it("posts the key, sender id, number with the country code and the message as a form", async () => {
    requests = [];

    const result = await sender().send({ to: "01711000001", text: "প্রিয় অভিভাবক" });

    expect(result).toEqual({ ref: "5150" });
    expect(requests).toEqual([
      {
        method: "POST",
        type: "application/x-www-form-urlencoded",
        body: { api_key: "KEY-123", type: "text", senderid: "8809617000000", number: "8801711000001", message: "প্রিয় অভিভাবক" },
      },
    ]);
  });

  it("fails with the gateway's code and reason, never the key", async () => {
    reply = { status: 200, body: { response_code: 1007, error_message: "Balance Insufficient" } };

    const error = await sender().send({ to: "01711000001", text: "x" }).catch((e) => e);

    expect(error.message).toBe("BulkSMSBD 1007: Balance Insufficient");
    expect(error.message).not.toContain("KEY-123");
  });

  it("fails on an HTTP error", async () => {
    reply = { status: 503, body: {} };

    await expect(sender().send({ to: "01711000001", text: "x" })).rejects.toThrow("BulkSMSBD HTTP 503");
  });
});

describe("log sender", () => {
  it("only logs that it would send, with the number masked and without the child's name", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await makeLogSmsSender().send({ to: "01711000001", text: "Rahim Uddin is absent" });

    expect(result.ref).toMatch(/^log-/);
    expect(log).toHaveBeenCalledWith("[SMS log only] to 017*****001: 21 characters");
    log.mockRestore();
  });
});

describe("makeSmsSender", () => {
  it("logs by default", () => {
    expect(makeSmsSender({}).name).toBe("log");
  });

  it("uses BulkSMSBD when it is chosen and configured", () => {
    expect(makeSmsSender({ SMS_PROVIDER: "bulksmsbd", SMS_API_KEY: "k", SMS_SENDER_ID: "s" }).name).toBe("bulksmsbd");
  });

  it("refuses BulkSMSBD without its key and sender id, and an unknown provider", () => {
    expect(() => makeSmsSender({ SMS_PROVIDER: "bulksmsbd" })).toThrow(/SMS_API_KEY and SMS_SENDER_ID/);
    expect(() => makeSmsSender({ SMS_PROVIDER: "carrier-pigeon" })).toThrow(/Unknown SMS_PROVIDER/);
  });
});
