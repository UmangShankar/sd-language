# SD-1 Visual Grammar — Direction D

**Status:** proposed; not approved  
**Scope:** SD-1 Text, Handwritten and Inscription styles  
**Approval gate:** “Direction approved for font proof.”

## Design thesis

Related sounds should look related because they share a natural calligraphic movement—not because bars, ticks and circles have been mechanically attached to a vertical stem.

SD-1 remains a featural, linear, non-joining abugida. Direction D changes how its features are embodied. P1–P6 become gesture families with shared motion, pressure and terminal logic. They remain recoverable in construction diagrams, but the reader should perceive complete letters rather than assembled components.

## Architecture held constant

- canonical IAST storage and existing PUA mapping;
- deterministic, lossless transliteration;
- inherent vowel `/a/` and explicit virāma;
- linear non-stacking clusters and no conjunct ligatures;
- one sound-to-one-sign behaviour;
- core and extension tiers.

## Reinterpreted primitives

| Primitive | Direction D gesture |
|---|---|
| P1 | Primary body stroke: may curve, taper, swell and lean. |
| P2 | Branch, shoulder or structured cross-movement. |
| P3 | Flick, cut, terminal or directional release. |
| P4 | Open returning gesture or bowl. |
| P5 | Enclosed counter or nasal crown gesture. |
| P6 | Inward retroflex return or curled terminal. |

The primitives are semantic gesture classes, not mandatory pixel-identical contours.

## Writing tools

### Text

Moderate calligraphic contrast based on a broad pen held approximately 25–35° to the baseline, regularised for screen text. The design must remain stable at 14–18 px.

### Handwritten

Ordinary ballpoint, gel pen, pencil or felt-tip. Identity must come from trajectory and proportion rather than thick–thin contrast. Fewer pen lifts are preferred.

### Inscription

V-cut or flat chisel, clay stylus, woodcut, laser engraving and seals. Contrast is reduced, counters open and fragile details simplify without changing identity.

## Proposed metrics

| Metric | Starting range | Status |
|---|---:|---|
| UPM | 1000 | proposed |
| Main body top | 650–700 | proposed |
| Upper feature zone | 700–850 | proposed |
| Lower feature zone | -80 to -180 | proposed |
| Independent-vowel height | 520–620 | proposed |
| Typical consonant width | 430–650, proportional | proposed |
| Text stem equivalent | 80–105 | proposed |
| Minimum text aperture | 90–120 | proposed |
| Minimum inscription aperture | 140–180 | proposed |
| Sidebearings | 45–90, optical | proposed |
| Round-form overshoot | 8–18 | proposed |

## Decision register

Every entry remains **proposed** until rendered and tested.

| Decision | Proposed rule | Rationale | Learnability | Screen | Handwriting | Carving | Risk |
|---|---|---|---|---|---|---|---|
| Primary rhythm | Shared forward-return cadence with genuinely different place silhouettes. | Avoids a fence of identical stems. | Five core motions remain teachable. | Better word texture and blur recognition. | Repeated movement families aid memory. | Strong silhouettes. | Must not copy a living script’s paragraph rhythm. |
| P1 body stroke | Slight curve/lean with tapered entry and grounded finish. | Replaces technological rectangles. | Shared body logic. | Taper must not become fragile. | Natural principal motion. | Inscription flattens contrast. | Excess curve may resemble rounded scripts. |
| P2 branch | Join through a shoulder; avoid detached crossbars. | Features belong to the letter. | Predictable branch event. | Cleaner joins. | Fewer lifts. | Reliable incised shoulder. | Moderate resemblance risk. |
| P3 release | Broad integrated exit, not a tiny tick. | Aspiration and direction must survive 14 px. | Strong mnemonic. | Better blur survival. | Fast final flick. | Clear wedge cut. | Avoid generic Latin-like terminals. |
| P4 return | Open asymmetric return; no perfect circles. | Creates pen credibility and durable counters. | Direction encodes family. | Resists fill-in. | Natural curve. | Easy open incision. | Audit against rounded Indic scripts. |
| P5 nasal | Test crown return versus enclosed counter; reject detached rings. | Nasality needs a durable system feature. | One recurring upper gesture. | Must survive 14 px. | Crown is faster; counter may be clearer. | Crown/open counter both carvable. | High resemblance risk; compare carefully. |
| P6 retroflex | Main descent turns inward in the lower zone. | Retroflexion becomes intrinsic motion. | Strong embodied cue. | Must remain open. | One continuous stroke. | Strong carved hook. | Audit across South Asian scripts. |
| Voicing | Internal branch or counter transformation, not a floating bar. | Changes internal energy rather than adding a status indicator. | One recurring internal event. | Requires controlled counters. | One added motion. | Opened for inscription. | Moderate. |
| Aspiration | Upward/outward release integrated into exit or shoulder. | Reads as breath rather than slash. | Clear mnemonic. | Large enough for mobile. | Final flick. | Wedge/flare. | Low if orientation is SD-specific. |
| Place skeletons | Each place has a distinct trajectory before manner is added. | Place must survive modifier loss under blur. | Five base movements. | Strong silhouette recognition. | Distinct motor patterns. | Strong carving identity. | Highest audit priority. |
| Mātrās | Preserve codepoint order; allow optical right, upper-right or lower-right placement around the host. | Akṣara balance may need more than one rail. | Sign trajectory remains stable. | Reduces collisions. | Natural additions. | Simplified attached cuts. | Must not imply changed encoding. |
| Virāma | Clear lower-right cancellation gesture, not punctuation noise. | Must visibly suppress the vowel. | Stable placement. | Robust negative space. | Quick finishing cut. | Strong notch/return. | Must not confuse with alveolar or aspiration features. |
| Closure | Descending returning gesture using SD terminal logic; abandon the solid triangle as the lead form. | Current form reads as an emblem/operator. | Unique but related endpoint. | Strong line-final silhouette. | One or two deliberate strokes. | Strong seal potential. | Avoid danda, sacred-emblem and mathematical resemblance. |
| Spacing | Proportional widths and optical sidebearings; marks remain anchor-positioned. | Avoids monospaced icon texture. | Learnable word shapes. | Improves reading rhythm. | Mirrors natural spacing. | Balanced inscriptions. | Low. |
| Optical variants | Shared semantics may have host-sensitive contour variants. | Pixel-identical components are too mechanical. | Variation kept narrow. | Prevents collisions/black spots. | Mirrors natural variation. | Allows widened cuts. | Too much variation would weaken the featural system. |

## Place-family hypotheses

These are hypotheses to render, not approved glyph descriptions.

- **Guttural:** high-origin shoulder descending into a firm body and restrained return; no headline.
- **Palatal:** upper-left open return flowing into a shorter descent.
- **Retroflex:** main descent turns inward and back in the lower zone.
- **Dental:** forward descent ending in a grounded open base return, not a geometric T-base.
- **Labial:** integrated rounded side-return with an open counter.
- **Alveolar extension:** intermediate lower trajectory between dental grounding and retroflex return; no fragile micro-tick.

## Terminals and counters

Three related terminal classes will define SD texture:

1. tapered entry;
2. cut release;
3. inward return.

Counter rules:

- no perfect circles;
- text counters remain optically open and asymmetric;
- nasal counters must differ clearly from labial and vowel counters;
- inscription counters open by roughly 25–50%;
- handwriting may simplify a counter into an open return only if identity remains unambiguous.

## Handwriting rules

For every concept glyph document:

- numbered stroke order;
- pen-lift count;
- fast form;
- acceptable simplification;
- forbidden identity-changing simplification.

Targets:

- place skeleton: usually one principal stroke, maximum two;
- aspiration: final flick without a new lift where possible;
- voicing: one additional internal motion at most;
- nasal: one crown/counter motion;
- mātrā: one added motion;
- separate consonants remain non-joining.

## Inscription simplification

- reduce contrast and remove delicate taper;
- open counters and broaden reverse curves;
- increase gaps and apertures;
- replace fragile overlaps with clear intersections;
- preserve feature placement and overall silhouette;
- require a valid monochrome stencil for every sign.

## Direction D concept families

### D1 — Flowing Structural

- broad curved gestures and generous open counters;
- strongest Text–Handwritten continuity;
- moderate asymmetry and softer shoulders;
- crown-based nasality as lead hypothesis;
- long integrated aspiration release;
- likely best handwriting speed;
- highest rounded-script resemblance risk.

### D2 — Sculpted Calligraphic

- compact counters and controlled curves;
- disciplined proportions and tapered terminals;
- internal branch as lead voicing hypothesis;
- enclosed-counter nasality as lead hypothesis;
- contained aspiration flare;
- expected best 14–18 px performance;
- moderate handwriting speed and lower decorative risk.

### D3 — Monumental Organic

- heavier silhouettes, low contrast and simplified curves;
- wider apertures and shorter terminals;
- strong lower-zone place distinctions;
- open crown/notch-return nasality;
- aspiration as a wedge release;
- expected best inscription performance;
- risk of becoming too pictographic or heavy for body text.

## Exact deliverables for D1, D2 and D3

Each concept sheet must contain actual rendered evidence for:

### Inventory

- place skeletons: `k c ṭ t p`;
- full dental family: `t th d dh n`;
- supporting consonants: `m r v s`;
- independent vowels: `a ā i u`;
- dependent signs: `ā i u`;
- virāma, anusvāra, visarga and closure.

### Required views

- Text, Handwritten and Inscription forms;
- construction overlay identifying P1–P6 gesture families;
- large display view;
- 18 px view;
- 14 px view;
- mild blur;
- monochrome silhouette/stencil;
- documented handwriting stroke order.

### Required strings

```text
tat tvam asi {C}
ta tha da dha na
ka ca ṭa ta pa
a ā i u
```

Mātrā and virāma behaviour must also be shown on at least `t`, `k` and `m`.

## Comparative review

Score D1, D2 and D3 from 1–10 against:

- Indic-informed rhythm;
- distinctiveness;
- internal coherence;
- family relationships;
- body-text readability;
- small-size readability;
- handwriting speed;
- carving suitability;
- visual beauty;
- low risk of resembling an existing script;
- implementation simplicity.

No concept may be recommended solely from large display artwork. The 14 px, blur, handwriting and inscription views are mandatory.

## Influence ledger rules

Study principles, never copy glyphs.

| Source group | Principle permitted | Explicit prohibition |
|---|---|---|
| Devanagari, Bengali, Gujarati, Gurmukhi | Akṣara grouping, zone balance, paragraph rhythm | No headline, hanging line or recognisable base. |
| Odia, Tamil, Telugu, Kannada, Malayalam, Sinhala | Counter durability, curve tension, pen economy, controlled asymmetry | No recognisable loops, bowls or letter skeletons. |
| Brahmi, Grantha, Siddham, Sharada | Monumental economy, terminal discipline, carving transitions | No revivalist copying or historical-authenticity claim. |
| Meitei Mayek, Ol Chiki | Modern script identity and learnable regularity | No glyph borrowing. |
| Mathematical/technical symbols | Failure modes to avoid | No glyph should read primarily as an operator, diagram or icon. |

Formal distinctiveness approval requires external reviewers and is not claimed here.

## Current status

- Phase 1 audit: completed.
- Phase 2 visual grammar: started; all rules proposed.
- D1/D2/D3 rendered sheets: not yet produced.
- Direction recommendation: not yet made.
- Founder approval: not granted.
- Outline-generator redesign: not started.
- Full inventory expansion: prohibited until the minimal proof passes.