import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import NotFound from "./NotFound";

describe("NotFound", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("shows the 404 message and a link back home", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  });
});
