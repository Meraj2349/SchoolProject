import { describe, expect, it } from "@jest/globals";
import { parseCsv } from "./csv.js";

describe("parseCsv", () => {
  it("reads a header row and records", () => {
    expect(parseCsv("a,b\n1,2\n3,4\n")).toEqual([
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });

  it("handles quoted commas, doubled quotes and line breaks inside quotes", () => {
    const csv = 'q,a\n"Sum of 1, 2","He said ""hi"""\n"line one\nline two",x\n';

    expect(parseCsv(csv)).toEqual([
      { q: "Sum of 1, 2", a: 'He said "hi"' },
      { q: "line one\nline two", a: "x" },
    ]);
  });

  it("handles Windows line endings, a byte-order mark and no final newline", () => {
    expect(parseCsv("\uFEFFa,b\r\n1,2\r\n3,4")).toEqual([
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });

  it("keeps Bangla and LaTeX untouched and skips blank lines", () => {
    expect(parseCsv('q,a\n"\\frac{1}{2}",উত্তল\n\n')).toEqual([{ q: "\\frac{1}{2}", a: "উত্তল" }]);
  });

  it("fills missing trailing cells with empty strings", () => {
    expect(parseCsv("a,b,c\n1\n")).toEqual([{ a: "1", b: "", c: "" }]);
  });

  it("treats a quote inside an unquoted field as a normal character", () => {
    expect(parseCsv('q,a\nA 5" pipe,x\nnext,y\n')).toEqual([
      { q: 'A 5" pipe', a: "x" },
      { q: "next", a: "y" },
    ]);
  });
});
