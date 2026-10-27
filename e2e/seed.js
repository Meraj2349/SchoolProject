// Builds a fresh database for the browser tests and fills it with the data
// every public page shows. Uses the server's own integration-test setup
// (schema + helpers), so the data goes in exactly as the tests' does.
//
// The database named by E2E_DB_NAME (default school_e2e) is dropped first —
// never point it at real data.
import { createRequire } from "node:module";
import { E2E } from "./fixtures/data.js";
import { database, serverDbEnv } from "./fixtures/database.js";

// The server's own password hashing, so the accounts sign in like real ones.
const bcrypt = createRequire(new URL("../server/package.json", import.meta.url))("bcryptjs");

// The integration-test setup reads TEST_DB_*, the app's db module DB_*.
Object.assign(process.env, serverDbEnv, {
  TEST_DB_DIALECT: database.dialect,
  TEST_DB_HOST: database.host,
  TEST_DB_PORT: database.port,
  TEST_DB_USER: database.user,
  TEST_DB_PASSWORD: database.password,
  TEST_DB_NAME: database.name,
});

const { default: buildDatabase } = await import("../server/tests/integration/globalSetup.js");
await buildDatabase();
const { db, insert, resetDb, BRANCH_A, BRANCH_B } = await import("../server/tests/integration/helpers.js");

const today = new Date();
const day = (offset) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

try {
  await resetDb();
  await db.query(`UPDATE "Branches" SET name_en = ?, name_bn = ?, address_en = ?, address_bn = ? WHERE id = ?`, [
    E2E.branchA.en, E2E.branchA.bn, "Natiapara, Delduar, Tangail", "নাটিয়াপাড়া, দেলদুয়ার, টাঙ্গাইল", BRANCH_A,
  ]);
  await db.query(`UPDATE "Branches" SET name_en = ?, name_bn = ?, address_en = ?, address_bn = ? WHERE id = ?`, [
    E2E.branchB.en, E2E.branchB.bn, "Bathuli, Delduar, Tangail", "বাথুলী, দেলদুয়ার, টাঙ্গাইল", BRANCH_B,
  ]);

  // Admins who sign in through the login page (fixtures/data.js)
  const admin = async (account, role, branchId = null) =>
    insert("Admin", {
      Username: account.email.split("@")[0], Email: account.email,
      Password: await bcrypt.hash(account.password, 4), role, branch_id: branchId,
    });
  await admin(E2E.admins.super, "super_admin");
  await admin(E2E.admins.branch, "branch_admin", BRANCH_A);

  // People and classes
  const teacher = await insert("Teachers", {
    FirstName: E2E.teacher.first, LastName: E2E.teacher.last, Subject: "Bangla",
    ContactNumber: "01711000007", Email: "nasima@school.test", JoiningDate: "2020-01-05", branch_id: BRANCH_A,
  });
  await insert("Teachers", { FirstName: "Kamal", LastName: "Hossain", Subject: "Mathematics", branch_id: BRANCH_A });
  await insert("Teachers", { FirstName: "Rupa", LastName: "Begum", Subject: "English", branch_id: BRANCH_B });
  const class5 = await insert("Classes", { ClassName: "Class 5", Section: "Good", TeacherID: teacher, branch_id: BRANCH_A });
  const class6 = await insert("Classes", { ClassName: "Class 6", Section: "Good", branch_id: BRANCH_A });
  await insert("Classes", { ClassName: "Class 5", Section: "Good", branch_id: BRANCH_B });
  // Empty, for the admin tests' new students (no other test bills or counts it).
  await insert("Classes", { ClassName: "Class 8", Section: "Good", branch_id: BRANCH_A });

  const student = (first, roll, classId, branchId = BRANCH_A, gender = "Male") =>
    insert("Students", {
      FirstName: first, LastName: "Uddin", RollNumber: roll, DateOfBirth: "2015-03-01", Gender: gender,
      ClassID: classId, AdmissionDate: "2024-01-01", ParentContact: "01711000101", branch_id: branchId,
    });
  const rahim = await student(E2E.student.first, E2E.student.roll, class5);
  const karim = await student("Karim", "2", class5);
  const nadia = await student("Nadia", "10", class5, BRANCH_A, "Female");
  await student("Sabbir", "1", class6);

  // Attendance: today and yesterday for Class 5
  for (const [studentId, status] of [[rahim, "Present"], [karim, "Absent"], [nadia, "Late"]]) {
    for (const date of [day(0), day(-1)]) {
      await insert("Attendance", { StudentID: studentId, ClassID: class5, ClassDate: date, Status: status, branch_id: BRANCH_A });
    }
  }

  // Exams and results
  const exam = await insert("Exams", { ExamType: "Annual", ExamName: E2E.exam, ClassID: class5, ExamDate: day(-30), branch_id: BRANCH_A });
  const bangla = await insert("Subjects", { SubjectName: "Bangla", ClassID: class5, branch_id: BRANCH_A });
  const maths = await insert("Subjects", { SubjectName: "Mathematics", ClassID: class5, branch_id: BRANCH_A });
  for (const [studentId, marks] of [[rahim, [85, 78]], [karim, [62, 45]], [nadia, [91, 88]]]) {
    await insert("Results", { StudentID: studentId, ExamID: exam, SubjectID: bangla, ClassID: class5, MarksObtained: marks[0], branch_id: BRANCH_A });
    await insert("Results", { StudentID: studentId, ExamID: exam, SubjectID: maths, ClassID: class5, MarksObtained: marks[1], branch_id: BRANCH_A });
  }

  // Website content
  await insert("Notices", { Title: E2E.notice, Description: "School stays closed for the national holiday.", Show: true });
  await insert("Messages", { Messages: E2E.chairmanMessage, Show: true });
  await insert("News", { title_en: E2E.news.en, title_bn: E2E.news.bn, date: day(-2), link: "/events", is_active: true });
  await insert("NoticeAnnouncements", { title_en: "Admission open for 2027", title_bn: "২০২৭ সালের ভর্তি চলছে", category: "Admission", date: day(-1), is_published: true });
  await insert("Events", { EventName: E2E.event, EventType: "Cultural", StartDate: day(10), EndDate: day(11), Venue: "School field", Description: "Annual cultural programme", branch_id: BRANCH_A });
  await insert("Achievements", {
    title_en: E2E.achievement.en, title_bn: E2E.achievement.bn, category: "board_result", year: 2025,
    is_featured: true, is_published: true, exam_name: "SSC", examinees: 120, passed: 118, gpa5: 42,
  });
  await insert("Images", { ImagePath: `${E2E.frontendUrl}/images/photo.jpg`, PublicID: "e2e-1", Description: E2E.galleryCaption, ImageType: "school" });
  await insert("Images", { ImagePath: `${E2E.frontendUrl}/images/School Gate Picture.jpg`, PublicID: "e2e-2", Description: "School gate", ImageType: "event" });
  await insert("Routines", {
    RoutineTitle: E2E.routine, ClassID: class5, RoutineDate: day(-5), Description: "Class routine",
    FileURL: `${E2E.frontendUrl}/images/photo.jpg`, FileType: "image", IsActive: true, branch_id: BRANCH_A,
  });
  await insert("JobCirculars", {
    title_en: E2E.circular.en, title_bn: E2E.circular.bn, circular_date: day(-3), deadline: day(20),
    posts: JSON.stringify([{ title_en: E2E.post.en, title_bn: E2E.post.bn, vacancies: 2, qualification_en: "BSc", qualification_bn: "বিএসসি", salary_min: 12000, salary_max: 18000 }]),
    is_open: true, is_published: true, branch_id: BRANCH_A,
  });

  // Quiz questions for Class 5
  for (const [prompt, answer] of [["2 + 2 = ?", "B"], ["5 × 3 = ?", "C"], ["10 − 4 = ?", "A"]]) {
    await insert("QuizQuestions", {
      ClassKey: "5", Subject: "Mathematics", Prompt: prompt, PromptBn: prompt,
      OptionsJSON: JSON.stringify({ A: "6", B: "4", C: "15", D: "8" }),
      OptionsBnJSON: JSON.stringify({ A: "৬", B: "৪", C: "১৫", D: "৮" }),
      CorrectAnswer: answer, Active: true,
    });
  }
  console.log(`Seeded ${database.name} (${database.dialect})`);
} finally {
  await db.end();
}
