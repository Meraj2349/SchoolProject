import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { EmptyState, ErrorState, SiteLoader } from "./states";

describe("page states", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("says it is loading, in the reader's language", () => {
    const { unmount } = render(<SiteLoader />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    unmount();

    useLanguageStore.getState().setLanguage("bn");
    render(<SiteLoader />);
    expect(screen.getByRole("status")).toHaveTextContent("লোড হচ্ছে");
  });

  it("explains an empty result", () => {
    render(<EmptyState title="No events" message="Check back soon." />);

    expect(screen.getByText("No events")).toBeInTheDocument();
    expect(screen.getByText("Check back soon.")).toBeInTheDocument();
  });

  it("reports an error and offers to try again", () => {
    const retry = vi.fn();
    render(<ErrorState message="Could not load events." onRetry={retry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load events.");
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(retry).toHaveBeenCalled();
  });
});
