import { ValidationError } from "../../../shared/errors/index.js";

// Amounts cross the API and the database as taka (DECIMAL(10,2)); arithmetic is
// done in whole poisha so 0.1 + 0.2 is exactly 0.3.
const POISHA_PER_TAKA = 100;
const MAX_AMOUNT = 99_999_999.99; // DECIMAL(10,2)
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export const toPoisha = (taka) => Math.round(Number(taka) * POISHA_PER_TAKA);

export const fromPoisha = (poisha) => poisha / POISHA_PER_TAKA;

export const sumTaka = (amounts) =>
  fromPoisha(amounts.reduce((total, amount) => total + toPoisha(amount), 0));

// A non-negative amount in taka with at most two decimals.
export function parseAmount(value, errorCode) {
  const text = typeof value === "number" ? String(value) : String(value ?? "").trim();
  if (!AMOUNT_PATTERN.test(text) || Number(text) > MAX_AMOUNT) {
    throw new ValidationError(errorCode);
  }
  return Number(text);
}
