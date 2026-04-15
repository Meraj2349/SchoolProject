/**
 * Centralized React Query key factory.
 *
 * Branch-scoped keys include `branchId` so that when a super_admin switches
 * branches in BranchSelector, React Query detects a key change and re-fetches
 * automatically.  Pass `currentBranchId` from useBranchStore() at call site.
 *
 * branchId === null  → super_admin seeing all branches (or not yet selected)
 * branchId === number → scoped to that branch
 */
export const queryKeys = {
  notices: {
    all: ["notices"],
  },
  messages: {
    all: ["messages"],
  },
  events: {
    all: (branchId = null) => ["events", { branchId }],
    detail: (id) => ["events", id],
  },
  students: {
    all: (branchId = null) => ["students", { branchId }],
    search: (filters, branchId = null) => ["students", "search", filters, { branchId }],
    byClassSection: (cls, sec, branchId = null) => ["students", cls, sec, { branchId }],
    count: (branchId = null) => ["students", "count", { branchId }],
  },
  teachers: {
    all: (branchId = null) => ["teachers", { branchId }],
    search: (q, className = "", branchId = null) => ["teachers", "search", q, className, { branchId }],
  },
  classes: {
    all: (branchId = null) => ["classes", { branchId }],
    distinct: (branchId = null) => ["classes", "distinct", { branchId }],
    studentCount: (name, branchId = null) => ["classes", "count", name, { branchId }],
  },
  subjects: {
    all: (branchId = null) => ["subjects", { branchId }],
    byClass: (id, branchId = null) => ["subjects", "class", id, { branchId }],
  },
  exams: {
    all: (branchId = null) => ["exams", { branchId }],
    byClass: (id, branchId = null) => ["exams", "class", id, { branchId }],
  },
  results: {
    search: (filters, branchId = null) => ["results", "search", filters, { branchId }],
    byStudent: (id, branchId = null) => ["results", "student", id, { branchId }],
    byExam: (id, branchId = null) => ["results", "exam", id, { branchId }],
  },
  attendance: {
    all: (branchId = null) => ["attendance", { branchId }],
    byStudent: (id, branchId = null) => ["attendance", "student", id, { branchId }],
    stats: (branchId = null) => ["attendance", "statistics", { branchId }],
    grid: (cls, sec, start, end, branchId = null) => ["attendance", "grid", cls, sec, start, end, { branchId }],
  },
  routines: {
    all: (branchId = null) => ["routines", { branchId }],
    filters: (branchId = null) => ["routines", "filters", { branchId }],
    byClassSection: (cls, sec, branchId = null) => ["routines", cls, sec, { branchId }],
  },
  chairman: {
    profile: ["chairman", "profile"],
  },
  branches: {
    all: ["branches"],
    stats: ["branches", "stats"],
  },
  news: {
    all: ["news"],
    adminAll: ["news", "admin"],
  },
  noticeAnnouncements: {
    all: ["noticeAnnouncements"],
    published: ["noticeAnnouncements", "published"],
  },
  images: {
    all: ["images"],
    byType: (type) => ["images", "type", type],
    byStudent: (id) => ["images", "student", id],
    byTeacher: (id) => ["images", "teacher", id],
  },
};
