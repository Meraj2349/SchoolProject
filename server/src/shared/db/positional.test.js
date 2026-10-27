import { describe, expect, it } from "@jest/globals";
import { toPositional } from "./positional.js";

describe("toPositional", () => {
  it("numbers ? placeholders in order", () => {
    expect(toPositional("SELECT * FROM t WHERE a = ? AND b IN (?, ?)")).toBe("SELECT * FROM t WHERE a = $1 AND b IN ($2, $3)");
  });

  it("leaves a ? inside a string literal alone", () => {
    expect(toPositional("SELECT 'why?' AS q, a FROM t WHERE b = ?")).toBe("SELECT 'why?' AS q, a FROM t WHERE b = $1");
  });

  it("handles doubled quotes inside a string", () => {
    expect(toPositional("SELECT 'it''s ?' FROM t WHERE a = ?")).toBe("SELECT 'it''s ?' FROM t WHERE a = $1");
  });

  it("leaves a ? inside a quoted identifier alone", () => {
    expect(toPositional('SELECT "odd?name" FROM t WHERE a = ?')).toBe('SELECT "odd?name" FROM t WHERE a = $1');
  });

  it("leaves ? in comments alone", () => {
    expect(toPositional("SELECT a -- what?\nFROM t /* or? */ WHERE b = ?")).toBe(
      "SELECT a -- what?\nFROM t /* or? */ WHERE b = $1",
    );
  });

  it("returns SQL without placeholders unchanged", () => {
    expect(toPositional("SELECT 1")).toBe("SELECT 1");
  });
});
