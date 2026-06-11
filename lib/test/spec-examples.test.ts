/**
 * Test suite = the specs' worked examples, verbatim.
 * SD-unified-script-v1.md §5 mini-examples + §7; SD-language-design-v1.md §12.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { iastToCodepoints, codepointsToIast, asciiToIast } from "../src/translit.js";
import { analyze, generateVerb, generateNoun } from "../src/fst.js";
import { tokenize, checkSentence } from "../src/parser.js";

const cps = (s: string) => iastToCodepoints(s);
const hex = (a: number[]) => a.filter((c) => c > 0xff).map((c) => c.toString(16).toUpperCase());
const roundtrip = (s: string) => codepointsToIast(iastToCodepoints(s));

// ---------- SD‑1 §5 mini-examples ----------
test("SD-1 §5: akṣara mechanics", () => {
  assert.deepEqual(hex(cps("ta")), ["E02F"]);
  assert.deepEqual(hex(cps("ti")), ["E02F", "E012"]);
  assert.deepEqual(hex(cps("tā")), ["E02F", "E011"]);
  assert.deepEqual(hex(cps("t")), ["E02F", "E050"]);
  assert.deepEqual(hex(cps("tva")), ["E02F", "E050", "E03C"]);
  assert.deepEqual(hex(cps("kṣi")), ["E020", "E050", "E03E", "E012"]);
  assert.deepEqual(hex(cps("oṁ")), ["E009", "E051"]);
});

// ---------- SD‑1 §7.1: tat tvam asi {C} ----------
test("SD-1 §7.1: Mahāvākya codepoints", () => {
  assert.deepEqual(hex(cps("tat tvam asi {C}")), [
    "E02F", "E02F", "E050", // tat
    "E02F", "E050", "E03C", "E038", "E050", // tvam
    "E000", "E03F", "E012", // asi
    "E06F", // {C}
  ]);
  assert.equal(roundtrip("tat tvam asi {C}"), "tat tvam asi {C}");
});

// ---------- SD‑1 §7.2: SD-native exercises ----------
test("SD-1 §7.2: śanuma", () => {
  assert.deepEqual(hex(cps("śanuma")), ["E03D", "E033", "E014", "E038"]);
  assert.equal(roundtrip("śanuma"), "śanuma");
});

// ---------- Design spec §12.1: preview line (r1: asrasi) ----------
test("§12.1 preview: tva ta asrasi {C}", () => {
  assert.deepEqual(hex(cps("tva ta asrasi {C}")), [
    "E02F", "E050", "E03C", // tva
    "E02F", // ta
    "E000", "E03F", "E050", "E03A", "E03F", "E012", // a·s(vir)·ra·si
    "E06F",
  ]);
  const p = analyze("asrasi");
  assert.equal(p?.kind, "verb");
  assert.equal((p as any).gloss, "as·PRES·2sg");
});

// ---------- Design spec §12.2: plain sentence ----------
test("§12.2: śanuma vadruṁ-ai janrati\\", () => {
  const line = "śanuma vadruṁ-ai janrati\\";
  assert.deepEqual(hex(cps(line)), [
    "E03D", "E033", "E014", "E038", // śanuma
    "E03C", "E031", "E050", "E03A", "E014", "E051", // vadruṁ  (hyphen passes through)
    "E008", // -ai (independent ai after hyphen)
    "E027", "E033", "E050", "E03A", "E02F", "E012", // janrati
    "E061", // falling tone
  ]);
  assert.equal(roundtrip(line), line);

  const check = checkSentence(tokenize(line));
  assert.ok(check.ok, check.notes.join("; "));
  assert.equal(check.glossLine, "śanuma vadruṁ·ACC jan·PRES·3sg \\");
});

// ---------- Design spec §12.3: scientific statement ----------
test("§12.3: coinage parse-back + islands", () => {
  assert.equal((analyze("gati-vat") as any)?.gloss, "gati·RATE");
  assert.equal((analyze("gati-vat-vat") as any)?.gloss, "gati·RATE·RATE");
  assert.equal((analyze("sthā-naṁ-bhid-ma") as any)?.gloss, "sthā·LOC.NMLZ-bhid·ABSTR");
  assert.equal((analyze("vidyut-aṇu") as any)?.gloss, "vidyut·PARTICLE");
  assert.equal((analyze("vikīr-tva") as any)?.gloss, "vikīr·PROP");
  assert.equal((analyze("tāpa-aṅka") as any)?.gloss, "tāpa·MEASURE");

  const line = "^gati-vat [[v]] kāla-prati sthā-naṁ-bhid-ma asrati.";
  const check = checkSentence(tokenize(line));
  assert.ok(check.ok, check.notes.join("; "));
  assert.equal(roundtrip("^gati-vat [[v = s/t]] [[m/s]]"), "^gati-vat [[v = s/t]] [[m/s]]");
});

// ---------- Design spec §12.4: absorption demos ----------
test("§12.4: tamiḻ / cā= / dakʼ", () => {
  assert.deepEqual(hex(cps("tamiḻ")), ["E02F", "E038", "E012", "E087", "E050"]);
  assert.deepEqual(hex(cps("cā=")), ["E025", "E011", "E063"]);
  assert.deepEqual(hex(cps("dakʼ")), ["E031", "E020", "E050", "E08E", "E050"]);
  for (const w of ["tamiḻ", "cā=", "dakʼ"]) assert.equal(roundtrip(w), w);
  // ASCII aliases (§3.6): zh, =, q
  assert.equal(asciiToIast("tamizh"), "tamiḻ");
  assert.equal(asciiToIast("dakq"), "dakʼ");
});

// ---------- Design spec §12.5: Hymn 53 (r1 sound proof) ----------
test("§12.5: Hymn 53 line — analyzability + SOV per clause", () => {
  const line = "yo ātmā-ai janrati, so naśrati illa\\ {C}";
  assert.equal(roundtrip(line), line);
  // clause 2 exercises NEG-after-verb
  const c2 = checkSentence(tokenize("so naśrati illa\\"));
  assert.ok(c2.ok, c2.notes.join("; "));
  assert.equal((analyze("naśrati") as any)?.gloss, "naś·PRES·3sg");
  assert.equal((analyze("ātmā-ai") as any)?.gloss, "ātmā·ACC");
});

// ---------- FST paradigms (§4.1 r1) ----------
test("§4.1: full paradigm generation + analysis round-trip", () => {
  const persons = ["mi", "si", "ti", "mina", "sina", "tina"] as const;
  const aspects = ["ra", "ma", "ṇa", "viya", "tila"] as const;
  for (const a of aspects) for (const p of persons) {
    const w = generateVerb("jan", a, p);
    const parse = analyze(w);
    assert.equal(parse?.kind, "verb", `failed on ${w}`);
  }
  assert.equal(generateVerb("jan", "ra", "ti", "lā"), "janratilā");
  assert.equal((analyze("janratilā") as any)?.gloss, "jan·PRES·3sg·MAYBE");
  assert.equal((analyze("darśviyasina") as any)?.gloss, "darś·FUT·2pl");
});

test("§4.2–4.3: noun template", () => {
  assert.equal(generateNoun("śanuma", { plural: true, case_: "in" }), "śanuma-gaṇ-in");
  assert.equal((analyze("śanuma-gaṇ-in") as any)?.gloss, "śanuma·PL·GEN");
  for (const c of ["ai", "āl", "tas", "in", "il", "ne"])
    assert.equal((analyze(`jolma-${c}`) as any)?.kind, "noun", `case -${c}`);
});

// ---------- Slot-collision regression (§4.6 note) ----------
test("§4.6: 'ma' past-aspect vs 'ma' abstract-DERIV resolved by slot", () => {
  assert.equal((analyze("janmati") as any)?.gloss, "jan·PAST·3sg"); // verb reading
  assert.equal((analyze("jan-ma") as any)?.gloss, "jan·ABSTR");     // noun reading (hyphenated derivation)
});

// ---------- Error handling ----------
test("rejects invalid input per SD-1 §8.4", () => {
  assert.throws(() => iastToCodepoints("hello x@y"));
  assert.throws(() => iastToCodepoints("[[unterminated"));
});
