import { ValidationError } from "../../../shared/errors/index.js";

// Pure business rules for a Branch. No database, HTTP or framework imports.

const TEXT_FIELDS = [
  "name_bn",
  "name_en",
  "description_bn",
  "description_en",
  "address_bn",
  "address_en",
  "established_date",
];

const parseNumber = (value) => (value == null || value === "" ? null : parseFloat(value));
const parseBoolean = (value) => value === true || value === "true";

export function toNewBranch(input) {
  if (!input.name_bn && !input.name_en) {
    throw new ValidationError("branch_name_required");
  }

  const branch = {};
  for (const field of TEXT_FIELDS) branch[field] = input[field] || null;

  return {
    ...branch,
    latitude: parseNumber(input.latitude),
    longitude: parseNumber(input.longitude),
    is_proposed: parseBoolean(input.is_proposed),
  };
}

// Only the fields the client actually sent, so a PATCH-style update
// never overwrites columns with null.
export function toBranchUpdate(input) {
  const update = {};
  for (const field of TEXT_FIELDS) {
    if (input[field] !== undefined) update[field] = input[field];
  }
  if (input.latitude !== undefined) update.latitude = parseNumber(input.latitude);
  if (input.longitude !== undefined) update.longitude = parseNumber(input.longitude);
  if (input.is_proposed !== undefined) update.is_proposed = parseBoolean(input.is_proposed);
  return update;
}
