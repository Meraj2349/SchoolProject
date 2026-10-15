"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { feesService } from "@/services/fees.service";
import { useWriteBranch } from "@/hooks/useWriteBranch";

const dataOf = (body) => body?.data;

/** The branch fee data belongs to; a super admin on "All branches" cannot change fees. */
export const useFeeBranch = useWriteBranch;

const useFeeQuery = (keyOf, fetch, { enabled = true } = {}) => {
  const { branchId } = useFeeBranch();
  return useQuery({ queryKey: keyOf(branchId), queryFn: fetch, select: dataOf, enabled });
};

export const useFeeSummary = (period) =>
  useFeeQuery((b) => queryKeys.fees.summary(period, b), () => feesService.getSummary(period));

export const useInvoices = (filters) =>
  useFeeQuery((b) => queryKeys.fees.invoices(filters, b), () => feesService.getInvoices(filters));

export const useInvoice = (invoiceId) =>
  useFeeQuery((b) => queryKeys.fees.invoice(invoiceId, b), () => feesService.getInvoice(invoiceId));

export const useLedger = (studentId) =>
  useFeeQuery((b) => queryKeys.fees.ledger(studentId, b), () => feesService.getLedger(studentId));

export const useReceipt = (paymentId) =>
  useFeeQuery((b) => queryKeys.fees.receipt(paymentId, b), () => feesService.getReceipt(paymentId));

export const useFeeSettings = ({ enabled }) =>
  useFeeQuery((b) => queryKeys.fees.settings(b), feesService.getSettings, { enabled });

export const useStructures = (year, { enabled }) =>
  useFeeQuery((b) => queryKeys.fees.structures(year, b), () => feesService.getStructures({ academic_year: year }), { enabled });

export const useHeads = ({ enabled = true } = {}) =>
  useFeeQuery((b) => queryKeys.fees.heads(b), feesService.getHeads, { enabled });

/**
 * A fee write. Afterwards every fee query (and the dashboard, which shows fee
 * totals) is refreshed. `mutateAsync` resolves with the response body.
 */
export function useFeeMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    // Only the variables: React Query also passes its own context as a second argument.
    mutationFn: (variables) => mutationFn(variables),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.fees.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
