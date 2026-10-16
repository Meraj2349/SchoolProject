import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import ChairmanMessagePage from "./ChairmanMessagePage";

vi.mock("next/navigation", () => ({ usePathname: () => "/chairman-message" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/messages.service", () => ({
  messagesService: {
    getAll: async () => [
      { MessageID: 1, Messages: "Dear students and parents, welcome.", Show: 1 },
      { MessageID: 2, Messages: "Hidden draft", Show: 0 },
    ],
  },
}));
vi.mock("@/services/chairman.service", () => ({
  chairmanService: {
    getProfile: async () => ({
      name_en: "Md. Rashedul Islam", name_bn: "মোঃ রাশেদুল ইসলাম",
      title_en: "Chairman", title_bn: "চেয়ারম্যান",
      institution_en: "Star Shikkha Poribar", institution_bn: "স্টার শিক্ষা পরিবার",
      image_url: "/uploads/chairman/photo.png",
    }),
  },
}));

describe("ChairmanMessagePage", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("shows the chairman's published message under the page heading", async () => {
    renderWithQuery(<ChairmanMessagePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Chairman's Message" })).toBeInTheDocument();
    expect(await screen.findByText("Dear students and parents, welcome.")).toBeInTheDocument();
    expect(screen.queryByText("Hidden draft")).not.toBeInTheDocument();
  });

  it("names the chairman in the reader's language, with the photo from the server", async () => {
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<ChairmanMessagePage />);

    expect((await screen.findAllByText("মোঃ রাশেদুল ইসলাম")).length).toBeGreaterThan(0);
    expect(screen.getByRole("img", { name: /মোঃ রাশেদুল ইসলাম/ })).toHaveAttribute("data-src", "http://localhost:3000/uploads/chairman/photo.png");
  });

  it("links back to the home page", async () => {
    renderWithQuery(<ChairmanMessagePage />);

    expect(await screen.findByRole("link", { name: /Back to Home/ })).toHaveAttribute("href", "/");
  });
});
