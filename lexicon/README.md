# SD Lexicon

`sd-lexicon.json` is the seed lexical database for SD Language v0.1: every root, lexicalized
stem, pronoun, and the ten §8.3 technical coinages, each annotated with meaning, part of speech,
and provenance from **SD-1** (`spec/SD-language-design-v1.md`).

## The parity contract (why this file can't drift)

The **source of truth** for what the language recognizes is the verified finite-state machine in
`lib/src/fst.ts` (`VERB_ROOTS`, `NOUN_STEMS`, `PRONOUNS`). This JSON **mirrors** those closed sets
and adds human-facing metadata — it does not redefine them. `validate.mjs` enforces that the two
stay identical, so a root added in code but not here (or vice-versa) fails CI immediately.

## Schema

```jsonc
{
  "version": "0.1.0",
  "spec": { "language": "...", "script": "..." },
  "roots":    [ { "form", "meaning", "pos": "verb", "status": "canonical|addition", "source" } ],
  "stems":    [ { "form", "meaning", "pos": "noun", "status", "source" } ],
  "pronouns": [ { "form", "gloss", "meaning" } ],
  "coinages": [ { "term", "sd", "form", "parse_back": [...], "gloss", "literal", "register": "Core" } ]
}
```

- `status` follows SD-1 §7.1: `canonical` = attested lexicon; `addition` = spec addition.
- `coinages[].sd` is the saṁjñā-marked form (`^…`); `form` is the bare hyphenated form the analyzer
  consumes; `gloss` is the analyzer's exact output (feature tags, e.g. `gati·RATE`); `literal` is the
  morpheme reading (e.g. `motion-rate`).
- IPA is intentionally absent: SD-1 stores IPA in its private DB but does not enumerate per-root
  values in §7.1, so we do not fabricate them. This is the natural place for future IPA enrichment.

## Validator

`validate.mjs` (zero dependencies) loads the compiled reference library and checks three contracts:

1. **Round-trip** — every surface form (including the `^`-marked coinage forms) is lossless:
   `codepointsToIast(iastToCodepoints(f)) === f`.
2. **FST recognition** — every root/stem/pronoun is known to `analyze()`; every coinage parses to
   its stated `gloss`; every pronoun glosses as stated.
3. **Parity** — the lexicon's `roots`/`stems`/`pronouns` sets EXACTLY equal `VERB_ROOTS`/
   `NOUN_STEMS`/`PRONOUNS` from `lib/src/fst.ts`.

### Run it

```sh
cd lib && npm run build && cd ..   # produces lib/dist/ (gitignored)
node lexicon/validate.mjs          # exit 0 + summary on success; exit 1 + report on failure
```

Success prints, e.g.:

```
✓ lexicon: OK (21 roots, 28 stems, 5 pronouns, 10 coinages — round-trip + FST + parity verified)
```

CI runs this on every push/PR (see `.github/workflows/ci.yml`), so the lexicon and the verified
implementation can never diverge unnoticed.
