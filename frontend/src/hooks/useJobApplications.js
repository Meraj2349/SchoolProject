"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { jobApplicationsService } from "@/services/jobApplications.service";
import { useBranchStore } from "@/store/branchStore";

/** Public — sends an application (FormData). */
export function useSubmitJobApplication() {
  return useMutation({ mutationFn: (formData) => jobApplicationsService.submit(formData) });
}

// Admin — applications in the admin's scope, filtered by circular and status.
export function useJobApplications(filters = {}) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.jobApplications.list(filters, branchId),
    queryFn: () => jobApplicationsService.getAll(filters),
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

// Admin — { [circularId]: number of applications }.
export function useJobApplicationCounts() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.jobApplications.counts(branchId),
    queryFn: jobApplicationsService.getCounts,
    select: (data) => data ?? {},
  });
}

function useApplicationMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables) => mutationFn(variables),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.jobApplications.all }),
  });
}

export const useSetJobApplicationStatus = () => useApplicationMutation(({ id, status }) => jobApplicationsService.setStatus(id, status));

export const useDeleteJobApplication = () => useApplicationMutation((id) => jobApplicationsService.remove(id));

/** Admin — the CV as a Blob (sent with the admin's login, so it cannot be a plain link). */
export function useDownloadJobApplicationCv() {
  return useMutation({ mutationFn: (id) => jobApplicationsService.downloadCv(id) });
}
