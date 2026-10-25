// The seeded values the tests look for (seed.js writes them).
export const E2E = {
  frontendUrl: "http://localhost:5173",
  branchA: { en: "Natiapara Head Office", bn: "নাটিয়াপাড়া প্রধান কার্যালয়" },
  branchB: { en: "Bathuli Branch", bn: "বাথুলী শাখা" },
  teacher: { first: "Nasima", last: "Akter" },
  student: { first: "Rahim", roll: "1" },
  exam: "Annual Exam 2026",
  notice: "Holiday on Victory Day",
  chairmanMessage: "Education is the light of the nation.",
  news: { en: "Science fair winners announced", bn: "বিজ্ঞান মেলার বিজয়ীদের নাম ঘোষণা" },
  event: "Cultural Evening",
  achievement: { en: "SSC 2025: 98% passed", bn: "এসএসসি ২০২৫: ৯৮% পাস" },
  galleryCaption: "Morning assembly",
  routine: "Class 5 weekly routine",
  circular: { en: "Teachers wanted 2026", bn: "শিক্ষক নিয়োগ ২০২৬" },
  post: { en: "Assistant Teacher (Maths)", bn: "সহকারী শিক্ষক (গণিত)" },

  // Admin accounts that sign in through the real login page. `settings` is
  // only for the change-password test, so the others keep their password.
  admins: {
    super: { email: "head@school.test", password: "Head-Office-2026" },
    branch: { email: "natiapara@school.test", password: "Natiapara-2026" },
    settings: { email: "settings@school.test", password: "Settings-2026" },
  },
};
