# SD-1 Direction D — Repository and Design Audit

**Status:** completed Phase 1 audit  
**Date:** 2026-07-20  
**Branch audited:** `feat/sd1-core-font-proof`  
**Pull request:** #1 — draft, not approved for merge  
**Scope:** script rendering and font system only

## Executive verdict

PR #1 succeeds as an engineering proof and fails as a visual alphabet proof.

The build demonstrates a deterministic path from canonical IAST through PUA codepoints into SVG, TTF, OTF, WOFF2 and browser specimens. The failure is not the encoding model or build pipeline. The failure is that the current construction grammar was interpreted literally as rigid Euclidean parts: rectangular stems and bars, polygonal arcs, detached ticks and mechanically repeated loops. This produces glyphs that read as mathematical, electronic or diagrammatic symbols rather than as members of a coherent pen-written script.

The correct response is to preserve the pipeline, codepoints and transliteration contract while replacing the outline logic and revising the visual grammar under Direction D — Featural Calligraphic Hybrid.

## Sources reviewed

Minimum audit set:

- `spec/SD-unified-script-v1.md`
- `spec/SD-language-design-v1.md`
- `font/FONT-WORKFLOW.md`
- `font/pua-map.csv`
- `font/PROOF-SCOPE.md`
- `font/scripts/build_proof_font.py`
- PR #1 metadata, changed-file inventory and generated proof assets

The product-owner review verdict is treated as authoritative: the current glyphs are rejected visually and PR #1 must remain draft until a redesigned direction passes human review.

## Architecture to preserve

| Area | Audit decision | Reason |
|---|---|---|
| Canonical IAST storage | Preserve | Keeps source text portable, searchable and independent of PUA rendering. |
| PUA codepoint assignments | Preserve | Existing stable mapping is already integrated with transliteration and tests. |
| Featural abugida architecture | Preserve | Place and manner relationships remain the learnability engine. |
| Inherent vowel `/a/` | Preserve | Core abugida behaviour and transliteration already depend on it. |
| Explicit virāma | Preserve | Supports deterministic linear clusters and non-stacking rendering. |
| Linear, non-joining clusters | Preserve | Avoids conjunct inventory and protects handwriting/carving simplicity. |
| One sound-to-one-sign behaviour | Preserve | Required for deterministic encoding and learner predictability. |
| Core versus extension tiers | Preserve | Supports learnability without weakening pan-Indian coverage. |
| Transliteration round trip | Preserve and lock | This is a proven invariant, not a visual-design variable. |
| SVG master generation | Preserve concept, replace outlines | The export path is useful; generated shapes are not approved. |
| TTF / OTF / WOFF2 production | Preserve | The FontTools implementation proves all required output formats. |
| GPOS and mark-positioning infrastructure | Preserve, retune anchors | The table and test approach are sound; coordinates must follow new forms. |
| Browser specimen generation | Preserve and expand | Current normal/small/blur views are valuable but incomplete. |
| Font-table and cmap validation | Preserve | These are objective engineering gates. |
| CI and proof artefacts | Preserve | Reproducibility and visible review should remain mandatory. |
| Provisional labelling | Preserve | No visual concept is canonical before founder approval. |

## Visual rules that failed

### 1. Primitives became detachable components

The specification says P1–P6 are a construction vocabulary, but the generator implements them as literal reusable geometric objects. The resulting glyphs visibly decompose into “stem + bar + tick + loop.” Featural relationships are present intellectually but not embodied as natural movements.

**Direction D correction:** retain primitive identity in stroke logic, but fuse primitives into continuous or rhythmically related gestures wherever character identity permits.

### 2. The primary stroke has no pen behaviour

`stem()` is a uniform rectangle. It has no entry, pressure, taper, lean, curvature, speed or terminal logic. Since most consonants share this object, the entire paragraph texture inherits a technological vertical-grid rhythm.

**Direction D correction:** P1 becomes a primary body stroke with controlled lean, swelling, taper and curve. It may remain recognisable across families without being mechanically identical.

### 3. Curves are polygonal constructions rather than calligraphic paths

The current arc and bowl functions are closed polygons assembled from straight segments. The nasal loop is a twelve-sided ring. At large size they look engineered; at small size their counters and joins become blunt or brittle.

**Direction D correction:** use true Bézier contours derived from stroke skeletons, with optical correction and open counters sized for 14–18 px.

### 4. Manner distinctions are added, not integrated

Voicing is a detached horizontal bar; aspiration is a detached diagonal; nasality is a repeated top ring. This makes a family look like a base icon with status indicators.

**Direction D correction:** manner must alter the internal motion of the glyph:

- aspiration becomes an integrated outward or upward release;
- voicing becomes an internal branch, counter shift or weight event;
- voiced aspiration combines both without visual clutter;
- nasality becomes a crown or enclosed returning gesture large enough to survive small sizes.

### 5. Place skeletons rely on positional mnemonics more than silhouettes

Top cap, upper-left hook, foot curl, bottom base and right bowl are distinct in a diagram, but too many share the same upright spine and similar bounding box. Under blur they risk collapsing into “stem with attachment.”

**Direction D correction:** each place family receives a genuinely distinct skeletal movement, not merely a different attachment location.

### 6. Uniform advance widths suppress word rhythm

The proof assigns `ADVANCE = 720` to nearly every base. This proves rendering but creates monospaced-like spacing and weak akṣara grouping.

**Direction D correction:** establish proportional widths, sidebearings and optical spacing by silhouette; keep attached marks zero-width only where shaping logic requires it.

### 7. The closure mark belongs to a different visual language

A solid triangle plus bowl reads as an emblem or technical icon. It does not share the stroke rhythm, terminal behaviour or counter logic of the letters.

**Direction D correction:** retain its semantic closure role and codepoint, but redesign it from the same returning and descending gestures as the alphabet.

### 8. The existing workflow overvalues pixel-identical components

`FONT-WORKFLOW.md` recommends pixel-identical reuse of bars, ticks and loops. That is maintainable but aesthetically over-constraining. In a calligraphic system, related features need optical variants according to host shape and position.

**Direction D correction:** preserve component semantics and parameterisation, not necessarily identical final contours. Allow contextual optical masters generated from shared rules.

## Code dependencies and change boundaries

### Safe to preserve largely unchanged

- FontTools build scaffolding.
- TTF glyf and OTF CFF output paths.
- WOFF2 conversion.
- cmap setup from the existing glyph inventory.
- name tables and provisional version naming.
- test structure for codepoint coverage, table presence and SVG parity.
- transliteration tests and locked proof sequence.
- CI workflow and artefact publishing.

### Must be redesigned

- `rect`, `polygon`, `ring`, `diagonal`, `arc_left`, `bowl_right` as primary drawing language.
- `stem`, `top_cap`, `bottom_base`, `voice_bar`, `aspiration_tick`, `nasal_loop`, `foot_curl` final contour logic.
- `skeleton()` place constructions.
- `varga()` manner composition.
- independent-vowel carrier design.
- semivowel, sibilant and closure drawing functions.
- advance widths, sidebearings and anchors after new outlines exist.

### Must not be changed casually

- PUA values in `pua-map.csv`.
- canonical IAST-to-PUA mapping.
- order of codepoints emitted for the proof sentence.
- core/extension classification.
- the no-conjunct, explicit-virāma architecture.

## Unresolved visual decisions requiring evidence

1. **Primary body rhythm:** broad curved stroke versus compact sculpted stroke.
2. **Nasal feature:** open crown versus enclosed counter.
3. **Voicing feature:** internal branch versus counter/weight transformation.
4. **Aspiration feature:** high outward release versus rising terminal flare.
5. **Dental base:** open grounded return versus compact lower shoulder.
6. **Retroflex signature:** depth and direction of the inward lower return at 14 px.
7. **Alveolar distinction:** intermediate base gesture that survives blur without a fragile tick.
8. **Vowel signs:** right-attached only versus limited upper/lower participation while preserving deterministic order.
9. **Closure sign:** descending return, folded terminal or balanced sealed form.
10. **Stroke contrast:** amount that remains contemporary, writable and carvable.

These decisions will be tested through D1, D2 and D3 concept sheets rather than settled verbally.

## Assumptions requiring founder approval

The following remain proposed until Umang explicitly approves a direction:

- which Direction D sub-family becomes the minimal font proof;
- whether nasality uses a crown gesture or enclosed counter;
- whether voicing is primarily branch-based or counter-based;
- whether the text style may use contextual optical variants of a shared feature;
- whether the existing all-right-side mātrā policy may be visually rebalanced without changing codepoint order;
- whether the closure mark may depart substantially from the current triangle concept.

The approval phrase is fixed:

> “Direction approved for font proof.”

No expansion to the full inventory may begin before that approval.

## Phase 1 exit decision

- Encoding status: **retain**.
- Transliteration status: **retain**.
- Font-engineering pipeline: **retain with outline-layer refactor**.
- Current visual design: **reject**.
- Handwriting status: **not yet demonstrated**.
- Inscription status: **not yet demonstrated**.
- Distinctiveness status: **not yet reviewed externally**.
- PR #1: **keep draft; do not merge**.

Phase 2 may begin as documentation and visual exploration only. No full-glyph generation is authorised.