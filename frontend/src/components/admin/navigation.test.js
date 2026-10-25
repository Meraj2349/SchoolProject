import { describe, expect, it } from "vitest";
import { breadcrumbsFor, canOpen, findNavItem, NAV_GROUPS, visibleNavigation } from "./navigation";

const paths = (groups) => groups.flatMap((g) => g.items.map((i) => i.path));

describe("admin navigation", () => {
  it("gives every item a unique path and a translation key", () => {
    const all = NAV_GROUPS.flatMap((g) => g.items);

    expect(new Set(all.map((i) => i.path)).size).toBe(all.length);
    expect(all.every((i) => i.key && i.icon)).toBe(true);
  });

  it("shows super-admin-only pages to super admins", () => {
    expect(paths(visibleNavigation("super_admin"))).toEqual(
      expect.arrayContaining(["/admin/branches", "/admin/admins", "/admin/chairman"]),
    );
  });

  it("hides super-admin-only pages from branch admins", () => {
    const visible = paths(visibleNavigation("branch_admin"));

    expect(visible).not.toContain("/admin/branches");
    expect(visible).not.toContain("/admin/admins");
    expect(visible).not.toContain("/admin/chairman");
    expect(visible).toContain("/admin/studentList");
    expect(visible).toContain("/admin/dashboard");
  });

  it("drops a group when none of its items are visible", () => {
    const groups = visibleNavigation("branch_admin");

    expect(groups.every((g) => g.items.length > 0)).toBe(true);
  });

  describe("findNavItem", () => {
    it("matches the exact page", () => {
      expect(findNavItem("/admin/attendance").item.path).toBe("/admin/attendance");
      expect(findNavItem("/admin/attendance/grid").item.path).toBe("/admin/attendance/grid");
    });

    it("lists the attendance by branch page in the Attendance group, for every admin", () => {
      expect(findNavItem("/admin/attendance/overview")).toMatchObject({
        group: { key: "sidebar.groups.attendance" },
        item: { path: "/admin/attendance/overview", key: "sidebar.attendanceOverview" },
      });
      expect(paths(visibleNavigation("branch_admin"))).toContain("/admin/attendance/overview");
    });

    it("matches a sub-page to its closest menu item", () => {
      expect(findNavItem("/admin/studentList/42").item.path).toBe("/admin/studentList");
    });

    it("returns the group the item belongs to", () => {
      expect(findNavItem("/admin/results").group.key).toBe("sidebar.groups.examsResults");
    });

    it("puts the fee pages in the Fees group, sub-pages under the overview", () => {
      expect(findNavItem("/admin/fees/invoices").item.key).toBe("sidebar.feeInvoices");
      expect(findNavItem("/admin/fees/students/7")).toMatchObject({
        group: { key: "sidebar.groups.fees" },
        item: { path: "/admin/fees" },
      });
    });

    it("puts the quiz pages in the Quiz group, for every admin", () => {
      for (const path of ["/admin/quiz/questions", "/admin/quiz/results", "/admin/quiz/leaderboard"]) {
        expect(findNavItem(path)).toMatchObject({ group: { key: "sidebar.groups.quiz" }, item: { path } });
        expect(paths(visibleNavigation("branch_admin"))).toContain(path);
      }
    });

    it("returns null for unknown pages", () => {
      expect(findNavItem("/admin/nope")).toBeNull();
      expect(findNavItem("/admin/studentListing")).toBeNull();
    });
  });

  describe("breadcrumbsFor", () => {
    it("lists admin home, the group and the page", () => {
      expect(breadcrumbsFor("/admin/results")).toEqual([
        { key: "admin.shell.home", path: "/admin/dashboard" },
        { key: "sidebar.groups.examsResults" },
        { key: "sidebar.results", path: "/admin/results" },
      ]);
    });

    it("skips the group for top-level items", () => {
      expect(breadcrumbsFor("/admin/dashboard")).toEqual([
        { key: "admin.shell.home", path: "/admin/dashboard" },
      ]);
    });

    it("shows only admin home for unknown pages", () => {
      expect(breadcrumbsFor("/admin/nope")).toEqual([{ key: "admin.shell.home", path: "/admin/dashboard" }]);
    });
  });

  describe("canOpen", () => {
    it("lets a super admin open every page", () => {
      expect(canOpen("/admin/chairman", "super_admin")).toBe(true);
      expect(canOpen("/admin/admins", "super_admin")).toBe(true);
    });

    it("keeps a branch admin out of super-admin pages, and pages under them", () => {
      expect(canOpen("/admin/chairman", "branch_admin")).toBe(false);
      expect(canOpen("/admin/branches", "branch_admin")).toBe(false);
      expect(canOpen("/admin/admins/7", "branch_admin")).toBe(false);
    });

    it("lets a branch admin open the other pages", () => {
      expect(canOpen("/admin/studentList", "branch_admin")).toBe(true);
      expect(canOpen("/admin/fees/receipt/3", "branch_admin")).toBe(true);
      expect(canOpen("/admin/nope", "branch_admin")).toBe(true);
    });
  });
});
