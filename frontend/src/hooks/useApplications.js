"use client";

import { useMutation } from "@tanstack/react-query";
import { applicationService } from "@/services/application.service";

/** Sends an online admission application. */
export function useSubmitApplication() {
  return useMutation({ mutationFn: (application) => applicationService.submit(application) });
}
