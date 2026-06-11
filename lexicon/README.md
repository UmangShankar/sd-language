# SD Lexicon

`sd-lexicon.json` is the seed lexical database for SD Language: every root, lexicalized stem,
pronoun, the ten §8.3 technical coinages, plus the closed sets of particles and postpositions —
each annotated with meaning and provenance from **SD-1** (`spec/SD-language-design-v1.md`).

## The parity contract (why this file can't drift)

The **source of truth** for what the language recognizes is the verified finite-state machine in
`lib/src/fst.ts` (`VERB_ROOTS`, `NOUN_STEMS`, `PRONOUNS`, `PARTICLES`, `POSTP`). This JSON **mirrors**
those closed sets and adds human-facing metadata — it does not redefine them. `validate.mjs` enforces
that the two stay identical, so a form added in code but not here (or vice-versa) fails CI immediately.

## Schema

```jsonc
{
  "version": "0.2.0",
  "spec": { "language": "...", "script": "..." },
  "roots":         [ { "form", "meaning", "pos": "verb", "status": "canonical|addition", "source" } ],
  "stems":         [ { "form", "meaning", "pos": "noun", "status", "source" } ],
  "pronouns":      [ { "form", "gloss", "meaning" } ],
  "coinages":      [ { "term", "sd", "form", "derivation", "literal", "register": "Core" } ],
  "particles":     [ { "form", "meaning" } ],     // parity reference only (see below)
  "postpositions": [ { "form", "gloss", "meaning" } ]  // parity reference only
}
```

- `status` follows SD-1 §7.1: `canonical` = attested lexicon; `addition` = spec addition.
- `coinages[].sd` is the saṁjñā-marked form (`^…`); `form` is the bare hyphenated form the analyzer
  consumes; `derivation` is the analyzer's exact gloss output (e.g. `gati·RATE`); `literal` is the
  morpheme reading (e.g. `motion-rate`).
- IPA is intentionally absent: SD-1 stores IPA in its private DB but does not enumerate per-root
  values in §7.1, so we do not fabricate them. This is the natural place for future IPA enrichment.

### Why particles/postpositions are parity-only

`particles` and `postpositions` exist so the parity contract can compare them against the code's
`PARTICLES`/`POSTP`. They are **not round-tripped through the codec**, because several forms
(`kēruṁ`, `ṭhēla`, `ēla`, `ōṁ`) use the Tier-1 vowels **ē/ō**, which the Simplified codec in
`lib/src/translit.ts` does not encode as units. Round-tripping them would (correctly) throw, so the
validator deliberately scopes the round-trip contract to the encodable lexical entries
(roots, stems, pronouns, coinages) and treats the closed-set lists as parity references only.

## Validator — the three contracts

`validate.mjs` (zero dependencies) loads the compiled reference library and checks:

1. **Round-trip** — every lexical `form` (roots, stems, pronouns, coinages, and the `^`-marked coinage
   forms) `analyze()`s to a parse and is lossless: `codepointsToIast(iastToCodepoints(form)) === form`.
2. **FST recognition** — every coinage satisfies `analyze(form).gloss === derivation` exactly; pronoun
   glosses match the analyzer too.
3. **Parity** — `roots`/`stems`/`pronouns`/`particles`/`postpositions` EXACTLY equal
   `VERB_ROOTS`/`NOUN_STEMS`/`PRONOUNS`/`PARTICLES`/`POSTP` from `lib/src/fst.ts`.

The parity sets are imported live from the compiled library rather than hardcoded, so drift is caught
in both directions.

### Run it

```sh
cd lib && npm run build && cd ..   # produces lib/dist/ (gitignored)
node lexicon/validate.mjs          # exit 0 + summary on success; exit 1 + contract-labelled report on failure
```

Success prints:

```
✓ lexicon: all three contracts pass
  round-trip      : 21 roots + 28 stems + 5 pronouns + 10 coinages (lossless + analyzable)
  fst-recognition : 10 coinage derivations + 5 pronoun glosses match analyze()
  parity          : verb-roots/noun-stems/pronouns/particles/postpositions == fst.ts closed sets
```

CI runs this on every push/PR (see `.github/workflows/ci.yml`).
