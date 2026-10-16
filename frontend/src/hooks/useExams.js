"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { examsService } from "@/services/exams.service";

/** Exam names offered as suggestions on the public results search. */
export function useExamNames() {
  return useQuery({
    queryKey: queryKeys.exams.publicNames(),
    queryFn: examsService.getPublicNames,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
    staleTime: 5 * 60 * 1000,
  });
}
