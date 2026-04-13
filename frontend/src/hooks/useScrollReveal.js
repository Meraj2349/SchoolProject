"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref.
 * Once the element enters the viewport, `revealed` class is added.
 *
 * @param {number} threshold - 0..1 — how much of the element must be visible. Default 0.12.
 * @param {string} extraClass - additional CSS class name to toggle (optional).
 */
export default function useScrollReveal(threshold = 0.12, extraClass = null) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already visible (e.g. SSR content above fold)
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add("revealed");
      if (extraClass) el.classList.add(extraClass);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          if (extraClass) el.classList.add(extraClass);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, extraClass]);

  return ref;
}
