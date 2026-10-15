import { toPage } from "../../../shared/paging.js";
import { classKey } from "../domain/classKey.js";

const DEFAULT_LEADERBOARD = 20;
const MAX_LEADERBOARD = 100;

const optionalText = (value) => String(value ?? "").trim() || null;

/**
 * Quiz results for admins, scoped to the admin's branch (null = all branches).
 *
 * @param {object} deps
 * @param {{listSessions, leaderboard}} deps.quizRepository
 */
export function makeQuizResultsUseCases({ quizRepository }) {
  return {
    async listSessions({ branchId, classKey: key, subject, page, pageSize }) {
      const paging = toPage({ page, pageSize });
      const { items, total } = await quizRepository.listSessions({
        branchId,
        classKey: classKey(key),
        subject: optionalText(subject),
        offset: paging.offset,
        pageSize: paging.pageSize,
      });
      return { items, total, page: paging.page, pageSize: paging.pageSize };
    },

    leaderboard({ branchId, classKey: key, limit }) {
      const size = Number.parseInt(limit, 10);
      return quizRepository.leaderboard({
        branchId,
        classKey: classKey(key),
        limit: Number.isInteger(size) && size > 0 ? Math.min(size, MAX_LEADERBOARD) : DEFAULT_LEADERBOARD,
      });
    },
  };
}
