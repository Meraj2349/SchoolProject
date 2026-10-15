import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import { ContentScopeBadge, NewContentScopeNote } from "./ContentScope";

vi.mock("@/services/branch.service", () => ({
  branchService: { getAll: async () => [{ id: 1, name_en: "Main", name_bn: "প্রধান" }, { id: 2, name_en: "North", name_bn: "উত্তর" }] },
}));

describe("ContentScopeBadge", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("says whole school for an item without a branch", () => {
    renderWithQuery(<ContentScopeBadge branchId={null} />);

    expect(screen.getByText("Whole school")).toBeInTheDocument();
  });

  it("names the item's branch", async () => {
    renderWithQuery(<ContentScopeBadge branchId={2} />);

    expect(await screen.findByText("North")).toBeInTheDocument();
  });

  it("names the branch in Bangla", async () => {
    useLanguageStore.getState().setLanguage("bn");

    renderWithQuery(<ContentScopeBadge branchId={1} />);

    expect(await screen.findByText("প্রধান")).toBeInTheDocument();
  });
});

describe("NewContentScopeNote", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "super_admin" });
  });

  it("tells a super admin on All branches that new items are for the whole school", () => {
    useBranchStore.setState({ currentBranchId: null });

    renderWithQuery(<NewContentScopeNote />);

    expect(screen.getByRole("note")).toHaveTextContent(/published for the whole school/);
  });

  it("names the chosen branch", async () => {
    useBranchStore.setState({ currentBranchId: 2 });

    renderWithQuery(<NewContentScopeNote />);

    await waitFor(() => expect(screen.getByRole("note")).toHaveTextContent("New items are published for North."));
  });
});
