import assert from "node:assert/strict";
import { codepointsToIast, iastToCodepoints } from "../../lib/dist/src/index.js";

const sentence = "tat tvam asi {C}";
const expected = [
  0xe02f, 0xe02f, 0xe050, 0x20,
  0xe02f, 0xe050, 0xe03c, 0xe038, 0xe050, 0x20,
  0xe000, 0xe03f, 0xe012, 0x20, 0xe06f,
];
const actual = iastToCodepoints(sentence);
assert.deepEqual(actual, expected, "the proof sentence changed its canonical codepoint sequence");
assert.equal(codepointsToIast(actual), sentence, "the proof sentence must round-trip losslessly");
console.log("proof sentence transliteration: OK");
