"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { quizService } from "@/services/quiz.service";
import { useQuizSessionStore } from "@/store/quizSessionStore";

/** Checks a student against the register and starts their quiz session. */
export function useVerifyQuizStudent() {
  const setSession = useQuizSessionStore((s) => s.setSession);
  return useMutation({
    mutationFn: (identity) => quizService.verifyStudent(identity),
    onSuccess: ({ token, student }) => setSession(token, student),
  });
}

/** The signed-in student's totals, subject averages and quiz history. */
export function useMyQuizProgress(token) {
  return useQuery({
    queryKey: queryKeys.quiz.mine(token),
    queryFn: async () => {
      const [progress, sessions] = await Promise.all([quizService.myProgress(), quizService.mySessions()]);
      return { progress: progress ?? {}, sessions: Array.isArray(sessions) ? sessions : [] };
    },
    enabled: !!token,
    retry: false,
  });
}
