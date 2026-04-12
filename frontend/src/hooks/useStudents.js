"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { studentsService } from "@/services/students.service";

export function useStudentSearch(filters, enabled = false) {
  return useQuery({
    queryKey: queryKeys.students.search(filters),
    queryFn: () => studentsService.search(filters),
    enabled,
    staleTime: 0,
  });
}

export function useStudentsByClassSection(className, section, enabled = true) {
  return useQuery({
    queryKey: queryKeys.students.byClassSection(className, section),
    queryFn: () => studentsService.getByClassSection(className, section),
    enabled: enabled && !!className && !!section,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.students.all }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => studentsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.students.all }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.students.all }),
  });
}
