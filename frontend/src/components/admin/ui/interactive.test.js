import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import ConfirmDialog from "./ConfirmDialog";
import Drawer from "./Drawer";
import Tabs from "./Tabs";

describe("ConfirmDialog", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  const setup = (props = {}) => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog open title="Delete student?" onConfirm={onConfirm} onCancel={onCancel} {...props}>
        This cannot be undone.
      </ConfirmDialog>,
    );
    return { onConfirm, onCancel };
  };

  it("shows the question as an accessible dialog", () => {
    setup();

    expect(screen.getByRole("dialog", { name: "Delete student?" })).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("confirms", () => {
    const { onConfirm } = setup({ confirmLabel: "Delete" });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancels with the button or the Escape key", () => {
    const { onCancel } = setup();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("disables the buttons while working", () => {
    setup({ busy: true, confirmLabel: "Delete" });

    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("renders nothing when closed", () => {
    setup({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Drawer", () => {
  it("shows its content with a title and closes with the close button", () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Add student" onClose={onClose}>
        <p>form</p>
      </Drawer>,
    );

    expect(screen.getByRole("dialog", { name: "Add student" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("Tabs", () => {
  const tabs = [
    { key: "tuition", label: "Class tuition", content: <p>tuition table</p> },
    { key: "heads", label: "Fee heads", content: <p>heads table</p> },
  ];

  it("shows the first tab and switches on click", () => {
    render(<Tabs tabs={tabs} />);

    expect(screen.getByRole("tab", { name: "Class tuition" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("tuition table")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Fee heads" }));

    expect(screen.getByRole("tab", { name: "Fee heads" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("heads table");
  });
});
