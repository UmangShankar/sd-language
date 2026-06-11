# SD-1 Font Workflow Guide

How to draw the SD-1 writing system as a font: the construction grammar, the six stroke primitives,
the place/manner featural system, the Tier-1 pan-Indian extensions, vowel mechanics, special marks,
SVG stroking conventions, the ~70-glyph core starter set, and the production pipeline from SVG masters
to a compiled OpenType font and carving stencils.

**Authoritative sources** (this guide transcribes them; it does not redefine the script):
- `spec/SD-unified-script-v1.md` — "SD-1": §3 letterform system, §4 full glyph table, §5 vowel/virāma
  mechanics, §6 tone/anusvāra/visarga, Appendix B codepoints.
- `spec/SD-language-design-v1.md` — design spec: §3.1 alveolar place marker, §3.2 vowel extensions,
  §3.3–§3.4 tones and phonation marks.
- `lib/src/translit.ts` — the transliteration library's codepoint tables: the **single source of truth**
  for which PUA codepoint each glyph occupies and what the renderer actually emits.

Target audience: a font designer (or Umang, if drawing the masters directly).

---

## 1. Overview

### 1.1 What SD-1 is

SD-1 is a **featural abugida**:

- **Abugida.** Every consonant carries an **inherent vowel /a/**. A bare consonant glyph already reads
  consonant + /a/ (e.g. the dental base `t` reads **ta**). Other vowels are written as attached signs
  (mātrās); the absence of an inherent vowel is written with an explicit **virāma**.
- **Featural.** A glyph's *shape states its phonology.* Place of articulation is encoded as a base
  **skeleton**; manner of articulation is encoded as a consistent **modifier** reused across every
  consonant group. Learn 5 skeletons + 3 modifiers + a few family rules and the whole stop grid is
  generable. This is the engine behind "easy to learn."
- **Linear, no conjuncts.** Clusters are written left-to-right with an explicit visible virāma between
  consonants. There is **no stacking and there are no conjunct ligatures.** This is decisive for
  carving (the chisel never lifts and re-registers over a previous glyph) and simplifies the font (no
  GSUB conjunct machinery — only mark positioning).

### 1.2 What this guide covers

1. The **six primitive strokes** (P1–P6) — the entire carving vocabulary.
2. The **5 place skeletons** (vargas) and the **manner modifiers** that regenerate every stop row.
3. The **Tier-1 alveolar place marker** and the other pan-Indian extension glyphs.
4. **Vowel mechanics** — independent vowels, mātrās, the inherent /a/, the shortness tick, central dot.
5. **Special marks** — virāma, anusvāra, visarga, avagraha, candrabindu, tone marks, phonation marks.
6. **SVG stroking conventions** for digital masters.
7. The **~70-glyph core starter set**, with construction recipes.
8. The **export & production pipeline** (SVG → UFO → OTF → carving stencils) and tool recommendations.

### 1.3 The carvability constraint

The overriding design constraint: **every glyph must be decomposable into the simple strokes P1–P6,
with no fine interior detail.** Concretely:

- Modifiers are **single strokes** — one cut = voicing bar, one gouge = nasal loop, one flick =
  aspiration tick.
- Skeletons are **visually well-separated** (cap-up vs base-down vs foot-curl vs left-hook vs
  right-bowl) so they hold up at small size and low resolution.
- No stacking, no conjunct ligatures, no curves sharper than the chisel can cut.

If a proposed glyph cannot be expressed as a composition of P1–P6, it is out of spec.

### 1.4 The rendering pipeline (where the font sits)

```
IAST (canonical, stored)                         ← database / Git / website body text
        │  (ASCII/ITRANS input is normalised to IAST first)
        ▼
transliteration library  (lib/src/translit.ts)   ← THE shaping logic: IAST → ordered PUA codepoints
        ▼
SD-1 OpenType font                                ← THIS deliverable: codepoint → glyph + mark position
        ▼
rendered SD-1 text  /  SVG export for carving stencils
```

The font is a **thin glyph table plus mark positioning.** All shaping logic — which mātrā, where the
virāma goes, cluster handling — lives in the transliteration library, **not** in the font. The font's
only contract: *map each PUA codepoint the library emits to a glyph, and position vowel signs / tones /
virāma correctly.*

### 1.5 How to use this guide

A suggested reading/drawing path:

1. **Learn the vocabulary** — §2 (the six primitives). Everything else is a composition of these.
2. **Learn the system** — §3 (the 5 skeletons) and §4 (the 3 manner modifiers). Together they
   regenerate all 25 stops + 5 nasals from a tiny rule set.
3. **Add the families** — §4.3 (semivowels, sibilants, aspirant) and §5 (Tier-1 alveolars + ḻ + ʼ).
4. **Add the vowels and marks** — §6 (independent vowels, mātrās, inherent /a/) and §7 (virāma, signs,
   tones, phonation, ordering).
5. **Set your conventions** — §8 (UPM, weights, stroke order, component reuse), then study the
   worked builds in §8.5 and the sketches/assemblies in §9.7–§9.8.
6. **Draw the core set** — §9, working from `pua-map.csv` (`tier=core` first, `extension` after).
7. **Produce** — §10 (SVG → UFO → OTF → stencils) with the tools in §11; QA against Appendix C.

Throughout, the golden rule: **build from P1–P6, reuse the shared components, and keep the font a thin
map over the transliteration library.**

---

## 2. The six stroke primitives (P1–P6)

From SD-1 §3.1. **Every** SD-1 glyph is a composition of these six strokes. No glyph requires a stroke
outside this set. ASCII can only *approximate* the forms — the authoritative definition is the stroke
description, from which the font is built.

### P1 — vertical stem

```
 |
 |
 |
```

- **Description:** a vertical stroke, the spine of most consonants.
- **ASCII hint:** `|`
- **Stroke count:** 1
- **Typical usage:** the backbone of every varga skeleton; the vowel carrier (a *short* P1); the
  tall body of avagraha and the glottal-stop consonant.

### P2 — horizontal bar

```
 ———
```

- **Description:** a horizontal stroke. Used full-width (caps, bases) or short (the voicing bar).
- **ASCII hint:** `—`
- **Stroke count:** 1
- **Typical usage:** the guttural top cap; the dental bottom base; the **voicing bar** (a short P2
  crossing the stem at lower-mid); the vowel-length stroke; level tone bars.

### P3 — short tick (diagonal)

```
   ╱
```

- **Description:** a single short diagonal cut.
- **ASCII hint:** `╱`
- **Stroke count:** 1
- **Typical usage:** the **aspiration tick** (upper-right, flicking off the skeleton); the diphthong
  tick (e→ai, o→au); the **alveolar place marker** (base-right of the dental skeleton); the shortness
  tick on ĕ/ŏ.

### P4 — simple arc (open curve)

```
  (        )
 (          )
```

- **Description:** an open curved stroke, oriented as the glyph requires (left-opening, up-opening,
  hook).
- **ASCII hint:** `(` `)`
- **Stroke count:** 1
- **Typical usage:** the palatal upper-left hook; the labial right bowl; the semivowel "sweeping arc"
  family (y r l v); the i-mark (small up-arc) and u-mark (small down-bowl); the chant-extension curve.

### P5 — small loop

```
  o
```

- **Description:** a small closed loop.
- **ASCII hint:** `o`
- **Stroke count:** 1 (a single continuous gouge)
- **Typical usage:** the **nasal loop** (at the very top of a skeleton → ṅ ñ ṇ n m); the **anusvāra**
  is exactly this loop standing alone (tying nasality together across the whole system); part of
  candrabindu.

### P6 — foot-curl (small basal hook)

```
 |
 ↄ
```

- **Description:** a small hook curling at the base of a stem.
- **ASCII hint:** `ↄ`
- **Stroke count:** 1
- **Typical usage:** the **retroflex signature** (foot-curl at the base → ṭ family); the ṛ vocalic
  curl; the ṣ sibilant base; the ḻ retroflex approximant.

### Summary table

| ID | Primitive            | ASCII | Strokes | Signature role                     |
|----|----------------------|-------|---------|------------------------------------|
| P1 | vertical stem        | `\|`  | 1       | consonant spine; vowel carrier     |
| P2 | horizontal bar       | `—`   | 1       | caps, bases, voicing bar, length   |
| P3 | short tick (diagonal)| `╱`   | 1       | aspiration; diphthong; alveolar    |
| P4 | simple arc           | `( )` | 1       | hooks, bowls, semivowels, i/u marks|
| P5 | small loop           | `o`   | 1       | nasal loop; anusvāra               |
| P6 | foot-curl            | `ↄ`   | 1       | retroflex; ṛ curl                  |

---

## 3. Consonant place skeletons (the 5 vargas)

From SD-1 §3.2. The base form of each varga is its **unvoiced, unaspirated, inherent-/a/** member.
Each skeleton is iconically motivated (a memory aid, not a metaphysical claim): the mark's position
mirrors the place of articulation in the mouth.

### 3.1 Guttural — base **k** (U+E020)

```
 ———
  |
  |
```

- **Construction:** P1 stem + P2 cap at the **top**.
- **Iconic logic:** sound at the throat → mark at the top.

### 3.2 Palatal — base **c** (U+E025)

```
 ⌐|
  |
  |
```

- **Construction:** P1 stem + P4 small hook, **upper-left**.
- **Iconic logic:** the palate is mid-high → a soft hook, mid-high on the stem.

### 3.3 Retroflex — base **ṭ** (U+E02A)

```
  |
  |
  ↄ
```

- **Construction:** P1 stem + P6 foot-curl at the **base**.
- **Iconic logic:** the tongue curls back → the foot of the glyph curls.

### 3.4 Dental — base **t** (U+E02F)

```
  |
  |
 ———
```

- **Construction:** P1 stem + P2 base at the **bottom**.
- **Iconic logic:** teeth at the front/bottom → a flat base.

### 3.5 Labial — base **p** (U+E034)

```
  |◗
  |
```

- **Construction:** P1 stem + P4 rounded bowl, **right side**.
- **Iconic logic:** the lips round → a closed bowl.

### 3.6 Skeleton summary

| Varga      | Base | Skeleton | Construction              | Mark position |
|------------|------|----------|---------------------------|---------------|
| Guttural   | k    | `⊤`      | P1 stem + P2 cap, top     | top           |
| Palatal    | c    | `⌐\|`    | P1 stem + P4 hook, up-left| mid-high left |
| Retroflex  | ṭ    | `\|ↄ`    | P1 stem + P6 foot-curl    | base          |
| Dental     | t    | `⊥`      | P1 stem + P2 base, bottom | bottom        |
| Labial     | p    | `\|◗`    | P1 stem + P4 bowl, right  | right         |

---

## 4. Manner modifiers

From SD-1 §3.3. The **same** modifiers apply consistently across **every** varga. This is the heart of
the featural system: learn the modifiers once and they regenerate all 25 stops + 5 nasals.

| Manner             | Modifier        | Stroke | Position                    |
|--------------------|-----------------|--------|-----------------------------|
| voiced             | voicing bar     | P2     | a short bar crossing the stem at lower-mid |
| aspirated          | aspiration tick | P3     | a short diagonal, upper-right, flicking off |
| voiced + aspirated | bar **and** tick| P2+P3  | both, as above              |
| nasal              | nasal loop      | P5     | a small loop at the very top, above the skeleton |
| soft-consonant (Extension tier) | central dot | — | a small dot inside the skeleton (E080–E086 softened series) |

### 4.1 The row-generation recipe

Within a varga the five members are **always**:

```
base   ·   +tick    ·   +bar    ·   +bar+tick   ·   +loop
(k)         (kh)        (g)         (gh)            (ṅ)
```

The same recipe regenerates every row. **The nasal loop standing alone is the anusvāra** (U+E051) —
nasality is one shape across the whole system.

### 4.2 The full stop grid (worked)

| Varga      | base | +tick (asp.) | +bar (voiced) | +bar+tick | +loop (nasal) |
|------------|------|--------------|---------------|-----------|---------------|
| Guttural   | k E020 | kh E021    | g E022        | gh E023   | ṅ E024        |
| Palatal    | c E025 | ch E026    | j E027        | jh E028   | ñ E029        |
| Retroflex  | ṭ E02A | ṭh E02B    | ḍ E02C        | ḍh E02D   | ṇ E02E        |
| Dental     | t E02F | th E030    | d E031        | dh E032   | n E033        |
| Labial     | p E034 | ph E035    | b E036        | bh E037   | m E038        |

To draw any cell: start from the varga skeleton (§3), then add the manner modifier(s) for that column.
Example — **gh** (U+E023): guttural skeleton (stem + top cap) + voicing bar (P2, lower-mid) +
aspiration tick (P3, upper-right).

### 4.3 Non-varga consonant families (SD-1 §3.4)

- **Semivowels (y r l v)** — an "open" family: a single sweeping arc (P4), no stop-skeleton, tagged by
  place. They echo their vowel cousins (y↔i, r↔ṛ, v↔u):
  - **y** (E039): left-opening arc.
  - **r** (E03A): flowing stroke + small curl (echoes ṛ).
  - **l** (E03B): stem + basal right-branch (lateral).
  - **v** (E03C): up-opening bowl (echoes u / the labial bowl).
- **Sibilants (ś ṣ s)** — a "friction" family: the relevant place skeleton + a small **friction hatch**
  (two tiny parallel ticks, distinct from the single aspiration tick):
  - **ś** (E03D): palatal hook + hatch.
  - **ṣ** (E03E): foot-curl + hatch.
  - **s** (E03F): dental base + hatch.
- **Aspirant (h)** (E040) — the lone glottal fricative, drawn as the **aspiration tick "grown up"**: a
  single prominent diagonal stem with an upper-right flare. (Mnemonic: the small tick = the aspiration
  feature; the full glyph = standalone /h/.)

---

## 5. The Tier-1 addition — the alveolar place marker

From the design spec §3.1. SD-1 encodes **place** as a skeleton and **manner** as a modifier. The
alveolar series sits articulatorily **between dental and retroflex**, and the glyph says so.

> **Alveolar marker = a short tick (P3) at the base-right of the dental skeleton** — iconically, the
> tongue *raised toward* the curl position but not curled. (The retroflex foot-curl P6 is the full
> curl; the alveolar tick is its "half-step.")

This is a **place** modifier, deliberately positioned at the **base** — establishing a consistent
meta-rule: *place modifiers live at the base; manner modifiers live on the stem/top.* Future place
extensions must follow the same rule.

The full alveolar row is then generated by SD-1's ordinary manner modifiers applied on top of the
alveolar-marked skeleton:

| IAST | Construction recipe                                        | Codepoint |
|------|------------------------------------------------------------|-----------|
| ṯ    | dental base + alveolar tick (P3, base-right)               | U+E08A    |
| ḏ    | dental base + alveolar tick + voicing bar (P2)             | U+E08B    |
| ṉ    | dental base + alveolar tick + nasal loop (P5)              | U+E089    |
| ṟ    | r-glyph (flowing stroke + small curl) + alveolar tick, base| U+E088    |

Two more pan-Indian glyphs that are **not** alveolars but ship in the same Tier-1 block:

- **ḻ /ɻ/ — retroflex approximant** (U+E087): an open sweeping arc (P4, the semivowel-family
  signature) + a **foot-curl (P6)**. "An open arc with a curled foot." Visually distinct from **ḷ**
  (stem + basal branch + curl, E085) and from **r** (flowing stroke + small curl).
- **ʼ /ʔ/ — glottal stop, full consonant** (U+E08E): the avagraha form (tall vertical + notch)
  **scaled to consonant-body height with a baseline foot.** SD-1 already glosses avagraha as "glottal
  echo," so the full consonant is its grown-up form (the same mnemonic move SD-1 used for h ←
  aspiration tick). Checked/glottalized finals need **no new sign**: they are the ordinary cluster
  machinery — e.g. Santali *dakʼ* "water" = d-a-k(virāma)-ʼ(virāma).

---

## 6. Vowel mātrās and signifiers

### 6.1 The three vowel rules (SD-1 §5)

1. **Inherent /a/.** A bare consonant = consonant + /a/. No sign needed. `t` (E02F) reads **ta**.
2. **Other vowels.** Attach the matching mātrā (§6.3) to the **right** of the consonant. `t` + i-sign
   (E012) = **ti**.
3. **Virāma (no vowel).** Add the virāma (E050) to strip the inherent /a/. `t` + virāma = bare **t**.
   Used for word-final consonants and inside clusters.

Length is a consistent added stroke (short → long); a diphthong is a consistent added tick (e → ai,
o → au). This regularity means a designer draws the *length stroke* and the *diphthong tick* once and
reuses them.

### 6.2 Independent vowels (word-initial / standalone)

An independent vowel = a neutral **vowel carrier** (a short P1 stem) bearing the same sign used as the
mātrā, so the standalone and attached forms visibly share a core.

| IPA | IAST | ASCII | Construction (carrier + sign)        | Codepoint |
|-----|------|-------|--------------------------------------|-----------|
| ə   | a    | a     | carrier alone                        | U+E000    |
| aː  | ā    | aa/A  | carrier + length stroke (P2)         | U+E001    |
| i   | i    | i     | carrier + i-mark (small up-arc, P4)  | U+E002    |
| iː  | ī    | ii/I  | carrier + i-mark + length stroke     | U+E003    |
| u   | u    | u     | carrier + u-mark (small down-bowl, P4)| U+E004   |
| uː  | ū    | uu/U  | carrier + u-mark + length stroke     | U+E005    |
| ɻ̩   | ṛ    | R/.r  | carrier + retroflex curl (P6)        | U+E006    |
| eː  | e    | e     | carrier + e-mark (right bar, P2)     | U+E007    |
| ai  | ai   | ai    | carrier + e-mark + diphthong tick (P3)| U+E008   |
| oː  | o    | o     | carrier + o-mark (right bar + bowl)  | U+E009    |
| au  | au   | au    | carrier + o-mark + diphthong tick    | U+E00A    |

### 6.3 Vowel signs (mātrās — attached to a consonant, right side)

Inherent /a/ has **no sign**. All mātrās attach to the right (no above/below complexity in v1).

| Vowel | IAST | Sign                              | Codepoint |
|-------|------|-----------------------------------|-----------|
| ā     | ā    | length stroke, right (P2)         | U+E011    |
| i     | i    | up-arc, right (P4)                | U+E012    |
| ī     | ī    | up-arc + length                   | U+E013    |
| u     | u    | down-bowl, right (P4)             | U+E014    |
| ū     | ū    | down-bowl + length                | U+E015    |
| ṛ     | ṛ    | retroflex curl, right (P6)        | U+E016    |
| e     | e    | right bar (P2)                    | U+E017    |
| ai    | ai   | right bar + diphthong tick (P3)   | U+E018    |
| o     | o    | right bar + bowl (P2 + P4)        | U+E019    |
| au    | au   | right bar + bowl + diphthong tick | U+E01A    |

### 6.4 Extension-tier vowel signifiers (design spec §3.2)

- **Shortness tick** (U+E08C): a small notch (P3) added to /eː/ → /ĕ/ and /oː/ → /ŏ/. Drawn as a
  combining tick on the e/o mark.
- **Central dot** for /ï/ (U+E08D): a small dot inside the i-mātrā (central high vowel; the independent
  form is an E000-carrier composition).

These belong to the **extension tier** and are not part of the Simplified core; draw them after the
core set is complete.

---

## 7. Special marks and signs

### 7.1 Baseline signs (SD-1 §4.4)

| Function                         | IAST | Construction                                        | Codepoint |
|----------------------------------|------|-----------------------------------------------------|-----------|
| virāma (suppress inherent /a/)   | —    | small basal right-stroke after the consonant (P3)   | U+E050    |
| anusvāra (nasal resonance)       | ṁ    | the §3.3 nasal loop (P5), standalone                | U+E051    |
| visarga (aspirated exhale)       | ḥ    | two small dots, vertically paired (echo-h)          | U+E052    |
| avagraha (elision/glottal echo)  | ʼ    | a single tall vertical (P1) with a small notch      | U+E053    |
| candrabindu (vowel nasalisation) | m̐    | the nasal loop with a subscript dot (distinct from anusvāra) | U+E054 |

Anusvāra, visarga, and nasalisation are **baseline** signs: they follow their consonant/vowel inline
on the writing line.

### 7.2 Tone marks (SD-1 §4.4 + design spec §3.3)

Tones are **suprasegmental** — they sit **above** the akṣara (the only departure from strict
linearity) and attach to the *whole* syllable. In canonical IAST they are written as trailing
ASCII-safe markers on the syllable's vowel and round-trip to their codepoints.

| Tone        | ASCII | Construction                          | Codepoint |
|-------------|-------|---------------------------------------|-----------|
| rising      | `/`   | short upward arc above the akṣara (P4)| U+E060    |
| falling     | `\`   | short downward arc above the akṣara (P4)| U+E061  |
| chant ext.  | `:`   | low curve trailing the akṣara (P4)    | U+E062    |
| high level  | `=`   | short horizontal bar above (P2)       | U+E063    |
| low level   | `` ` ``| short horizontal bar below (P2)      | U+E064    |

(The high/low level tones E063/E064 are the design-spec additions for pan-Indian tonal languages; per
the r2 errata the low-level alias is the backtick `` ` ``, not the comma, to avoid colliding with
punctuation.)

### 7.3 Phonation marks (design spec §3.4)

| Phonation | IAST | Construction              | Codepoint |
|-----------|------|---------------------------|-----------|
| creaky    | ◌̰    | a small under-tilde (combining) | U+E08F |
| breathy   | ◌̤    | two small subscript dots (combining) | U+E090 |

### 7.4 Saṁjñā and closure

- **Saṁjñā / technical-sense mark** `^` (U+E065): a prefix mark flagging that the following term is a
  registered Core technical term rather than its everyday sense. (Its detailed glyph form is not fixed
  in SD-1; treat as a small raised prefix mark pending a ratified form.)
- **Closure glyph (saṁpūrṇa-mudrā)** `{C}` (U+E06F): a downward-pointing triangle (three straight cuts,
  "descent into stillness") capped by the chant-extension curve (P4). Distinct from every letter; reads
  at small size; marks a Grantha-unit boundary.

### 7.5 Ordering within an akṣara

Canonical (and codepoint) order within a syllable:

```
consonant(s)+virāma → final consonant → vowel sign → shortness/central tick
                    → phonation mark → nasal/visarga/nasalisation → tone
```

The font positions vowel signs and baseline marks inline, and tone marks above. All suprasegmental
marks attach to the right of the vowel or above/below the whole akṣara.

### 7.6 Akṣara mechanics — worked encodings (SD-1 §5)

| Target      | Units (left→right)        | Codepoints            |
|-------------|---------------------------|-----------------------|
| `ta`        | ta                        | E02F                  |
| `ti`        | t + i-sign                | E02F E012             |
| `tā`        | t + ā-sign                | E02F E011             |
| `t` (final) | t + virāma                | E02F E050             |
| `tva`       | t+virāma · va             | E02F E050 · E03C      |
| `kṣi`       | k+virāma · ṣ+i-sign       | E020 E050 · E03E E012 |
| `oṁ`        | independent o · anusvāra  | E009 · E051           |

**Rule 4 (clusters are linear, no stacking):** write each consonant with a virāma except the last,
which takes its vowel. `tva` = `t`+virāma · `v`(+inherent a). `kṣi` = `k`+virāma · `ṣ`+i-sign.

---

## 8. SVG stroking conventions (digital masters)

These are recommended production defaults for drawing the masters. They are not mandated by the spec —
the spec mandates only the stroke composition — but they keep the family consistent and carving-ready.
Design on a **1000-unit em square** (UPM = 1000).

### 8.1 Metrics

- **Baseline alignment:** all consonants sit on a common baseline. Skeleton (cap/x) height ≈ 700 units.
- **Vowel carrier height** ≈ 500 units (the "short stem" P1).
- **Suprasegmental zone:** vowel and tone marks float **above** the skeleton by ~25% of glyph height
  (anchor around 700–900). Subscript marks (low-level tone, phonation) sit just below the baseline.

### 8.2 Stroke weights

- **Vertical stems (P1):** 180–200 units wide.
- **Horizontal bars (P2):** ~160 units (caps, bases, voicing bar, length stroke).
- **Ticks (P3):** short, ~120–150 units long, at the weight of a stem.
- **Arcs/loops (P4/P5/P6):** quarter-circles or arcs with radius ~120–150 units, smoothed (no sharp
  corners except intentional notches such as avagraha).
- A reference hairline of ~2 units at 1000 UPM is the minimum renderable feature; never go below it.
  Scale all weights proportionally for other UPMs.

### 8.3 Stroke order (carving readiness)

Draw — and document — each glyph so it is **carvable in one pass without backtracking**:

1. Start with the main **skeleton** (stem first, then its place mark: top cap / base / hook / bowl /
   foot-curl).
2. Layer **modifiers** left-to-right, top-to-bottom: voicing bar, then aspiration tick, then nasal
   loop.
3. Add **vowel signs** to the right; **tones** above last.

Every stroke should be passable in one chisel motion without lifting and re-registering.

### 8.4 Consistency & anti-collision

- **Reuse components.** Model each primitive (voicing bar, aspiration tick, nasal loop, length stroke,
  diphthong tick, alveolar tick, friction hatch) as a **single reusable SVG component / font
  component**, so it is pixel-identical everywhere it appears. This is what makes the system legible
  and the file maintainable.
- **No unintended overlaps.** Marks must attach cleanly to their base, not float; ensure the friction
  hatch (two ticks) is visibly distinct from the single aspiration tick at 16 px.
- **Test small.** Verify each glyph at 16 px and as a 2-bit (black/white) stencil. Skeletons must stay
  distinguishable (cap-up vs base-down vs foot-curl vs left-hook vs right-bowl).

### 8.5 Worked glyph builds (stroke-by-stroke)

Each build lists the strokes in carving order. One numbered step = one chisel pass. The intent is that
a carver can follow the numbers without ever lifting to re-register over a finished stroke.

**k — guttural base (U+E020)**
```
1. P1  vertical stem (the spine)            |
2. P2  horizontal cap across the top      ——|
```
Two strokes. This is the lightest glyph in the system and the reference for cap height.

**g — voiced guttural (U+E022)**
```
1. P1  vertical stem
2. P2  top cap
3. P2  short voicing bar crossing the stem at lower-mid
```
Three strokes. Note the voicing bar is the *same* component used in j, ḍ, d, b — draw it once, reuse.

**gh — voiced aspirated guttural (U+E023)**
```
1. P1  vertical stem
2. P2  top cap
3. P2  voicing bar (lower-mid)
4. P3  aspiration tick (upper-right, flicking off)
```
Four strokes. The +bar+tick column is always the base plus both manner components.

**ṅ — guttural nasal (U+E024)**
```
1. P1  vertical stem
2. P2  top cap
3. P5  nasal loop at the very top, above the cap
```
The nasal loop sits above the skeleton; standing alone, this same loop is the anusvāra (E051).

**ṭ — retroflex base (U+E02A)**
```
1. P1  vertical stem
2. P6  foot-curl at the base, curling right
```
Two strokes. The foot-curl is the retroflex signature; reuse it for ṛ and the ṣ base.

**t — dental base (U+E02F)**
```
1. P1  vertical stem
2. P2  horizontal base across the bottom
```
The mirror of k (cap at top → base at bottom): same two strokes, opposite mark position.

**ti — dental + i-mātrā (akṣara)**
```
1. P1  vertical stem            (t skeleton…)
2. P2  bottom base              (…= t)
3. P4  small up-arc to the right (the i-mātrā, E012)
```
Mātrās attach to the **right**; they never alter the consonant skeleton.

**tva — cluster t+virāma · va (akṣara, no stacking)**
```
1–2. build t (stem + bottom base)
3.   P3  virāma — small basal right-stroke after t (strips its /a/)
4.   P4  up-opening bowl = v (carries inherent /a/)
```
Linear, left-to-right. The chisel finishes t, cuts the virāma, then moves right to v — no overlap.

**c — palatal base (U+E025)**
```
1. P1  vertical stem
2. P4  small hook, upper-left of the stem
```
The hook is mid-high — iconic for the palate. Keep it clearly smaller than the labial bowl.

**m — labial nasal (U+E038)**
```
1. P1  vertical stem
2. P4  rounded bowl on the right (= p skeleton)
3. P5  nasal loop at the very top
```
The loop is the same component as in ṅ/ñ/ṇ/n — and as the standalone anusvāra.

**ṣ — retroflex sibilant (U+E03E)**
```
1. P1  short stem
2. P6  foot-curl at the base (the retroflex signature)
3. P3+P3  friction hatch (two short parallel ticks) — NOT one tick
```
The double hatch is what separates a sibilant from an aspirate; keep both ticks legible at 16 px.

**ṯ — Tier-1 alveolar stop (U+E08A)**
```
1. P1  vertical stem
2. P2  bottom base (= dental t)
3. P3  alveolar tick at the base-RIGHT (place modifier, half-step toward the curl)
```
Place modifiers live at the base; manner modifiers live on the stem/top. The alveolar tick is the
"half-step" between the dental base and the full retroflex foot-curl.

**ai — independent diphthong (U+E008)**
```
1. P1  short carrier stem
2. P2  e-mark (right bar)
3. P3  diphthong tick on the bar (e → ai)
```
The same diphthong tick turns o → au. Draw it once, reuse.

---

## 9. The core ~70-glyph starter set

The Simplified-SD inventory a font must cover first, with construction recipes. The complete,
machine-readable inventory (including digits and the full extension tier) is in **`pua-map.csv`**;
this table is the design reference for the core glyphs.

### 9.1 Consonants — 5 vargas × 5 (25)

| Form | Codepoint | Skeleton  | Modifiers          | Construction recipe                          |
|------|-----------|-----------|--------------------|----------------------------------------------|
| k    | E020      | guttural  | —                  | stem + top cap                               |
| kh   | E021      | guttural  | tick               | stem + top cap + aspiration tick             |
| g    | E022      | guttural  | bar                | stem + top cap + voicing bar                 |
| gh   | E023      | guttural  | bar + tick         | stem + top cap + voicing bar + aspiration tick |
| ṅ    | E024      | guttural  | loop               | stem + top cap + nasal loop                  |
| c    | E025      | palatal   | —                  | stem + upper-left hook                       |
| ch   | E026      | palatal   | tick               | palatal base + aspiration tick               |
| j    | E027      | palatal   | bar                | palatal base + voicing bar                   |
| jh   | E028      | palatal   | bar + tick         | palatal base + voicing bar + aspiration tick |
| ñ    | E029      | palatal   | loop               | palatal base + nasal loop                    |
| ṭ    | E02A      | retroflex | —                  | stem + foot-curl                             |
| ṭh   | E02B      | retroflex | tick               | retroflex base + aspiration tick             |
| ḍ    | E02C      | retroflex | bar                | retroflex base + voicing bar                 |
| ḍh   | E02D      | retroflex | bar + tick         | retroflex base + voicing bar + aspiration tick |
| ṇ    | E02E      | retroflex | loop               | retroflex base + nasal loop                  |
| t    | E02F      | dental    | —                  | stem + bottom base                           |
| th   | E030      | dental    | tick               | dental base + aspiration tick                |
| d    | E031      | dental    | bar                | dental base + voicing bar                    |
| dh   | E032      | dental    | bar + tick         | dental base + voicing bar + aspiration tick  |
| n    | E033      | dental    | loop               | dental base + nasal loop                     |
| p    | E034      | labial    | —                  | stem + right bowl                            |
| ph   | E035      | labial    | tick               | labial base + aspiration tick                |
| b    | E036      | labial    | bar                | labial base + voicing bar                    |
| bh   | E037      | labial    | bar + tick         | labial base + voicing bar + aspiration tick  |
| m    | E038      | labial    | loop               | labial base + nasal loop                     |

### 9.2 Semivowels (4), sibilants (3), aspirant (1)

| Form | Codepoint | Family    | Construction recipe                          |
|------|-----------|-----------|----------------------------------------------|
| y    | E039      | semivowel | left-opening arc (echoes i)                  |
| r    | E03A      | semivowel | flowing stroke + small curl (echoes ṛ)       |
| l    | E03B      | semivowel | stem + basal right-branch (lateral)          |
| v    | E03C      | semivowel | up-opening bowl (echoes u)                   |
| ś    | E03D      | sibilant  | palatal hook + friction hatch                |
| ṣ    | E03E      | sibilant  | foot-curl + friction hatch                   |
| s    | E03F      | sibilant  | dental base + friction hatch                 |
| h    | E040      | aspirant  | prominent diagonal with upper-right flare    |

### 9.3 Tier-1 alveolars + retroflex approximant (5) and glottal stop (1)

| Form | Codepoint | Construction recipe                                      |
|------|-----------|----------------------------------------------------------|
| ṟ    | E088      | r-glyph + alveolar tick (P3, base-right)                 |
| ṉ    | E089      | dental base + alveolar tick + nasal loop                 |
| ṯ    | E08A      | dental base + alveolar tick                              |
| ḏ    | E08B      | dental base + alveolar tick + voicing bar                |
| ḻ    | E087      | open sweeping arc (P4) + foot-curl (P6)                  |
| ʼ    | E08E      | avagraha form (tall vertical + notch) scaled to body height + baseline foot |

(ḷ, the retroflex lateral at E085, is the original SD-1 extension-tier glyph: stem + basal branch +
curl. It is provisioned but belongs to the extension tier.)

### 9.4 Independent vowels (11) and mātrās (10)

| Form | Codepoint | Construction recipe                  |   | Mātrā | Codepoint | Construction recipe              |
|------|-----------|--------------------------------------|---|-------|-----------|----------------------------------|
| a    | E000      | carrier alone                        |   | —     | —         | inherent /a/: no sign            |
| ā    | E001      | carrier + length stroke              |   | ā     | E011      | length stroke, right             |
| i    | E002      | carrier + i-mark (up-arc)            |   | i     | E012      | up-arc, right                    |
| ī    | E003      | carrier + i-mark + length            |   | ī     | E013      | up-arc + length                  |
| u    | E004      | carrier + u-mark (down-bowl)         |   | u     | E014      | down-bowl, right                 |
| ū    | E005      | carrier + u-mark + length            |   | ū     | E015      | down-bowl + length               |
| ṛ    | E006      | carrier + retroflex curl             |   | ṛ     | E016      | retroflex curl, right            |
| e    | E007      | carrier + e-mark (right bar)         |   | e     | E017      | right bar                        |
| ai   | E008      | carrier + e-mark + diphthong tick    |   | ai    | E018      | right bar + diphthong tick       |
| o    | E009      | carrier + o-mark (right bar + bowl)  |   | o     | E019      | right bar + bowl                 |
| au   | E00A      | carrier + o-mark + diphthong tick    |   | au    | E01A      | right bar + bowl + diphthong tick|

### 9.5 Signs (5), tones (5), phonation (2), plus markers

| Form | Codepoint | Category   | Construction recipe                         |
|------|-----------|------------|---------------------------------------------|
| virāma | E050    | sign       | small basal right-stroke                    |
| ṁ    | E051      | sign       | nasal loop, standalone (anusvāra)           |
| ḥ    | E052      | sign       | two small dots, vertically paired (visarga) |
| ʼ    | E053      | sign       | tall vertical + small notch (avagraha)      |
| m̐    | E054      | sign       | nasal loop + subscript dot (candrabindu)    |
| /    | E060      | tone       | short upward arc above                      |
| \    | E061      | tone       | short downward arc above                    |
| :    | E062      | tone       | low trailing curve                          |
| =    | E063      | tone       | level bar above                             |
| `    | E064      | tone       | level bar below                             |
| ◌̰    | E08F      | phonation  | under-tilde (combining)                     |
| ◌̤    | E090      | phonation  | two subscript dots (combining)              |
| ^    | E065      | mark       | saṁjñā / technical-sense prefix mark        |
| {C}  | E06F      | closure    | downward triangle + chant-extension curve   |

### 9.6 Glyph count

| Block                                   | Count |
|-----------------------------------------|-------|
| Stops + nasals (5 vargas × 5)           | 25    |
| Semivowels                              | 4     |
| Sibilants                               | 3     |
| Aspirant                                | 1     |
| Tier-1 alveolars + ḻ                    | 5     |
| Glottal stop ʼ                          | 1     |
| Independent vowels                      | 11    |
| Mātrās                                  | 10    |
| Baseline signs                          | 5     |
| Tone marks                              | 5     |
| Phonation marks                         | 2     |
| Saṁjñā + closure                        | 2     |
| **Core starter total**                  | **74**|

(Plus the 10 simplified digits E070–E079, drawn from P1–P6, for a full public inscription set. The
machine-readable `pua-map.csv` lists all 87 codepoints the library emits — 76 core + 11 extension.)

### 9.7 Representative glyph sketches (ASCII approximations)

ASCII can only *approximate* the forms — the authoritative definition is always the stroke recipe.
These sketches are orientation aids for a first pass.

**The five varga bases** (the shapes a learner must internalise first):

```
   k            c            ṭ            t            p
  ———          ⌐|           |            |            |◗
   |            |           |            |            |
   |            |           ↄ           ———
 (top cap)  (up-left hook) (foot-curl) (bottom base) (right bowl)
```

**One full row — dentals** (showing the manner recipe regenerating the row):

```
   t            th           d            dh           n
   |            |  ╱         |            |  ╱        o
   |            |            |—           |—           |
  ———          ———          ———          ———          ———
 (base)      (+tick)      (+bar)      (+bar+tick)   (+loop on top)
```

**Nasals across the vargas** (the same P5 loop on each skeleton):

```
   ṅ            ñ            ṇ            n            m
  o——         o            o            o            o
   |           ⌐|           |            |            |◗
   |            |           ↄ           ———
```

**Semivowels** (open-arc family — no stop skeleton):

```
   y            r            l            v
  (            )ↄ          |             (
   (            curl        |—            )
                            branch       bowl-up
```

**Sibilants** (place skeleton + friction hatch ╱╱):

```
   ś            ṣ            s
  ⌐|╱╱          |╱╱         |╱╱
   |            ↄ          ———
 (palatal)  (foot-curl)  (dental base)
```

**Vowels — carrier + sign** (the carrier is a short stem; the sign is shared with the mātrā):

```
   a       ā        i        u        e        ai
   ¦       ¦—       ¦(       ¦)       ¦|       ¦|╱
 (carrier)(+len)  (+up-arc)(+bowl) (+rt bar)(+bar+tick)
```

**Signs and closure:**

```
  virāma     anusvāra(ṁ)   visarga(ḥ)   avagraha(ʼ)   closure({C})
   ·_          o             :            |̓             ▽
                                                        :
```

### 9.8 Worked akṣara assemblies (full words)

Following SD-1 §7's method: (a) canonical IAST, (b) stroke account, (c) PUA codepoint sequence.

**`oṁ`** — the sacred syllable
- (a) `oṁ`
- (b) independent **o** (carrier + right bar + bowl) · **anusvāra** (standalone nasal loop)
- (c) `E009 · E051`

**`tat`** — "that" (the Mahāvākya word)
- (a) `tat`
- (b) **ta** (dental base, inherent /a/) · **t** (dental base + virāma)
- (c) `E02F · E02F E050`

**`tvam`** — "you"
- (a) `tvam`
- (b) **t** (dental base + virāma) · **va** (up-bowl, inherent /a/) · **m** (labial + nasal loop + virāma)
- (c) `E02F E050 · E03C · E038 E050`

**`śanuma`** — "cosmic person" (SD lexeme)
- (a) `śanuma`
- (b) **śa** (palatal hook + hatch, inherent /a/) · **nu** (dental + nasal loop + u-bowl) · **ma**
  (labial + nasal loop, inherent /a/)
- (c) `E03D · E033 E014 · E038`

**`vadruṁ-ai`** — "the ritual (accusative)"
- (a) `vadruṁ-ai`
- (b) **va** · **d** + virāma · **ru** (r + u-bowl) · **ṁ** (anusvāra) · hyphen · **ai** (independent)
- (c) `E03C · E031 E050 · E03A E014 · E051 · - · E008`

These exercise every core mechanism: independent vowels and mātrās, the inherent /a/, a cluster with
virāma, all consonant families (stop, nasal, sibilant, semivowel), the anusvāra, and lexical
hyphenation.

---

## 10. Export & production pipeline

### 10.1 SVG masters

- Draw each glyph in **Inkscape** or **FontForge** using the §8 conventions (1000 UPM, component
  reuse, stroke order). Save as standard **SVG paths only** (no embedded rasters, no text elements).
- Name each master by its production glyph name `uniXXXX` (matching `pua-map.csv`), e.g. `uniE020.svg`.

### 10.2 SVG → UFO

- Use **FontTools** (`fontTools.pens.svgPathPen` / `fontTools.svgLib`) to convert SVG paths into UFO
  glyphs, **or** import the SVGs directly into FontForge and export a UFO.
- Set each glyph's Unicode value to its PUA codepoint from `pua-map.csv`. The `cmap` must map exactly
  the codepoints the transliteration library emits — no more, no less.

### 10.3 Font compilation

- Build the OTF/TTF from the UFO with **fontmake** (or FontLab / FontForge).
- Add **GPOS mark-to-base** anchors so the renderer can position:
  - mātrās to the **right** of the consonant,
  - tone marks **above** the akṣara,
  - the virāma at the baseline-right,
  - phonation marks below.
- **Do NOT add GSUB conjunct ligatures.** Clusters are linear by design; the virāma is always visible.
- Export `SD-1.ttf` and a web `SD-1.woff2`.

### 10.4 Carving stencils

- Export the UFO/font at **200% scale as PDF**, one glyph per page, with baseline and suprasegmental
  guides.
- Print on kraft paper, pin to stone/wood, trace with a stylus, and carve following the documented
  stroke order (§8.3) — every stroke is a single chisel pass.

### 10.5 QA

- Render the compiled font in a test app — the **playground** (`site/playground.html`) is purpose-built
  for this: drop `SD-1.woff2` into the `@font-face` rule and the glyph-preview row renders real glyphs.
- Verify each glyph matches its construction recipe in §9 / `pua-map.csv`, with no rendering artifacts,
  correct mark positioning, and clean small-size legibility.

---

## 11. Tool recommendations

Non-prescriptive — pick the tool that fits your workflow:

- **Inkscape** (free): precise path-based design, clean SVG export. Good first stop for the masters.
- **FontForge** (free; steeper learning curve): a full font editor, UFO-native, can do SVG import and
  OTF export end-to-end without leaving the app.
- **Glyphs** (commercial, ~$299; macOS): very smooth UX, ideal for learning the craft; exports UFO
  directly and has excellent component/anchor tooling for the reusable-modifier approach.
- **RoboFont** (commercial; Python-based): maximum control, best if the modifier system is ever driven
  parametrically/algorithmically (e.g. generating the whole stop grid from skeleton + modifier
  components).
- **FontTools / fontmake** (free, Python): the scripting backbone for SVG→UFO→OTF automation and CI.

Whatever the tool, the invariant is the same: **build from P1–P6, reuse the modifier components,
map to the PUA codepoints in `pua-map.csv`, and keep the font a thin glyph-map + mark-positioning
layer** over the transliteration library.

---

## Appendix A — relationship to the codepoint map

`pua-map.csv` (this folder) is the canonical machine-readable inventory: one row per codepoint the
library emits, with `Codepoint, Hex, Form, Category, Construction Recipe, Notes`. Every codepoint in
that CSV is verified to exist in `lib/src/translit.ts` (INDEP_VOWELS, MATRAS, CONSONANTS, SIGNS,
TONES, plus virāma, saṁjñā, closure, digits, and the extension tier). If you add a glyph to the font,
add it to the library's tables too — otherwise the font maps a codepoint the renderer never produces.

## Appendix B — PUA block map and reserved ranges

The SD-1 PUA layout is **block-structured**, not a single contiguous run. Each functional class gets
its own block, with deliberate reserved gaps between blocks for future growth. The font's `cmap`
covers the **87 assigned codepoints** below (the rows in `pua-map.csv`); the reserved gaps carry **no
glyph** and the library never emits them.

| Range        | Assigned | Class                                   | Reserved gap after        |
|--------------|----------|-----------------------------------------|---------------------------|
| E000–E00A    | 11       | independent vowels                      | E00B–E010 reserved        |
| E011–E01A    | 10       | vowel mātrās                            | E01B–E01F reserved        |
| E020–E040    | 33       | consonants (Simplified)                 | E041–E04F reserved        |
| E050         | 1        | virāma                                  | —                         |
| E051–E054    | 4        | signs (anusvāra, visarga, avagraha, candrabindu) | E055–E05F reserved |
| E060–E064    | 5        | tone marks                              | —                         |
| E065         | 1        | saṁjñā / technical mark                 | E066–E06E reserved        |
| E06F         | 1        | closure glyph                           | —                         |
| E070–E079    | 10       | simplified digits 0–9                   | E07A–E07F reserved        |
| E080–E084    | 0        | (SD-1 original extension diacritics — not emitted) | reserved        |
| E085         | 1        | ḷ retroflex lateral (extension tier)    | E086 reserved             |
| E087–E08B    | 5        | Tier-1: ḻ ṟ ṉ ṯ ḏ                       | —                         |
| E08C–E08D    | 2        | combining: shortness tick, central dot  | —                         |
| E08E         | 1        | glottal stop ʼ (consonant)              | —                         |
| E08F–E090    | 2        | phonation: creaky, breathy              | E091–E0FF reserved        |
| **Total**    | **87**   |                                         |                           |

> **Why the CSV is not "E000…E090 with no gaps":** the honesty rule is that *every codepoint in the
> CSV must exist in `lib/src/translit.ts`.* The reserved codepoints (E00B–E010, E041–E04F, E080–E084,
> …) are intentionally unassigned and the library does not emit them, so they get **no row**. The CSV
> is contiguous *within* each functional block; the gaps between blocks are by design.

## Appendix C — designer QA checklist

Before declaring a glyph done:

- [ ] Built **only** from P1–P6; no stroke outside the set.
- [ ] Reused the shared modifier components (voicing bar, aspiration tick, nasal loop, length stroke,
      diphthong tick, alveolar tick, friction hatch) — not redrawn ad hoc.
- [ ] Skeleton instantly distinguishable from the other four vargas at 16 px.
- [ ] Friction hatch (two ticks) visibly distinct from a single aspiration tick at 16 px.
- [ ] Mātrās attach cleanly to the right; tones anchor above; virāma at baseline-right; no float.
- [ ] Stroke order documented; every stroke a single chisel pass with no backtracking.
- [ ] Production name is `uniXXXX` exactly matching `pua-map.csv`; `cmap` set to that PUA codepoint.
- [ ] No GSUB conjunct ligature was added (clusters are linear; virāma always visible).
- [ ] Rendered in the playground (`site/playground.html`) via the `@font-face` rule and visually
      matches the §9 construction recipe.

## Appendix D — glossary

- **abugida** — a script where consonants carry an inherent vowel and other vowels are written as
  attached signs (mātrās). SD-1 is an abugida with an explicit visible virāma.
- **akṣara** — an orthographic syllable: a consonant (or cluster) plus its vowel, written as one unit
  on the line, possibly with marks above/below.
- **varga** — a place-of-articulation group of consonants (guttural, palatal, retroflex, dental,
  labial), each a 5-member row in the stop grid.
- **skeleton** — the base shape of a varga (stem + a place mark), before manner modifiers.
- **manner modifier** — a single reusable stroke encoding voicing (voicing bar), aspiration
  (aspiration tick), or nasality (nasal loop).
- **mātrā** — a dependent vowel sign attached to a consonant (right side in SD-1).
- **inherent /a/** — the default vowel a bare consonant carries; written with no sign.
- **virāma** — the mark that strips a consonant's inherent /a/ (for finals and inside clusters).
- **anusvāra (ṁ)** — nasal-resonance sign; the standalone nasal loop (P5).
- **visarga (ḥ)** — voiceless aspirated exhale; paired dots.
- **avagraha (ʼ)** — elision / glottal-echo sign; a tall vertical with a notch.
- **candrabindu (m̐)** — vowel-nasalisation sign; nasal loop + subscript dot.
- **saṁjñā (^)** — the prefix mark flagging a registered Core technical term.
- **closure / saṁpūrṇa-mudrā ({C})** — the Grantha-unit boundary glyph.
- **PUA** — Unicode Private Use Area (U+E000–U+F8FF); SD-1 stores render-layer codepoints here.
- **UPM** — units per em, the font's coordinate grid (1000 recommended here).
- **GPOS / GSUB** — OpenType positioning / substitution tables. SD-1 uses GPOS (mark positioning)
  and deliberately avoids GSUB conjunct ligatures.
- **UFO** — Unified Font Object, an open source format for font sources.
- **Tier-1** — the first-class pan-Indian phonology extension (alveolar series, ḻ, ĕ/ŏ, ï, glottal
  stop, phonation marks, level tones), all built by SD-1's featural rules.
