import { describe, expect, it } from "vitest";
import { breadcrumbsFor, findNavItem, NAV_GROUPS, visibleNavigation } from "./navigation";

const paths = (groups) => groups.flatMap((g) => g.items.map((i) => i.path));

describe("admin navigation", () => {
  it("gives every item a unique path and a translation key", () => {
    const all = NAV_GROUPS.flatMap((g) => g.items);

    expect(new Set(all.map((i) => i.path)).size).toBe(all.length);
    expect(all.every((i) => i.key && i.icon)).toBe(true);
  });

  it("shows super-admin-only pages to super admins", () => {
    expect(paths(visibleNavigation("super_admin"))).toEqual(
      expect.arrayContaining(["/admin/branches", "/admin/chairman"]),
    );
  });

  it("hides super-admin-only pages from branch admins", () => {
    const visible = paths(visibleNavigation("branch_admin"));

    expect(visible).not.toContain("/admin/branches");
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
});
