/**
 * SD tokenizer + minimal clause parser.
 * Source of truth: SD-language-design-v1.md §5 (tokenization spec §5.4, EBNF §5.2 subset).
 * Phase-1 scope: deterministic tokenization, per-word morphological classification,
 * sentence/Grantha-unit segmentation, gloss line. Full EBNF parse is Phase-1.5.
 */
import { analyze, Parse } from "./fst.js";

export type TokenType = "word" | "island" | "closure" | "tone" | "punct" | "samjna";
export interface Token { type: TokenType; text: string }

const TONE_CHARS = new Set(["/", "\\", ":", "=", "`"]);

export function tokenize(input: string): Token[] {
  const s = input.normalize("NFC");
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === " " || ch === "\n" || ch === "\t") { i++; continue; }
    if (s.startsWith("{C}", i)) { tokens.push({ type: "closure", text: "{C}" }); i += 3; continue; }
    if (s.startsWith("[[", i)) {
      const end = s.indexOf("]]", i);
      if (end === -1) throw new Error("Unterminated notation island");
      tokens.push({ type: "island", text: s.slice(i, end + 2) }); i = end + 2; continue;
    }
    if (ch === "^") { tokens.push({ type: "samjna", text: "^" }); i++; continue; }
    if (TONE_CHARS.has(ch)) { tokens.push({ type: "tone", text: ch }); i++; continue; }
    if (",.?!|—()".includes(ch)) { tokens.push({ type: "punct", text: ch }); i++; continue; }
    // word: run of IAST letters + hyphens + apostrophes/signs
    let j = i;
    while (j < s.length && !" \n\t,.?!|—()^".includes(s[j]) && !TONE_CHARS.has(s[j]) && !s.startsWith("{C}", j) && !s.startsWith("[[", j)) j++;
    tokens.push({ type: "word", text: s.slice(i, j) }); i = j;
  }
  return tokens;
}

export interface GlossedToken extends Token { parse?: Parse | null; technical?: boolean }

/** Classify every word via the FST; attach ^ to the following word as `technical`. */
export function gloss(tokens: Token[]): GlossedToken[] {
  const out: GlossedToken[] = [];
  let samjnaPending = false;
  for (const t of tokens) {
    if (t.type === "samjna") { samjnaPending = true; continue; }
    const g: GlossedToken = { ...t };
    if (t.type === "word") {
      g.parse = analyze(t.text);
      if (samjnaPending) g.technical = true;
    }
    samjnaPending = false;
    out.push(g);
  }
  return out;
}

export interface SentenceCheck {
  ok: boolean;
  notes: string[];
  glossLine: string;
}

/**
 * Minimal SOV well-formedness check on one sentence's tokens:
 *  - exactly one finite verb (or copula), in final position among words
 *    (modulo trailing NEG `illa`, tones, punctuation, closure);
 *  - every word analyzable.
 */
export function checkSentence(tokens: Token[]): SentenceCheck {
  const g = gloss(tokens);
  const notes: string[] = [];
  const words = g.filter((t) => t.type === "word");
  const unparsed = words.filter((w) => !w.parse);
  for (const u of unparsed) notes.push(`unanalyzable word: ${u.text}`);

  const verbs = words.filter((w) => w.parse?.kind === "verb");
  if (verbs.length !== 1) notes.push(`expected exactly 1 finite verb, found ${verbs.length}`);
  else {
    // verb must be last word, allowing a following NEG particle 'illa'
    const idx = words.indexOf(verbs[0]);
    const after = words.slice(idx + 1).map((w) => w.text);
    if (!(after.length === 0 || (after.length === 1 && after[0] === "illa")))
      notes.push(`SOV violation: material after the verb: ${after.join(" ")}`);
  }

  const glossLine = g
    .map((t) => {
      if (t.type !== "word") return t.text;
      const p = t.parse;
      const core = p ? ("gloss" in p ? p.gloss : t.text) : `?${t.text}?`;
      return (t.technical ? "^" : "") + core;
    })
    .join(" ");
  return { ok: notes.length === 0, notes, glossLine };
}

/** Split a token stream into Grantha units / sentences at {C}, '|', or '.' boundaries. */
export function sentences(tokens: Token[]): Token[][] {
  const out: Token[][] = [];
  let cur: Token[] = [];
  for (const t of tokens) {
    cur.push(t);
    if (t.type === "closure" || (t.type === "punct" && (t.text === "|" || t.text === "."))) {
      out.push(cur); cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
}
