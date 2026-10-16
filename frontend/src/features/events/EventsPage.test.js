import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import EventsPage from "./EventsPage";

const getAll = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/events" }));
vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/events.service", () => ({ eventsService: { getAll: () => getAll() } }));

const EVENTS = [
  { EventID: 1, EventName: "Annual Sports Day", EventType: "Sports", StartDate: "2099-01-10", EndDate: "2099-01-10T00:00:00.000Z", Venue: "School field" },
  { EventID: 2, EventName: "Science Fair 2020", EventType: "Academic", StartDate: "2020-02-01", EndDate: "2020-02-02" },
];

describe("EventsPage", () => {
  beforeEach(() => {
    getAll.mockReset().mockResolvedValue(EVENTS);
    useLanguageStore.getState().setLanguage("en");
  });

  it("lists upcoming events with a countdown, and past events separately", async () => {
    renderWithQuery(<EventsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Events" })).toBeInTheDocument();
    const upcoming = await screen.findByRole("region", { name: /Upcoming Events/ });
    expect(within(upcoming).getByText("Annual Sports Day")).toBeInTheDocument();
    expect(within(upcoming).getByText("School field")).toBeInTheDocument();
    expect(within(upcoming).getByText("Ends in:")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: /Past events/ })).getByText("Science Fair 2020")).toBeInTheDocument();
  });

  it("is written in Bangla, dates included", async () => {
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<EventsPage />);

    expect(await screen.findByRole("region", { name: /পুরোনো অনুষ্ঠান/ })).toBeInTheDocument();
    expect(screen.getByText(/১০ জানু/)).toBeInTheDocument();
    expect(screen.getByText("খেলাধুলা")).toBeInTheDocument();
  });

  it("says when there are no events and offers to retry after an error", async () => {
    getAll.mockRejectedValue(new Error("down"));
    renderWithQuery(<EventsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Error Loading Events");
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });
});
