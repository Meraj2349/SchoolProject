import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import IdentityFormPage from "./IdentityFormPage";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("next/image", () => ({ default: () => null }));

const api = vi.hoisted(() => ({ classesOf: vi.fn(), verifyStudent: vi.fn(), branches: vi.fn() }));
vi.mock("@/services/quiz.service", () => ({
  quizService: { classesOf: api.classesOf, verifyStudent: api.verifyStudent },
  quizTokenHolder: { get: () => null, set: vi.fn(), clear: vi.fn() },
  quizErrorMessage: (error, fallback) => error?.response?.data?.message || fallback,
}));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: api.branches } }));

const choose = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const optionsOf = (label) => within(screen.getByLabelText(label)).getAllByRole("option").map((o) => o.textContent);

describe("IdentityFormPage", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    router.push.mockReset();
    api.branches.mockResolvedValue([
      { id: 1, name_en: "Main Campus", name_bn: "প্রধান ক্যাম্পাস" },
      { id: 3, name_en: "Planned", is_proposed: 1 },
    ]);
    api.classesOf.mockResolvedValue([
      { ClassName: "Class 10", Section: "Good" },
      { ClassName: "Class 8", Section: "Good" },
      { ClassName: "Class 8", Section: "Better" },
    ]);
    api.verifyStudent.mockResolvedValue({ token: "t", student: { studentId: 7, firstName: "Rahim", classKey: "8" } });
    useLanguageStore.getState().setLanguage("en");
    useQuizSessionStore.getState().clearSession();
  });

  async function fillIn() {
    render(<IdentityFormPage />);
    await waitFor(() => expect(optionsOf("Branch")).toContain("Main Campus"));
    choose("Branch", "1");
    await waitFor(() => expect(optionsOf("Class")).toContain("Class 8"));
    choose("Class", "Class 8");
    choose("Section", "Better");
    type("First name", " Rahim ");
    type("Last name", "Uddin");
    type("Roll number", "1");
  }

  it("offers only open branches, then that branch's classes in school order", async () => {
    render(<IdentityFormPage />);
    await waitFor(() => expect(optionsOf("Branch")).toEqual(["Select branch", "Main Campus"]));
    expect(screen.getByLabelText("Class")).toBeDisabled();

    choose("Branch", "1");

    await waitFor(() => expect(optionsOf("Class")).toEqual(["Select class", "Class 8", "Class 10"]));
    expect(api.classesOf).toHaveBeenCalledWith("1");
  });

  it("offers the sections of the chosen class", async () => {
    render(<IdentityFormPage />);
    await waitFor(() => expect(optionsOf("Branch")).toContain("Main Campus"));
    choose("Branch", "1");
    await waitFor(() => expect(optionsOf("Class")).toContain("Class 8"));

    choose("Class", "Class 8");

    expect(optionsOf("Section")).toEqual(["Select section", "Better", "Good"]);
  });

  it("checks the student and goes to the quiz", async () => {
    await fillIn();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(api.verifyStudent).toHaveBeenCalledWith({
        branchId: "1",
        firstName: "Rahim",
        lastName: "Uddin",
        className: "Class 8",
        section: "Better",
        rollNumber: "1",
      }),
    );
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/quaker/quiz"));
    expect(useQuizSessionStore.getState().student).toMatchObject({ firstName: "Rahim" });
  });

  it("can go on to another page, such as progress", async () => {
    render(<IdentityFormPage next="/quaker/progress" />);
    await waitFor(() => expect(optionsOf("Branch")).toContain("Main Campus"));
    choose("Branch", "1");
    await waitFor(() => expect(optionsOf("Class")).toContain("Class 8"));
    choose("Class", "Class 8");
    choose("Section", "Good");
    type("First name", "Rahim");
    type("Last name", "Uddin");
    type("Roll number", "1");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/quaker/progress"));
  });

  it("asks for every field", async () => {
    render(<IdentityFormPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Please fill in all fields.");
    expect(api.verifyStudent).not.toHaveBeenCalled();
  });

  it("shows the server's message when no student matches", async () => {
    api.verifyStudent.mockRejectedValue({ response: { status: 404, data: { message: "No student matches these details." } } });
    await fillIn();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No student matches these details.");
    expect(router.push).not.toHaveBeenCalled();
  });
});
