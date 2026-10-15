/** Fills "{name}" placeholders in a translated string: fillTemplate("{n} items", { n: 3 }). */
export const fillTemplate = (template, values) =>
  String(template).replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match));
