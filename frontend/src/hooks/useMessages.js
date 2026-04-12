"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { messagesService } from "@/services/messages.service";

export function useMessages() {
  return useQuery({
    queryKey: queryKeys.messages.all,
    queryFn: messagesService.getAll,
  });
}

export function useCreateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: messagesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.messages.all }),
  });
}

export function useUpdateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => messagesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.messages.all }),
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: messagesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.messages.all }),
  });
}
