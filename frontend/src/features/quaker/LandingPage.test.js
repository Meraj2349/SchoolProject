import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import LandingPage from "./LandingPage";

vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));

describe("Quaker LandingPage", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("introduces the quizzes and links to starting one and to progress", () => {
    render(<LandingPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Practice smarter. Learn faster.");
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Huge Question Bank", "Instant Grading", "Track Progress"]);
    expect(screen.getByRole("link", { name: "Start Quiz" })).toHaveAttribute("href", "/quaker/start");
    expect(screen.getByRole("link", { name: "Check My Progress" })).toHaveAttribute("href", "/quaker/progress");
    expect(screen.getByRole("link", { name: "Start Now" })).toHaveAttribute("href", "/quaker/start");
  });

  it("speaks Bangla", () => {
    useLanguageStore.getState().setLanguage("bn");
    render(<LandingPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("আরও ভালোভাবে অনুশীলন করুন।");
    expect(screen.getByRole("link", { name: "কুইজ শুরু করুন" })).toHaveAttribute("href", "/quaker/start");
    expect(screen.queryByText("Huge Question Bank")).not.toBeInTheDocument();
  });
});
