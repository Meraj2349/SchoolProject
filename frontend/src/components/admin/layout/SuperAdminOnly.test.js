import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import SuperAdminOnly from "./SuperAdminOnly";

describe("SuperAdminOnly", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("names the page and says only the super admin can open it", () => {
    render(<SuperAdminOnly titleKey="sidebar.chairmanProfile" />);

    expect(screen.getByRole("heading", { level: 1, name: "Chairman Profile" })).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("Only the super admin can open this page.");
  });

  it("speaks Bangla", () => {
    useLanguageStore.getState().setLanguage("bn");
    render(<SuperAdminOnly titleKey="sidebar.admins" />);

    expect(screen.getByRole("note")).toHaveTextContent("এই পাতাটি শুধু সুপার অ্যাডমিন খুলতে পারেন।");
  });
});
