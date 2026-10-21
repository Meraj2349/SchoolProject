/**
 * A branch's name in the reader's language, falling back to the other.
 * Accepts the attendance API's { nameBn, nameEn } and the branches list's { name_bn, name_en }.
 */
export function branchName(branch, language = "en") {
  if (!branch) return "";
  const bn = branch.nameBn ?? branch.name_bn;
  const en = branch.nameEn ?? branch.name_en;
  return (language === "bn" ? bn || en : en || bn) || "";
}
