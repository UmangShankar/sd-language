# SD-1 Font Workflow Guide

How to draw the SD-1 writing system as a font: the stroke-primitive grammar, the ~70-glyph core
starter set, the akṣara assembly rules, and the PUA codepoint mapping. Authoritative source:
`spec/SD-unified-script-v1.md` (§2–§5, Appendix B), cross-checked against the transliteration
library's tables in `lib/src/translit.ts` (the codepoints the renderer actually emits).

This guide is for a font designer (or you) to draw SVG glyph masters and assemble an OpenType font.
It does **not** redefine the script — it transcribes SD-1 into a buildable spec.

---

## 1. Design principles (SD-1 §1.4)

SD-1 is built to be **carvable** — drawable with a chisel, legible at small size and low resolution:

- Every glyph composes from a **small primitive-stroke set** (§2 below). No fine interior detail.
- **No stacking, no conjunct ligatures.** Clusters are linear; the chisel never lifts and
  re-registers over a previous glyph.
- Modifiers are **single strokes** — one cut = voicing bar, one gouge = nasal loop, one flick =
  aspiration tick.
- Skeletons are **visually well-separated** (cap-up vs base-down vs foot-curl vs left-hook vs
  right-bowl) so they survive at small sizes.

The rendering pipeline keeps all shaping logic in the transliteration library; the font is a **thin
glyph map + mark positioning** only:

```
IAST (canonical) → transliteration library → ordered SD-1 PUA codepoints
                 → SD-1 OpenType font (codepoint→glyph + mark positioning)
                 → rendered text / SVG carving stencils
```

---

## 2. Stroke primitives (§3.1) — the carving vocabulary

Every glyph is a composition of these six. **No glyph requires a stroke outside this set.**

| ID | Primitive            | ASCII hint | Typical role                         |
|----|----------------------|-----------|--------------------------------------|
| P1 | vertical stem        | `\|`      | the spine of most consonants         |
| P2 | horizontal bar       | `—`       | caps, bases, the voicing bar         |
| P3 | short tick (diagonal)| `╱`       | aspiration; single short cut         |
| P4 | simple arc (curve)   | `( )`     | palatal hook, semivowels, vowel marks|
| P5 | small loop           | `o`       | nasal mark; anusvāra                 |
| P6 | foot-curl (basal hook)| `ↄ`      | retroflex signature                  |

---

## 3. Consonant construction (§3.2–§3.4)

### 3.1 Place skeletons (the 5 vargas)

The base member of each varga is one skeleton; the iconic logic ties articulation place to shape:

| Varga      | Base | Skeleton  | Construction                         | Iconic logic                  |
|------------|------|-----------|--------------------------------------|-------------------------------|
| Guttural   | k    | `⊤`       | P1 stem + P2 cap at **top**          | sound at the throat → mark up |
| Palatal    | c    | hook      | P1 stem + P4 hook, upper-left        | palate → soft hook, mid-high  |
| Retroflex  | ṭ    | foot-curl | P1 stem + P6 foot-curl at **base**   | tongue curls back → foot curls|
| Dental     | t    | `⊥`       | P1 stem + P2 base at **bottom**      | teeth at front → flat base    |
| Labial     | p    | bowl      | P1 stem + P4 rounded bowl, right     | lips round → closed bowl      |

### 3.2 Manner modifiers — the recipe that regenerates every row

The **same** modifiers apply across **every** varga:

| Manner             | Modifier        | Stroke | Position                  |
|--------------------|-----------------|--------|---------------------------|
| voiced             | voicing bar     | P2     | crosses the stem, lower-mid |
| aspirated          | aspiration tick | P3     | upper-right, flicking off |
| voiced + aspirated | bar **and** tick| P2+P3  | both                      |
| nasal              | nasal loop      | P5     | at the very top           |

So within a varga the five members are always:

```
base   ·   +tick   ·   +bar   ·   +bar+tick   ·   +loop
 (k)        (kh)      (g)        (gh)           (ṅ)
```

This single recipe regenerates all 25 stops + 5 nasals (5 vargas × 5).

### 3.3 Other consonant families (§3.4)

- **Semivowels** (y r l v): a single sweeping arc (P4), no stop-skeleton, distinguished by place.
- **Sibilants** (ś ṣ s): place skeleton + a **friction hatch** (two tiny parallel ticks — distinct
  from the single aspiration tick).
- **Aspirant** (h): the aspiration tick "grown up" — one prominent diagonal with an upper-right flare.

---

## 4. Vowels & akṣara mechanics (§4.1–§4.2, §5)

### 4.1 Independent vowels vs mātrās

- **Independent vowels** (E000–E00A) use a neutral **vowel carrier** (short P1 stem) bearing the
  vowel mark.
- **Mātrās** (E011–E01A) are the same marks **right-attached** to a consonant. There is **no above/
  below** complexity in v1 — all mātrās attach to the right.
- The inherent **/a/** has **no sign** (a bare consonant already reads C + /a/).

### 4.2 Akṣara assembly rules (§5)

1. **Inherent vowel.** Bare consonant = consonant + /a/. `t` (E02F) reads **ta**.
2. **Other vowels.** Attach the matching mātrā to the right. `t` + i-sign (E012) = **ti**.
3. **Virāma.** Add virāma (E050) to strip the inherent /a/. `t` + virāma = bare **t**. Used word-final
   and inside clusters.
4. **Clusters are linear (no stacking).** Write each consonant with a virāma except the last, which
   takes its vowel. `tva` = `t`+virāma · `va`; `kṣi` = `k`+virāma · `ṣ`+i-sign.

Worked encodings (from §5):

| Target     | Units (left→right)        | Codepoints          |
|------------|---------------------------|---------------------|
| `ta`       | ta                        | E02F                |
| `ti`       | t + i-sign                | E02F E012           |
| `tā`       | t + ā-sign                | E02F E011           |
| `t` (final)| t + virāma                | E02F E050           |
| `tva`      | t+virāma · va             | E02F E050 · E03C    |
| `kṣi`      | k+virāma · ṣ+i-sign       | E020 E050 · E03E E012 |
| `oṁ`       | independent o · anusvāra  | E009 · E051         |

### 4.3 Marks, tones, closure

- **Signs** (E050–E054): virāma, anusvāra (ṁ), visarga (ḥ), avagraha (ʼ), candrabindu (m̐).
- **Tones** (E060–E064): rising `/`, falling `\`, chant `:`, high-level `=`, low-level `` ` ``.
  Tone marks sit **above** the akṣara (the only departure from strict left-to-right linearity) and are
  suprasegmental.
- **Saṁjñā** (E065, `^`): technical-sense prefix mark.
- **Closure** (E06F, `{C}`): saṁpūrṇa-mudrā — a downward-pointing triangle (three straight cuts)
  capped by the chant-extension curve (P4). Distinct from every letter; reads at small size.
- **Digits** (E070–E079): simplified 0–9, drawn from P1–P6.

---

## 5. The core starter set (~70 glyphs)

The **Simplified SD** inventory a font must cover first. Full per-glyph codepoints and stroke recipes
are in **`pua-map.csv`** (`tier=core`). Summary:

| Block            | Range        | Count | Notes                                    |
|------------------|--------------|-------|------------------------------------------|
| Independent vowels | E000–E00A  | 11    | carrier + vowel mark                     |
| Mātrās           | E011–E01A    | 10    | right-attached vowel signs (no `a`)      |
| Stops + nasals   | E020–E038    | 25    | 5 vargas × 5 (base/tick/bar/bar+tick/loop)|
| Semivowels       | E039–E03C    | 4     | y r l v                                  |
| Sibilants        | E03D–E03F    | 3     | ś ṣ s                                    |
| Aspirant         | E040         | 1     | h                                        |
| Signs            | E050–E054    | 5     | virāma, anusvāra, visarga, avagraha, candrabindu |
| Tones            | E060–E064    | 5     | rising/falling/chant/high/low            |
| Saṁjñā           | E065         | 1     | technical-sense prefix `^`               |
| Closure          | E06F         | 1     | `{C}` saṁpūrṇa-mudrā                      |
| Digits           | E070–E079    | 10    | 0–9                                      |
| **Core total**   |              | **76**|                                          |

The **extension tier** (`pua-map.csv` `tier=extension`, E085–E090: ḷ ḻ ṟ ṉ ṯ ḏ ʼ + combining marks)
is **excluded from the core starter set** — draw these only after the core is complete. They exist
because the transliteration library emits them for pan-Indian absorption (SD-1 §3.4).

> The codepoints here are **verified to match `lib/src/translit.ts`** — every glyph the renderer can
> emit has exactly one row in `pua-map.csv` (87 rows = 76 core + 11 extension). If you add a glyph,
> add it to the library's tables too, or the font will map codepoints the renderer never produces.

---

## 6. Drawing the masters (SVG → OpenType)

Recommended em square: **1000 UPM**. Suggested metrics: cap/skeleton height ~700, vowel-carrier
height ~500, tone marks in the zone above 700, virāma small at the baseline-right.

Per glyph:

1. **Compose from P1–P6 only** — model each primitive as a reusable SVG path/component so the
   voicing bar, aspiration tick, and nasal loop are *identical* everywhere they appear.
2. **Keep skeletons well-separated** at small sizes; test each glyph at 16 px and as a 2-bit stencil.
3. **Name the glyph `uniXXXX`** exactly as in `pua-map.csv` (production names font tools expect).
4. **Mark positioning, not ligatures:** mātrās attach right; tones anchor above; virāma at baseline.
   Use GPOS mark-to-base anchors — do **not** build conjunct ligatures (the script forbids stacking).
5. Export masters as SVG (also serving as carving stencils), then assemble with a tool of choice
   (e.g. FontForge / fontmake / glyphs) into `.ttf`/`.woff2` mapping each PUA codepoint to its glyph.

See `README.md` in this folder for the end-to-end build/assembly recipe and how the playground
(`site/playground.html`) picks up the finished font.
