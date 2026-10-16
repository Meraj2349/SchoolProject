"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { quizService } from "@/services/quiz.service";

/** { ClassName, Section } rows of one branch, for the quiz identity form; waits for a branch. */
export function useQuizClasses(branchId) {
  return useQuery({
    queryKey: queryKeys.quiz.classes(branchId),
    queryFn: () => quizService.classesOf(branchId),
    enabled: !!branchId,
    select: (rows) => (Array.isArray(rows) ? rows : []),
  });
}
