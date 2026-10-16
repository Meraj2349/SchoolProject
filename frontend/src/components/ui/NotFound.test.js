import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import NotFound from "./NotFound";

vi.mock("next/navigation", () => ({ usePathname: () => "/missing" }));
vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));

describe("NotFound", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("shows the 404 message and a link back home", () => {
    renderWithQuery(<NotFound />);

    expect(screen.getByRole("heading", { level: 1, name: "Page Not Found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("banner")).toBeInTheDocument(); // inside the normal site header and footer
  });
});
