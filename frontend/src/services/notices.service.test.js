import { beforeEach, describe, expect, it, vi } from "vitest";
import { noticesService } from "./notices.service";

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock("@/lib/httpClient", () => ({ default: http }));

describe("noticesService", () => {
  beforeEach(() => http.post.mockReset().mockResolvedValue({ data: { success: true } }));

  it("sends whether a new notice is shown on the website", async () => {
    await noticesService.create({ Title: "Holiday", Description: "Friday", Show: true });

    expect(http.post).toHaveBeenCalledWith("/notices/add", { title: "Holiday", description: "Friday", show: true });
  });

  it("reads the list from { success, data }", async () => {
    http.get.mockResolvedValue({ data: { success: true, data: [{ NoticeID: 1 }] } });

    expect(await noticesService.getAll()).toEqual([{ NoticeID: 1 }]);
  });
});
