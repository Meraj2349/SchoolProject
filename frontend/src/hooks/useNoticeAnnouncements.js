"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { noticeAnnouncementsService } from "@/services/notice-announcements.service";

// Public hook — fetches only published notice announcements
export function usePublishedNoticeAnnouncements() {
  return useQuery({
    queryKey: queryKeys.noticeAnnouncements.published,
    queryFn: noticeAnnouncementsService.getPublished,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

// Admin hook — fetches all notice announcements
export function useAllNoticeAnnouncements() {
  return useQuery({
    queryKey: queryKeys.noticeAnnouncements.all,
    queryFn: noticeAnnouncementsService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

export function useCreateNoticeAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: noticeAnnouncementsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.noticeAnnouncements.all });
      qc.invalidateQueries({
        queryKey: queryKeys.noticeAnnouncements.published,
      });
    },
  });
}

export function useUpdateNoticeAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) =>
      noticeAnnouncementsService.update(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.noticeAnnouncements.all });
      qc.invalidateQueries({
        queryKey: queryKeys.noticeAnnouncements.published,
      });
    },
  });
}

export function useToggleNoticeAnnouncementPublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_published }) =>
      noticeAnnouncementsService.togglePublish(id, is_published),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.noticeAnnouncements.all });
      qc.invalidateQueries({
        queryKey: queryKeys.noticeAnnouncements.published,
      });
    },
  });
}

export function useDeleteNoticeAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: noticeAnnouncementsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.noticeAnnouncements.all });
      qc.invalidateQueries({
        queryKey: queryKeys.noticeAnnouncements.published,
      });
    },
  });
}
