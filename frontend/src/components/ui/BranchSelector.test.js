import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import BranchSelector from "./BranchSelector";

vi.mock("@/services/branch.service", () => ({
  branchService: {
    getAll: async () => [
      { id: 1, name_en: "Natiapara Head Office", name_bn: "নাটিয়াপাড়া প্রধান কার্যালয়" },
      { id: 2, name_en: "Bathuli Branch", name_bn: "বাথুলী শাখা" },
    ],
  },
}));

describe("BranchSelector (admin top bar)", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("bn");
    useBranchStore.getState().resetBranch();
  });

  it("lets a super admin choose a branch, named in the admin's language", async () => {
    useAuthStore.setState({ role: "super_admin", branchId: null });
    renderWithQuery(<BranchSelector />);

    const picker = screen.getByRole("combobox", { name: "একটি শাখা নির্বাচন করুন" });
    expect(await screen.findByRole("option", { name: "বাথুলী শাখা" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "সকল শাখা" })).toBeInTheDocument();

    fireEvent.change(picker, { target: { value: "2" } });

    expect(useBranchStore.getState().currentBranchId).toBe(2);
  });

  it("shows a branch admin their own branch in the admin's language", async () => {
    useAuthStore.setState({ role: "branch_admin", branchId: 1 });
    useBranchStore.getState().lockBranch(1, "Natiapara Head Office");
    renderWithQuery(<BranchSelector />);

    expect(await screen.findByText("নাটিয়াপাড়া প্রধান কার্যালয়")).toBeInTheDocument();
  });
});
