# SD Language Design — v1 specification

**Project:** SD Language (SanatanDharma Bhāṣā) · a sub-project of Vedika (askvedika.com)
**Document status:** internal canon **v0.1‑r2** — the authoritative *language* design, companion to `SD-unified-script-v1.md` (SD‑1, the authoritative *script* decision). Basis for the open-source beta.
**Revision r1 (maintainer-ratified):** personal endings (2sg revised -vi → **-si**, yielding the Vedic -mi/-si/-ti set), case forms, pronouns, plural -gaṇ, the **no-sandhi law**, the **spoken hiatus-glide rule** (§2.4), and removal of the redundant -viya modal. The remaining open items are §15.
**Errata r2 (found by the reference implementation):** the low-level tone's ASCII alias `,` collided with the punctuation comma in running text; revised to backtick **`` ` ``**. Codepoint (E064) and glyph unchanged.
**Scope:** the complete language — phonology, script extension, morphology, syntax, lexicon and word-formation, the scientific/Core register, numerals and notation, registers, the absorption protocol, and governance. It does **not** modify SD‑1's architecture, and it does not re-author the hymn corpus (that is a downstream task this design unblocks, §13/§14).
**Honesty note:** SD is an **openly constructed, in-development** language (v0.1, open-source beta upcoming). Nothing here is ancient, revealed, official, or "the only true" language, and SD is not a replacement for Sanskrit or any living language. Where a design choice was made, the trade-off accepted is stated at that fork.

---

## 0. Verdict (read this first)

**SD is one language with a small, regular engine and tiered surface area.** The design in one paragraph:

A **pan-Indian phoneme inventory in three tiers** (Simplified core → pan-Indian extension → IPA-anchored absorption substrate), written in the **SD‑1 featural abugida extended by its own construction grammar** (no architectural change, eleven new codepoints). On top of that sits an **agglutinative, fully regular morphology** — one verb template, one noun template, **zero sandhi, zero irregular forms** — expressible as a small finite-state transducer; an **SOV syntax** with particle-marked clause types, given here as an EBNF sketch with a deterministic tokenization spec; a **transparent word-formation system** (root + suffix derivation, hyphen-joined head-final compounds) that makes every word parseable back to its parts; a **Core scientific register** with technical affixes, a marked technical sense, an unambiguous logical vocabulary, and clean inline embedding of standard mathematical notation and SI units; and a **governed absorption protocol** — the rule-book by which any language's sounds, prosody, and words can be *represented* in SD through a versioned, human-reviewed, respectful process. Four worked examples (§12) prove the tenets end-to-end, including a Tamil and a Meitei absorption run.

**The three load-bearing decisions** (each defended at its section):

1. **No sandhi, anywhere** (§4.4). Morpheme and word boundaries are never altered by euphonic combination. This single rule buys near-zero irregularity (T3), a trivially regular FST (T4), and deterministic tokenization — at the cost of occasionally less mellifluous junctures than Sanskrit would produce. Chantability is recovered at the prosodic layer (tones, refrains, rāga mapping), not the morphological one.
2. **Hyphen-canonical compounds** (§7.3). Compounds are written with `-` in the canonical IAST layer. Every compound is machine-segmentable and human-guessable for free (T3 + T4 + T5). Cost: canonical text looks slightly more "technical" than flowing Sanskrit prose; the Grantha display layer may render the hyphen as a thin space.
3. **Absorption = representation, never ownership** (§10). The protocol can *represent* any language's phonology and borrow vocabulary with attribution; it never claims, renames, or absorbs a living language's identity, script, or sacred material. The Chakma lesson from the script decision is generalized into standing policy.

---

## 1. The six tenets, and how this design meets each

The tenets are equally weighted hard constraints. Each is met by a named mechanism; each pairwise tension is resolved explicitly, not waved away.

| Tenet | Mechanism in this design | Where |
|---|---|---|
| **T1 — Incorporate all Indian languages** | Tiered phonology: Sanskrit-grouped core + a systematic pan-Indian extension (alveolar series, retroflex approximant ḻ, short ĕ/ŏ, central ï, glottal stop, phonation marks, two added level tones), all built by SD‑1's featural rules | §2, §3 |
| **T2 — Open; able to absorb any language** | IPA anchoring of every phoneme + the absorption protocol (a documented procedure with a governed extension path) + open governance with versioning and a human review gate | §2.4, §10, §11 |
| **T3 — Easy to learn** | Featural script (SD‑1); zero sandhi; one verb template, one noun template, no irregular forms, no grammatical gender; transparent compounds; fixed penultimate stress; Simplified tier deliberately small | §4–§7 |
| **T4 — Easy to code** | IAST canonical (from SD‑1); morphology as a finite-state model (§4.6); syntax as EBNF (§5.2); deterministic tokenization (§5.4); hyphen-canonical compounds; ASCII input aliases for everything | §4–§6 |
| **T5 — Easy to write science in** | Core register with productive technical affixes (-vat, -aṅka, -aṇu, -tva), the saṁjñā technical-sense marker `^`, a closed logical vocabulary, positional decimal numerals, verbatim SI units, and `[[ … ]]` notation islands | §8, §9 |
| **T6 — Easy to carve on stone** | Carried from SD‑1: Simplified = the inscription register; all new glyphs built from the same P1–P6 primitives; carving conventions restated and extended | §3.5, §9.4 |

### 1.1 Tensions resolved (the honest version)

**T1 vs T3 (maximal inventory vs learnable).** Resolved by **tiering**. The Simplified tier is exactly the Sanskrit-grouped core a beginner meets (11 vowels + 33 consonants + 5 signs + 3 tone marks). Everything pan-Indian beyond that lives in the Extension tier (§2.2): real, first-class, fully specified — but a learner never meets it until they need it. Trade-off accepted: a Tamil speaker writing *tamiḻ* needs one Extension-tier letter from day one. That is the cost of keeping the carving/learning core small; the Extension tier is one featural rule away, not a second alphabet.

**T2 vs T3/T4 (absorb anything vs stable and codeable).** Resolved by making absorption **governed and versioned**, not open-ended. The core inventory is frozen per spec version; extensions enter only through the SD-LEP process (§11.2) with assigned codepoints in a dedicated block (E100+), so parsers and fonts upgrade by version bump, never by surprise. Trade-off accepted: absorbing a new phonology is deliberately slower than ad-hoc invention. That is the point.

**T5 vs T3/T6 (technical density vs simple and carvable).** Resolved by **register separation**. Technical affixes, the saṁjñā marker, logical vocabulary, and notation islands are Core-register machinery; none of it is required (or permitted) in Simplified inscription text. A stone inscription and a physics paper share the same grammar and the same morphology — they differ only in which lexicon strata and notation they may use (§9.5).

**Vedic rootedness vs pan-Indian first-class status (T1 + §guardrail).** Resolved structurally, not rhetorically: (a) the Extension tier's Dravidian, Tibeto-Burman, and Munda phonemes are specified with the *same* featural rigor and codepoint dignity as the Sanskrit core, not as diacritic afterthoughts — they get dedicated construction rules and worked examples; (b) the **case system deliberately sources its forms across families** (§4.5): accusative *-ai* and instrumental *-āl* from Tamil, locative *-il* and genitive *-in* from the project's own Tamil-grammar heritage, ablative *-tas* from Sanskrit, ergative *-ne* from Hindi. The grammar's skeleton is visibly pan-Indian, not Sanskrit-with-guests; (c) the absorption protocol's respectful-representation policy (§10.5, §11.4) is binding. What remains true and is stated openly: SD's design intent, register names, and corpus are rooted in the Sanatan/Vedic tradition. Rootedness is a heritage claim about *this project*, never a superiority claim about any language family.

---

## 2. Phonology (T1 + T2): the tiered, IPA-mapped inventory

Three tiers. Every phoneme maps to IPA. Each addition is justified and costed.

### 2.1 Tier 0 — Simplified core (the everyday / inscription set)

Unchanged from SD‑1 §4 / the Varṇamālā (sounds only; the rejected Chakma glyph assignments remain deleted). This is the **complete** inventory of the Simplified register.

**Vowels (11):** a /ə/, ā /aː/, i /i/, ī /iː/, u /u/, ū /uː/, ṛ /ɻ̩/, e /eː/, ai /ai/, o /oː/, au /au/.
**Stops (25):** the five vargas — k kh g gh ṅ · c ch j jh ñ · ṭ ṭh ḍ ḍh ṇ · t th d dh n · p ph b bh m — IPA per SD‑1 §4.3.
**Semivowels (4):** y /j/, r /r/, l /l/, v /ʋ/. **Sibilants (3):** ś /ɕ/, ṣ /ʂ/, s /s/. **Aspirant (1):** h /ɦ/.
**Signs (5):** anusvāra ṁ, visarga ḥ, avagraha ', candrabindu m̐, virāma.
**Tone marks (3):** rising `/`, falling `\`, chant-extension `:` (suprasegmental; sparing use in Simplified — typically only the falling mark for closure and rising for questions).

Cost statement: this tier is intentionally Sanskrit-shaped. That is the heritage anchor — and the reason Tier 1 exists and is first-class.

### 2.2 Tier 1 — Pan-Indian extension (first-class, by family)

Everything below is a **full citizen of Core, Sandarbh, and Grantha registers**, excluded only from Simplified (the carving/beginner tier). Each addition follows SD‑1's featural construction grammar (§3) and receives a codepoint (§3.4). IAST-extended transliteration follows standard Indological practice wherever one exists.

**(a) Dravidian requirements** (Tamil, Malayalam, Telugu, Kannada, Tulu …)

| Phoneme | IPA | IAST | ASCII | Motivation |
|---|---|---|---|---|
| retroflex approximant | /ɻ/ | ḻ | zh | Tamil/Malayalam ḻ (தமிழ் *tamiḻ*); related to the ṛ/r family |
| alveolar trill/tap | /r̠/ | ṟ | rr | Tamil ṟ, Malayalam ṟ — a third rhotic, contrastive |
| alveolar nasal | /n̠/ | ṉ | nn2 | Tamil ṉ, contrastive with dental n and retroflex ṇ |
| alveolar stop (vl.) | /t̠/ | ṯ | tt2 | Malayalam alveolar stop (ṯṯ geminates); completes the series |
| alveolar stop (vd.) | /d̠/ | ḏ | dd2 | generated by the featural rule for free; attested marginally |
| retroflex lateral | /ɭ/ | ḷ | L | already provisioned at E085 (SD‑1 extension tier); promoted to this tier |
| short e | /e/ | ĕ | e2 | Dravidian contrasts short/long e — Sanskrit e is long-only |
| short o | /o/ | ŏ | o2 | same, for o |

**(b) Tibeto-Burman requirements** (Meitei/Manipuri, Bodo, Mizo, Naga languages …)

| Item | IPA | IAST | ASCII | Motivation |
|---|---|---|---|---|
| central/back-unrounded high vowel | /ɨ ~ ɯ/ | ï | i2 | Meitei ɯ, common central vowels in TB |
| high level tone | ˥ | trailing `=` | `=` | register-tone languages need level tones, not only contours |
| low level tone | ˩ | trailing `` ` `` | `` ` `` | same (alias revised r2: `,` collided with punctuation) |
| (existing) rising / falling / chant | ˧˥ / ˥˩ / ː | `/` `\` `:` | — | already in SD‑1; reused as contour tones |

Tone policy: SD's five tone marks (high, low, rising, falling, chant) form the **tonal substrate**. A tonal language's system is *mapped* onto these five in its absorption dossier (§10.2 step T); a language needing a sixth distinction triggers a governed extension. Trade-off: five marks cannot natively distinguish every tone system on earth (some Naga languages have more contours); the dossier documents any merger explicitly rather than pretending coverage.

**(c) Munda / Austroasiatic requirements** (Santali, Mundari, Ho, Khasi …)

| Item | IPA | IAST | ASCII | Motivation |
|---|---|---|---|---|
| glottal stop (full consonant) | /ʔ/ | ʼ (modifier letter) | q | Munda checked finals; Khasi finals; many TB languages |
| checked/glottalized final | C + /ʔ/ | Cʼ | Cq | written as a final cluster C-virāma + ʼ — no new sign needed |
| creaky phonation mark | ◌̰ | a̰ (under-tilde) | .~ | distinctive phonation in Munda and some TB languages |
| breathy phonation mark | ◌̤ | a̤ (under-diaeresis) | .: | murmured vowels (also serves, e.g., Gujarati murmur in absorption) |

Note the economy: the **checked final is not a new mechanism** — it is the ordinary cluster machinery (§3 of SD‑1) applied to the new glottal-stop consonant. Santali *dakʼ* "water" is simply d-a-k(virāma)-ʼ.

**(d) Indo-Aryan residue.** Kashmiri's centralized vowels map to ï/ə̆ via the absorption protocol; Punjabi's tonal contrasts map to the tone marks (its historical murmured stops may be written either with the inherited voiced-aspirate letters or tonally — the Sandarbh dossier for Punjabi chooses per word-class). The SD‑1 extension-tier diacritics (E080–E086: soft central a, short front i, softened th, g̃, soft k, ḷ, aspirated ṇ) remain valid and are folded into this tier.

Cost statement for the whole tier: **+13 letters/marks** beyond the core (8 Dravidian items, 1 vowel + 2 tones TB, 1 consonant + 2 phonation marks Munda). Each one costs carvability nothing (excluded from Simplified) and learnability little (each is one featural rule from a known form). The alternative — pretending the core covers India — would violate T1 outright.

### 2.3 Tier 2 — Universal substrate (IPA anchoring + the extension hook)

1. **Every SD phoneme has exactly one IPA value** (tables above + SD‑1 §4). The lexicon database stores it.
2. **Mapping-in rule for a foreign phoneme:** (a) exact IPA match → use the SD phoneme; (b) no exact match → map to the **nearest SD phoneme by articulatory features** (place > manner > voicing > phonation > length), and *document the merger* in the absorption dossier; (c) if the merger would collapse a contrast that is **phonemic and functionally loaded** in the source language, file an SD-LEP extension proposal (§11.2) instead of merging.
3. **Governed extensions** receive: a featural glyph built by §3's construction grammar, an IAST-extended transliteration (preferring established Indological/Africanist conventions), an ASCII alias, and the next free codepoint in the absorption block **U+E100–U+E1FF**.
4. Extensions are **per-version, append-only**: a codepoint once assigned is never reused, and removal requires a major version bump (this is what keeps T4's parsers sane).

### 2.4 Phonotactics, stress, and tone rules

- **Syllable:** (C)(C)V(C)(ʼ). Onset clusters of at most 2 (and only obstruent+semivowel or s+stop patterns); coda of at most one consonant plus optional glottal check. Simplified register: onset clusters of at most 2, no checked finals, no phonation marks.
- **No sandhi** (§4.4, ratified) — phonotactics apply *within* morphemes; junctures are left unmodified in writing. Two phonetic (never orthographic) realization rules smooth the spoken/chanted junctures:
  - **Anusvāra before a vowel** is realized [m] (*vadruṁ-ai* → [ʋad̪rumai]).
  - **Hiatus glide:** across an unwritten vowel–vowel juncture, insert **[v]** after a ā u ū o au and **[y]** after i ī e ai. So *śanuma-in* is chanted [śanumavin], *jolma-āl* [jolmavāl], *ātmā-ai* [ātmāvai]. The glide is speech only — the canonical text, the FST, and parse-back are untouched; the ear gets ~90% of what sandhi gave, the machine pays nothing.
- **Stress:** fixed **penultimate syllable**, no exceptions (monosyllables are stressed; tone marks do not move stress). One rule, total coverage. Trade-off: occasionally unnatural for loans; accepted for T3/T4.
- **Tone:** lexical tone is written only where contrastive (tonal-origin vocabulary, Sandarbh renderings, and the three grammatical uses: rising = interrogative, falling = closure/finality, chant = sustain). Plain SD prose is not a tone language; the marks are a *capability*, deployed per register and per absorbed lexeme.

---
## 3. Script extension (extends SD‑1; does not redesign it)

SD‑1's architecture is preserved untouched: featural linear abugida, inherent /a/, right-attached mātrās, explicit virāma, no conjuncts, IAST-canonical storage, PUA-backed font, the saṁpūrṇa-mudrā closure `{C}`. This section only **adds glyphs by SD‑1's own construction grammar** (primitives P1–P6, place skeletons, manner modifiers) and assigns codepoints in the blocks SD‑1 left open.

### 3.1 One new featural rule: the alveolar place marker

SD‑1 encodes **place** as a skeleton and **manner** as a modifier. The alveolar series sits articulatorily between dental and retroflex, and the glyph says so:

> **Alveolar marker = a short tick (P3) at the base-right of the dental skeleton** — iconically, the tongue *raised toward* the curl position but not curled (the retroflex foot-curl P6 is the full curl; the alveolar tick is its "half-step").

This is a place modifier, deliberately positioned at the **base** (place modifiers live at the base; manner modifiers live on the stem/top — a new but consistent meta-rule that future place extensions must also follow). The full alveolar row is then generated by SD‑1's ordinary manner modifiers:

| Glyph | Construction | IAST |
|---|---|---|
| ṯ | dental base + alveolar tick | ṯ |
| ḏ | + voicing bar | ḏ |
| ṉ | + nasal loop | ṉ |
| ṟ | r-glyph (flowing stroke + small curl) + alveolar tick at base | ṟ |

(ṯʰ/ḏʰ are generable by the aspiration tick if ever needed; unassigned for now.)

### 3.2 New vowel machinery

- **Shortness tick** — one combining sign meaning "short variant": added to the e-mark or o-mark (sign or independent) it yields **ĕ /e/ and ŏ /o/**. One codepoint covers four uses (ĕ ŏ as mātrās and as independents); maximally featural, minimally costly.
- **ï /ɨ~ɯ/** — i-mark + **centralization dot** (the SD‑1 extension dot, reused with its established "shifted quality" meaning). Independent form = carrier + i-mark + dot.

### 3.3 New consonants, signs, and tones

- **ḻ /ɻ/** — open sweeping arc (P4, the semivowel family signature) + **foot-curl (P6)**: "the retroflex approximant — an open arc with a curled foot." Visually distinct from ḷ (stem + basal branch + curl, E085) and from r (flowing stroke + small curl).
- **ʼ /ʔ/ (glottal stop, full consonant)** — the avagraha form (tall vertical + notch) **scaled to consonant body height with a baseline foot**: SD‑1 already glossed avagraha as "glottal echo," so the full consonant is its grown-up form (same mnemonic move SD‑1 used for h ← aspiration tick).
- **Creaky mark ◌̰** — small under-tilde (P4 arc, subscript). **Breathy mark ◌̤** — two subscript dots (echoing visarga's paired dots, displaced below). Both attach to the syllable vowel, baseline-subscript.
- **High level tone `=`** — short horizontal bar above the akṣara (P2, raised). **Low level tone `` ` ``** — short horizontal bar *below* the trailing baseline. Both follow SD‑1 §4.4's tone-placement convention (suprasegmental, attach to the whole syllable, written as trailing ASCII-safe markers in canonical text).
- **Saṁjñā mark `^`** (the Core register's technical-sense marker, §8.2) — a small raised ring *preceding* the word (three tiny cuts approximating a circle, or one ring-gouge). In canonical IAST it is the typeable prefix `^`.

### 3.4 Codepoint assignments (extends SD‑1 Appendix B; same blocks, no reuse)

```
E063  high level tone (=)            E064  low level tone (`)
E065  saṁjñā / technical-sense mark (^)
E087  ḻ  retroflex approximant       E088  ṟ  alveolar trill
E089  ṉ  alveolar nasal              E08A  ṯ  alveolar stop (vl.)
E08B  ḏ  alveolar stop (vd.)         E08C  shortness tick (ĕ/ŏ, combining)
E08D  ï  central high vowel (sign; independent = E000-carrier composition)
E08E  ʼ  glottal stop (consonant)    E08F  creaky phonation mark
E090  breathy phonation mark
E091–E09F  reserved: future pan-Indian-tier needs
E100–E1FF  absorption block: governed extensions via SD-LEP, append-only
```

E080–E086 (SD‑1's original extension diacritics) are unchanged. E0A0–E0FF remains reserved for the Core symbolic/quantum-meta numeral overlay exactly as SD‑1 left it.

### 3.5 Carvability check (T6)

Every new form decomposes into P1–P6: the alveolar tick is one P3 cut; the shortness tick one notch; ḻ is one arc + one curl; ʼ is one stem + one notch; tones are single bars/arcs; phonation marks are one arc or two dots. Nothing stacks; everything is linear. **And none of it is carved in practice**, because the Simplified register — the inscription register — excludes Tier 1 entirely (§9.4). The extension exists for screen, print, and Core/Sandarbh text; stone stays within the small core.

### 3.6 Transliteration-library delta (extends SD‑1 §8.4 contract)

```
add to accepted input:  ḻ ṟ ṉ ṯ ḏ ĕ ŏ ï ʼ ◌̰ ◌̤  (+ ASCII aliases zh rr nn2 tt2 dd2 e2 o2 i2 q .~ .:)
add trailing markers:   = (high tone → E063)   ` (low tone → E064)
add prefix token:       ^ (saṁjñā → E065)
ordering (unchanged + extended): consonant(s)+virāma → final consonant → vowel sign
        → shortness/centralization tick → phonation mark → nasal/visarga → tone
round-trip guarantee:   unchanged — total + injective on valid IAST-extended input
```

---

## 4. Morphology — the regular machine (FST)

Design dogma, stated once: **near-zero irregularity means zero.** No irregular verbs, no irregular nouns, no stem changes, no suppletion, no grammatical gender, no agreement classes, **no sandhi**. Every form is template-generated; every surface form segments deterministically.

### 4.1 The verb template (from the Vyākaraṇa Grantha, formalized)

```
VERB ::= ROOT  ·  ASPECT  ·  PERSON  ·  (MODAL)  ·  (NEG)  [· TONE]
```

**Aspect particles** (settled by the grammar PDF): **-ra** present · **-ma** past · **-ṇa** habitual · **-viya** future/intent · **-tila** certainty.

**Personal endings** (open in the PDF; **ratified r1** — the Vedic present-active set -mi/-si/-ti, kept fully regular: asmi/asi/asti is the heritage echo, and *as-ra-si* "you are" audibly rhymes with the Mahāvākya it will re-author):

| Person | Singular | Plural |
|---|---|---|
| 1 | -mi | -mina |
| 2 | -si | -sina |
| 3 | -ti | -tina |

Plural = singular + **-na**, uniformly. Examples: *jan-ra-ti* "s/he knows" · *jan-ma-mi* "I knew" · *darś-viya-sina* "you (pl.) will perceive" · *vad-ṇa-ti* "s/he habitually speaks."

**Modal particles** (PDF set, **revised r1**): -lā maybe · -naḍ must · -zā hope · -meṁ inner belief. The PDF's modal **-viya "will" is deleted as redundant** — the aspect particle -viya is already glossed "future/*intent*" and covers it; one form, one slot, no ambiguity. Modal occupies its own slot after person: *jan-ra-ti-lā* "s/he perhaps knows."

**Negation:** the invariant auxiliary **illa** follows the verb as a separate word: *jan-ra-ti illa* "s/he does not know." (One word, one rule; no negative conjugation.)

**Imperative:** bare ROOT + falling tone: *jan\* "know!" **Optative/hortative:** ROOT + -zā: *jan-zā* "may (one) know."

### 4.2 The noun template

```
NOUN ::= STEM  ·  (PLURAL -gaṇ)  ·  (CASE)
```

**Plural -gaṇ** (from Skt. gaṇa "group"; echoes Dravidian -kaḷ/-gaḷ in shape and slot): *śanuma-gaṇ* "cosmic persons."

### 4.3 Case suffixes (the PDF's seven cases, with forms fixed here)

The Vyākaraṇa PDF defines the case *set* but its romanized forms are unrecoverable from the source (glyph-only cells). The forms below were assigned by this spec, deliberately sourced across India's families (see §1.1), and are **ratified r1**. Vowel-initial suffixes (-ai, -āl, -in, -il) after vowel-final stems take the spoken hiatus glide of §2.4 — written plain, chanted smooth:

| Case | Suffix | Source echo | Example |
|---|---|---|---|
| Nominative | ∅ | — | śanuma |
| Accusative | -ai | Tamil -ai | vadruṁ-ai "the ritual (obj.)" |
| Instrumental | -āl | Tamil -āl | jolma-āl "by the fire-being" |
| Ablative | -tas | Sanskrit -tas | viyāna-tas "from space" |
| Genitive | -in | Tamil -in (and the project's legacy files) | śanuma-in "of the cosmic person" |
| Locative | -il | Tamil -il (legacy files) | viyāna-il "in space" |
| Ergative | -ne | Hindi -ne | trahya-ne "the sovereign (past agent)" |

Case attaches with a hyphen in canonical text after vowel-final stems where the juncture would otherwise be ambiguous, and may attach solid elsewhere; the FST accepts both, the canonical normalizer emits the hyphenated form for non-∅ cases (one convention, deterministic — T4).

**Ergative rule (regularized split-ergativity):** -ne optionally marks the agent of a **past-aspect transitive** clause for agent-focus; verb agreement stays with the subject regardless (no agreement gymnastics — the Hindi complication is deliberately not imported). Trade-off: less "authentic" ergativity; total regularity.

### 4.4 The no-sandhi law

> At every morpheme and word boundary, both sides surface unchanged. *vadruṁ + -ai = vadruṁ-ai* (never \*vadrumai by written assimilation); *tāpa + aṅka = tāpa-aṅka* (never \*tāpāṅka).

What is lost: Sanskrit's euphonic elegance at junctures. What is gained: every learner rule survives contact with every other rule (T3); the morphological FST has no rewrite tier (T4); a reader can always recover the parts (T5); and chant flow is handled where it belongs — the prosodic layer (chant tone `:`, refrains, rāga setting), per the project's own Chantability Engine. Phonetic assimilation in *speech* is permitted and expected; it is simply never written.

### 4.5 Derivational suffixes (PDF set, carried + extended in §8)

-ma abstract noun (*jan-ma* "knowledge") · -ka agent (*jan-ka* "knower") · -la guide/conductor (*vad-la* "speech-guide") · -uṁ sacred/divine origin (*vadr-uṁ* → lexicalized *vadruṁ* "ritual") · -naṁ location/space (*jan-naṁ* "place of knowing"). Derivation precedes inflection: STEM = ROOT (·DERIV)*; the result inflects by §4.2/§4.1.

### 4.6 The finite-state model (implementation-ready)

Morphology is a single FST; because there is no sandhi, it is a plain concatenation machine over closed suffix sets — regular in the formal sense, trivially invertible.

```
LEXICON  = closed set of ROOTS  ∪ closed set of STEMS (lexicalized derivations)
DERIV    = { ma, ka, la, uṁ, naṁ }            (noun-forming; iterable, depth ≤ 2)
TECH     = { vat, aṅka, aṇu, tva }            (Core register only, §8.1; iterable)
ASPECT   = { ra, ma, ṇa, viya, tila }
PERSON   = { mi, si, ti, mina, sina, tina }
MODAL    = { lā, naḍ, zā, meṁ }
PLURAL   = { gaṇ }
CASE     = { ai, āl, tas, in, il, ne }

Verb  : ROOT (DERIV|TECH)* ASPECT PERSON (MODAL)?         e.g. jan·ra·ti·lā
Noun  : (ROOT (DERIV|TECH)*) | STEM  (PLURAL)? (CASE)?    e.g. śanuma·gaṇ·in

Analyzer  = the same machine reversed; longest-match over the closed sets,
            disambiguated by the lexicon (ROOT/STEM list) — deterministic because
            (a) no sandhi, (b) suffix sets are closed per spec version,
            (c) slot order is fixed.
Collisions: surface strings like 'ma' (past aspect) vs 'ma' (abstract DERIV) are
            resolved by slot position alone — DERIV can only follow ROOT/DERIV/TECH;
            ASPECT can only follow a verb stem and must be followed by PERSON.
```

An engineer can implement this as ~200 lines with `foma`/HFST or a hand-rolled trie; unit tests are the §12 examples plus the paradigm tables above.

---

## 5. Syntax — SOV, particles, and the EBNF sketch

### 5.1 Clause facts (settled by the PDF, formalized here)

SOV; modifiers precede heads; no gender; questions = clause-final particle **ka** family + rising tone; negation = post-verbal **illa**; subordination by clause-final particles; coordination by **ca** "and", **vā** "or" (postposed after the final conjunct: *jolma śanuma ca* "the fire-being and the cosmic person").

**Subordinators:** conditional **yad … (tad)** "if … then" (clause-initial yad on the protasis, optional tad on the apodosis); simultaneity **-raṁ** "while" cliticized to the subordinate verb (PDF: *vadruṁ-raṁ śanuma jan-ra* pattern); relative-correlative **yo … so** for relative clauses (Indic style, kept because it is linear and parse-friendly).

### 5.2 EBNF sketch (for the parser)

```ebnf
text        ::= unit+
unit        ::= sentence | grantha_unit
grantha_unit::= sentence+ CLOSURE                  (* {C} *)
sentence    ::= clause (CONJ clause)* PUNCT? TONE?
clause      ::= sub_clause* core_clause
sub_clause  ::= "yad" core_clause | core_clause "-raṁ"
core_clause ::= np_subj? argument* predicate
argument    ::= np_case | pp
np_subj     ::= np                                  (* nominative = ∅ *)
np_case     ::= np CASE
np          ::= dem? adj* noun PLURAL?
noun        ::= STEM | compound
compound    ::= word ("-" word)+                    (* head-final, §7.3 *)
predicate   ::= verb (MODAL)? (NEG)? | np_pred copula
copula      ::= "as" ASPECT PERSON
verb        ::= ROOT deriv* ASPECT PERSON
question    ::= clause QPART RISING_TONE            (* ka | kāya | kēruṁ | vāḷa | ṭhēla *)
CONJ        ::= "ca" | "vā"
NEG         ::= "illa"
```

(Agreement: the verb's PERSON slot agrees with the nominative subject in person and number — the only agreement in the language.)

### 5.3 The logical layer hooks (used by §8)

Quantifiers and connectives are ordinary words with frozen Core senses: they slot into the grammar as `dem`/`CONJ`/particles, so the EBNF needs no new productions for scientific prose.

### 5.4 Tokenization & segmentation spec (T4)

1. **Word boundary** = whitespace. **Sentence boundary** = `|` (daṇḍa-equivalent, optional in canonical), falling-tone marker at clause end, or `{C}`.
2. **Compound-internal boundary** = `-` (hyphen, canonical; §7.3). A hyphen always separates *lexical* members; it never appears inside an inflectional suffix chain except the normalizer's case-hyphen (§4.3), which is distinguishable because the right side is a closed-class CASE string.
3. **Morpheme segmentation** = the §4.6 analyzer (longest-match over closed sets + lexicon).
4. **Clitics** (`=`-joined in interlinear glossing only): -raṁ "while" is written solid on the verb; glossing tools may represent it as `=raṁ`.
5. **Notation islands** `[[ … ]]` (§9.2) and reserved tokens (`{C}`, tone markers, `^`) pass through the tokenizer as atomic tokens.
6. **Normalization order** (must match SD‑1 §2.3): NFC → ASCII-alias expansion → IAST validation → tokenization.


---

## 6. (Reserved — section number alignment)

*Intentionally empty: subsystem numbering in this spec follows the handoff's §6 list but is presented in reading order. Cross-reference map: phonology §2 · script §3 · morphology §4 · syntax+tokenization §5 · lexicon §7 · scientific register §8 · numerals/notation + registers + carving §9 · absorption §10 · governance §11 · worked examples §12 · migration §13–14 · open questions §15.*

---

## 7. Lexicon & word-formation

### 7.1 Root system

Roots are mono- or disyllabic, shape (C)(C)V(C)(V(C)), stored with IPA, gloss, register, and source attribution in the lexicon DB. **Starter set** = the attested lexicon (canonical, from the project files): *jan* know · *darś* perceive · *vad* speak · *śanuma* cosmic person · *vadruṁ* ritual · *trahya* sovereign · *jolma* fire-being · *śavaka* invoker · *tavṛṁ* totality · *grūta* past · *nivraṁ* future · *bhalu* nourishment · *vasram* move-through · *sārā/asārā* essence/non-being · *viyāna* space-realm · refrains *ṭṛṣa, vāmā, ōṁ* — **plus** the verb/noun roots this spec adds for a working core: *as* be · *gam* move · *kṛ* do/make · *dā* give · *labh* receive · *paś* see · *śru* hear · *man* think · *kalp* suppose/posit · *mā* measure · *gan* count · *yuj* join · *bhid* split/differ · *vṛt* turn/change · *tap* heat · *vah* carry/flow · *sthā* stand/place · *naś* perish · *kāla* time · *gati* motion · *taraṅga* wave · *vidyut* electric · *ūrjā* energy · *aṅka* mark/measure · *aṇu* particle/atom · *bindu* point · *rekha* line · *saṅkhyā* number. Pronouns (**ratified r1**): **ma** 1 · **tva** 2 · **sa** 3 (animate) / **ta** that (demonstrative & inanimate 3) · **i** this; plural by -gaṇ (*ma-gaṇ* "we"); *ma* vs the root *mā* "measure" is length-distinguished. Sacred vocabulary such as *ātmā* enters by route 1 (§7.4): borrowed and attributed, never respelled.

### 7.2 Derivation (transparent, productive)

General suffixes §4.5 + technical suffixes §8.1. **Guessability rule (T3/T5):** every non-root lexeme published in the dictionary must carry a derivation string that the §4.6 analyzer reproduces; if it cannot be derived, it must be listed as a root. There is no third category.

### 7.3 Compounding (samāsa-style, regularized)

- **Head-final** (the Indic tatpuruṣa default): *taraṅga-dīrgha-ma* "wave-length(-ness)" — the rightmost member is the head; left members modify.
- **Hyphen-canonical:** members joined by `-` in stored IAST. Display layers may render the hyphen as a thin space (Grantha) or keep it (Core/scientific). The Simplified register limits compounds to **two members**.
- **No sandhi at the join** (§4.4), so segmentation is the inverse of concatenation.
- Bahuvrīhi-style possessives are formed with the agent/possessor suffix instead of ambiguity: *trahya-bhalu-ka* "(one) having sovereign nourishment" — the -ka makes the exocentric reading explicit. Trade-off: classical samāsa ambiguity (a poetic resource) is sacrificed in Core; Grantha verse may use unmarked compounds with an editorial gloss.

### 7.4 Loanword / borrowing policy (three routes, chosen per item)

1. **Transliterate (represent):** proper names, sacred terms, culture-bound items — rendered in SD script via the absorption mapping, *never* respelled into pseudo-SD, always source-attributed in the DB. (*tamiḻ* stays *tamiḻ*.)
2. **Nativize:** common nouns in broad use — adapted to SD phonotactics by the §2.3 rules, marked `loan:<source>` in the lexicon.
3. **Coin:** technical and abstract vocabulary — preferred route; built from roots by §7.2/§8.1 so the term self-documents.
Route 1 is mandatory for sacred or identity-bearing source vocabulary (§10.5).

---

## 8. The scientific / Core register (T5)

### 8.1 Technical affixes (closed set, recursive, parse-transparent)

| Affix | Meaning | Example |
|---|---|---|
| **-vat** | rate of X (per unit time) | gati-vat "velocity" |
| **-aṅka** | measured quantity / scalar of X | tāpa-aṅka "temperature" |
| **-aṇu** | particle/quantum of X | vidyut-aṇu "electron" |
| **-tva** | property/-ness of X | vikīr-tva "entropy" |

Recursion is legal and meaningful: **gati-vat-vat** "rate of (rate of motion)" = acceleration. The analyzer parses it back: gati·vat·vat.

### 8.2 The saṁjñā mark `^` (disambiguation convention)

A lexeme prefixed with **`^`** (codepoint E065) carries its **defined Core-technical sense** — registered in the Vedika term database with one definition, one IPA, one derivation. Unprefixed, the same string carries its everyday/Simplified sense. *^gati-vat* is exactly velocity (displacement per unit time); plain *gati-vat* in a poem may mean "the pace of things." The convention is Pāṇinian in spirit (saṁjñā = defined technical term) and one keystroke in practice. **Rule:** a term's first occurrence in a scientific document must be `^`-marked; subsequent occurrences may drop it. Polysemy in the technical register is forbidden: one `^`-term, one definition, enforced at the term-DB level by review (§11).

### 8.3 Sample coinages (the required demonstration — ten terms)

| Term | SD coinage | Parse-back | Literal reading |
|---|---|---|---|
| velocity | ^gati-vat | gati·vat | motion-rate |
| acceleration | ^gati-vat-vat | gati·vat·vat | motion-rate-rate |
| displacement | ^sthā-naṁ-bhid-ma | sthā·naṁ·bhid·ma | place-differing-ness |
| electron | ^vidyut-aṇu | vidyut·aṇu | electricity-particle |
| entropy | ^vikīr-tva | vi·kīr·tva | scatteredness |
| energy | ^ūrjā-aṅka | ūrjā·aṅka | energy-quantity |
| temperature | ^tāpa-aṅka | tāpa·aṅka | heat-measure |
| wavelength | ^taraṅga-dīrgha-ma | taraṅga·dīrgha·ma | wave-length-ness |
| derivative | ^kṣaṇa-vat | kṣaṇa·vat | instant-rate |
| hypothesis | ^kalp-ma | kalp·ma | supposition |

Every cell in column 3 is produced by the §4.6 analyzer with no special cases — that is the T5 proof in miniature.

### 8.4 Logical & quantificational vocabulary (closed, unambiguous)

| Function | SD | Notes |
|---|---|---|
| and / or (incl.) / or (excl.) | ca / vā / vā-eka | postposed conjunctions |
| not (clausal) / non- (term) | illa / a- | a- prefix for term negation (a-sārā) |
| if … then / iff | yad … tad / yad-eva … tad-eva | biconditional by paired -eva "exactly" |
| for all / there exists / unique | sarva- / asti- / eka-asti- | quantifier prefixes on the bound noun |
| therefore / because | tas-mā / kēruṁ-tas | causal connectives |
| more/most X | X-tara / X-tama | regular comparatives |
| ratio / per / equals | anupāta / -prati / sama as-ra-ti | kāla-prati "per time" |

Example (a conditional law): *yad ^tāpa-aṅka vṛt-ra-ti, tad ^ūrjā-aṅka vṛt-ra-ti* — "if temperature changes, then energy changes."

### 8.5 Layering rule

Core = Simplified grammar + Tier-1 phonology + technical affixes + `^` + logical vocabulary + notation islands (§9.2). Nothing in Core changes the grammar; technical density is purely lexical and notational, so any Core sentence stripped of `^`-terms and islands is a grammatical Simplified sentence. That is the T5-vs-T3 resolution made mechanical.

---

## 9. Numerals, notation, registers, carving

### 9.1 Working scientific numerals (positional decimal — confirmed)

- Digits 0–9 = the SD‑1 simplified digits (U+E070–E079), **positional decimal** with a zero — the historically Indian system, which is the one true claim of ancientness this project gets to make about its numerals.
- **Canonical storage uses ASCII digits 0–9**; the font maps them to SD digit glyphs in SD-script rendering (same decoupling as letters). Decimal separator `.`; digit grouping by thin space in 3s for scientific text (Indian 2-2-3 grouping permitted in Simplified prose; a document picks one).
- The **Core symbolic/cosmological layer** (0 śūnya … 9 nava; Ψ ⊙ Θ ⇌ …) is a **semantic overlay**, not working numerals: used like iconography beside text, reserved block E0A0+, separate future spec — exactly as SD‑1 ruled. A physics paper never computes with śūnya-glyphs.

### 9.2 Inline notation (the prose↔notation boundary)

- **Notation island** = `[[ … ]]` in canonical text (atomic token, §5.4). Inside an island: standard international mathematical notation verbatim — Latin/Greek variables, operators, SI unit symbols (m, s, kg, K, mol …), rendered LTR. SD is LTR and linear, so islands embed without bidi pain.
- **SI units:** symbols stay international inside islands; SD prose names exist for reading aloud (e.g., *mīṭara, sekanda* as nativized loans, route 2 §7.4) and are listed in the term DB.
- **Boundary rule:** an island is syntactically a noun phrase (it can take a case suffix *outside* the brackets: `[[v]]‑in` "of v"). One rule, full composability.
- Variables may be bound to SD terms at first use: *^gati-vat [[v]]* "velocity, v" — thereafter either form refers.

### 9.3 Register matrix (precise deltas only)

| | Simplified | Core | SD-Sandarbh | Grantha |
|---|---|---|---|---|
| Phoneme tiers | Tier 0 only | 0+1 (+ approved E100 ext.) | 0+1+ext. as the source needs | 0+1 |
| Tone marks | falling, rising only | all five | all five + chant-heavy | chant + falling |
| Compounds | ≤ 2 members | unlimited | per source rendering | unlimited (display may drop hyphen) |
| `^`, TECH affixes, `[[ ]]` | forbidden | required for technical sense | forbidden | forbidden |
| Numerals | SD digits, either grouping | SD digits, 3-grouping, islands | per source | symbolic overlay permitted as iconography |
| Closure | — | — | — | `{C}` mandatory per unit |
| Special | the inscription register | the science register | bridge tables + rāga layer (§10.3) | seven-field corpus format |

**Movement rules:** Simplified→Core = add machinery (always grammatical, §8.5). Core→Simplified = strip `^`/islands, re-express technical terms periphrastically (lossy; flag it). Any→Sandarbh = run the bridge table for the target community. Any→Grantha = editorial composition + `{C}`; Grantha content is human-reviewed before publication, always (§11.3).

### 9.4 Carving conventions (T6, carried from SD‑1 and completed)

Simplified register only on stone. Left-to-right, top-to-bottom lines; inter-word gap ≥ one stem-width; inter-line gap ≥ one glyph-height; tone marks limited to falling `\` (closure) — carve as one shallow arc; digits from E070–E079 share letter stroke-depth; the saṁpūrṇa-mudrā `{C}` may close a Simplified inscription (the one Grantha element admitted to stone, as it is three cuts + one arc); no Tier-1 letters, no phonation marks, no `^`, no islands. A carving stencil = the font's SVG export at final size (SD‑1 §2.2 pipeline).

---

## 10. The absorption protocol (T2) — the heart of openness

**Definition:** absorption = the governed process by which SD gains the ability to **represent** a language Λ — its sounds, prosody, and (selectively) words — producing a versioned public dossier. Absorption is representation and bridging. It is **never** ownership, supersession, renaming, or claiming of Λ, its script, or its sacred material.

### Step P — Phonology mapping
1. Compile Λ's phoneme inventory in IPA from published descriptions **and** native-speaker consultation (§11.4).
2. For each phoneme apply §2.3: exact match → SD phoneme; near match → nearest-by-features **with the merger logged** (source contrast lost? say so); contrastive + functionally loaded + unmappable → file an **SD-LEP** extension (glyph by §3's rules, IAST-extended transliteration, ASCII alias, next E100-block codepoint).
3. Output: the **mapping table** (Λ-phoneme · IPA · SD rendering · codepoint · merger notes).

### Step T — Prosody & tone
Map Λ's tone/phonation system onto SD's five tone marks + two phonation marks; document every merger; a needed sixth tonal distinction is an SD-LEP, not an improvisation. Stress: SD's fixed penultimate stress applies to *SD text*; transliterated Λ material may carry a stress diacritic if Λ's stress is contrastive (dossier decision).

### Step L — Lexicon policy for Λ
Apply §7.4 per item class: names & sacred terms → route 1 (transliterate + attribute, mandatory); everyday borrowings → route 2 (nativize, tagged `loan:Λ`); concepts SD lacks → route 3 (coin natively) **or** route 2 with the community's blessing. The dossier lists every borrowed item with source, meaning, and route.

### Step B — Bridge (the generalized Sandarbh mechanism)
Produce a **Sandarbh bridge table** for Λ, generalizing the existing Punjabi/Dogri/Kashmiri work: emotionally-rich vākya templates mapped Λ↔SD; sample verses rendered both ways; optionally the music layer (rāga/tāl mapping, chant-tone flow) where Λ has a devotional-musical tradition the community wants bridged. The bridge is how Λ-speakers *meet* SD without leaving Λ.

### Step D — Dossier, review, version
One Markdown dossier per Λ (`/absorption/Λ.md`): mapping table, tone mapping, lexicon list, bridge table, consultation record, open issues. It enters via the §11.2 workflow (proposal → review → **human editorial gate** → merge), lands in a **minor version** of the language spec if it adds E100 codepoints, a **patch** otherwise. Append-only; corrections supersede, never silently rewrite.

### 10.5 Respectful-representation policy (binding)
(a) No living language's script is reused or imitated (the Chakma rule, made permanent and general). (b) No claim, ever, that SD contains/replaces/perfects Λ — dossiers use "represents." (c) Native-speaker consultation is required before a dossier merges; for sacred material, the relevant community's express consent is required, and **right-to-removal** is honored (a community may request its material be withdrawn; removal is a patch release with the codepoints retired-but-reserved). (d) Attribution is permanent metadata.

---

## 11. Governance & openness (T2)

### 11.1 Repository & licensing
Public GitHub repo (`vedika-sd/sd-language`): `/spec` (this doc + SD‑1), `/lexicon` (term DB as versioned JSON/CSV), `/absorption` (dossiers), `/font`, `/lib` (transliteration + FST), `/corpus`. Suggested licensing — specs & lexicon: CC BY-SA 4.0; code & font: MIT/OFL. (Maintainer decision; §15.)

### 11.2 SD-LEP workflow (SD Language Enhancement Proposal)
1. **Propose:** issue from template (problem, evidence, design-by-the-rules, codepoint request, dossier link if absorption-driven).
2. **Review:** open comment ≥ 14 days; an FST/parser impact check is mandatory for any morphology/suffix change.
3. **Editorial gate (human, mandatory):** the Vedika editorial board — which for Dharmic content cites traditional Sanatani sources, per standing Vedika practice — approves, returns, or rejects. Nothing auto-publishes. For absorption dossiers the gate additionally verifies §10.5 compliance (consultation record present, attribution complete).
4. **Merge & version:** SemVer on the language spec — **major** = breaking grammar/encoding change; **minor** = new codepoints/suffixes/dossiers; **patch** = corrections. Codepoints append-only (§2.3.4).

### 11.3 Publication rule
All SD content published on Vedika (hymns, Grantha units, bridge verses, term-DB entries) passes human editorial review. Machine-generated drafts are drafts.

### 11.4 Consultation standard
For any Λ with living speakers: at least one native-speaker reviewer signs off on the dossier's mapping and lexicon steps; their review is credited (or anonymized at their request) in the dossier. Where no reviewer can yet be found, the dossier may merge only in **provisional** status, clearly labeled, excluded from publication surfaces.


---

## 12. Worked examples (the tenets, proven end-to-end)

Each item shows **(a)** canonical transliteration, **(b)** described SD‑1 rendering, **(c)** stored codepoints — per the SD‑1 convention. Canonical writing rule used throughout: inflectional morphology solid (*janrati*), case suffixes and compounds hyphenated, reserved tokens atomic.

### 12.1 A Grantha line with closure — Hymn 59, *tat tvam asi*

**(a)** `tat tvam asi {C}`
**(b)** ta (dental base, inherent a) · t+virāma ‖ t+virāma · va (semivowel bowl) · m+virāma ‖ a (carrier) · si (dental-hatch + i-sign) ‖ saṁpūrṇa-mudrā.
**(c)** `E02F · E02F E050 ␣ E02F E050 · E03C · E038 E050 ␣ E000 · E03F E012 ␣ E06F`

**Honesty flag (and the fix this design enables):** as the corpus stands, this *is* the Sanskrit, transliterated — the §0(2) known flaw. The design now makes true re-authoring possible. **Preview of the SD-native line** (downstream task, shown to prove the machinery):

**(a)** `tva ta asrasi {C}` — *you that be-PRES-2sg* = "you are That."
**(b)** t+virāma · va ‖ ta ‖ a · s+virāma · ra · si (dental-hatch + i-sign) ‖ closure.
**(c)** `E02F E050 E03C ␣ E02F ␣ E000 · E03F E050 · E03A · E03F E012 ␣ E06F`
Parse-back: tva (2sg pronoun) · ta (demonstrative) · as·ra·si (be·PRES·2sg). Every unit is in §7.1's lexicon and §4's paradigms — and the line audibly echoes *tat tvam asi*, the verse it re-authors: the -si ending is doing heritage work and grammar work at once.

### 12.2 A plain SD sentence (real lexicon, full template)

"The cosmic person knows the ritual."

**(a)** `śanuma vadruṁ-ai janrati\`
Gloss: śanuma(NOM) · vadruṁ-ACC · know-PRES-3sg · falling tone (declarative closure).
**(b)** śa (palatal-hook + hatch) · nu (dental + nasal loop + u-sign) · ma (labial + nasal loop) ‖ va · d+virāma · ru · anusvāra-loop · independent-ai ‖ ja (palatal + voicing bar) · n+virāma · ra (flowing stroke + curl) · ti (dental + i-sign) with falling arc above the final akṣara.
**(c)** `E03D · E033 E014 · E038 ␣ E03C · E031 E050 · E03A E014 · E051 · E008 ␣ E027 · E033 E050 · E03A · E02F E012 E061`
(The case hyphen is canonical-layer only; the renderer shows a thin gap. Anusvāra before the vowel-initial suffix is read [m], §2.4.)

### 12.3 A scientific statement (proves T5) — *v = s/t*

Coinages used (from §8.3): **^gati-vat** velocity · **^sthā-naṁ-bhid-ma** displacement.

**(a)** `^gati-vat [[v]] kāla-prati ^sthā-naṁ-bhid-ma asrati. [[v = s/t]] — [[m/s]]`
Reading: "Velocity, v, is displacement per time. v = s/t, in metres per second."
Gloss: ^motion-rate [v] time-per place-differ-ness be-PRES-3sg.
**(b)** the `^` renders as the small raised ring before *gati-vat*; SD letters per the tables; `[[v]]`, `[[v = s/t]]`, `[[m/s]]` render verbatim as LTR notation islands inline with the SD text; the island can inflect from outside its brackets (§9.2), e.g. `[[v]]-in` "of v."
**(c)** SD-text spans map per §4–§5 of SD‑1 plus `^` = E065; island contents are stored as plain ASCII/Unicode math, untouched by the transliteration library (atomic tokens).
**Parse-back (the T5 test):** the analyzer returns gati·vat ("motion"·RATE) and sthā·naṁ·bhid·ma (place·LOC-NMLZ·differ·ABSTR) with no special-casing — a reader or a program recovers the meaning from the parts.

### 12.4 Absorption demo (proves T1 + T2) — three inputs, two families beyond Indo-Aryan

**Tamil — *tamiḻ* (தமிழ்).** Step P: /t̪/ → t (exact) · /a/ → a (exact) · /m/ → m (exact) · /i/ → i (exact) · **/ɻ/ → ḻ** (Tier-1 letter E087; for Tamil this is a pre-approved pan-Indian-tier mapping, no merger, no loss). Step L: *tamiḻ* is an identity-bearing name → route 1, transliterated, attributed.
**(a)** `tamiḻ` **(b)** ta (dental) · mi (labial + nasal loop + i-sign) · ḻ+virāma (open arc + foot-curl, then virāma) **(c)** `E02F · E038 E012 · E087 E050`

**Meitei (Tibeto-Burman, tonal) — illustrative syllable *cā* "eat," high tone.** Step P: /tʃ ~ c/ → c · /a/ long → ā. Step T: Meitei's level-vs-falling tonal contrast maps onto SD's **high level `=` (E063)** vs **falling `\` (E061)** — no merger needed for a two-tone analysis; the dossier must record which published analysis it follows.
**(a)** `cā=` **(b)** ca (palatal hook) + ā-length sign, high-level bar above the akṣara **(c)** `E025 E011 E063`
**Status: provisional** pending native-speaker review per §11.4 — shown here precisely to demonstrate that the protocol *requires* that step rather than treating a dictionary lookup as enough.

**Santali (Munda, checked finals) — *dakʼ* "water."** Step P: /d̪/ → d · /a/ → a · final checked /kʼ/ → k + glottal stop ʼ, i.e. the ordinary cluster machinery applied to E08E — no new mechanism (§2.2c).
**(a)** `dakʼ` (ASCII input `dakq`) **(b)** da (dental + voicing bar) · k+virāma · glottal-stop letter + virāma **(c)** `E031 · E020 E050 · E08E E050`
**Status: provisional**, same gate.

### 12.5 A hymn-level sound proof (the ratified trio working together) — Hymn 53

*yaḥ ātmānaṁ veda na sa jātu naśyati* "He who knows the Self never perishes," re-authored in SD with the relative-correlative (§5.1), the ratified cases, and the glide rule:

**Written (canonical):** `yo ātmā-ai janrati, so naśrati illa\ {C}`
**Chanted:** [yo ātmāvai janrati, so naśrati illa] — the §2.4 glide smooths ā-ai to [āvai]; penultimate stress throughout; falling tone closes the unit.
Gloss: who Self-ACC know-PRES-3sg, that-one perish-PRES-3sg NEG.
The counterfactual that ratifying no-sandhi avoided: fused \*ātmai- would have destroyed parse-back (ātmā? ātma? ātmai?) and forced a rewrite tier into the FST. Written plain, chanted smooth — per hymn, forever.

Together: a Dravidian phoneme rendered first-class, a Tibeto-Burman tone mapped without loss, a Munda checked final composed from existing machinery — and two of the three deliberately held at the human-review gate. That is the protocol working as designed.

---

## 13. Migration notes

1. **Implement the FST + parser** (§4.6, §5.2) and extend the transliteration library per §3.6; unit-test on §12 and SD‑1 §7. *(Blocks everything downstream; small, well-specified.)*
2. **Seed the lexicon DB** from §7.1 + §8.3 + the term DB schema (lexeme · IPA · derivation string · register · `^`-definition · source attribution · version).
3. **Re-author the hymn corpus (the §0(2) fix).** Pipeline per hymn: Sanskrit + meaning fields (authoritative, unchanged) → human translator composes the SD fields *in SD* using this grammar and lexicon → the analyzer must round-trip every SD word (mechanical validation) → editorial gate → publish; closure `𑁹` → `{C}` throughout (already mandated by SD‑1 §8). Hymns 1–25 and 43–60 proceed now; 11–15 and 26–42 are authored when written — nothing here blocks them. Expect the lexicon to grow root-by-root during re-authoring; each new root enters by patch release.
4. **Regenerate the Varṇamālā documents** from SD‑1 §4 + this spec's §2–§3 (the Chakma mappings stay deleted).
5. **Re-typeset the Vyākaraṇa Grantha** content in SD‑1 once the font ships, replacing its deprecated abstract glyphs; fold §4–§5 of this spec back into it as the formal grammar modules.
6. **Generalize Sandarbh:** convert the existing Punjabi/Dogri/Kashmiri material into the §10 dossier format (they become absorption dossiers #1–#3, with the rāga layer as their Step B), then proceed family-by-family per community interest.
7. **Do not** modify any live Vedika repo, push to GitHub, or open a PR from this chat — this document is the spec only; implementation is a separate, approved step (standing constraint).

## 14. What changed vs. the source documents (delta record)

- **Fixed by assignment and ratified r1** (PDF forms unrecoverable or absent): case suffix forms (§4.3), personal endings (§4.1 — 2sg revised to -si in ratification, aligning the set with Vedic -mi/-si/-ti), pronouns (§7.1), plural -gaṇ (§4.2). The redundant -viya modal was deleted (§4.1).
- **New law, ratified:** zero sandhi (§4.4) with the spoken hiatus-glide rule (§2.4) as its prosodic complement — the corpus's Sanskrit fields are unaffected (they are Sanskrit); SD-native composition follows the law.
- **New machinery:** alveolar place marker + 11 codepoints (§3), technical affixes + `^` (§8), notation islands (§9.2), hyphen-canonical compounds (§7.3), absorption protocol + SD-LEP (§10–§11).
- **Carried unchanged:** SD‑1 in its entirety; the PDF's aspect particles, modal/emotive/question particles, derivational suffixes, SOV; the Varṇamālā *sounds*; the lexicon; the Chantability Engine (now formally located at the prosodic layer); the numeral dual-system ruling.

## 15. Open questions remaining (maintainer decisions)

*(Resolved in r1: personal endings, case forms, pronouns, plural -gaṇ, the no-sandhi law + glide rule, and the -viya modal deletion — see the header note and §14.)*

1. **Five tone marks:** sufficient until a >5-tone language's dossier forces an SD-LEP — accept, or pre-allocate a third contour now?
2. **Hyphen display in Grantha** (thin space vs visible hyphen) — decide after font prototype, alongside SD‑1's mātrā/tone-placement open questions.
3. **`^` saṁjñā glyph form** (raised ring) — legibility test at small sizes pending.
4. **Licensing** (§11.1) and the **editorial board composition** for the SD-LEP gate.
5. **Provisional dossiers** (Meitei, Santali illustrations in §12.4): recruit native-speaker reviewers before any publication surface uses them.
6. **Naming:** "SD bhāṣā v0.1" as the public version label, alongside SD‑1/*Saṁlipi* for the script — your call, with the standing rule: no "ancient/revealed" framing anywhere.
