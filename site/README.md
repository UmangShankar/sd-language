# SD Language — Playground (`site/`)

`playground.html` is a single static page that runs the **real, verified** reference library
(`lib/src` → compiled `lib/dist`) live in the browser. It mirrors the `lib/src/cli.ts` pipeline:

```
input → asciiToIast → iastToCodepoints → formatCps        (IAST + codepoints)
                    → codepointsToIast (round-trip check)
        tokenize → checkSentence                           (gloss + well-formedness)
```

It is both the project's **front door** and its **QA tool**: paste any line and see exactly what the
implementation produces, including lossless round-trip status and the morphological gloss.

## Running locally

Two prerequisites:

1. **Build the library** (produces `lib/dist/`, which is gitignored):
   ```sh
   cd lib && npm install && npm run build && cd ..
   ```
2. **Serve over http from the REPO ROOT** — not from `site/`. The page imports
   `../lib/dist/src/index.js`, so the server root must sit *above* both `site/` and `lib/`.
   Browsers block ES-module imports over `file://`, so opening the file directly will not work.

   ```sh
   # from the repository root:
   npx serve .                 # then open http://localhost:3000/site/playground.html
   # or:
   python -m http.server 8000  # then open http://localhost:8000/site/playground.html
   ```

> ⚠️ Do **not** run the server inside `site/` (e.g. `npx serve site`): the `../lib` import would
> escape the server root and 404.

## Hosting (GitHub Pages)

`lib/dist/` is gitignored, so a vanilla Pages deploy of the repo will not find the compiled module.
To host the playground you need either:

- a Pages **build step** that runs `cd lib && npm ci && npm run build` and publishes the repo with
  `lib/dist/` present, or
- a committed build artifact (a bundled `index.js`) referenced by the page.

Wiring up Pages is intentionally out of scope for this commit; the page is fully functional locally
today and ready to drop into either hosting path.

## SD-1 glyph rendering

The "SD-1" output row shows the Private-Use-Area codepoints as text in a span whose font family is
`SD-1`. Until that font (see `font/`) is built and added via `@font-face`, those characters render as
the browser's PUA fallback (often tofu boxes) — expected. Once the font exists, dropping in:

```css
@font-face { font-family: "SD-1"; src: url("../font/SD-1.woff2") format("woff2"); }
```

makes the row render real glyphs with no other change.
