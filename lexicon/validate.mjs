/**
 * SD lexicon validator — zero dependencies.
 *
 * Cross-checks lexicon/sd-lexicon.json against the VERIFIED reference library
 * (lib/dist/src/index.js). Three contracts:
 *   1. Round-trip   — every surface form is lossless: codepointsToIast(iastToCodepoints(f)) === f
 *   2. FST-recognized — every root/stem/pronoun is known to the analyzer; every coinage parses
 *                       to its stated gloss.
 *   3. Parity        — the lexicon's roots/stems/pronouns EXACTLY equal the FST closed sets in
 *                      lib/src/fst.ts, so the JSON can never silently drift from the code.
 *
 * Run after building the lib:  cd lib && npm run build && cd .. && node lexicon/validate.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (rel) => fileURLToPath(new URL(rel, import.meta.url));

let lib;
try {
  lib = await import(new URL("../lib/dist/src/index.js", import.meta.url).href);
} catch (e) {
  console.error("✗ Cannot load compiled library at lib/dist/src/index.js");
  console.error("  Build it first:  cd lib && npm run build");
  console.error("  (" + e.message + ")");
  process.exit(2);
}

const { iastToCodepoints, codepointsToIast, analyze, VERB_ROOTS, NOUN_STEMS, PRONOUNS } = lib;
const lex = JSON.parse(readFileSync(here("./sd-lexicon.json"), "utf8"));

const nfc = (s) => s.normalize("NFC");
const errors = [];
const fail = (msg) => errors.push(msg);

// ---------- 1. Round-trip (lossless transliteration) ----------
const roundtripForms = [
  ...lex.roots.map((r) => r.form),
  ...lex.stems.map((s) => s.form),
  ...lex.pronouns.map((p) => p.form),
  ...lex.coinages.map((c) => c.form),
  ...lex.coinages.map((c) => c.sd), // includes the leading saṁjñā '^'
];
for (const f of roundtripForms) {
  let got;
  try {
    got = codepointsToIast(iastToCodepoints(f));
  } catch (e) {
    fail(`round-trip threw for "${f}": ${e.message}`);
    continue;
  }
  if (nfc(got) !== nfc(f)) fail(`round-trip not lossless for "${f}" → "${got}"`);
}

// ---------- 2. FST recognition ----------
for (const r of lex.roots) if (!VERB_ROOTS.has(nfc(r.form))) fail(`root not in VERB_ROOTS: "${r.form}"`);
for (const s of lex.stems) if (!NOUN_STEMS.has(nfc(s.form))) fail(`stem not in NOUN_STEMS: "${s.form}"`);
for (const p of lex.pronouns) {
  if (!PRONOUNS.has(nfc(p.form))) fail(`pronoun not in PRONOUNS: "${p.form}"`);
  const parse = analyze(p.form);
  if (!parse || parse.gloss !== p.gloss) fail(`pronoun "${p.form}" gloss "${parse?.gloss}" ≠ "${p.gloss}"`);
}
for (const c of lex.coinages) {
  const parse = analyze(c.form);
  if (!parse) { fail(`coinage "${c.sd}" (${c.term}) does not parse`); continue; }
  if (parse.gloss !== c.gloss) fail(`coinage "${c.sd}" (${c.term}) gloss "${parse.gloss}" ≠ stated "${c.gloss}"`);
}

// ---------- 3. Parity (anti-drift) — lexicon sets must EQUAL code sets ----------
const diff = (label, jsonForms, codeSet) => {
  const j = new Set(jsonForms.map(nfc));
  const c = new Set([...codeSet].map(nfc));
  const missing = [...c].filter((x) => !j.has(x)); // in code, absent from lexicon
  const extra = [...j].filter((x) => !c.has(x)); // in lexicon, absent from code
  if (missing.length) fail(`${label}: missing from lexicon (present in code): ${missing.join(", ")}`);
  if (extra.length) fail(`${label}: extra in lexicon (absent from code): ${extra.join(", ")}`);
};
diff("VERB_ROOTS", lex.roots.map((r) => r.form), VERB_ROOTS);
diff("NOUN_STEMS", lex.stems.map((s) => s.form), NOUN_STEMS);
diff("PRONOUNS", lex.pronouns.map((p) => p.form), PRONOUNS);

// ---------- Report ----------
if (errors.length) {
  console.error(`✗ lexicon: ${errors.length} error(s)`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(
  `✓ lexicon: OK (${lex.roots.length} roots, ${lex.stems.length} stems, ` +
    `${lex.pronouns.length} pronouns, ${lex.coinages.length} coinages — round-trip + FST + parity verified)`
);
