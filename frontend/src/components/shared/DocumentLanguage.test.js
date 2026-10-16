import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import DocumentLanguage from "./DocumentLanguage";

describe("DocumentLanguage", () => {
  it("sets <html lang> to the chosen language", () => {
    useLanguageStore.getState().setLanguage("bn");
    render(<DocumentLanguage />);
    expect(document.documentElement.lang).toBe("bn");

    act(() => useLanguageStore.getState().setLanguage("en"));
    expect(document.documentElement.lang).toBe("en");
  });
});
