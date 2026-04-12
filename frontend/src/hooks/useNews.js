"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { newsService } from "@/services/news.service";

// Public hook — fetches only active news (for the homepage)
export function useNews() {
  return useQuery({
    queryKey: queryKeys.news.all,
    queryFn: newsService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

// Admin hook — fetches all news including inactive
export function useAllNews() {
  return useQuery({
    queryKey: queryKeys.news.adminAll,
    queryFn: newsService.getAllAdmin,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: newsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.news.all });
      qc.invalidateQueries({ queryKey: queryKeys.news.adminAll });
    },
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => newsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.news.all });
      qc.invalidateQueries({ queryKey: queryKeys.news.adminAll });
    },
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: newsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.news.all });
      qc.invalidateQueries({ queryKey: queryKeys.news.adminAll });
    },
  });
}
