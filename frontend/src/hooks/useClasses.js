"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { classesService } from "@/services/classes.service";
import { useBranchStore } from "@/store/branchStore";

// Standard fallback values used while queries are loading
const FALLBACK_CLASS_NAMES = [
  "Nursery", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
];
const FALLBACK_SECTIONS = ["Better", "Good", "General"];

export function useClasses() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.classes.all(branchId),
    queryFn: classesService.getAll,
    select: (data) => data?.data ?? data ?? [],
  });
}

// Returns the 11 standard class names (Nursery, 1-10) from ClassNames table
export function useClassNames() {
  return useQuery({
    queryKey: queryKeys.classes.names(),
    queryFn: classesService.getNames,
    select: (data) =>
      Array.isArray(data) && data.length > 0 ? data : FALLBACK_CLASS_NAMES,
    placeholderData: FALLBACK_CLASS_NAMES,
    staleTime: 10 * 60 * 1000, // 10 minutes — these rarely change
  });
}

// Returns the 3 fixed sections: ["Better", "Good", "General"]
export function useStandardSections() {
  return useQuery({
    queryKey: queryKeys.classes.standardSections(),
    queryFn: classesService.getStandardSections,
    select: (data) =>
      Array.isArray(data) && data.length > 0 ? data : FALLBACK_SECTIONS,
    placeholderData: FALLBACK_SECTIONS,
    staleTime: Infinity, // sections never change at runtime
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
