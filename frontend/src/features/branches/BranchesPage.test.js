import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import BranchesPage from "./BranchesPage";

vi.mock("next/navigation", () => ({ usePathname: () => "/branches" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({
  branchService: {
    getAll: async () => [
      {
        id: 1, name_en: "Main Campus", name_bn: "প্রধান ক্যাম্পাস", address_en: "Natiapara", address_bn: "নাটিয়াপাড়া",
        latitude: 24.17, longitude: 90.01, established_date: "2001-01-01", image_url: "/uploads/branches/main.png", is_proposed: 0,
      },
      { id: 2, name_en: "Future Campus", name_bn: "ভবিষ্যৎ ক্যাম্পাস", is_proposed: 1 },
    ],
    getStats: async () => [{ id: 1, studentCount: 1240, teacherCount: 40, classCount: 24 }],
  },
}));

const card = async (name) => (await screen.findByRole("heading", { name })).closest("article");

describe("BranchesPage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: null, currentBranchName: null });
  });

  it("lists active and proposed branches with their numbers and directions", async () => {
    renderWithQuery(<BranchesPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Our Branches" })).toBeInTheDocument();
    const main = await card("Main Campus");
    expect(within(main).getByText("1,240")).toBeInTheDocument();
    expect(within(main).getByRole("link", { name: /Get Directions/ })).toHaveAttribute("href", "https://www.google.com/maps?q=24.17,90.01");
    expect(within(main).getByRole("img", { name: "Main Campus" })).toHaveAttribute("data-src", "http://localhost:3000/uploads/branches/main.png");
    expect(within(await card("Future Campus")).getByText("Proposed")).toBeInTheDocument();
  });

  it("switches the site to a branch and back", async () => {
    renderWithQuery(<BranchesPage />);

    fireEvent.click(within(await card("Main Campus")).getByRole("button", { name: /Choose this branch/ }));

    expect(useBranchStore.getState().currentBranchId).toBe(1);
    expect(screen.getByRole("status")).toHaveTextContent("Main Campus");
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(useBranchStore.getState().currentBranchId).toBeNull();
  });

  it("reads in Bangla, numbers and dates included", async () => {
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<BranchesPage />);

    const main = await card("প্রধান ক্যাম্পাস");
    expect(within(main).getByText("১,২৪০")).toBeInTheDocument();
    expect(within(main).getByText(/২০০১/)).toBeInTheDocument();
  });
});
