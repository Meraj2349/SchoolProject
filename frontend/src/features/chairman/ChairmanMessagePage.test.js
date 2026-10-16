import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import ChairmanMessagePage from "./ChairmanMessagePage";

vi.mock("next/navigation", () => ({ usePathname: () => "/chairman-message" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
const messages = vi.hoisted(() => ({ list: null }));
const profile = vi.hoisted(() => ({ imageUrl: "/uploads/chairman/photo.png" }));
vi.mock("@/services/messages.service", () => ({
  messagesService: {
    getAll: async () => messages.list ?? [
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
      image_url: profile.imageUrl,
    }),
  },
}));

describe("ChairmanMessagePage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    messages.list = null;
    profile.imageUrl = "/uploads/chairman/photo.png";
  });

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

  it("falls back to his own words when no message is published", async () => {
    messages.list = [];
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<ChairmanMessagePage />);

    expect(screen.getByRole("heading", { level: 1, name: "চেয়ারম্যানের কথা" })).toBeInTheDocument();
    expect(await screen.findByText(/টাঙ্গাইল জেলাকে স্টার শিক্ষা পরিবারের মাধ্যমে সার্বিক শিক্ষা ব্যবস্থার উন্নয়ন এবং আধুনিক শিক্ষার মডেল হিসেবে গড়ে তুলবো ইনশাআল্লাহ্/)).toBeInTheDocument();
    expect(screen.getAllByText("চেয়ারম্যান").length).toBeGreaterThan(0);
    expect(screen.queryByText(/প্রতিষ্ঠাতা/)).not.toBeInTheDocument();
  });

  it("shows his photo until an admin uploads one, and his mobile number", async () => {
    profile.imageUrl = null;
    renderWithQuery(<ChairmanMessagePage />);

    expect(await screen.findByRole("img", { name: /Md\. Rashedul Islam/ })).toHaveAttribute("data-src", "/images/chairman.jpg");
    expect(screen.getByRole("link", { name: /01915-680214/ })).toHaveAttribute("href", "tel:+8801915680214");
  });
});
