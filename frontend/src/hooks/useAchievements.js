"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { achievementsService } from "@/services/achievements.service";
import { useBranchStore } from "@/store/branchStore";

const listOf = (data) => (Array.isArray(data) ? data : (data?.data ?? []));

// Public — the honours board of the chosen branch (plus whole-school items).
export function usePublishedAchievements() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.achievements.published(branchId),
    queryFn: achievementsService.getPublished,
    select: listOf,
  });
}

// Admin — every achievement in the admin's scope, published or not.
export function useAllAchievements() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.achievements.admin(branchId),
    queryFn: achievementsService.getAll,
    select: listOf,
  });
}

function useAchievementMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    // Only the variables: React Query also passes its own context as a second argument.
    mutationFn: (variables) => mutationFn(variables),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.achievements.all }),
  });
}

/** Creates (no id) or updates an achievement from a FormData body. */
export const useSaveAchievement = () =>
  useAchievementMutation(({ id, formData }) =>
    id ? achievementsService.update(id, formData) : achievementsService.create(formData),
  );

export const useSetAchievementPublished = () =>
  useAchievementMutation(({ id, isPublished }) => achievementsService.setPublished(id, isPublished));

export const useDeleteAchievement = () => useAchievementMutation((id) => achievementsService.remove(id));
