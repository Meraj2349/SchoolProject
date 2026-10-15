import httpClient from "@/lib/httpClient";

// Admin quiz calls (admin token via httpClient). Questions are shared by every
// branch; sessions and the leaderboard follow the selected branch.
const dataOf = (response) => response.data?.data;

export const quizAdminService = {
  /** { classKey, subject, search, status, page, pageSize } → { items, total, page, pageSize } */
  questions: (params) => httpClient.get("/quiz/admin/questions", { params }).then(dataOf),
  /** [{ subject, count }] for one class, hidden questions included */
  subjects: (classKey) => httpClient.get("/quiz/admin/questions/subjects", { params: { classKey } }).then(dataOf),
  createQuestion: (data) => httpClient.post("/quiz/admin/questions", data).then((r) => r.data),
  updateQuestion: (id, data) => httpClient.put(`/quiz/admin/questions/${id}`, data).then((r) => r.data),
  setQuestionActive: (id, active) => httpClient.patch(`/quiz/admin/questions/${id}/active`, { active }).then((r) => r.data),
  /** { classKey, subject, page, pageSize } → { items, total, page, pageSize } */
  sessions: (params) => httpClient.get("/quiz/admin/sessions", { params }).then(dataOf),
  leaderboard: (params) => httpClient.get("/quiz/admin/leaderboard", { params }).then(dataOf),
};
