import { describe, expect, it, jest } from "@jest/globals";
import { makeQuizResultsUseCases } from "./quizResults.usecases.js";

describe("quiz results", () => {
  it("pages through a branch's sessions, optionally for one class and subject", async () => {
    const listSessions = jest.fn(async () => ({ items: [{ id: 1 }], total: 41 }));
    const results = makeQuizResultsUseCases({ quizRepository: { listSessions } });

    const page = await results.listSessions({ branchId: 2, classKey: "Class 8", subject: " Math ", page: "3", pageSize: "20" });

    expect(page).toEqual({ items: [{ id: 1 }], total: 41, page: 3, pageSize: 20 });
    expect(listSessions).toHaveBeenCalledWith({ branchId: 2, classKey: "8", subject: "Math", offset: 40, pageSize: 20 });
  });

  it("treats an unknown or empty class as every class", async () => {
    const listSessions = jest.fn(async () => ({ items: [], total: 0 }));
    const results = makeQuizResultsUseCases({ quizRepository: { listSessions } });

    await results.listSessions({ branchId: null, classKey: "" });

    expect(listSessions).toHaveBeenCalledWith(expect.objectContaining({ branchId: null, classKey: null, subject: null }));
  });

  it("caps the leaderboard size", async () => {
    const leaderboard = jest.fn(async () => []);
    const results = makeQuizResultsUseCases({ quizRepository: { leaderboard } });

    await results.leaderboard({ branchId: 1, classKey: "10", limit: "5000" });
    await results.leaderboard({ branchId: 1, limit: "abc" });

    expect(leaderboard).toHaveBeenNthCalledWith(1, { branchId: 1, classKey: "10", limit: 100 });
    expect(leaderboard).toHaveBeenNthCalledWith(2, { branchId: 1, classKey: null, limit: 20 });
  });
});
