"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { classesService } from "@/services/classes.service";
import { useBranchStore } from "@/store/branchStore";

export function useClasses() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.classes.all(branchId),
    queryFn: classesService.getAll,
    select: (data) => data?.data ?? data ?? [],
  });
}

export function useClassStudentCount(className) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.classes.studentCount(className, branchId),
    queryFn: () => classesService.getStudentCount(className),
    enabled: !!className,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: classesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.classes.all(branchId) });
      qc.invalidateQueries({ queryKey: queryKeys.classes.distinct(branchId) });
    },
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: ({ id, data }) => classesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.classes.all(branchId) });
      qc.invalidateQueries({ queryKey: queryKeys.classes.distinct(branchId) });
    },
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: classesService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.classes.all(branchId) });
      qc.invalidateQueries({ queryKey: queryKeys.classes.distinct(branchId) });
    },
  });
}
