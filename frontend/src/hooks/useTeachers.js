"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { teachersService } from "@/services/teachers.service";
import { useBranchStore } from "@/store/branchStore";

export function useTeachers() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.teachers.all(branchId),
    queryFn: teachersService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: teachersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teachers.all(branchId) }),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: ({ id, data }) => teachersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teachers.all(branchId) }),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: teachersService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teachers.all(branchId) }),
  });
}
