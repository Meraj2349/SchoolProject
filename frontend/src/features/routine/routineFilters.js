// Framework-free helpers for the public routine page.

const time = (value) => {
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

/** Routines in the chosen class and section that match the search, newest first. */
export function filterRoutines(routines = [], { className = "", section = "", search = "" } = {}) {
  const query = search.trim().toLowerCase();
  return routines
    .filter((r) => !className || r.ClassName === className)
    .filter((r) => !section || r.Section === section)
    .filter((r) => !query || [r.RoutineTitle, r.Description, r.ClassName, r.Section].some((v) => String(v ?? "").toLowerCase().includes(query)))
    .sort((a, b) => time(b.RoutineDate) - time(a.RoutineDate));
}

/** "pdf", "image" or "file" (any other attachment) from the stored type or the file name; null when there is no file. */
export function fileKind({ FileType, FileURL } = {}) {
  if (!FileURL) return null;
  if (FileType === "pdf" || /\.pdf$/i.test(FileURL)) return "pdf";
  if (FileType === "image" || /\.(jpe?g|png|gif|webp)$/i.test(FileURL)) return "image";
  return "file";
}
