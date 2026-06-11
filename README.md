# SD Language (SanatanDharma Bhāṣā)

An **openly constructed, in-development** sacred/philosophical/scientific language — a sub-project of [Vedika](https://askvedika.com). Internal canon **v0.1**, preparing open-source beta.

SD is **not** ancient, revealed, official, or a replacement for Sanskrit or any living language. It is a governed, versioned constructed language designed around six tenets: incorporate all Indian languages · open and able to absorb any language · easy to learn · easy to code · easy to write science in · easy to carve on stone.

## Repository layout
- `/spec` — the authoritative specs: `SD-unified-script-v1.md` (script, SD‑1) and `SD-language-design-v1.md` (the complete language, v0.1‑r2)
- `/lib` — reference implementation (TypeScript): transliteration (IAST ⇄ SD‑1 codepoints), morphological FST, tokenizer + clause checker. Test suite = the specs' worked examples.
- `/font` `/lexicon` `/absorption` `/corpus` `/site` — Phase 2+ (see the roadmap in the design spec §13)

## Quick start
```bash
cd lib && npm install && npm test
node dist/src/cli.js "tva ta asrasi {C}"
```

## Governance
Changes enter via the SD-LEP process with a mandatory human editorial gate and a binding respectful-representation policy — see design spec §10–§11.
