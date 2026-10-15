"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { useBranchStore } from "@/store/branchStore";
import { imagesService } from "@/services/images.service";

export function useImages() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: [...queryKeys.images.all, { branchId }],
    queryFn: imagesService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

export function useImagesByStudent(studentId) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: [...queryKeys.images.byStudent(studentId), { branchId }],
    queryFn: () => imagesService.getByStudent(studentId),
    enabled: !!studentId,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

export function useImagesByTeacher(teacherId) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: [...queryKeys.images.byTeacher(teacherId), { branchId }],
    queryFn: () => imagesService.getByTeacher(teacherId),
    enabled: !!teacherId,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
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
