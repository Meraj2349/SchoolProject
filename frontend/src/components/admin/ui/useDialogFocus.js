"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal focus handling: while `open`, focus moves into the dialog (first
 * field or button), Tab / Shift+Tab cycle inside it, and on close focus
 * returns to whatever was focused before (usually the button that opened it).
 * Returns the ref to put on the dialog element.
 */
export default function useDialogFocus(open) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open || !ref.current) return undefined;
    const dialog = ref.current;
    const previous = document.activeElement;
    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)];

    (focusables()[0] ?? dialog).focus();

    const trapTab = (event) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", trapTab);
    return () => {
      dialog.removeEventListener("keydown", trapTab);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [open]);

  return ref;
}
