import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import PublicBranchSelector from "./PublicBranchSelector";

vi.mock("@/services/branch.service", () => ({
  branchService: {
    getAll: async () => [
      { id: 1, name_en: "Main Campus", name_bn: "প্রধান ক্যাম্পাস", is_proposed: 0 },
      { id: 2, name_en: "Future Campus", name_bn: "ভবিষ্যৎ", is_proposed: 1 },
    ],
  },
}));

describe("PublicBranchSelector", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: null, currentBranchName: null });
  });

  it("offers the active branches and switches the whole site to one", async () => {
    renderWithQuery(<PublicBranchSelector />);
    fireEvent.click(screen.getByRole("button", { name: /Switch Branch/ }));

    expect(screen.queryByRole("option", { name: /Future Campus/ })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole("option", { name: /Main Campus/ }));

    expect(useBranchStore.getState().currentBranchId).toBe(1);
    expect(screen.getByRole("button", { name: /Switch Branch/ })).toHaveTextContent("Main Campus");
  });

  it("names branches in Bangla and can go back to all branches", async () => {
    useLanguageStore.getState().setLanguage("bn");
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main Campus" });
    renderWithQuery(<PublicBranchSelector />);

    const button = screen.getByRole("button", { name: /শাখা পরিবর্তন/ });
    expect(button).toHaveTextContent("Main Campus"); // saved name while the list loads
    await waitFor(() => expect(button).toHaveTextContent("প্রধান ক্যাম্পাস"));
    fireEvent.click(screen.getByRole("button", { name: /শাখা পরিবর্তন/ }));
    fireEvent.click(screen.getByRole("option", { name: /সকল শাখা/ }));

    expect(useBranchStore.getState().currentBranchId).toBeNull();
  });
});
