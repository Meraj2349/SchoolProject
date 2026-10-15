import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AtAGlance from "./AtAGlance";

vi.mock("@/services/branch.service", () => ({
  branchService: {
    getStats: async () => [
      { id: 1, studentCount: 1120, teacherCount: 40, classCount: 24, is_proposed: 0 },
      { id: 2, studentCount: 80, teacherCount: 5, classCount: 4, is_proposed: 0 },
    ],
  },
}));

const figure = async (label) => (await screen.findByText(label)).closest("li");

describe("AtAGlance", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: null });
  });

  it("shows the whole school's real numbers", async () => {
    renderWithQuery(<AtAGlance />);

    expect(await within(await figure("Students")).findByText("1,200")).toBeInTheDocument();
    expect(within(await figure("Teachers")).getByText("45")).toBeInTheDocument();
    expect(within(await figure("Branches")).getByText("2")).toBeInTheDocument();
  });

  it("shows the chosen branch's numbers, in Bangla digits for Bangla", async () => {
    useBranchStore.setState({ currentBranchId: 2 });
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<AtAGlance />);

    expect(await within(await figure("শিক্ষার্থী")).findByText("৮০")).toBeInTheDocument();
  });
});
