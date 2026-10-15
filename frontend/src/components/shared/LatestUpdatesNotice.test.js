import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import LatestUpdatesNotice from "./LatestUpdatesNotice";

const getAll = vi.fn();
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: () => getAll() } }));
vi.mock("@/components/ui/LottieLoader", () => ({ default: () => null }));

describe("LatestUpdatesNotice", () => {
  beforeEach(() => {
    getAll.mockReset();
    useLanguageStore.getState().setLanguage("en");
  });

  it("scrolls the notices meant for the website", async () => {
    getAll.mockResolvedValue([
      { NoticeID: 1, Title: "Exam routine published", Description: "See the notice board", Show: 1, CreatedAt: "2026-10-01" },
      { NoticeID: 2, Title: "Draft", Description: "x", Show: 0, CreatedAt: "2026-10-02" },
    ]);
    renderWithQuery(<LatestUpdatesNotice />);

    expect(await screen.findByText("Exam routine published:")).toBeInTheDocument();
    expect(screen.queryByText("Draft:")).not.toBeInTheDocument();
  });

  it("takes no space when there is nothing to show", async () => {
    getAll.mockResolvedValue([]);
    const { container } = renderWithQuery(<LatestUpdatesNotice />);

    await vi.waitFor(() => expect(getAll).toHaveBeenCalled());
    await vi.waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
