"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { noticesService } from "@/services/notices.service";

export function useNotices() {
  return useQuery({
    queryKey: queryKeys.notices.all,
    queryFn: noticesService.getAll,
  });
}

export function useCreateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: noticesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notices.all }),
  });
}

export function useUpdateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => noticesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notices.all }),
  });
}

export function useDeleteNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: noticesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notices.all }),
  });
}
