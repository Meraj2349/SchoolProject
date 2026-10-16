import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import GalleryPage from "./GalleryPage";

vi.mock("next/navigation", () => ({ usePathname: () => "/gallery" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/images.service", () => ({
  imagesService: {
    getAll: async () => [
      { ImageID: 1, ImageType: "event", ImagePath: "https://cdn.test/1.png", Description: "Prize giving" },
      { ImageID: 2, ImageType: "school", ImagePath: "/uploads/2.png", Description: "Our campus" },
      { ImageID: 3, ImageType: "event", ImagePath: "https://cdn.test/3.png", Description: "Sports day" },
    ],
  },
}));

describe("GalleryPage", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("shows the photos, and filters them by category", async () => {
    renderWithQuery(<GalleryPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Gallery" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Our campus" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Our campus" })).toHaveAttribute("data-src", "http://localhost:3000/uploads/2.png");

    fireEvent.click(screen.getByRole("button", { name: "Events" }));

    expect(screen.getByRole("button", { name: "Events" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "Our campus" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sports day" })).toBeInTheDocument();
  });

  it("opens a photo in a viewer that works with the keyboard", async () => {
    renderWithQuery(<GalleryPage />);
    const opener = await screen.findByRole("button", { name: "Prize giving" });

    fireEvent.click(opener);
    const viewer = screen.getByRole("dialog", { name: "Prize giving" });
    expect(within(viewer).getByRole("button", { name: "Close" })).toHaveFocus();
    expect(within(viewer).getByText("1 of 3")).toBeInTheDocument();

    fireEvent.click(within(viewer).getByRole("button", { name: "Next photo" }));
    expect(screen.getByRole("dialog", { name: "Our campus" })).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement, { key: "ArrowLeft" });
    expect(screen.getByRole("dialog", { name: "Prize giving" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
