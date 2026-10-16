import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AppAccessDrawer from "./AppAccessDrawer";

const teachers = vi.hoisted(() => ({ setAppAccess: vi.fn() }));
vi.mock("@/services/teachers.service", () => ({ teachersService: teachers }));
vi.mock("@/components/admin/ui/notify", () => ({ notify: { success: vi.fn(), error: vi.fn() }, errorMessage: (e, f) => e?.response?.data?.message || f }));

const TEACHER = { TeacherID: 7, FirstName: "Nasima", LastName: "Akter" };

describe("AppAccessDrawer", () => {
  beforeEach(() => {
    teachers.setAppAccess.mockReset();
    useLanguageStore.getState().setLanguage("en");
  });

  it("turns on a teacher's app access with a mobile number and a password", async () => {
    teachers.setAppAccess.mockResolvedValue({ success: true, data: {} });
    const onClose = vi.fn();
    renderWithQuery(<AppAccessDrawer teacher={TEACHER} access={null} onClose={onClose} />);

    expect(screen.getByRole("dialog", { name: "Attendance app: Nasima Akter" })).toBeInTheDocument();
    expect(screen.getByText("Has not signed in yet")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Mobile number"), { target: { value: "01711000001" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "class5-secret" } });
    fireEvent.click(screen.getByLabelText("Allow this teacher to use the app"));
    fireEvent.click(screen.getByRole("button", { name: "Save app access" }));

    await waitFor(() =>
      expect(teachers.setAppAccess).toHaveBeenCalledWith(7, { phone: "01711000001", password: "class5-secret", enabled: true }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("keeps the current password when the field is left empty, and switches access off", async () => {
    teachers.setAppAccess.mockResolvedValue({ success: true, data: {} });
    const access = { teacherId: 7, phone: "01711000001", enabled: true, hasPassword: true, lastLoginAt: "2026-10-15T03:15:00.000Z" };
    renderWithQuery(<AppAccessDrawer teacher={TEACHER} access={access} onClose={() => {}} />);

    expect(screen.getByLabelText("Mobile number")).toHaveValue("01711000001");
    expect(screen.getByLabelText("New password (leave empty to keep the current one)")).toHaveValue("");
    expect(screen.getByText(/Last sign-in:/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Allow this teacher to use the app"));
    fireEvent.click(screen.getByRole("button", { name: "Save app access" }));

    await waitFor(() => expect(teachers.setAppAccess).toHaveBeenCalledWith(7, { phone: "01711000001", enabled: false }));
  });

  it("shows the server's reason when the save is refused", async () => {
    teachers.setAppAccess.mockRejectedValue({ response: { data: { message: "Another teacher already signs in with this mobile number." } } });
    renderWithQuery(<AppAccessDrawer teacher={TEACHER} access={null} onClose={() => {}} />);

    fireEvent.change(screen.getByLabelText("Mobile number"), { target: { value: "01711000001" } });
    fireEvent.click(screen.getByRole("button", { name: "Save app access" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Another teacher already signs in with this mobile number.");
  });
});
