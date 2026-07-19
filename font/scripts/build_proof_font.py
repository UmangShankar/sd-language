#!/usr/bin/env python3
"""Build the provisional SD-1 core font proof.

This is intentionally a small, reviewable vertical slice. It converts the
SD-1 P1–P6 construction grammar into real outline fonts and SVG masters for
just enough glyphs to render the first proof sentence:

    tat tvam asi {C}

The outlines are PROVISIONAL and must not be treated as the final alphabet.
"""
from __future__ import annotations

import argparse
import math
from pathlib import Path
from typing import Callable, Dict, Iterable, Tuple

from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

UPM = 1000
ASCENDER = 820
DESCENDER = -180
BODY_BOTTOM = 80
BODY_TOP = 720
STEM = 72
ADVANCE = 720
MARK_ADVANCE = 0

DrawFn = Callable[[object], None]


def rect(pen: object, x0: float, y0: float, x1: float, y1: float) -> None:
    pen.moveTo((x0, y0))
    pen.lineTo((x1, y0))
    pen.lineTo((x1, y1))
    pen.lineTo((x0, y1))
    pen.closePath()


def polygon(pen: object, points: Iterable[Tuple[float, float]]) -> None:
    pts = list(points)
    pen.moveTo(pts[0])
    for pt in pts[1:]:
        pen.lineTo(pt)
    pen.closePath()


def ring(pen: object, cx: float, cy: float, r: float, thickness: float = STEM) -> None:
    outer = [
        (cx + r * math.cos(2 * math.pi * i / 12), cy + r * math.sin(2 * math.pi * i / 12))
        for i in range(12)
    ]
    inner_r = r - thickness
    inner = [
        (cx + inner_r * math.cos(2 * math.pi * i / 12), cy + inner_r * math.sin(2 * math.pi * i / 12))
        for i in reversed(range(12))
    ]
    polygon(pen, outer)
    polygon(pen, inner)


def diagonal(pen: object, x: float, y: float, length: float = 180, thickness: float = STEM) -> None:
    polygon(
        pen,
        [
            (x, y),
            (x + thickness, y),
            (x + length, y + length),
            (x + length - thickness, y + length),
        ],
    )


def arc_left(pen: object, x: float, y: float, width: float = 260, height: float = 420) -> None:
    polygon(
        pen,
        [
            (x + width, y),
            (x + width - STEM, y),
            (x + 70, y + height * 0.35),
            (x + 70, y + height * 0.65),
            (x + width - STEM, y + height),
            (x + width, y + height),
            (x + 150, y + height * 0.64),
            (x + 150, y + height * 0.36),
        ],
    )


def bowl_right(pen: object, x: float, y: float, width: float = 240, height: float = 330) -> None:
    polygon(
        pen,
        [
            (x, y),
            (x + width * 0.72, y),
            (x + width, y + height * 0.3),
            (x + width, y + height * 0.7),
            (x + width * 0.72, y + height),
            (x, y + height),
            (x, y + height - STEM),
            (x + width * 0.55, y + height - STEM),
            (x + width - STEM, y + height * 0.65),
            (x + width - STEM, y + height * 0.35),
            (x + width * 0.55, y + STEM),
            (x, y + STEM),
        ],
    )


def stem(pen: object, x: float = 280, y0: float = BODY_BOTTOM, y1: float = BODY_TOP) -> None:
    rect(pen, x, y0, x + STEM, y1)


def top_cap(pen: object, x: float = 150, y: float = BODY_TOP - STEM) -> None:
    rect(pen, x, y, 520, y + STEM)


def bottom_base(pen: object, x: float = 150, y: float = BODY_BOTTOM) -> None:
    rect(pen, x, y, 520, y + STEM)


def voice_bar(pen: object) -> None:
    rect(pen, 205, 280, 435, 280 + STEM)


def aspiration_tick(pen: object) -> None:
    diagonal(pen, 425, 520, 145, 58)


def nasal_loop(pen: object) -> None:
    ring(pen, 316, 800, 90, 52)


def foot_curl(pen: object) -> None:
    bottom_base(pen, 280, BODY_BOTTOM)
    bowl_right(pen, 310, BODY_BOTTOM, 210, 190)


def skeleton(kind: str) -> DrawFn:
    def draw(pen: object) -> None:
        stem(pen)
        if kind == "guttural":
            top_cap(pen)
        elif kind == "palatal":
            arc_left(pen, 60, 350, 260, 300)
        elif kind == "retroflex":
            foot_curl(pen)
        elif kind == "dental":
            bottom_base(pen)
        elif kind == "labial":
            bowl_right(pen, 315, 240, 250, 350)
        else:
            raise ValueError(kind)

    return draw


def varga(kind: str, modifier: str = "") -> DrawFn:
    base = skeleton(kind)

    def draw(pen: object) -> None:
        base(pen)
        if "v" in modifier:
            voice_bar(pen)
        if "a" in modifier:
            aspiration_tick(pen)
        if "n" in modifier:
            nasal_loop(pen)

    return draw


def carrier(pen: object) -> None:
    stem(pen, 300, 200, 620)


def ind_aa(pen: object) -> None:
    carrier(pen)
    rect(pen, 370, 390, 590, 390 + STEM)


def ind_i(pen: object) -> None:
    carrier(pen)
    arc_left(pen, 320, 350, 220, 230)


def ind_u(pen: object) -> None:
    carrier(pen)
    bowl_right(pen, 355, 180, 220, 220)


def matra_aa(pen: object) -> None:
    rect(pen, 0, 310, 190, 310 + STEM)


def matra_i(pen: object) -> None:
    arc_left(pen, 0, 300, 190, 220)


def matra_u(pen: object) -> None:
    bowl_right(pen, 0, 150, 190, 210)


def semivowel_r(pen: object) -> None:
    arc_left(pen, 150, 180, 300, 430)
    bowl_right(pen, 300, 90, 170, 160)


def semivowel_v(pen: object) -> None:
    polygon(
        pen,
        [
            (170, 560),
            (170 + STEM, 560),
            (270, 240),
            (430, 240),
            (500, 560),
            (500 + STEM, 560),
            (500, 170),
            (430, 110),
            (270, 110),
            (200, 170),
        ],
    )


def sibilant_s(pen: object) -> None:
    skeleton("dental")(pen)
    diagonal(pen, 420, 500, 120, 45)
    diagonal(pen, 470, 470, 120, 45)


def virama(pen: object) -> None:
    diagonal(pen, 0, 40, 125, 48)


def anusvara(pen: object) -> None:
    ring(pen, 60, 0, 64, 38)


def visarga(pen: object) -> None:
    ring(pen, 55, 100, 42, 28)
    ring(pen, 55, -30, 42, 28)


def closure(pen: object) -> None:
    polygon(pen, [(180, 600), (500, 600), (340, 250)])
    polygon(pen, [(340, 490), (260, 550), (420, 550)])
    bowl_right(pen, 430, 150, 170, 160)


def notdef(pen: object) -> None:
    rect(pen, 120, 0, 600, 700)
    rect(pen, 190, 70, 530, 630)


GLYPHS: Dict[str, Tuple[int | None, int, DrawFn]] = {
    ".notdef": (None, ADVANCE, notdef),
    "space": (0x20, 330, lambda pen: None),
    "uniE000": (0xE000, ADVANCE, carrier),
    "uniE001": (0xE001, ADVANCE, ind_aa),
    "uniE002": (0xE002, ADVANCE, ind_i),
    "uniE004": (0xE004, ADVANCE, ind_u),
    "uniE011": (0xE011, MARK_ADVANCE, matra_aa),
    "uniE012": (0xE012, MARK_ADVANCE, matra_i),
    "uniE014": (0xE014, MARK_ADVANCE, matra_u),
    "uniE020": (0xE020, ADVANCE, varga("guttural")),
    "uniE025": (0xE025, ADVANCE, varga("palatal")),
    "uniE02A": (0xE02A, ADVANCE, varga("retroflex")),
    "uniE02F": (0xE02F, ADVANCE, varga("dental")),
    "uniE030": (0xE030, ADVANCE, varga("dental", "a")),
    "uniE031": (0xE031, ADVANCE, varga("dental", "v")),
    "uniE032": (0xE032, ADVANCE, varga("dental", "va")),
    "uniE033": (0xE033, ADVANCE, varga("dental", "n")),
    "uniE034": (0xE034, ADVANCE, varga("labial")),
    "uniE038": (0xE038, ADVANCE, varga("labial", "n")),
    "uniE03A": (0xE03A, ADVANCE, semivowel_r),
    "uniE03C": (0xE03C, ADVANCE, semivowel_v),
    "uniE03F": (0xE03F, ADVANCE, sibilant_s),
    "uniE050": (0xE050, MARK_ADVANCE, virama),
    "uniE051": (0xE051, 180, anusvara),
    "uniE052": (0xE052, 180, visarga),
    "uniE06F": (0xE06F, ADVANCE, closure),
}

BASES = [
    name
    for name in GLYPHS
    if name
    in {
        "uniE020",
        "uniE025",
        "uniE02A",
        "uniE02F",
        "uniE030",
        "uniE031",
        "uniE032",
        "uniE033",
        "uniE034",
        "uniE038",
        "uniE03A",
        "uniE03C",
        "uniE03F",
    }
]


def feature_text() -> str:
    bases = " ".join(BASES)
    return f"""
markClass uniE011 <anchor 0 346> @RIGHT;
markClass uniE012 <anchor 0 360> @RIGHT;
markClass uniE014 <anchor 0 245> @RIGHT;
markClass uniE050 <anchor 0 92> @VIRAMA;
feature mark {{
  pos base [{bases}] <anchor 575 346> mark @RIGHT;
  pos base [{bases}] <anchor 565 92> mark @VIRAMA;
}} mark;
"""


def common_names() -> dict[str, str]:
    return {
        "familyName": "SD-1 Text Proof",
        "styleName": "Regular",
        "uniqueFontIdentifier": "SD-1-Text-Proof-0.2.0",
        "fullName": "SD-1 Text Proof Regular",
        "psName": "SD1TextProof-Regular",
        "version": "Version 0.2.0-proof",
    }


def build_ttf(path: Path) -> None:
    order = list(GLYPHS)
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap({cp: name for name, (cp, _, _) in GLYPHS.items() if cp is not None})
    glyphs = {}
    metrics = {}
    for name, (_, width, draw) in GLYPHS.items():
        pen = TTGlyphPen(None)
        draw(pen)
        glyphs[name] = pen.glyph()
        metrics[name] = (width, 0)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASCENDER, descent=DESCENDER)
    fb.setupNameTable(common_names())
    fb.setupOS2(
        sTypoAscender=ASCENDER,
        sTypoDescender=DESCENDER,
        usWinAscent=ASCENDER,
        usWinDescent=-DESCENDER,
    )
    fb.setupPost()
    fb.setupMaxp()
    addOpenTypeFeaturesFromString(fb.font, feature_text())
    path.parent.mkdir(parents=True, exist_ok=True)
    fb.font.save(path)


def build_otf(path: Path) -> None:
    order = list(GLYPHS)
    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap({cp: name for name, (cp, _, _) in GLYPHS.items() if cp is not None})
    charstrings = {}
    metrics = {}
    for name, (_, width, draw) in GLYPHS.items():
        pen = T2CharStringPen(width, None)
        draw(pen)
        charstrings[name] = pen.getCharString(private=None, globalSubrs=None)
        metrics[name] = (width, 0)
    fb.setupCFF(
        "SD1TextProof-Regular",
        {"FullName": "SD-1 Text Proof Regular", "FamilyName": "SD-1 Text Proof", "Weight": "Regular"},
        charstrings,
        {},
    )
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASCENDER, descent=DESCENDER)
    fb.setupNameTable(common_names())
    fb.setupOS2(
        sTypoAscender=ASCENDER,
        sTypoDescender=DESCENDER,
        usWinAscent=ASCENDER,
        usWinDescent=-DESCENDER,
    )
    fb.setupPost()
    addOpenTypeFeaturesFromString(fb.font, feature_text())
    path.parent.mkdir(parents=True, exist_ok=True)
    fb.font.save(path)


def build_woff2(ttf_path: Path, woff2_path: Path) -> None:
    font = TTFont(ttf_path)
    font.flavor = "woff2"
    font.save(woff2_path)


def build_svgs(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, (cp, width, draw) in GLYPHS.items():
        if cp is None or name == "space":
            continue
        pen = SVGPathPen(None)
        draw(pen)
        label = f"U+{cp:04X}"
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -{ASCENDER} {max(width, 720)} {ASCENDER-DESCENDER}">
  <title>SD-1 provisional proof {name} ({label})</title>
  <g transform="scale(1,-1)"><path d="{pen.getCommands()}" fill="black"/></g>
</svg>\n'''
        (out_dir / f"{name}.svg").write_text(svg, encoding="utf-8")


def build_specimen(path: Path) -> None:
    proof_chars = "".join(
        chr(cp)
        for cp in [
            0xE02F,
            0xE02F,
            0xE050,
            0x20,
            0xE02F,
            0xE050,
            0xE03C,
            0xE038,
            0xE050,
            0x20,
            0xE000,
            0xE03F,
            0xE012,
            0x20,
            0xE06F,
        ]
    )
    html = f'''<!doctype html>
<meta charset="utf-8">
<title>SD-1 core font proof</title>
<style>
@font-face{{font-family:SD1Proof;src:url(../builds/SD1-Text-Proof.woff2)}}
body{{font-family:system-ui;max-width:900px;margin:3rem auto;padding:0 1rem}}
.sd{{font-family:SD1Proof;font-size:72px;line-height:1.5}}
.small{{font-size:18px}}
.blur{{filter:blur(.65px)}}
code{{font-size:1rem}}
</style>
<h1>SD-1 core font proof</h1>
<p><strong>Provisional:</strong> visual candidate, not the final alphabet.</p>
<p><code>tat tvam asi {{C}}</code></p>
<p class="sd">{proof_chars}</p>
<h2>Small size</h2>
<p class="sd small">{proof_chars}</p>
<h2>Mild blur</h2>
<p class="sd blur">{proof_chars}</p>
'''
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    root = args.root
    builds = root / "font" / "builds"
    ttf = builds / "SD1-Text-Proof.ttf"
    otf = builds / "SD1-Text-Proof.otf"
    woff2 = builds / "SD1-Text-Proof.woff2"
    build_ttf(ttf)
    build_otf(otf)
    build_woff2(ttf, woff2)
    build_svgs(root / "font" / "glyphs" / "core-proof")
    build_specimen(root / "font" / "specimens" / "core-font-proof.html")
    print(f"Built {len(GLYPHS) - 2} proof glyphs: {ttf.name}, {otf.name}, {woff2.name}")


if __name__ == "__main__":
    main()
