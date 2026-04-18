"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { eventsService } from "@/services/events.service";
import { useBranchStore } from "@/store/branchStore";

export function useEvents() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.events.all(branchId),
    queryFn: eventsService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: eventsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.all(branchId) }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: ({ id, data }) => eventsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.all(branchId) }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useMutation({
    mutationFn: eventsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.all(branchId) }),
  });
}
