/**
 * SD‑1 transliteration library.
 * Contract: SD-unified-script-v1.md §8.4, extended per SD-language-design-v1.md §3.6.
 * Canonical = IAST (UTF-8, NFC). PUA codepoints are render-layer only.
 * Guarantee: total + injective on valid IAST(-extended); lossless round-trip.
 */

// ---------- Codepoint tables (SD‑1 §4 + design spec §3.4) ----------

export const INDEP_VOWELS: Record<string, number> = {
  a: 0xe000, "ā": 0xe001, i: 0xe002, "ī": 0xe003, u: 0xe004, "ū": 0xe005,
  "ṛ": 0xe006, e: 0xe007, ai: 0xe008, o: 0xe009, au: 0xe00a,
};

export const MATRAS: Record<string, number> = {
  "ā": 0xe011, i: 0xe012, "ī": 0xe013, u: 0xe014, "ū": 0xe015,
  "ṛ": 0xe016, e: 0xe017, ai: 0xe018, o: 0xe019, au: 0xe01a,
  // 'a' is inherent: no mātrā.
};

export const CONSONANTS: Record<string, number> = {
  k: 0xe020, kh: 0xe021, g: 0xe022, gh: 0xe023, "ṅ": 0xe024,
  c: 0xe025, ch: 0xe026, j: 0xe027, jh: 0xe028, "ñ": 0xe029,
  "ṭ": 0xe02a, "ṭh": 0xe02b, "ḍ": 0xe02c, "ḍh": 0xe02d, "ṇ": 0xe02e,
  t: 0xe02f, th: 0xe030, d: 0xe031, dh: 0xe032, n: 0xe033,
  p: 0xe034, ph: 0xe035, b: 0xe036, bh: 0xe037, m: 0xe038,
  y: 0xe039, r: 0xe03a, l: 0xe03b, v: 0xe03c,
  "ś": 0xe03d, "ṣ": 0xe03e, s: 0xe03f, h: 0xe040,
  // Tier-1 pan-Indian extension (design spec §3.4)
  "ḻ": 0xe087, "ṟ": 0xe088, "ṉ": 0xe089, "ṯ": 0xe08a, "ḏ": 0xe08b,
  "ʼ": 0xe08e, // glottal stop (U+02BC modifier letter apostrophe)
  "ḷ": 0xe085, // retroflex lateral (SD‑1 extension tier, promoted)
};

export const VIRAMA = 0xe050;
export const SIGNS: Record<string, number> = {
  "ṁ": 0xe051, "ḥ": 0xe052, "'": 0xe053, "m̐": 0xe054,
};

/** Trailing tone markers on a syllable's vowel (canonical ASCII-safe). */
export const TONES: Record<string, number> = {
  "/": 0xe060, // rising
  "\\": 0xe061, // falling
  ":": 0xe062, // chant extension
  "=": 0xe063, // high level (design spec)
  "`": 0xe064, // low level (design spec; alias revised r2 — see errata)
};

export const SAMJNA = 0xe065; // '^' technical-sense mark (prefix)
export const CLOSURE = 0xe06f; // '{C}' saṁpūrṇa-mudrā
export const DIGIT_BASE = 0xe070; // '0'-'9' → E070–E079 (render layer)

// Tier-1 vowel machinery (design spec §3.2): combining marks
export const SHORTNESS_TICK = 0xe08c; // ĕ = e+tick, ŏ = o+tick
export const CENTRAL_DOT = 0xe08d; // ï = i+dot (sign value; independent = carrier composition)
export const CREAKY = 0xe08f; // ◌̰ (combining U+0330)
export const BREATHY = 0xe090; // ◌̤ (combining U+0324)

// ---------- ASCII (ITRANS-style) → IAST normalisation (SD‑1 App. A + §3.6) ----------

const ASCII_MAP: [string, string][] = [
  // longest first
  ["nn2", "ṉ"], ["tt2", "ṯ"], ["dd2", "dd2_PLACEHOLDER"], // dd2 handled below to avoid clash with 'd'+'d2'
  ["{C}", "{C}"],
  ["aa", "ā"], ["ii", "ī"], ["uu", "ū"], [".r", "ṛ"],
  ["~N", "ṅ"], ["~n", "ñ"], ["Ch", "ch"],
  ["Th", "ṭh"], ["Dh", "ḍh"], ["sh", "ś"], ["Sh", "ṣ"],
  ["zh", "ḻ"], ["rr", "ṟ"], ["e2", "ĕ"], ["o2", "ŏ"], ["i2", "ï"],
  [".~", "̰"], [".:", "̤"],
  ["A", "ā"], ["I", "ī"], ["U", "ū"], ["R", "ṛ"],
  ["G", "ṅ"], ["J", "ñ"], ["T", "ṭ"], ["D", "ḍ"], ["N", "ṇ"],
  ["z", "ś"], ["S", "ṣ"], ["M", "ṁ"], ["H", "ḥ"], ["~", "m̐"],
  ["L", "ḷ"], ["q", "ʼ"],
];

/** Normalise ASCII/ITRANS input to canonical IAST. Pure-IAST input passes through. */
export function asciiToIast(input: string): string {
  let s = input;
  // dd2 first as a unit (ḏ), before single-char rules could touch it
  s = s.split("dd2").join("ḏ");
  for (const [from, to] of ASCII_MAP) {
    if (from === "dd2") continue;
    if (to === "dd2_PLACEHOLDER") continue;
    s = s.split(from).join(to);
  }
  return s.normalize("NFC");
}

// ---------- IAST → codepoints ----------

/** Multigraph-safe unit lists, longest-first for maximal munch. */
const VOWEL_UNITS = ["ai", "au", "ā", "ī", "ū", "ṛ", "ĕ", "ŏ", "ï", "a", "i", "u", "e", "o"];
const CONS_UNITS = Object.keys(CONSONANTS).sort((x, y) => y.length - x.length);
const TONE_CHARS = Object.keys(TONES);
const PHONATION: Record<string, number> = { "\u0330": CREAKY, "\u0324": BREATHY };

/** Pass-through characters preserved verbatim in the codepoint stream (losslessness). */
const PASSTHRU = new Set([" ", "-", "|", ".", ",", "?", "!", "(", ")", "—", "\n", "\t", '"', "“", "”"]);

export type CP = number; // PUA codepoint, or the UTF-16 code of a pass-through char

function emitVowel(out: CP[], v: string, independent: boolean): void {
  // ĕ/ŏ/ï decompose to base vowel + combining tick/dot (one codepoint each, §3.2)
  let base = v, extra: CP | null = null;
  if (v === "ĕ") { base = "e"; extra = SHORTNESS_TICK; }
  if (v === "ŏ") { base = "o"; extra = SHORTNESS_TICK; }
  if (v === "ï") { base = "i"; extra = CENTRAL_DOT; }
  if (independent) out.push(INDEP_VOWELS[base]);
  else if (base !== "a") out.push(MATRAS[base]);
  // independent 'a' = E000; mātrā 'a' = nothing (inherent)
  if (extra !== null) out.push(extra);
}

/**
 * IAST (canonical, NFC) → ordered SD‑1 codepoints.
 * Rejects characters outside the IAST(-extended) + reserved-token set.
 */
export function iastToCodepoints(input: string): CP[] {
  const s = input.normalize("NFC");
  const out: CP[] = [];
  let i = 0;
  let prevWasConsonant = false; // pending inherent-/a/ or virāma decision

  const flushVirama = () => { if (prevWasConsonant) { out.push(VIRAMA); prevWasConsonant = false; } };

  while (i < s.length) {
    // reserved tokens
    if (s.startsWith("{C}", i)) { flushVirama(); out.push(CLOSURE); i += 3; continue; }
    if (s.startsWith("[[", i)) { // notation island: atomic pass-through
      flushVirama();
      const end = s.indexOf("]]", i);
      if (end === -1) throw new Error(`Unterminated notation island at ${i}`);
      for (const ch of s.slice(i, end + 2)) out.push(ch.codePointAt(0)!);
      i = end + 2; continue;
    }
    if (s[i] === "^") { flushVirama(); out.push(SAMJNA); i += 1; continue; }

    // signs (after vowel or bare): ṁ ḥ ' m̐  — m̐ is m + U+0310; check first
    if (s.startsWith("m̐", i)) { flushVirama(); out.push(SIGNS["m̐"]); i += 2; continue; }
    if (s[i] === "ṁ" || s[i] === "ḥ" || s[i] === "'") {
      flushVirama(); out.push(SIGNS[s[i]]); i += 1; continue;
    }

    // tones
    if (TONE_CHARS.includes(s[i])) {
      // a comma is low-tone only per revised alias '`'; ',' here is punctuation pass-through
      flushVirama(); out.push(TONES[s[i]]); i += 1; continue;
    }

    // phonation combining marks
    if (PHONATION[s[i]] !== undefined) { out.push(PHONATION[s[i]]); i += 1; continue; }

    // digits: canonical ASCII; emit render-layer SD digit codepoint
    if (s[i] >= "0" && s[i] <= "9") {
      flushVirama(); out.push(DIGIT_BASE + (s.charCodeAt(i) - 48)); i += 1; continue;
    }

    // consonants (maximal munch)
    let matched = false;
    for (const c of CONS_UNITS) {
      if (s.startsWith(c, i)) {
        flushVirama(); // previous consonant had no vowel → virāma
        out.push(CONSONANTS[c]);
        prevWasConsonant = true;
        i += c.length; matched = true; break;
      }
    }
    if (matched) continue;

    // vowels
    for (const v of VOWEL_UNITS) {
      if (s.startsWith(v, i)) {
        if (prevWasConsonant) { emitVowel(out, v, false); prevWasConsonant = false; }
        else emitVowel(out, v, true);
        i += v.length; matched = true; break;
      }
    }
    if (matched) continue;

    // pass-through
    if (PASSTHRU.has(s[i])) { flushVirama(); out.push(s.codePointAt(i)!); i += 1; continue; }

    throw new Error(`Invalid character ${JSON.stringify(s[i])} at index ${i} — outside IAST + reserved-token set`);
  }
  flushVirama();
  return out;
}

// ---------- codepoints → IAST (lossless inverse) ----------

const REV_INDEP = invert(INDEP_VOWELS);
const REV_MATRA = invert(MATRAS);
const REV_CONS = invert(CONSONANTS);
const REV_SIGNS = invert(SIGNS);
const REV_TONES = invert(TONES);

function invert(m: Record<string, number>): Map<number, string> {
  const r = new Map<number, string>();
  for (const [k, v] of Object.entries(m)) r.set(v, k);
  return r;
}

export function codepointsToIast(cps: CP[]): string {
  let out = "";
  let pendingConsonant: string | null = null; // consonant awaiting vowel/virāma decision

  const flush = (withA: boolean) => {
    if (pendingConsonant !== null) { out += pendingConsonant + (withA ? "a" : ""); pendingConsonant = null; }
  };

  for (let i = 0; i < cps.length; i++) {
    const cp = cps[i];
    if (cp === CLOSURE) { flush(true); out += "{C}"; continue; }
    if (cp === SAMJNA) { flush(true); out += "^"; continue; }
    if (cp === VIRAMA) { flush(false); continue; }
    if (cp === SHORTNESS_TICK) { out = out.replace(/e$/, "ĕ").replace(/o$/, "ŏ"); continue; }
    if (cp === CENTRAL_DOT) { out = out.replace(/i$/, "ï"); continue; }
    if (cp === CREAKY) { out += "\u0330"; continue; }
    if (cp === BREATHY) { out += "\u0324"; continue; }
    if (cp >= DIGIT_BASE && cp <= DIGIT_BASE + 9) { flush(true); out += String(cp - DIGIT_BASE); continue; }
    if (REV_SIGNS.has(cp)) { flush(true); out += REV_SIGNS.get(cp)!; continue; }
    if (REV_TONES.has(cp)) { flush(true); out += REV_TONES.get(cp)!; continue; }
    if (REV_CONS.has(cp)) { flush(true); pendingConsonant = REV_CONS.get(cp)!; continue; }
    if (REV_MATRA.has(cp)) {
      if (pendingConsonant === null) throw new Error(`Mātrā ${cp.toString(16)} with no consonant at ${i}`);
      out += pendingConsonant + REV_MATRA.get(cp)!; pendingConsonant = null; continue;
    }
    if (REV_INDEP.has(cp)) { flush(true); out += REV_INDEP.get(cp)!; continue; }
    // pass-through (space, hyphen, punctuation, island content)
    flush(true); out += String.fromCodePoint(cp);
  }
  flush(true);
  return out.normalize("NFC");
}

/** Pretty-print a codepoint stream for specs/tests: `E02F E050 · E03C ␣ ...` */
export function formatCps(cps: CP[]): string {
  return cps.map((c) => (c === 0x20 ? "␣" : c >= 0xe000 && c <= 0xe8ff ? c.toString(16).toUpperCase().padStart(4, "0").replace(/^/, "E").replace(/^EE/, "E") : JSON.stringify(String.fromCodePoint(c)))).join(" ");
}
