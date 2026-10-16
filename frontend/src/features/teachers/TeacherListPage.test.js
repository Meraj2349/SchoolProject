import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import TeacherListPage from "./TeacherListPage";

const images = vi.hoisted(() => ({
  getAll: vi.fn(async () => [{ ImageID: 1, ImageType: "teacher", TeacherID: 4, ImagePath: "/uploads/teachers/karim.png" }]),
  getByTeacher: vi.fn(async () => []),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/teachers" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/images.service", () => ({ imagesService: images }));
vi.mock("@/services/teachers.service", () => ({
  teachersService: {
    getAll: async () => [
      { TeacherID: 4, FirstName: "Karim", LastName: "Ahmed", Subject: "Math", Email: "karim@school.test", JoiningDate: "2015-03-01" },
      { TeacherID: 7, FirstName: "Nadia", LastName: "Akter", Subject: "English", JoiningDate: null },
      { TeacherID: 8, FirstName: "Rina", LastName: null, Subject: "Science" },
    ],
  },
}));
vi.mock("@/services/classes.service", () => ({
  classesService: {
    getAll: async () => [
      { ClassID: 1, ClassName: "Class 5", Section: "A", TeacherID: 4 },
      { ClassID: 2, ClassName: "Class 5", Section: "B", TeacherID: 7 },
    ],
    getNames: async () => ["Class 5", "Class 6"],
  },
}));

const names = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("TeacherListPage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    images.getAll.mockClear();
    images.getByTeacher.mockClear();
  });

  it("shows every teacher, with photos from one request and no broken dates", async () => {
    renderWithQuery(<TeacherListPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Our Teachers" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 3, name: "Rina" })).toBeInTheDocument();
    expect(names()).toEqual(["Karim Ahmed", "Nadia Akter", "Rina"]);
    expect(await screen.findByRole("img", { name: "Karim Ahmed" })).toHaveAttribute("data-src", "http://localhost:3000/uploads/teachers/karim.png");
    expect(images.getByTeacher).not.toHaveBeenCalled();
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
    expect(screen.getByText(/1 Mar 2015/)).toBeInTheDocument();
  });

  it("narrows the list by class and section (class teachers), and by search", async () => {
    renderWithQuery(<TeacherListPage />);
    await screen.findByRole("heading", { level: 3, name: "Rina" });

    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "Class 5" } });
    expect(names()).toEqual(["Karim Ahmed", "Nadia Akter"]);
    fireEvent.change(screen.getByLabelText("Section"), { target: { value: "B" } });
    expect(names()).toEqual(["Nadia Akter"]);

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    fireEvent.change(screen.getByLabelText("Search teachers"), { target: { value: "math" } });
    expect(names()).toEqual(["Karim Ahmed"]);
    expect(screen.getByText("1 teacher found")).toBeInTheDocument();
  });

  it("marks class teachers", async () => {
    renderWithQuery(<TeacherListPage />);

    const karim = (await screen.findByRole("heading", { level: 3, name: "Karim Ahmed" })).closest("article");
    expect(within(karim).getByText(/Class 5 – A/)).toBeInTheDocument();
  });
});
