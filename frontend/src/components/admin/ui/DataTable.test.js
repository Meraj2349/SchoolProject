import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import DataTable from "./DataTable";

const columns = [
  { key: "name", header: "Name", sortable: true },
  { key: "roll", header: "Roll", sortable: true, sortValue: (row) => Number(row.roll) },
  { key: "status", header: "Status", render: (row) => <strong>{row.status.toUpperCase()}</strong> },
];

const students = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Student ${String.fromCharCode(65 + i)}`,
  roll: String(12 - i),
  status: i % 2 ? "paid" : "due",
}));

const bodyRows = () => screen.getAllByRole("row").slice(1); // skip header row
const firstCells = () => bodyRows().map((row) => within(row).getAllByRole("cell")[0].textContent);

describe("DataTable", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("renders headers, cells and custom cell content", () => {
    render(<DataTable columns={columns} rows={students.slice(0, 2)} />);

    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByText("Student A")).toBeInTheDocument();
    expect(screen.getAllByText("DUE")[0].tagName).toBe("STRONG");
  });

  it("shows ten rows per page and moves between pages", () => {
    render(<DataTable columns={columns} rows={students} />);

    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText("Showing 1–10 of 12")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(bodyRows()).toHaveLength(2);
    expect(screen.getByText("Showing 11–12 of 12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("filters rows with the search box and goes back to the first page", () => {
    render(<DataTable columns={columns} rows={students} searchable />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "student c" } });

    expect(firstCells()).toEqual(["Student C"]);
    expect(screen.getByText("Showing 1–1 of 1")).toBeInTheDocument();
  });

  it("searches with a custom text function when given", () => {
    render(<DataTable columns={columns} rows={students} searchable searchText={(row) => `roll ${row.roll}`} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "roll 12" } });

    expect(firstCells()).toEqual(["Student A"]);
  });

  it("sorts by a column ascending, then descending", () => {
    render(<DataTable columns={columns} rows={students.slice(0, 3)} />);
    const rollHeader = screen.getByRole("columnheader", { name: /Roll/ });

    fireEvent.click(within(rollHeader).getByRole("button"));
    expect(firstCells()).toEqual(["Student C", "Student B", "Student A"]);
    expect(rollHeader).toHaveAttribute("aria-sort", "ascending");

    fireEvent.click(within(rollHeader).getByRole("button"));
    expect(firstCells()).toEqual(["Student A", "Student B", "Student C"]);
    expect(rollHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("shows an empty message when there are no rows", () => {
    render(<DataTable columns={columns} rows={[]} emptyText="No students yet" />);

    expect(screen.getByText("No students yet")).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("shows a loading state instead of rows while loading", () => {
    render(<DataTable columns={columns} rows={students} loading />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    expect(screen.queryByText("Student A")).not.toBeInTheDocument();
  });

  it("uses Bangla labels in Bangla", () => {
    useLanguageStore.getState().setLanguage("bn");
    render(<DataTable columns={columns} rows={[]} />);

    expect(screen.getByText("কোনো তথ্য নেই")).toBeInTheDocument();
  });

  describe("with server-side paging", () => {
    const page2 = students.slice(10, 12);

    it("shows the rows it is given and the overall position", () => {
      render(<DataTable columns={columns} rows={page2} pagination={{ page: 2, pageSize: 10, total: 12, onPageChange: () => {} }} />);

      expect(firstCells()).toEqual(["Student K", "Student L"]);
      expect(screen.getByText("Showing 11–12 of 12")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });

    it("asks for another page instead of slicing", () => {
      const onPageChange = vi.fn();
      render(<DataTable columns={columns} rows={students.slice(0, 10)} pagination={{ page: 1, pageSize: 10, total: 12, onPageChange }} />);

      expect(bodyRows()).toHaveLength(10);
      expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });
});
