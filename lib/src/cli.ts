/** Tiny CLI: `node dist/src/cli.js "<ascii or IAST line>"` → IAST, codepoints, gloss. */
import { asciiToIast, iastToCodepoints, codepointsToIast, formatCps } from "./translit.js";
import { tokenize, checkSentence } from "./parser.js";

const input = process.argv.slice(2).join(" ");
if (!input) { console.log("usage: sd-cli <text>"); process.exit(1); }
const iast = asciiToIast(input);
const cps = iastToCodepoints(iast);
console.log("IAST      :", iast);
console.log("codepoints:", formatCps(cps));
console.log("round-trip:", codepointsToIast(cps) === iast ? "OK (lossless)" : "FAILED");
const check = checkSentence(tokenize(iast));
console.log("gloss     :", check.glossLine);
if (!check.ok) console.log("notes     :", check.notes.join("; "));
