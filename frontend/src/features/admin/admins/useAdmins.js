"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { adminsService } from "@/services/admins.service";
import { branchService } from "@/services/branch.service";

const listOf = (body) => body?.data ?? (Array.isArray(body) ? body : []);

export const useAdmins = ({ enabled }) =>
  useQuery({ queryKey: queryKeys.admins.all, queryFn: adminsService.getAll, select: listOf, enabled });

export const useBranches = ({ enabled }) =>
  useQuery({ queryKey: queryKeys.branches.all, queryFn: branchService.getAll, select: listOf, enabled });

/** A save or remove that refreshes the admin list afterwards. */
export function useAdminMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    // Only the variables: React Query also passes its own context as a second argument.
    mutationFn: (variables) => mutationFn(variables),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins.all }),
  });
}
