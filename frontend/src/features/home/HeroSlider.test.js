import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import HeroSlider, { SLIDE_INTERVAL_MS } from "./HeroSlider";

vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));

const SLIDES = [
  { src: "/gate.jpg", alt: "The school gate" },
  { src: "/a.png", alt: "Sports day" },
  { src: "/b.png", alt: "Prize giving" },
];
const shown = () => screen.getAllByRole("group").find((slide) => slide.getAttribute("aria-hidden") !== "true");

describe("HeroSlider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useLanguageStore.getState().setLanguage("en");
    window.matchMedia = vi.fn(() => ({ matches: false }));
  });
  afterEach(() => vi.useRealTimers());

  it("welcomes visitors with the school's name and the two main actions", () => {
    render(<HeroSlider slides={SLIDES} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Star Shikkha Poribar");
    expect(screen.getByRole("link", { name: "Apply for admission" })).toHaveAttribute("href", "/apply");
    expect(screen.getByRole("link", { name: "Check results" })).toHaveAttribute("href", "/result");
  });

  it("moves between photos with the buttons and dots, wrapping around", () => {
    render(<HeroSlider slides={SLIDES} />);
    expect(shown()).toHaveAccessibleName("Photo 1 of 3");

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(shown()).toHaveAccessibleName("Photo 2 of 3");

    fireEvent.click(screen.getByRole("button", { name: "Photo 3 of 3" }));
    expect(screen.getByRole("button", { name: "Photo 3 of 3" })).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(shown()).toHaveAccessibleName("Photo 1 of 3");

    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(shown()).toHaveAccessibleName("Photo 3 of 3");
  });

  it("turns the photos by itself until paused", () => {
    render(<HeroSlider slides={SLIDES} />);

    act(() => vi.advanceTimersByTime(SLIDE_INTERVAL_MS));
    expect(shown()).toHaveAccessibleName("Photo 2 of 3");

    fireEvent.click(screen.getByRole("button", { name: "Pause slideshow" }));
    act(() => vi.advanceTimersByTime(SLIDE_INTERVAL_MS * 3));
    expect(shown()).toHaveAccessibleName("Photo 2 of 3");
    expect(screen.getByRole("button", { name: "Play slideshow" })).toBeInTheDocument();
  });

  it("stays still for visitors who prefer reduced motion", () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    render(<HeroSlider slides={SLIDES} />);

    act(() => vi.advanceTimersByTime(SLIDE_INTERVAL_MS * 2));
    expect(shown()).toHaveAccessibleName("Photo 1 of 3");
  });

  it("has no controls for a single photo", () => {
    render(<HeroSlider slides={SLIDES.slice(0, 1)} />);

    expect(screen.queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();
  });
});
