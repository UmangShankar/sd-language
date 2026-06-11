# SD-1 Font (`font/`)

Everything a designer needs to turn the SD-1 writing system into an installable font.

## Contents

- **`FONT-WORKFLOW.md`** — the design guide: stroke primitives (P1–P6), varga skeletons, manner
  modifiers, vowel/akṣara mechanics, the ~70-glyph core starter set, and SVG→OpenType drawing notes.
- **`pua-map.csv`** — machine-readable codepoint map. One row per glyph the transliteration library
  can emit (87 total: 76 `core` + 11 `extension`). Columns:
  `codepoint, iast, glyph_name, category, tier, stroke_recipe`.

## Why the map matters

The font is a **thin glyph table + mark positioning** — all shaping logic lives in the transliteration
library (`lib/src/translit.ts`). The font's only contract is: *map each PUA codepoint the library
emits to a glyph, and position mātrās/tones/virāma correctly.* `pua-map.csv` is exactly that contract,
and its codepoints are verified to match the library's tables (see the note in `FONT-WORKFLOW.md` §5).

## Build recipe (for a designer)

1. **Draw masters.** For each `tier=core` row in `pua-map.csv`, draw an SVG glyph from the
   `stroke_recipe` using only primitives P1–P6 (see `FONT-WORKFLOW.md` §6). Name each glyph by its
   `glyph_name` (`uniXXXX`). Do the `extension` rows afterward.
2. **Assemble.** Import the SVGs into a font tool (FontForge / fontmake / Glyphs), set the cmap so
   each `uniXXXX` glyph maps to its PUA codepoint, and add GPOS mark-to-base anchors so mātrās attach
   right, tones anchor above, and virāma sits baseline-right. **No conjunct ligatures** — clusters are
   linear by design.
3. **Export** `SD-1.ttf` and `SD-1.woff2`.

## Wiring the font into the playground

`site/playground.html` already references a font family named `SD-1`. Once `SD-1.woff2` exists, add:

```css
@font-face { font-family: "SD-1"; src: url("../font/SD-1.woff2") format("woff2"); }
```

and the playground's "SD-1" row renders real glyphs — no other change needed.

## Scope note

This folder ships the **guide and the codepoint map** only; no glyph outlines are drawn yet. The SVG
masters and the compiled font are the next deliverable, to be produced by you or a font designer from
these specifications.
