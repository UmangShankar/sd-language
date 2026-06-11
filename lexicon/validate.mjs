/**
 * SD lexicon validator — zero external dependencies (plain Node ESM).
 *
 * Runs the three CI contracts against the REAL compiled reference library
 * (lib/dist/src/index.js). Exits 0 if all pass; exits 1 with a clear,
 * contract-labelled report on the first set of failures.
 *
 *   1. Round-trip contract     — every lexical entry's `form` analyzes to a parse, and is
 *                                lossless: codepointsToIast(iastToCodepoints(form)) === form.
 *   2. FST-recognition contract — every entry carrying a `derivation` (the coinages) satisfies
 *                                analyze(form).gloss === derivation, exactly.
 *   3. Parity contract          — the lexicon's verb-roots / noun-stems / pronouns / particles /
 *                                postpositions EXACTLY match VERB_ROOTS / NOUN_STEMS / PRONOUNS /
 *                                PARTICLES / POSTP in lib/src/fst.ts (no drift in either direction).
 *
 * Run:  cd lib && npm run build && cd .. && node lexicon/validate.mjs
 *
 * Note: `particles` and `postpositions` are parity-only references. They are NOT round-tripped,
 * because some forms (e.g. kēruṁ, ōṁ) use Tier-1 vowels ē/ō that the Simplified codec does not
 * encode. This is a deliberate, documented exclusion — see lexicon/README.md.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (rel) => fileURLToPath(new URL(rel, import.meta.url));

let lib;
try {
  lib = await import(new URL("../lib/dist/src/index.js", import.meta.url).href);
} catch (e) {
  console.error("✗ Cannot load compiled library at lib/dist/src/index.js");
  console.error("  Build it first:  cd lib && npm run build   (" + e.message + ")");
  process.exit(2);
}

const { iastToCodepoints, codepointsToIast, analyze, VERB_ROOTS, NOUN_STEMS, PRONOUNS, PARTICLES, POSTP } = lib;
const lex = JSON.parse(readFileSync(here("./sd-lexicon.json"), "utf8"));

const nfc = (s) => s.normalize("NFC");
const errors = [];
const fail = (contract, form, detail) => errors.push(`[${contract}] form="${form}": ${detail}`);

// ---------- Contract 1: round-trip (analyze parses + lossless IAST) ----------
const lexicalEntries = [
  ...lex.roots.map((r) => ({ form: r.form, analyze: true })),
  ...lex.stems.map((s) => ({ form: s.form, analyze: true })),
  ...lex.pronouns.map((p) => ({ form: p.form, analyze: true })),
  ...lex.coinages.map((c) => ({ form: c.form, analyze: true })),
  ...lex.coinages.map((c) => ({ form: c.sd, analyze: false })), // saṁjñā-marked; round-trip only
];
for (const { form, analyze: doAnalyze } of lexicalEntries) {
  if (doAnalyze && analyze(form) == null) fail("round-trip", form, "analyze() returned no parse");
  let back;
  try {
    back = codepointsToIast(iastToCodepoints(form));
  } catch (e) {
    fail("round-trip", form, "codec threw: " + e.message);
    continue;
  }
  if (nfc(back) !== nfc(form)) fail("round-trip", form, `not lossless → "${back}"`);
}

// ---------- Contract 2: FST recognition (analyze(form).gloss === derivation) ----------
for (const c of lex.coinages) {
  const parse = analyze(c.form);
  if (!parse) { fail("fst-recognition", c.form, `${c.term}: does not parse`); continue; }
  if (parse.gloss !== c.derivation)
    fail("fst-recognition", c.form, `${c.term}: gloss "${parse.gloss}" ≠ derivation "${c.derivation}"`);
}
// bonus: pronoun glosses must match the analyzer
for (const p of lex.pronouns) {
  const parse = analyze(p.form);
  if (!parse || parse.gloss !== p.gloss)
    fail("fst-recognition", p.form, `pronoun gloss "${parse?.gloss}" ≠ "${p.gloss}"`);
}

// ---------- Contract 3: parity (lexicon sets === code closed sets) ----------
const setEq = (label, jsonForms, codeForms) => {
  const j = [...new Set(jsonForms.map(nfc))].sort();
  const c = [...new Set(codeForms.map(nfc))].sort();
  if (JSON.stringify(j) === JSON.stringify(c)) return;
  const js = new Set(j), cs = new Set(c);
  const missing = c.filter((x) => !js.has(x)); // in code, absent from lexicon
  const extra = j.filter((x) => !cs.has(x)); // in lexicon, absent from code
  if (missing.length) errors.push(`[parity] ${label}: missing from lexicon: ${missing.join(", ")}`);
  if (extra.length) errors.push(`[parity] ${label}: extra in lexicon: ${extra.join(", ")}`);
};
setEq("VERB_ROOTS", lex.roots.map((r) => r.form), [...VERB_ROOTS]);
setEq("NOUN_STEMS", lex.stems.map((s) => s.form), [...NOUN_STEMS]);
setEq("PRONOUNS", lex.pronouns.map((p) => p.form), [...PRONOUNS]);
setEq("PARTICLES", lex.particles.map((p) => p.form), [...PARTICLES]);
setEq("POSTP", lex.postpositions.map((p) => p.form), Object.keys(POSTP));

// ---------- Report ----------
if (errors.length) {
  console.error(`✗ lexicon: FAILED — ${errors.length} error(s)`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(
  "✓ lexicon: all three contracts pass\n" +
    `  round-trip      : ${lex.roots.length} roots + ${lex.stems.length} stems + ${lex.pronouns.length} pronouns + ${lex.coinages.length} coinages (lossless + analyzable)\n` +
    `  fst-recognition : ${lex.coinages.length} coinage derivations + ${lex.pronouns.length} pronoun glosses match analyze()\n` +
    `  parity          : verb-roots/noun-stems/pronouns/particles/postpositions == fst.ts closed sets`
);
