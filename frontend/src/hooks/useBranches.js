"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { branchService } from "@/services/branch.service";

export function useBranches() {
  return useQuery({
    queryKey: queryKeys.branches.all,
    queryFn: branchService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => branchService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.branches.all });
      qc.invalidateQueries({ queryKey: queryKeys.branches.stats });
    },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => branchService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.branches.all });
      qc.invalidateQueries({ queryKey: queryKeys.branches.stats });
    },
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => branchService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.branches.all });
      qc.invalidateQueries({ queryKey: queryKeys.branches.stats });
    },
  });
}
