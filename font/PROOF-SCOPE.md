# SD-1 Core Font Proof

**Status:** provisional visual candidate — not the final SD alphabet  
**Target:** v0.2 Script Alpha vertical slice

## Objective

Produce the first real SD-1 outline font and use it to render the canonical proof sentence:

```text
tat tvam asi {C}
```

This milestone proves the complete path from canonical IAST through the existing transliteration library to PUA codepoints, OpenType outlines, browser rendering and lossless round-trip recovery.

## Included glyphs

The proof contains 24 PUA glyphs plus `.notdef` and space:

- independent vowels: `a ā i u`;
- vowel signs: `ā i u`;
- the five place skeletons: `k c ṭ t p`;
- the complete dental family: `t th d dh n`;
- supporting consonants: `m r v s`;
- signs: virāma, anusvāra and visarga;
- the SD closure mark.

The glyphs are generated only from the current P1–P6 construction grammar. Their proportions, spacing, curve treatment and optical corrections remain reviewable visual decisions.

## Outputs

Running `python font/scripts/build_proof_font.py` generates:

```text
font/builds/SD1-Text-Proof.ttf
font/builds/SD1-Text-Proof.otf
font/builds/SD1-Text-Proof.woff2
font/glyphs/core-proof/*.svg
font/specimens/core-font-proof.html
```

## Acceptance criteria

- all three font formats open successfully;
- the proof codepoints are present in the cmap;
- GPOS mark positioning is present for vowel signs and virāma;
- the real transliteration library emits the locked proof sequence;
- `tat tvam asi {C}` round-trips without loss;
- no proof character renders as `.notdef`;
- one SVG master is generated for every PUA proof glyph;
- the browser specimen displays normal, small-size and mild-blur views;
- all outputs remain clearly labelled provisional.

## Non-goals

This PR does not freeze the final visual grammar, complete all 87 mapped glyphs, establish handwriting or inscription masters, pass distinctiveness testing, or declare SD-1 production-ready.
