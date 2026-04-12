"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { eventsService } from "@/services/events.service";

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events.all,
    queryFn: eventsService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eventsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.all }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => eventsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.all }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eventsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.all }),
  });
}
