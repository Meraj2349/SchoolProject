"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { imagesService } from "@/services/images.service";

export function useImages() {
  return useQuery({
    queryKey: queryKeys.images.all,
    queryFn: imagesService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

export function useImagesByStudent(studentId) {
  return useQuery({
    queryKey: queryKeys.images.byStudent(studentId),
    queryFn: () => imagesService.getByStudent(studentId),
    enabled: !!studentId,
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useImagesByTeacher(teacherId) {
  return useQuery({
    queryKey: queryKeys.images.byTeacher(teacherId),
    queryFn: () => imagesService.getByTeacher(teacherId),
    enabled: !!teacherId,
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useUploadImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: imagesService.upload,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.images.all }),
  });
}

export function useDeleteImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: imagesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.images.all }),
  });
}
