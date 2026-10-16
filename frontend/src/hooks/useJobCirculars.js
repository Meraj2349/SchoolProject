"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { jobCircularsService } from "@/services/jobCirculars.service";
import { useBranchStore } from "@/store/branchStore";

const listOf = (data) => (Array.isArray(data) ? data : (data?.data ?? []));

// Public — the chosen branch's circulars (plus whole-school ones), open first.
export function usePublishedJobCirculars() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.jobCirculars.published(branchId),
    queryFn: jobCircularsService.getPublished,
    select: listOf,
  });
}

/** Circular ids are whole numbers; anything else (from the URL) is never sent to the API. */
export const isCircularId = (id) => /^\d+$/.test(String(id ?? ""));

// Public — one circular, for its own page.
export function useJobCircular(id) {
  return useQuery({
    queryKey: queryKeys.jobCirculars.detail(id),
    queryFn: () => jobCircularsService.getById(id),
    enabled: isCircularId(id),
    retry: false,
  });
}

// Admin — every circular in the admin's scope.
export function useAllJobCirculars() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.jobCirculars.admin(branchId),
    queryFn: jobCircularsService.getAll,
    select: listOf,
  });
}

function useCircularMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    // Only the variables: React Query also passes its own context as a second argument.
    mutationFn: (variables) => mutationFn(variables),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.jobCirculars.all });
      qc.invalidateQueries({ queryKey: queryKeys.jobApplications.all });
    },
  });
}

/** Creates (no id) or updates a circular from a FormData body. */
export const useSaveJobCircular = () =>
  useCircularMutation(({ id, formData }) => (id ? jobCircularsService.update(id, formData) : jobCircularsService.create(formData)));

export const useSetJobCircularPublished = () => useCircularMutation(({ id, isPublished }) => jobCircularsService.setPublished(id, isPublished));

export const useDeleteJobCircular = () => useCircularMutation((id) => jobCircularsService.remove(id));
