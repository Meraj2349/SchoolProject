---
name: Quaker Portal Design Tokens
description: Extracted visual tokens from the two design languages used across the school site, relevant for future Quaker portal work
type: project
---

Two design languages coexist in the codebase. All Quaker portal files have been unified to use them correctly as of 2026-04-18.

## Language A — Admin/Auth surfaces
Used on: IdentityFormPage.js, ProgressPage.js (identity form panel)
- Background: `bg-[#0a1628]`
- Card: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl`
- Input: `w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:outline-none focus:border-amber-300 focus:bg-white/15 focus:ring-2 focus:ring-amber-300/40`
- Label: `block text-sm font-medium text-white/80 mb-2`
- Primary button: `py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30`
- Ghost button: `py-3.5 text-white/80 font-semibold rounded-xl border border-white/20 hover:bg-white/5`
- Accent: amber-400 / amber-300
- Error: `bg-red-500/10 border border-red-400/30 text-red-200 rounded-lg`
- Info badge: `bg-amber-400/10 border border-amber-300/30 text-amber-200 rounded-lg`

## Language B — Public site
Used on: LandingPage.js, QuizPage.js, ProgressPage.js (data dashboard), QuakerNav.js
- Section background (light): `bg-gradient-to-b from-[#fdf8f0] to-[#f5ede0]`
- Dark strip: `bg-[#0d1f3c]` with diagonal repeating-linear texture
- Gold accent: `#c9a84c` / `#e2c07a`
- Primary green: `linear-gradient(135deg, #10b981 0%, #059669 100%)` with `boxShadow: 0 4px 12px rgba(16,185,129,0.3)`
- Card: `bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] shadow-[0_2px_6px_rgba(13,31,60,0.07),0_8px_24px_rgba(13,31,60,0.06)]`
- Card top accent strip: `h-[3px]` with `linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)`
- Section heading: `text-[clamp(1.65rem,4vw,2.4rem)] font-extrabold text-[#0d1f3c] tracking-tight`
- Body text: `text-[0.95rem] text-[#5a6072] leading-relaxed`
- Star rule: `<span class="block w-14 h-px ..."/> ★ <span.../>`
- Table header: `background: rgba(201,168,76,0.06); border-bottom: 1px solid rgba(201,168,76,0.2)`

## QuakerNav
- Top 3px accent strip using Footer's 4-stop gradient (#4b2e83 → #7c3aed → #10b981 → #059669)
- Sticky, white bg, border-b border-gray-200 shadow-sm
- Active link: text-emerald-600 + 3px underline green gradient
- Same hover: text-emerald-600 / hover:bg-gray-50

## QuickLinks 6-card config
Cards assigned unique gradients — no two adjacent cards share a hue family:
1. students: emerald (#10b981 → #059669)
2. teachers: rose (#f43f5e → #e11d48)
3. attendance: amber (#f59e0b → #d97706)
4. result: blue (#3b82f6 → #2563eb)
5. routine: violet (#8b5cf6 → #7c3aed)
6. quaker: sky (#0ea5e9 → #0369a1)  ← changed from amber-brown to avoid clash with attendance

**Why:** differentiation pass confirmed gradient clash between quaker and attendance cards; sky blue chosen because it has no twin in the existing 5.
**How to apply:** If adding more cards to QuickLinks, continue assigning from distinct hue families. Grid is repeat(2,1fr) — always even numbers of cards.
