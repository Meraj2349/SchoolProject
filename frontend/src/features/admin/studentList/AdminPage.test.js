import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminPage from "./AdminPage";

const students = [
  { StudentID: 1, FirstName: "Rahim", LastName: "Uddin", RollNumber: "1", ClassName: "Class 5", Section: "Good", Gender: "Male", DateOfBirth: "2015-01-01", ParentContact: "01700000001" },
  { StudentID: 2, FirstName: "Karima", LastName: "Begum", RollNumber: "2", ClassName: "Class 5", Section: "Good", Gender: "Female", DateOfBirth: "2015-02-02" },
  { StudentID: 3, FirstName: "Sabbir", LastName: "Hossain", RollNumber: "1", ClassName: "Class 6", Section: "Good", Gender: "Male", DateOfBirth: "2014-03-03" },
];

const api = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  getInvoices: vi.fn(),
}));
vi.mock("@/services/students.service", () => ({
  studentsService: { getAll: api.getAll, create: api.create, update: api.update, remove: api.remove },
}));
vi.mock("@/services/classes.service", () => ({
  classesService: {
    getDistinct: async () => [
      { ClassName: "Class 5", Section: "Good" },
      { ClassName: "Class 5", Section: "General" },
      { ClassName: "Class 6", Section: "Good" },
    ],
  },
}));
vi.mock("@/services/fees.service", () => ({ feesService: { getInvoices: api.getInvoices } }));

const rowOf = (name) => screen.getByText(name).closest("tr");
const drawer = () => screen.getByRole("dialog");

async function openAddForm() {
  renderWithQuery(<AdminPage />);
  await screen.findByText("Rahim Uddin");
  fireEvent.click(screen.getByRole("button", { name: "Add Student" }));
  return drawer();
}

const fill = (form, label, value) => fireEvent.change(within(form).getByLabelText(label, { exact: false }), { target: { value } });

describe("Students admin page", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.getAll.mockResolvedValue({ success: true, data: students });
    api.getInvoices.mockResolvedValue({
      success: true,
      data: [
        { id: 10, student_id: 1, status: "paid", balance: 0 },
        { id: 11, student_id: 2, status: "partial", balance: 300 },
      ],
    });
    api.create.mockResolvedValue({ success: true });
    api.update.mockResolvedValue({ success: true });
    api.remove.mockResolvedValue({ success: true });
    useLanguageStore.getState().setLanguage("en");
  });

  it("lists students with this month's fee status", async () => {
    renderWithQuery(<AdminPage />);

    expect(await screen.findByText("Rahim Uddin")).toBeInTheDocument();
    await waitFor(() => expect(within(rowOf("Rahim Uddin")).getByText("Paid")).toBeInTheDocument());
    expect(within(rowOf("Karima Begum")).getByText("Partly paid")).toBeInTheDocument();
    expect(within(rowOf("Sabbir Hossain")).getByText("Not billed")).toBeInTheDocument();
    expect(within(rowOf("Rahim Uddin")).getByRole("link", { name: "Fee ledger" })).toHaveAttribute(
      "href",
      "/admin/fees/students/1",
    );
  });

  it("filters by class", async () => {
    renderWithQuery(<AdminPage />);
    await screen.findByText("Rahim Uddin");

    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "Class 6" } });

    expect(screen.getByText("Sabbir Hossain")).toBeInTheDocument();
    expect(screen.queryByText("Rahim Uddin")).not.toBeInTheDocument();
  });

  it("does not save an incomplete student and says what is missing", async () => {
    const form = await openAddForm();

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    expect(within(form).getAllByText("This field is required").length).toBeGreaterThan(0);
    expect(api.create).not.toHaveBeenCalled();
  });

  it("refuses a roll number already used in the class and section", async () => {
    const form = await openAddForm();
    fill(form, "First Name", "Nadia");
    fill(form, "Last Name", "Akter");
    fill(form, "Class", "Class 5");
    fill(form, "Section", "Good");
    fill(form, "Roll Number", "2");
    fill(form, "Date of Birth", "2015-05-05");

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    expect(within(form).getByText("This roll number is already used in this class and section")).toBeInTheDocument();
    expect(api.create).not.toHaveBeenCalled();
  });

  it("adds a student", async () => {
    const form = await openAddForm();
    fill(form, "First Name", "Nadia");
    fill(form, "Last Name", "Akter");
    fill(form, "Class", "Class 5");
    fill(form, "Section", "General");
    fill(form, "Roll Number", "1");
    fill(form, "Gender", "Female");
    fill(form, "Date of Birth", "2015-05-05");

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.create).toHaveBeenCalled());
    expect(api.create.mock.calls[0][0]).toMatchObject({
      FirstName: "Nadia",
      LastName: "Akter",
      ClassName: "Class 5",
      Section: "General",
      RollNumber: "1",
      Gender: "Female",
      DateOfBirth: "2015-05-05",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does not offer a gender the database cannot store", async () => {
    const form = await openAddForm();

    const options = within(within(form).getByLabelText("Gender", { exact: false })).getAllByRole("option");

    expect(options.map((o) => o.value)).toEqual(["Male", "Female"]);
  });

  it("edits a student with the form filled in", async () => {
    renderWithQuery(<AdminPage />);
    await screen.findByText("Rahim Uddin");

    fireEvent.click(within(rowOf("Rahim Uddin")).getByRole("button", { name: "Edit" }));
    const form = drawer();
    expect(within(form).getByLabelText("First Name", { exact: false })).toHaveValue("Rahim");
    fill(form, "Parent Contact", "01800000000");
    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.update).toHaveBeenCalled());
    expect(api.update.mock.calls[0][0]).toBe(1);
    expect(api.update.mock.calls[0][1]).toMatchObject({ FirstName: "Rahim", ParentContact: "01800000000" });
  });

  it("shows the server's message when saving fails", async () => {
    api.create.mockRejectedValue({ response: { data: { message: "Missing required fields: DateOfBirth" } } });
    const form = await openAddForm();
    fill(form, "First Name", "Nadia");
    fill(form, "Last Name", "Akter");
    fill(form, "Class", "Class 5");
    fill(form, "Section", "General");
    fill(form, "Roll Number", "1");
    fill(form, "Date of Birth", "2015-05-05");

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    expect(await within(form).findByRole("alert")).toHaveTextContent("Missing required fields: DateOfBirth");
  });

  it("deletes a student after confirming", async () => {
    renderWithQuery(<AdminPage />);
    await screen.findByText("Rahim Uddin");

    fireEvent.click(within(rowOf("Karima Begum")).getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog", { name: "Delete this student?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(api.remove).toHaveBeenCalledWith(2));
  });
});
