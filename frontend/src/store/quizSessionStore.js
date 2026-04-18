import { create } from "zustand";
import { quizTokenHolder } from "@/services/quiz.service";

/**
 * Holds quiz-session state (verified student + quiz token).
 * Token is kept in sessionStorage via quizTokenHolder so a page refresh
 * mid-quiz does not lose the session.
 */
export const useQuizSessionStore = create((set) => ({
  quizToken: null,
  student: null, // { studentId, firstName, lastName, className, section, branchId, rollNumber }

  setSession: (token, student) => {
    quizTokenHolder.set(token);
    set({ quizToken: token, student });
  },

  clearSession: () => {
    quizTokenHolder.clear();
    set({ quizToken: null, student: null });
  },

  /** Re-hydrate from sessionStorage after page reload (call in a useEffect). */
  hydrateFromStorage: () => {
    const token = quizTokenHolder.get();
    if (token) {
      set({ quizToken: token });
    }
  },
}));
