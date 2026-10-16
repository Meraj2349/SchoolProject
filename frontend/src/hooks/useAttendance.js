"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { attendanceService } from "@/services/attendance.service";
import { useBranchStore } from "@/store/branchStore";

/** Attendance records of one class and section; runs once both are given. */
export function useAttendanceSearch(className, section) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.attendance.byClassSection(className, section, branchId),
    queryFn: () => attendanceService.getByClassSection(className, section),
    enabled: !!className && !!section,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

/** Admin — a class's students with their status that day and who took it; runs once a class is chosen. */
export function useAttendanceRoster(classId, date) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.attendance.roster(classId, date, branchId),
    queryFn: () => attendanceService.getRoster(classId, date),
    enabled: !!classId && !!date,
    select: (data) => data?.data ?? null,
  });
}

/** Admin — saves a class's whole day in one request. */
export function useSaveAttendanceDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, date, entries }) => attendanceService.saveDay(classId, date, entries),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.attendance.prefix }),
  });
}

/** Admin — the day's SMS to parents of absent children. */
export function useAbsenceSms(date) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.attendance.sms(date, branchId),
    queryFn: () => attendanceService.getSms(date),
    enabled: !!date,
    select: (data) => data?.data ?? [],
  });
}
