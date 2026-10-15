"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { PRE_PRIMARY, classKeyOf, classLabel } from "@/lib/schoolClass";
import { classesService } from "@/services/classes.service";
import { quizAdminService } from "@/services/quizAdmin.service";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";

const listOf = (body) => (Array.isArray(body) ? body : (body?.data ?? []));

/** School classes as { key, name }, from the ClassNames list, without repeats. */
export const useSchoolClasses = () =>
  useQuery({
    queryKey: queryKeys.classes.names(),
    queryFn: classesService.getNames,
    select: (body) => {
      const seen = new Set();
      return listOf(body)
        .map((name) => ({ key: classKeyOf(name), name }))
        .filter(({ key }) => key && !seen.has(key) && seen.add(key));
    },
  });

// Play, Nursery, KG, then Class 1..12.
const schoolOrder = (key) => (PRE_PRIMARY.includes(key) ? PRE_PRIMARY.indexOf(key) : 10 + Number(key));

/** Class choices for selects: [{ key, label }] in school order, labelled in the site language. */
export function useClassOptions() {
  const language = useLanguageStore((s) => s.language);
  const { data = [] } = useSchoolClasses();
  return [...data]
    .sort((a, b) => schoolOrder(a.key) - schoolOrder(b.key))
    .map(({ key }) => ({ key, label: classLabel(key, language) }));
}

export const useQuestions = (filters) =>
  useQuery({
    queryKey: queryKeys.quiz.questions(filters),
    queryFn: () => quizAdminService.questions(filters),
    enabled: Boolean(filters.classKey),
    placeholderData: keepPreviousData,
  });

export const useQuestionSubjects = (classKey) =>
  useQuery({
    queryKey: queryKeys.quiz.subjects(classKey),
    queryFn: () => quizAdminService.subjects(classKey),
    enabled: Boolean(classKey),
  });

export function useQuizSessions(filters) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.quiz.sessions(filters, branchId),
    queryFn: () => quizAdminService.sessions(filters),
    placeholderData: keepPreviousData,
  });
}

export function useLeaderboard(filters) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.quiz.leaderboard(filters, branchId),
    queryFn: () => quizAdminService.leaderboard(filters),
  });
}

function useQuizMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    // Only the variables: React Query also passes its own context as a second argument.
    mutationFn: (variables) => mutationFn(variables),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.quiz.all }),
  });
}

/** Adds (no id) or edits a question. */
export const useSaveQuestion = () =>
  useQuizMutation(({ id, data }) => (id ? quizAdminService.updateQuestion(id, data) : quizAdminService.createQuestion(data)));

export const useSetQuestionActive = () => useQuizMutation(({ id, active }) => quizAdminService.setQuestionActive(id, active));
