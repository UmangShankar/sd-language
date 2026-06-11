/**
 * SD morphology — finite-state analyzer + generator.
 * Source of truth: SD-language-design-v1.md §4 (r1-ratified forms).
 * No sandhi → plain concatenation machine over closed sets; deterministic.
 */

// ---------- Closed sets (spec §4.6, r1) ----------

export const VERB_ROOTS = new Set([
  "jan", "darś", "vad", "as", "gam", "kṛ", "dā", "labh", "paś", "śru",
  "man", "kalp", "mā", "gan", "yuj", "bhid", "vṛt", "tap", "vah", "sthā", "naś",
]);

export const NOUN_STEMS = new Set([
  "śanuma", "vadruṁ", "trahya", "jolma", "śavaka", "tavṛṁ", "grūta", "nivraṁ",
  "bhalu", "vasram", "sārā", "asārā", "viyāna", "kāla", "gati", "taraṅga",
  "vidyut", "ūrjā", "aṅka", "aṇu", "bindu", "rekha", "saṅkhyā", "ātmā",
  "tāpa", "kṣaṇa", "dīrgha", "vikīr",
]);

export const PRONOUNS = new Set(["ma", "tva", "sa", "ta", "i"]);
export const PARTICLES = new Set([
  "ca", "vā", "illa", "yad", "tad", "yo", "so",
  "ka", "kāya", "kēruṁ", "vāḷa", "ṭhēla", // question particles
  "aiyo", "āṇi", "ēla", "bhaṛa",          // emotive
  "ṭṛṣa", "vāmā", "ōṁ", "oṁ",             // refrains
  "anupāta", "prati", "sama", "tas-mā",
]);

export const ASPECT: Record<string, string> = { ra: "PRES", ma: "PAST", "ṇa": "HAB", viya: "FUT", tila: "CERT" };
export const PERSON: Record<string, string> = { mi: "1sg", si: "2sg", ti: "3sg", mina: "1pl", sina: "2pl", tina: "3pl" };
export const MODAL: Record<string, string> = { "lā": "MAYBE", "naḍ": "MUST", "zā": "HOPE", "meṁ": "BELIEF" }; // -viya modal deleted r1
export const DERIV: Record<string, string> = { ma: "ABSTR", ka: "AGENT", la: "GUIDE", "uṁ": "SACRED", "naṁ": "LOC.NMLZ" };
export const TECH: Record<string, string> = { vat: "RATE", "aṅka": "MEASURE", "aṇu": "PARTICLE", tva: "PROP" };
export const CASE: Record<string, string> = { ai: "ACC", "āl": "INS", tas: "ABL", in: "GEN", il: "LOC", ne: "ERG" };
export const POSTP: Record<string, string> = { prati: "PER" }; // §8.4 hyphen-attached postpositions
export const PLURAL = "gaṇ";

const byLenDesc = (o: Record<string, string>) => Object.keys(o).sort((a, b) => b.length - a.length);

// ---------- Types ----------

export interface VerbParse {
  kind: "verb"; root: string; deriv: string[]; aspect: string; person: string; modal?: string;
  gloss: string;
}
export interface NounParse {
  kind: "noun"; members: { stem: string; suffixes: string[] }[]; plural: boolean; case_?: string;
  gloss: string;
}
export interface WordParse { kind: "pronoun" | "particle"; form: string; gloss: string }
export type Parse = VerbParse | NounParse | WordParse;

// ---------- Generator ----------

export function generateVerb(root: string, aspect: keyof typeof ASPECT, person: keyof typeof PERSON, modal?: keyof typeof MODAL): string {
  if (!VERB_ROOTS.has(root)) throw new Error(`Unknown verb root: ${root}`);
  return root + aspect + person + (modal ?? "");
}

export function generateNoun(stem: string, opts: { plural?: boolean; case_?: keyof typeof CASE } = {}): string {
  let w = stem;
  if (opts.plural) w += "-" + PLURAL;
  if (opts.case_) w += "-" + opts.case_;
  return w;
}

// ---------- Analyzer ----------

function stemAnalysis(seg: string): { stem: string; suffixes: string[] } | null {
  // a member = ROOT|STEM followed by (DERIV|TECH)* — written solid or hyphen-attached
  if (NOUN_STEMS.has(seg) || VERB_ROOTS.has(seg)) return { stem: seg, suffixes: [] };
  for (const sfxSet of [DERIV, TECH]) {
    for (const sfx of byLenDesc(sfxSet)) {
      if (seg.endsWith(sfx) && seg.length > sfx.length) {
        const inner = stemAnalysis(seg.slice(0, seg.length - sfx.length));
        if (inner) return { stem: inner.stem, suffixes: [...inner.suffixes, sfxSet[sfx]] };
      }
    }
  }
  return null;
}

function tryVerb(word: string): VerbParse | null {
  // VERB = ROOT (DERIV|TECH)* ASPECT PERSON (MODAL)?   — solid in canonical text
  const modals = byLenDesc(MODAL);
  const candidates: { rest: string; modal?: string }[] = [{ rest: word }];
  for (const m of modals) if (word.endsWith(m)) candidates.push({ rest: word.slice(0, -m.length), modal: MODAL[m] });

  for (const { rest, modal } of candidates) {
    for (const p of byLenDesc(PERSON)) {
      if (!rest.endsWith(p)) continue;
      const r1 = rest.slice(0, -p.length);
      for (const a of byLenDesc(ASPECT)) {
        if (!r1.endsWith(a)) continue;
        const stemPart = r1.slice(0, -a.length);
        const sa = stemAnalysis(stemPart);
        if (sa && VERB_ROOTS.has(sa.stem)) {
          const gloss = [sa.stem, ...sa.suffixes, ASPECT[a], PERSON[p], ...(modal ? [modal] : [])].join("·");
          return { kind: "verb", root: sa.stem, deriv: sa.suffixes, aspect: ASPECT[a], person: PERSON[p], modal, gloss };
        }
      }
    }
  }
  return null;
}

function tryNoun(word: string): NounParse | null {
  // hyphen-split; greedy member grouping (§7.3 + spec analyzer note):
  // a segment that is a known suffix attaches to the current member, else starts a new one.
  const segs = word.split("-");
  let case_: string | undefined;
  let plural = false;
  let postp: string | undefined;

  // strip trailing postposition (§8.4): kāla-prati "per time"
  if (segs.length > 1 && POSTP[segs[segs.length - 1]] !== undefined) {
    postp = POSTP[segs.pop()!];
  }

  // strip trailing case, then plural (each its own hyphen segment per the normalizer; accept solid too)
  const last = segs[segs.length - 1];
  if (CASE[last] !== undefined && segs.length > 1) { case_ = CASE[last]; segs.pop(); }
  else {
    for (const c of byLenDesc(CASE)) {
      const l = segs[segs.length - 1];
      if (l.endsWith(c) && l.length > c.length && (NOUN_STEMS.has(l.slice(0, -c.length)) || stemAnalysis(l.slice(0, -c.length)))) {
        case_ = CASE[c]; segs[segs.length - 1] = l.slice(0, -c.length); break;
      }
    }
  }
  if (segs[segs.length - 1] === PLURAL && segs.length > 1) { plural = true; segs.pop(); }

  const members: { stem: string; suffixes: string[] }[] = [];
  for (const seg of segs) {
    const asSuffix = DERIV[seg] ?? TECH[seg];
    if (asSuffix !== undefined && members.length > 0) {
      members[members.length - 1].suffixes.push(asSuffix);
      continue;
    }
    const sa = stemAnalysis(seg);
    if (!sa) return null;
    members.push(sa);
  }
  if (members.length === 0) return null;
  const gloss =
    members.map((m) => [m.stem, ...m.suffixes].join("·")).join("-") +
    (plural ? "·PL" : "") + (case_ ? "·" + case_ : "") + (postp ? "·" + postp : "");
  return { kind: "noun", members, plural, case_, gloss };
}

/** Analyze one canonical word (no surrounding tones/punctuation). Deterministic per spec. */
export function analyze(word: string): Parse | null {
  const w = word.normalize("NFC");
  if (PRONOUNS.has(w)) return { kind: "pronoun", form: w, gloss: { ma: "1", tva: "2", sa: "3.AN", ta: "DEM/3.INAN", i: "PROX" }[w]! };
  if (PARTICLES.has(w)) return { kind: "particle", form: w, gloss: w.toUpperCase() };
  return tryVerb(w) ?? tryNoun(w);
}
