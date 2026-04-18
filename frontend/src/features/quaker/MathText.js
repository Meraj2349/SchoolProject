"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders a string that may contain LaTeX mixed with plain text.
 *
 * Supported input:
 *   - Explicit delimiters: $…$, $$…$$, \(…\), \[…\]
 *   - Bare LaTeX commands: \frac{…}{…}, \sqrt{…}, \sum, \int, \infty, etc.
 *   - Identifier with sub/superscript: S_{n}, x^2, 10^{-5}
 *
 * Strategy: tokenize into plain/math runs using brace-matching so we never
 * feed prose through KaTeX (which would fail silently and leak raw \frac{…}
 * into the UI).
 */

const LATEX_CMD = /[a-zA-Z]/;

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMath(tex, display = false) {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      output: "html",
      strict: "ignore",
      trust: false,
    });
  } catch {
    return escapeHtml(tex);
  }
}

/** Scan a balanced group starting at `text[i]` where `text[i] === open`. */
function consumeGroup(text, i, open, close) {
  if (text[i] !== open) return i;
  let depth = 1;
  let j = i + 1;
  while (j < text.length && depth > 0) {
    const ch = text[j];
    if (ch === "\\") {
      j += 2;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) depth--;
    j++;
  }
  return j;
}

const DELIM_CMDS = new Set([
  "left",
  "right",
  "bigl",
  "bigr",
  "biggl",
  "biggr",
  "Bigl",
  "Bigr",
  "Biggl",
  "Biggr",
]);

/** Consume a LaTeX command name + its brace/bracket/delimiter arguments. */
function consumeCommand(text, i) {
  // i points at '\'
  let j = i + 1;
  const nameStart = j;
  while (j < text.length && LATEX_CMD.test(text[j])) j++;
  const name = text.slice(nameStart, j);
  // \left / \right take a single delimiter char (or \cmd). For \left, greedily
  // consume up through the matching \right<delim> so the whole bracketed math
  // expression renders as one KaTeX call.
  if (DELIM_CMDS.has(name)) {
    while (j < text.length && (text[j] === " " || text[j] === "\t")) j++;
    if (text[j] === "\\" && j + 1 < text.length && LATEX_CMD.test(text[j + 1])) {
      j += 2;
      while (j < text.length && LATEX_CMD.test(text[j])) j++;
    } else if (j < text.length) {
      j++;
    }
    if (name === "left") {
      // scan for matching \right
      let depth = 1;
      let k = j;
      while (k < text.length && depth > 0) {
        if (text[k] === "\\") {
          if (text.startsWith("\\left", k)) {
            depth++;
            k += 5;
          } else if (text.startsWith("\\right", k)) {
            depth--;
            k += 6;
            while (k < text.length && (text[k] === " " || text[k] === "\t"))
              k++;
            if (text[k] === "\\" && LATEX_CMD.test(text[k + 1] || "")) {
              k += 2;
              while (k < text.length && LATEX_CMD.test(text[k])) k++;
            } else if (depth === 0 && k < text.length) {
              k++;
            }
          } else {
            k += 2;
          }
        } else if (text[k] === "\n") {
          // abandon — don't cross newlines
          return j;
        } else {
          k++;
        }
      }
      if (depth === 0) return k;
    }
    return j;
  }
  while (j < text.length) {
    const ch = text[j];
    if (ch === "{") j = consumeGroup(text, j, "{", "}");
    else if (ch === "[") j = consumeGroup(text, j, "[", "]");
    else break;
  }
  // optional sub/super after command (e.g. \sum_{i=1}^{n})
  while (j < text.length && (text[j] === "_" || text[j] === "^")) {
    j++;
    if (text[j] === "{") j = consumeGroup(text, j, "{", "}");
    else if (text[j] === "\\") {
      let k = j + 1;
      while (k < text.length && LATEX_CMD.test(text[k])) k++;
      j = k;
    } else if (j < text.length) j++;
  }
  return j;
}

/** Extend a math run forward over adjacent math tokens. */
function extendMathRun(text, end) {
  let j = end;
  while (j < text.length) {
    const ch = text[j];
    if (ch === " " || ch === "\t") {
      // allow single spaces between math tokens
      if (j + 1 < text.length && isMathStart(text, j + 1)) {
        j++;
        continue;
      }
      break;
    }
    if (ch === "\\" && j + 1 < text.length && LATEX_CMD.test(text[j + 1])) {
      j = consumeCommand(text, j);
    } else if (ch === "{") {
      j = consumeGroup(text, j, "{", "}");
    } else if (ch === "^" || ch === "_") {
      j++;
      if (text[j] === "{") j = consumeGroup(text, j, "{", "}");
      else if (text[j] === "\\") {
        let k = j + 1;
        while (k < text.length && LATEX_CMD.test(text[k])) k++;
        j = k;
      } else if (j < text.length) j++;
    } else {
      break;
    }
  }
  return j;
}

function isMathStart(text, i) {
  const ch = text[i];
  if (ch === "\\" && i + 1 < text.length && LATEX_CMD.test(text[i + 1]))
    return true;
  // identifier followed by sub/super
  if (/[A-Za-z0-9]/.test(ch) && (text[i + 1] === "_" || text[i + 1] === "^")) {
    const next = text[i + 2];
    if (next === "{" || next === "\\" || /[A-Za-z0-9]/.test(next || ""))
      return true;
  }
  return false;
}

function consumeExplicitDelim(text, i) {
  // $$…$$
  if (text.startsWith("$$", i)) {
    const end = text.indexOf("$$", i + 2);
    if (end === -1) return null;
    return { end: end + 2, tex: text.slice(i + 2, end), display: true };
  }
  // $…$
  if (text[i] === "$") {
    const end = text.indexOf("$", i + 1);
    if (end === -1 || text.slice(i + 1, end).includes("\n")) return null;
    return { end: end + 1, tex: text.slice(i + 1, end), display: false };
  }
  // \(…\)
  if (text.startsWith("\\(", i)) {
    const end = text.indexOf("\\)", i + 2);
    if (end === -1) return null;
    return { end: end + 2, tex: text.slice(i + 2, end), display: false };
  }
  // \[…\]
  if (text.startsWith("\\[", i)) {
    const end = text.indexOf("\\]", i + 2);
    if (end === -1) return null;
    return { end: end + 2, tex: text.slice(i + 2, end), display: true };
  }
  return null;
}

function tokenize(text) {
  const out = [];
  let i = 0;
  let plainStart = 0;

  const flushPlain = (end) => {
    if (end > plainStart) {
      out.push({ type: "text", value: text.slice(plainStart, end) });
    }
  };

  while (i < text.length) {
    // explicit delimiters first
    const delim = consumeExplicitDelim(text, i);
    if (delim) {
      flushPlain(i);
      out.push({ type: "math", value: delim.tex, display: delim.display });
      i = delim.end;
      plainStart = i;
      continue;
    }

    if (isMathStart(text, i)) {
      flushPlain(i);
      let end;
      if (text[i] === "\\") end = consumeCommand(text, i);
      else {
        // identifier start: consume the letter then sub/super run
        end = i + 1;
      }
      end = extendMathRun(text, end);
      out.push({
        type: "math",
        value: text.slice(i, end),
        display: false,
      });
      i = end;
      plainStart = i;
      continue;
    }

    i++;
  }
  flushPlain(text.length);
  return out;
}

function renderSafe(raw) {
  if (!raw) return "";
  const tokens = tokenize(raw);
  return tokens
    .map((t) => {
      if (t.type === "math") return renderMath(t.value.trim(), t.display);
      return escapeHtml(t.value).replace(/\n/g, "<br/>");
    })
    .join("");
}

export default function MathText({
  children,
  className = "",
  as: Tag = "span",
}) {
  const html = useMemo(() => renderSafe(String(children ?? "")), [children]);
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
