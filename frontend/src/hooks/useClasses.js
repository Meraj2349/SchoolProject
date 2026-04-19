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
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

// Distinct class names live from the Classes table — branch-scoped via httpClient.
// Re-key on branchId so switching branches forces a fetch; refetch on mount/focus
// so admin-added classes show up without waiting for the user to refresh.
export function useClassNames() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.classes.names(branchId),
    queryFn: classesService.getNames,
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

// Distinct sections live from the Classes table — branch-scoped.
export function useStandardSections() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.classes.standardSections(branchId),
    queryFn: classesService.getStandardSections,
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
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
      qc.invalidateQueries({ queryKey: ["classes", "names"] });
      qc.invalidateQueries({ queryKey: ["classes", "standard-sections"] });
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
      qc.invalidateQueries({ queryKey: ["classes", "names"] });
      qc.invalidateQueries({ queryKey: ["classes", "standard-sections"] });
    },
  });
}

// Per-branch teacher assignment (ClassTeacherAssignments). Branch_admin allowed.
export function useAssignTeacher() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: ({ classId, teacherId }) =>
      classesService.assignTeacher(classId, teacherId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.classes.all(branchId) });
    },
  });
}

export function useUnassignTeacher() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: (classId) => classesService.unassignTeacher(classId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.classes.all(branchId) });
    },
  });
}

export function useHardDeleteClass() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: classesService.hardRemove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.classes.all(branchId) });
      qc.invalidateQueries({ queryKey: queryKeys.classes.distinct(branchId) });
      qc.invalidateQueries({ queryKey: ["classes", "names"] });
      qc.invalidateQueries({ queryKey: ["classes", "standard-sections"] });
    },
  });
}
