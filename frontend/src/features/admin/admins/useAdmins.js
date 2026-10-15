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

function useAdminMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    // Only the variables: React Query also passes its own context as a second argument.
    mutationFn: (variables) => mutationFn(variables),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins.all }),
  });
}

/** Creates (no id) or updates an admin, then refreshes the list. */
export const useSaveAdmin = () =>
  useAdminMutation(({ id, data }) => (id ? adminsService.update(id, data) : adminsService.create(data)));

/** Removes an admin, then refreshes the list. */
export const useRemoveAdmin = () => useAdminMutation((id) => adminsService.remove(id));
