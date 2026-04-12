"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { routinesService } from "@/services/routines.service";

export function useRoutines() {
  return useQuery({
    queryKey: queryKeys.routines.all,
    queryFn: routinesService.getAll,
    select: (data) => data?.routines ?? data ?? [],
  });
}

export function useRoutineFilterOptions() {
  return useQuery({
    queryKey: queryKeys.routines.filters,
    queryFn: routinesService.getFilterOptions,
    select: (data) => data?.options ?? { classes: [], sections: [] },
  });
}

export function useCreateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, file }) => {
      const fd = new FormData();
      fd.append("RoutineTitle", data.RoutineTitle);
      fd.append("ClassID", data.ClassID);
      fd.append("RoutineDate", data.RoutineDate);
      if (data.Description) fd.append("Description", data.Description);
      if (file) fd.append("routineFile", file);
      return routinesService.create(fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.routines.all }),
  });
}

export function useUpdateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, file }) => {
      const fd = new FormData();
      Object.entries(data).forEach(
        ([k, v]) => v !== undefined && fd.append(k, v),
      );
      if (file) fd.append("routineFile", file);
      return routinesService.update(id, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.routines.all }),
  });
}

export function useDeleteRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: routinesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.routines.all }),
  });
}
