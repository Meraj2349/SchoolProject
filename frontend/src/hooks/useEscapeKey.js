"use client";

import { useEffect } from "react";

/** Calls onEscape when Escape is pressed while `active` is true. */
export default function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") onEscape?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active, onEscape]);
}
