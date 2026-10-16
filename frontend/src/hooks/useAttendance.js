"use client";

import { useQuery } from "@tanstack/react-query";
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
