"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { classesService } from "@/services/classes.service";

export function useClasses() {
  return useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: classesService.getAll,
    select: (data) => data?.data ?? data ?? [],
  });
}

export function useClassStudentCount(className) {
  return useQuery({
    queryKey: queryKeys.classes.studentCount(className),
    queryFn: () => classesService.getStudentCount(className),
    enabled: !!className,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: classesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.classes.all }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => classesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.classes.all }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: classesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.classes.all }),
  });
}
