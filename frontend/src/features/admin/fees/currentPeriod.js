import { localDateString } from "@/lib/dates";

/** { year, month } of today in the browser's (school's) time zone. */
export function currentPeriod() {
  const [year, month] = localDateString().split("-").map(Number);
  return { year, month };
}
