"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { teachersService } from "@/services/teachers.service";

export function useTeachers() {
  return useQuery({
    queryKey: queryKeys.teachers.all,
    queryFn: teachersService.getAll,
  });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teachersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teachers.all }),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => teachersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teachers.all }),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teachersService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teachers.all }),
  });
}
