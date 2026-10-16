import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import PublicPage from "./PublicPage";

vi.mock("next/navigation", () => ({ usePathname: () => "/about" }));
vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));

describe("PublicPage", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("wraps a page in the shared header, main content and footer", () => {
    renderWithQuery(
      <PublicPage>
        <p>Page body</p>
      </PublicPage>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Page body");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
