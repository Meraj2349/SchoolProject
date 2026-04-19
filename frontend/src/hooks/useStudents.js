"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { studentsService } from "@/services/students.service";
import { useBranchStore } from "@/store/branchStore";

// Total student count for the currently selected branch.
// Re-keys on branchId so a branch switch triggers a fresh fetch.
// The httpClient interceptor appends ?branch_id=X so the backend
// optionalAuth middleware scopes the COUNT query correctly.
export function useStudentCount() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.students.count(branchId),
    queryFn: studentsService.getCount,
    select: (data) => data?.data?.totalStudents ?? data?.totalStudents ?? 0,
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useStudentSearch(filters, enabled = false) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.students.search(filters, branchId),
    queryFn: () => studentsService.search(filters),
    enabled,
    staleTime: 0,
  });
}

export function useStudentsByClassSection(className, section, enabled = true) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.students.byClassSection(className, section, branchId),
    queryFn: () => studentsService.getByClassSection(className, section),
    enabled: enabled && !!className && !!section,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.students.all(branchId) }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: ({ id, data }) => studentsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.students.all(branchId) }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: studentsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.students.all(branchId) }),
  });
}
