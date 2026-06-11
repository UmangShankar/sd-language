# SD Unified Script — v1 specification

**Project:** SD Language (SanatanDharma Bhāṣā) · a sub-project of Vedika (askvedika.com)
**Document status:** internal canon **v0.1** — basis for the open-source beta. Authoritative script decision.
**Scope of this document:** resolve the three-script conflict and define ONE unified SD script, its encoding, and a migration policy. It does **not** change the grammar, lexicon, numeral cosmology, or hymn content.
**Honesty note:** SD is an **openly constructed, in-development** language. Nothing here is ancient, revealed, official, or "the only true" script. Where a design choice was made, the trade-off accepted is stated.
**Working script name:** **SD‑1**, provisional proper name *Saṁlipi* ("unified script"). Naming is the maintainer's call — see Open Questions.

---

## 0. Verdict (read this first)

**The three existing scripts — one sentence each:**

1. **Chakma (Varṇamālā docs, U+11100): dropped entirely, permanently.** Chakma is the living script of the Chakma people; reassigning it to SD phonemes is ethically wrong and a technical dead-end, so it is removed from the project with no migration path back.
2. **Brahmi-transliteration (hymn corpus, U+11000): deprecated and replaced.** It is not a constructed script — it is Sanskrit mechanically poured into Brahmi, carrying none of SD's own identity — so it is retired along with its closure glyph `𑁹` (U+1107F).
3. **Abstract PDF glyphs (Vyākaraṇa Grantha): treated as the design *seed*, not the standard.** They are undocumented and unencodable as-is, but they gesture at a purpose-built geometric script, so SD‑1 fulfils that intent as a documented, systematic, encodable script rather than preserving the PDF forms.

**The canonical SD script is SD‑1:** a **featural, linear (non-stacking) abugida** whose machine-canonical representation is **romanized IAST** (UTF‑8), rendered to glyphs by a **PUA-backed OpenType font**. The Git repo, database, and website store IAST; the visual script is a rendering layer. None of the three legacy scripts survives unchanged.

---

## 1. Design rationale — learn / code / carve

The handoff weights three constraints equally. SD‑1 is built to satisfy all three at once; the central architectural move is **decoupling the stored form from the visual form**, which lets each constraint be solved where it is cheapest.

### 1.1 The core architectural decision: abugida + transliteration-canonical

**Decision:** SD‑1 is an **abugida** (consonants carry an inherent vowel `/a/`; other vowels are signs), drawn **linearly with an explicit visible virāma** (no conjunct ligatures, no stacking). Its canonical machine form is **IAST transliteration**, not the glyphs themselves.

**Why abugida, not an alphabet:**
- **Carving (decisive).** SD's phonology is Indic and `/a/`-heavy. Leaving the most frequent vowel unwritten removes the single largest source of strokes. `namaḥ` carves as two consonant signs + visarga (`na · ma · ḥ`) instead of five full letters. For stone and wood, fewer marks is the dominant cost.
- **Learning.** A *featural* abugida (§3) lets ~9 learnable units generate all 25 stops via family resemblance, which is exactly the "knows one letter, predicts its relatives" requirement. The "inherent vowel" idea is one extra rule — low cost, and native to the Indic register SD lives in.
- **Coding.** The usual abugida cost (combining vowel signs, virāma) does **not** touch stored data, because the canonical form is IAST. Mātrā placement and virāma logic live in the font/transliteration library, not in the database. Stored text stays flat, searchable, and normalisation-safe.

**Trade-off accepted:** explicit linear virāma makes consonant clusters more verbose than a stacking Brahmic script — `kṣa` is three units (`k · virāma · ṣa`) rather than one ligature. We accept extra horizontal space and a few extra units in cluster-heavy words in exchange for (a) trivial encoding, (b) no hundreds-of-conjuncts learning burden, and (c) every glyph carving as an independent unit with no re-registration. A second minor cost — word-initial vowels need independent letterforms — is handled in §4.1. (If the maintainer prefers a pure alphabet instead, the only section that must be rebuilt is the glyph table; the encoding strategy is unaffected. Flagged in Open Questions.)

### 1.2 Easy to learn
- **Featural construction.** Place of articulation = a base skeleton; manner = a consistent modifier reused across every group (voicing bar, aspiration tick, nasal loop). Learn 5 skeletons + 3 modifiers + a handful of family rules and the whole stop grid is generable.
- **One sound ↔ one sign**, no silent letters, no positional shape-shifting. A letter looks the same word-initially, medially, and finally.
- **Inherent vowel `/a/`** is the default; all other vowels are right-attached signs; virāma is one explicit mark. Three rules cover the whole vowel system.
- **Tiered.** Simplified SD uses the core set only; the extension-tier phonemes (§4.6) are visibly separated so beginners never meet them.

### 1.3 Easy to code
- **Canonical = IAST (UTF‑8).** What lives in Git, seeds Sanity, and renders on the site is readable transliteration, not PUA bytes. Search, diff, grep, and copy-paste all work without the font.
- **ASCII input layer** (ITRANS-style, Appendix A) lets a learner type SD on a plain keyboard; the transliteration library normalises ASCII → IAST → SD‑1.
- **Deterministic round-trip.** IAST ⇄ SD‑1 codepoints is lossless and rule-based (§2.3).
- **Real characters, not images** for tone marks, anusvāra, visarga, and the closure glyph (§4.4–4.5).

### 1.4 Easy to carve
- Every glyph is built from a **small primitive-stroke set** (§3.1): vertical stem, horizontal bar, short tick, simple arc, small loop, foot-curl. No fine interior detail.
- **No stacking / no ligatures** — clusters are linear, so the chisel never has to lift and re-register over a previous glyph.
- Modifiers are **single strokes** (one cut = voicing bar; one gouge = nasal loop; one flick = aspiration tick).
- Skeletons are **visually well-separated** (cap-up vs base-down vs foot-curl vs left-hook vs right-bowl) so they hold up at small size and low resolution.

---

## 2. Unicode & encoding strategy

### 2.1 Strategy chosen: (a) transliteration-canonical + font layer — with a PUA codepoint table backing the font

Among the three options in the handoff, SD‑1 adopts **(a)**: the canonical, stored, machine-truth representation is **romanized IAST**, and the visual script is a font/rendering layer. We **additionally** publish a **Private Use Area (PUA) codepoint table** (Appendix B) so the font has stable internal codepoints and so anyone can build tooling — but PUA strings are **never the primary stored data**.

**Why (a) over (b) and (c):**
- **(b) map onto an under-assigned existing block** — rejected. Hijacking a real block (the Chakma mistake at the encoding level) breaks interchange and is the same category of error we are removing.
- **(c) PUA as primary storage** — rejected as the *canonical* form. PUA is unofficial and non-portable: a PUA string renders as tofu without the exact font, isn't searchable, and silently corrupts on systems lacking the font. It is fine *inside* the font and for local tooling, not as the data of record.
- **(a)** keeps the data layer portable, searchable, and human-legible while still delivering a real visual script. **Trade-offs accepted:** the script only *looks* like SD‑1 where the font is installed (everywhere else it shows correct, readable IAST — an acceptable, graceful fallback); and formal Unicode registration remains a future, multi-year option, not a v0.1 dependency.

### 2.2 Rendering pipeline

```
IAST string (canonical, in DB / Git / website body)
        │   (or ASCII/ITRANS input → normalised to IAST)
        ▼
transliteration library  (IAST → ordered sequence of SD‑1 PUA codepoints)
        ▼
SD‑1 OpenType font  (maps each PUA codepoint to a glyph; positions vowel signs,
                     virāma, tone marks, anusvāra/visarga, closure glyph)
        ▼
rendered SD‑1 text on screen / export to SVG for carving stencils
```

The **transliteration library** is the single source of shaping logic and must be the only component that knows the IAST→codepoint rules. The font is a thin glyph map plus mark-positioning. This keeps the website, the seed scripts, and any future input method consistent.

### 2.3 Canonical transliteration scheme (the typed/stored form)

- **Canonical = IAST** (UTF‑8 NFC): `a ā i ī u ū ṛ e ai o au`, consonants as in §4, anusvāra `ṁ`, visarga `ḥ`, avagraha `'`, nasalisation/candrabindu `m̐`.
- **ASCII input alias = ITRANS-style** (Appendix A) for keyboard-only typing; library normalises to IAST.
- **Round-trip rule:** IAST → SD‑1 codepoints is total and injective; SD‑1 codepoints → IAST recovers the exact IAST string. The library MUST `NFC`-normalise input first to avoid combining-mark ambiguity (e.g., precomposed `ā` vs `a` + combining macron).
- **Reserved tokens** in canonical text: the closure glyph is written `{C}` (§4.5); tone marks are written as trailing IAST-safe markers (§4.4). These are typeable, searchable, and round-trip.

---

## 3. Letterform system

SD‑1 is **featural**: a glyph's shape states its phonology. This is the engine behind "easy to learn."

### 3.1 Primitive strokes (the carving vocabulary)

| # | Primitive | ASCII hint | Notes |
|---|-----------|-----------|-------|
| P1 | vertical stem | `\|` | the spine of most consonants |
| P2 | horizontal bar | `—` | caps, bases, the voicing bar |
| P3 | short tick (diagonal) | `╱` | aspiration; single short cut |
| P4 | simple arc (open curve) | `(` `)` | palatal hook, approximants |
| P5 | small loop | `o` | nasal mark; anusvāra |
| P6 | foot-curl (small basal hook) | `ↄ` | retroflex signature |

Every SD‑1 glyph is a composition of P1–P6. No glyph requires a stroke outside this set. ASCII can only *approximate* the forms; the **authoritative definition is the stroke description**, from which a font is built.

### 3.2 Place skeletons (the 5 vargas)

The base form of each varga is its **unvoiced, unaspirated, inherent-`/a/`** member. Each skeleton is iconically motivated (an aid to memory, not a metaphysical claim):

| Varga | Base member | Skeleton | Construction | Iconic logic |
|-------|-------------|----------|--------------|--------------|
| Guttural | k | `⊤` | P1 stem + P2 cap at top | sound at the throat → mark at the **top** |
| Palatal | c | `⌐\|` | P1 stem + P4 small hook, upper-left | palate → a **soft hook**, mid-high |
| Retroflex | ṭ | `\|ↄ` | P1 stem + P6 foot-curl at base | tongue **curls back** → the foot curls |
| Dental | t | `⊥` | P1 stem + P2 base at bottom | teeth at the front → flat **base** |
| Labial | p | `\|◗` | P1 stem + P4 rounded bowl, right side | lips **round** → a closed bowl |

### 3.3 Manner modifiers (consistent across every varga)

| Manner | Modifier | Stroke | Position |
|--------|----------|--------|----------|
| voiced | **voicing bar** | P2 short bar | crosses the stem at lower-mid |
| aspirated | **aspiration tick** | P3 short diagonal | upper-right, flicking off |
| voiced + aspirated | bar **and** tick | P2 + P3 | both, as above |
| nasal | **nasal loop** | P5 small loop | at the very top, above the skeleton |

So within a varga the five members are: **base** (k) · **+tick** (kh) · **+bar** (g) · **+bar+tick** (gh) · **+loop** (ṅ). The same recipe regenerates every row. The nasal loop standing alone is the **anusvāra** — tying nasality together across the whole system.

### 3.4 Non-varga families
- **Semivowels (y r l v)** — an "open" family: a single sweeping arc (P4), no stop-skeleton, tagged by place. They echo their vowel cousins (y↔i, r↔ṛ, v↔u), reinforcing the system.
- **Sibilants (ś ṣ s)** — a "friction" family: the relevant **place skeleton** + a small **friction hatch** (two tiny parallel ticks, distinct from the single aspiration tick). So ś = palatal-hook + hatch, ṣ = foot-curl + hatch, s = dental-base + hatch.
- **Aspirant (h)** — the lone glottal fricative, drawn as the **aspiration tick "grown up"**: a single prominent diagonal stem with an upper-right flare. (Mnemonic link: the small tick = aspiration feature; the full glyph = standalone /h/.)

---

## 4. Full glyph table

Codepoints are PUA (Appendix B). **Construction** is authoritative; **ASCII** is the input alias (Appendix A); **IAST** is canonical storage.

### 4.1 Independent vowels (word-initial / standalone)

Independent vowels = a neutral **vowel carrier** (a short stem, P1) bearing the same sign used as a mātrā, so the standalone form and the attached form visibly share a core.

| IPA | IAST | ASCII | Construction (carrier + sign) | Codepoint |
|-----|------|-------|-------------------------------|-----------|
| ə | a | a | carrier alone | U+E000 |
| aː | ā | aa / A | carrier + length stroke | U+E001 |
| i | i | i | carrier + i-mark (small up-arc) | U+E002 |
| iː | ī | ii / I | carrier + i-mark + length stroke | U+E003 |
| u | u | u | carrier + u-mark (small down-bowl) | U+E004 |
| uː | ū | uu / U | carrier + u-mark + length stroke | U+E005 |
| ɻ̩ | ṛ | R / .r | carrier + retroflex curl (P6) | U+E006 |
| eː | e | e | carrier + e-mark (right bar) | U+E007 |
| ai | ai | ai | carrier + e-mark + diphthong tick | U+E008 |
| oː | o | o | carrier + o-mark (right bar + bowl) | U+E009 |
| au | au | au | carrier + o-mark + diphthong tick | U+E00A |

### 4.2 Vowel signs (mātrās — attached to a consonant, right side)

Inherent `/a/` has **no sign**. Length is a consistent added stroke (short → long); diphthong is a consistent added tick (e → ai, o → au).

| Vowel | IAST | ASCII | Sign | Codepoint |
|-------|------|-------|------|-----------|
| ā | ā | aa / A | length stroke, right | U+E011 |
| i | i | i | up-arc, right | U+E012 |
| ī | ī | ii / I | up-arc + length | U+E013 |
| u | u | u | down-bowl, right | U+E014 |
| ū | ū | uu / U | down-bowl + length | U+E015 |
| ṛ | ṛ | R / .r | retroflex curl, right | U+E016 |
| e | e | e | right bar | U+E017 |
| ai | ai | ai | right bar + diphthong tick | U+E018 |
| o | o | o | right bar + bowl | U+E019 |
| au | au | au | right bar + bowl + diphthong tick | U+E01A |

### 4.3 Consonants

**Gutturals** (skeleton: stem + top cap)

| IPA | IAST | ASCII | Construction | Codepoint |
|-----|------|-------|--------------|-----------|
| k | k | k | guttural base | U+E020 |
| kʰ | kh | kh | base + aspiration tick | U+E021 |
| g | g | g | base + voicing bar | U+E022 |
| gʰ | gh | gh | base + bar + tick | U+E023 |
| ŋ | ṅ | ~N / G | base + nasal loop (top) | U+E024 |

**Palatals** (skeleton: stem + upper-left hook)

| IPA | IAST | ASCII | Construction | Codepoint |
|-----|------|-------|--------------|-----------|
| c | c | c | palatal base | U+E025 |
| cʰ | ch | Ch | base + tick | U+E026 |
| ɟ | j | j | base + bar | U+E027 |
| ɟʰ | jh | jh | base + bar + tick | U+E028 |
| ɲ | ñ | ~n / J | base + nasal loop | U+E029 |

**Retroflex** (skeleton: stem + foot-curl)

| IPA | IAST | ASCII | Construction | Codepoint |
|-----|------|-------|--------------|-----------|
| ʈ | ṭ | T | retroflex base | U+E02A |
| ʈʰ | ṭh | Th | base + tick | U+E02B |
| ɖ | ḍ | D | base + bar | U+E02C |
| ɖʰ | ḍh | Dh | base + bar + tick | U+E02D |
| ɳ | ṇ | N | base + nasal loop | U+E02E |

**Dentals** (skeleton: stem + bottom base)

| IPA | IAST | ASCII | Construction | Codepoint |
|-----|------|-------|--------------|-----------|
| t̪ | t | t | dental base | U+E02F |
| t̪ʰ | th | th | base + tick | U+E030 |
| d̪ | d | d | base + bar | U+E031 |
| d̪ʰ | dh | dh | base + bar + tick | U+E032 |
| n̪ | n | n | base + nasal loop | U+E033 |

**Labials** (skeleton: stem + right bowl)

| IPA | IAST | ASCII | Construction | Codepoint |
|-----|------|-------|--------------|-----------|
| p | p | p | labial base | U+E034 |
| pʰ | ph | ph | base + tick | U+E035 |
| b | b | b | base + bar | U+E036 |
| bʰ | bh | bh | base + bar + tick | U+E037 |
| m | m | m | base + nasal loop | U+E038 |

**Semivowels** (open-arc family)

| IPA | IAST | ASCII | Construction | Codepoint |
|-----|------|-------|--------------|-----------|
| j | y | y | left-opening arc (echoes i) | U+E039 |
| r | r | r | flowing stroke + small curl (echoes ṛ) | U+E03A |
| l | l | l | stem + basal right-branch (lateral) | U+E03B |
| ʋ | v | v | up-opening bowl (echoes u / labial) | U+E03C |

**Sibilants** (friction family: place skeleton + friction hatch)

| IPA | IAST | ASCII | Construction | Codepoint |
|-----|------|-------|--------------|-----------|
| ɕ | ś | sh / z | palatal hook + hatch | U+E03D |
| ʂ | ṣ | Sh / S | foot-curl + hatch | U+E03E |
| s | s | s | dental base + hatch | U+E03F |

**Aspirant**

| IPA | IAST | ASCII | Construction | Codepoint |
|-----|------|-------|--------------|-----------|
| ɦ | h | h | prominent diagonal with upper-right flare | U+E040 |

### 4.4 Special signs & tone marks

| Function | IAST | ASCII | Construction | Codepoint |
|----------|------|-------|--------------|-----------|
| virāma (suppresses inherent /a/) | (none; implicit in clusters/finals) | `_` if explicit needed | small basal right-stroke after the consonant | U+E050 |
| anusvāra (ṁ) | ṁ | M / .m | nasal loop, standalone (the §3.3 loop) | U+E051 |
| visarga (ḥ) | ḥ | H / .h | two small dots, vertically paired (echo-h) | U+E052 |
| avagraha (elision/glottal echo) | ' | ' / .a | a single tall vertical with a small notch | U+E053 |
| nasalisation / candrabindu | m̐ | ~ / .c | the nasal loop with a subscript dot (vowel nasalised, distinct from anusvāra) | U+E054 |
| tone — rising (question/seeking) | a̍ (`/`) | `/` | short upward arc above the akṣara | U+E060 |
| tone — falling (finality/closure) | a̱ (`\`) | `\` | short downward arc above the akṣara | U+E061 |
| chant extension (sustain) | aⁿ (`:`) | `:` | low curve trailing the akṣara | U+E062 |

**Tone-mark placement:** tones are suprasegmental, so they sit **above** the akṣara (the only departure from strict linearity) and attach to the *whole* syllable. In canonical transliteration they are written as trailing ASCII-safe markers on the syllable's vowel (`/` rising, `\` falling, `:` chant). They round-trip to U+E060–E062. Anusvāra, visarga, and nasalisation are baseline signs and follow their consonant/vowel on the line.

### 4.5 Closure glyph (Grantha register)

The Brahmi joiner `𑁹` (U+1107F) is **retired**. SD‑1 defines its own closure seal, the **saṁpūrṇa-mudrā** ("seal of completion"):

- **Form:** a downward-pointing triangle (descent into stillness) capped by the chant-extension curve (P4) — three straight cuts + one arc. Carvable, distinct from every letter, reads at small size.
- **Codepoint:** U+E06F.
- **Canonical transliteration token:** `{C}` — typeable on any keyboard, searchable, unambiguous, round-trips to U+E06F. Chosen over reusing `॥` (Devanagari double-daṇḍa) precisely so SD's closure is visibly *its own*, not borrowed.
- **Usage:** closes each hymn / Grantha-register unit, replacing `𑁹` everywhere in the corpus.

### 4.6 Numerals (gesture — full numeral spec is out of scope)

- **Simplified carvable digits 0–9:** U+E070–U+E079, drawn from the same P1–P6 primitives so the digit row matches the letter forms. These are the public/inscription digits.
- **Core symbolic / quantum-meta layer** (0 śūnya … 9 nava; Ψ ⊙ Θ …): treated as a **separate notation** layered over text (like mathematical symbols beside prose), **not** part of the core orthography. Space is reserved at U+E0A0+; a dedicated numeral spec should define it later. This document only guarantees that the simplified digits encode and carve consistently with the script.

### 4.7 Extension tier (NOT in Simplified SD)

Under-represented-language phonemes are handled by **diacritic on the nearest core consonant/vowel**, never by new base letters, and are **excluded from the Simplified tier**:

| Phoneme | Handling | Codepoint |
|---------|----------|-----------|
| soft central a /ɐ/ | a + extension dot below | U+E080 |
| short front i /ɪ/ | i-sign + extension dot | U+E081 |
| softened dental th | th + extension dot | U+E082 |
| nasalised g /g̃/ | g + nasalisation mark | U+E083 |
| soft k | k + extension dot | U+E084 |
| retroflex lateral ḷ /ɭ/ | l + foot-curl | U+E085 |
| aspirated retroflex nasal | ṇ + aspiration tick | U+E086 |

**Policy:** the Simplified tier omits all of these; Core/Sandarbh registers may use them via the diacritics above. A learner never encounters the extension tier first.

---

## 5. Vowel-sign & virāma mechanics

**Rule 1 — inherent vowel.** A bare consonant = consonant + `/a/`. `t` (U+E02F) reads **ta**.

**Rule 2 — other vowels.** Attach the matching mātrā (§4.2) to the right. `t` + i-sign (E012) = **ti**.

**Rule 3 — virāma (no vowel).** Add the virāma (E050) to strip the inherent `/a/`. `t` + virāma = bare **t**. Used for word-final consonants and inside clusters.

**Rule 4 — clusters are linear (no stacking).** Write each consonant with a virāma except the last, which takes its vowel. `tva` = `t`+virāma · `v`(+inherent a) = **t‑va**. `kṣi` = `k`+virāma · `ṣ`+i-sign = **k‑ṣi**.

Worked mini-examples:

| Target | Units (left→right) | Codepoints |
|--------|--------------------|------------|
| `ta` | ta | E02F |
| `ti` | t + i-sign | E02F E012 |
| `tā` | t + ā-sign | E02F E011 |
| `t` (final) | t + virāma | E02F E050 |
| `tva` | t+virāma · va | E02F E050 · E03C |
| `kṣi` | k+virāma · ṣ+i-sign | E020 E050 · E03E E012 |
| `oṁ` | independent o · anusvāra | E009 · E051 |

---

## 6. Tone, anusvāra, visarga, nasalisation, closure

- **Anusvāra `ṁ`** — the nasal loop (E051) on the baseline after its vowel. Canonical text: `ṁ` (ASCII `M`).
- **Visarga `ḥ`** — paired dots (E052) after its vowel. Canonical: `ḥ` (ASCII `H`).
- **Nasalisation / candrabindu `m̐`** — distinct from anusvāra; nasal loop + subscript dot (E054) marking a nasalised vowel. Canonical: `m̐` (ASCII `~`).
- **Avagraha `'`** — elision/glottal echo (E053). Canonical: `'`.
- **Tone marks** — above the akṣara: rising `/` (E060), falling `\` (E061), chant-extension `:` (E062). Suprasegmental, attach to the whole syllable, written as trailing markers on the syllable's vowel in canonical text.
- **Closure `{C}`** — the saṁpūrṇa-mudrā (E06F) closing each Grantha unit; replaces `𑁹`.

Ordering within an akṣara (canonical and codepoint): **consonant(s)+virāma → final consonant → vowel sign → nasal/visarga/nasalisation → tone**. The font positions vowel signs and baseline marks inline and tone marks above.

---

## 7. Fully worked example

Three renderings are shown for each item: **(a)** canonical transliteration, **(b)** described/sketched SD‑1 rendering (ASCII approximation + stroke account), **(c)** stored/PUA codepoint sequence.

> **Honesty flag on the corpus:** the hymn corpus currently sets the "SD Script" field to a *transliteration of the Sanskrit* (Hymn 59's SD field = `tat tvam asi`, identical to the Sanskrit). That is the §0(2) flaw. SD‑1 makes the **rendering** practical and correct, but it does not by itself convert the *content* into SD-language lexicon/grammar — that re-authoring is the downstream task noted in §8. The Mahāvākya below is therefore shown as a **script transliteration**; a genuinely SD-native phrase follows it to exercise the script on real SD words.

### 7.1 Mahāvākya — Hymn 59, *tat tvam asi* (Chāndogya Upaniṣad 6.8.7), with closure

**(a) Canonical transliteration:** `tat tvam asi {C}`

**(b) SD‑1 rendering (akṣara by akṣara):**

| Word | Akṣaras | Stroke account |
|------|---------|----------------|
| tat | **ta** · **t** | dental base (inherent a) · dental base + virāma |
| tvam | **t** · **va** · **m** | dental base + virāma · semivowel-v (inherent a) · labial+nasal-loop + virāma |
| asi | **a** · **si** | independent-a carrier · dental-sibilant (base+hatch) + i-sign |
| — | **{C}** | saṁpūrṇa-mudrā: down-triangle + chant curve |

ASCII approximation (illustrative only — authoritative forms are the stroke accounts):
```
⊥   ⊥_      ⊥_ ∪  |◦_      a   s̲ʿ        ▽
ta  t·      t·  va m·       a   si        {C}
└tat──┘    └──tvam──┘     └─asi─┘      closure
```

**(c) Stored codepoints (PUA, render layer):**
```
E02F · E02F E050 · ␣ · E02F E050 · E03C · E038 E050 · ␣ · E000 · E03F E012 · E06F
 ta      t   vir         t   vir     va      m   vir         a       s   i       {C}
```
Canonical IAST stored in DB/Git: `tat tvam asi {C}`  (the line of record; the codepoints above are produced by the transliteration library for display only).

### 7.2 SD-native exercises (real SD lexicon)

**`oṁ`** (mantric refrain) — independent o + anusvāra.
- (a) `oṁ`
- (b) independent-o carrier (carrier + right-bar + bowl) · nasal loop above-after
- (c) `E009 · E051`

**`śanuma`** (cosmic person / puruṣa) — exercises sibilant, nasal, vowel-sign u, inherent a.
- (a) `śanuma`
- (b) **śa** (palatal hook + hatch, inherent a) · **nu** (dental + nasal loop + u-sign) · **ma** (labial + nasal loop, inherent a)
- (c) `E03D · E033 E014 · E038`

These three together exercise every core mechanism: independent vowels and mātrās, the inherent `/a/`, a cluster with virāma, all consonant families (stop, nasal, sibilant, semivowel), anusvāra, and the closure glyph.

---

## 8. Migration plan

**New closure glyph:** `𑁹` (U+1107F) → **saṁpūrṇa-mudrā** (U+E06F, token `{C}`) everywhere.

### 8.1 Hymn corpus (Sanātana Grantha Vol 2)
- The seven-field structure is unchanged. The **"SD Script"** field is regenerated by running the **IAST → SD‑1** transliteration library over the existing **Transliteration (IAST)** field; the closure field `𑁹` → `{C}`.
- Present hymns 1–25, 43–60 convert immediately. Missing 11–15, 26–42 are authored later — **the script does not block this**.
- **Separate, downstream task (not this doc):** the "SD Transliteration" / SD-language *content* should later be re-authored using the SD lexicon and grammar so the SD fields stop being mere transliterations of the Sanskrit. SD‑1 is built to render that future content directly.

### 8.2 Varṇamālā documents
- The Chakma glyph mappings are **deleted**. **This document's §4 glyph table becomes the new Varṇamālā.** Regenerate `SD_Varnmala_Document` and `SD_Varnmala_Expanded` from §4 + Appendix B.

### 8.3 Vyākaraṇa Grantha (PDF)
- The abstract glyphs are **deprecated**. The grammar *content* is unaffected — only the script presentation changes. Re-typeset examples in SD‑1 once the font exists.

### 8.4 Transliteration-library contract (for the engineer)
```
input : UTF-8 string (IAST canonical, or ASCII/ITRANS → normalise to IAST first; apply NFC)
output: ordered array of SD‑1 PUA codepoints (per §4–§6 ordering rules)
guarantees:
  - total + injective on valid IAST  (round-trips back to identical IAST)
  - cluster handling: insert virāma (E050) after every non-final consonant in a cluster
  - inherent /a/: emit no vowel sign for /a/
  - tone/anusvāra/visarga/nasalisation/closure mapped to E051–E062, E06F
errors: reject input containing characters outside the IAST + reserved-token set
```

### 8.5 Migration checklist
1. Build SD‑1 font from §4 stroke descriptions + Appendix B codepoints.
2. Implement the transliteration library to the §8.4 contract; unit-test round-trip on §7 examples.
3. Batch-convert hymn "SD Script" fields from the IAST field; swap `𑁹` → `{C}`.
4. Regenerate the Varṇamālā docs from §4.
5. Re-typeset Vyākaraṇa examples in SD‑1.
6. Ship font + library + this spec to the public GitHub repo and the website's SD section.
7. **Do not** modify any live Vedika repo or open a PR from this chat — this document is the spec only; implementation is a separate, approved step.

---

## 9. Open questions remaining

1. **Script name.** Provisional *Saṁlipi* — maintainer's call. (Avoid any "ancient/revealed" framing.)
2. **Abugida vs alphabet.** Recommendation is the linear abugida (§1.1) with the stated cluster trade-off. If a pure alphabet is preferred, only the §4 glyph table is rebuilt; §2 encoding is unchanged.
3. **Mātrā placement.** v1 uses **pure right-attached** signs for carving/encoding simplicity. Some above/below placement would be more compact but adds shaping complexity — revisit after the first font prototype and legibility tests.
4. **Tone-mark placement.** v1 places tones **above** the akṣara. Confirm after low-resolution carving tests; a trailing-baseline alternative exists.
5. **Canonical form.** v1 = **IAST canonical + ASCII/ITRANS input alias.** Confirm against the engineering stack's DB collation and search before locking; if a pure-ASCII canonical (e.g., SLP1) is wanted for tooling reasons, the rendering pipeline is unaffected.
6. **Extension tier.** v1 handles under-represented phonemes via diacritics and excludes them from Simplified SD — confirm that exclusion policy.
7. **Core numeral / quantum-meta layer.** Needs its own spec; space reserved at U+E0A0+ but undefined here.
8. **Formal Unicode registration.** PUA is correct for v0.1/beta. Whether to pursue a formal proposal later (multi-year) is a separate strategic decision; the canonical-IAST design means the project is not blocked either way.

---

## Appendix A — ASCII input convention (ITRANS-style)

For keyboard-only typing; the library normalises to IAST. Where two forms are given, either is accepted.

```
Vowels:   a  aa/A  i  ii/I  u  uu/U  R/.r  e  ai  o  au
Gutturals: k  kh  g  gh  ~N|G
Palatals:  c  Ch  j  jh  ~n|J
Retroflex: T  Th  D  Dh  N
Dentals:   t  th  d  dh  n
Labials:   p  ph  b  bh  m
Semivowels: y  r  l  v
Sibilants: sh|z (ś)   Sh|S (ṣ)   s
Aspirant:  h
Signs:     M (ṁ)  H (ḥ)  ' (avagraha)  ~ (nasalisation)  _ (explicit virāma)
Tones:     / (rising)  \ (falling)  : (chant)
Closure:   {C}
```

## Appendix B — PUA allocation map (BMP, U+E000–U+E8FF)

```
E000–E00A  independent vowels (11)
E011–E01A  vowel signs / mātrās (10)
E020–E024  gutturals      E025–E029  palatals
E02A–E02E  retroflex      E02F–E033  dentals
E034–E038  labials        E039–E03C  semivowels
E03D–E03F  sibilants      E040       aspirant h
E050–E054  virāma, anusvāra, visarga, avagraha, nasalisation
E060–E062  tone marks (rising / falling / chant)
E06F       closure glyph (saṁpūrṇa-mudrā)
E070–E079  simplified digits 0–9
E080–E086  extension-tier phonemes (NOT in Simplified SD)
E0A0+      reserved: Core symbolic / quantum-meta numerals (separate spec)
```

PUA codepoints back the font and local tooling **only**. The canonical, stored, interchanged representation is **IAST** (§2).
