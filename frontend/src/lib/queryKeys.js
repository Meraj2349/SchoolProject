export const queryKeys = {
  notices: {
    all: ["notices"],
  },
  messages: {
    all: ["messages"],
  },
  events: {
    all: ["events"],
    detail: (id) => ["events", id],
  },
  students: {
    all: ["students"],
    search: (filters) => ["students", "search", filters],
    byClassSection: (cls, sec) => ["students", cls, sec],
    count: ["students", "count"],
  },
  teachers: {
    all: ["teachers"],
  },
  classes: {
    all: ["classes"],
    studentCount: (name) => ["classes", "count", name],
  },
  subjects: {
    all: ["subjects"],
    byClass: (id) => ["subjects", "class", id],
  },
  exams: {
    all: ["exams"],
    byClass: (id) => ["exams", "class", id],
  },
  results: {
    search: (filters) => ["results", "search", filters],
    byStudent: (id) => ["results", "student", id],
    byExam: (id) => ["results", "exam", id],
  },
  attendance: {
    all: ["attendance"],
    byStudent: (id) => ["attendance", "student", id],
    stats: ["attendance", "statistics"],
  },
  routines: {
    all: ["routines"],
    filters: ["routines", "filters"],
    byClassSection: (cls, sec) => ["routines", cls, sec],
  },
  branches: {
    all: ["branches"],
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
