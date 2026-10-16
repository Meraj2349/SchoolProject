import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SiteImage from "./SiteImage";

vi.mock("next/image", () => ({
  default: ({ alt, src, unoptimized }) => <span role="img" aria-label={alt} data-src={src} data-unoptimized={String(Boolean(unoptimized))} />,
}));

describe("SiteImage", () => {
  it("loads files stored on the server directly from the server", () => {
    render(<SiteImage src="/uploads/branches/a.png" alt="Main campus" fill />);

    const image = screen.getByRole("img", { name: "Main campus" });
    expect(image).toHaveAttribute("data-src", "http://localhost:3000/uploads/branches/a.png");
    expect(image).toHaveAttribute("data-unoptimized", "true");
  });

  it("lets Next.js optimise the site's own images", () => {
    render(<SiteImage src="/images/logo1.png" alt="Logo" width={10} height={10} />);

    expect(screen.getByRole("img", { name: "Logo" })).toHaveAttribute("data-unoptimized", "false");
  });

  it("shows the fallback when there is no photo", () => {
    render(<SiteImage src={null} alt="Teacher" fallback={<span>AB</span>} />);

    expect(screen.getByText("AB")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
