"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { chairmanService } from "@/services/chairman.service";

/** The chairman's profile (name, title, institution in en and bn). */
export function useChairmanProfile() {
  return useQuery({
    queryKey: queryKeys.chairman.profile,
    queryFn: chairmanService.getProfile,
    select: (data) => data?.data ?? data,
  });
}
