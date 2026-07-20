#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
BUILDS = ROOT / "font" / "builds"
REQUIRED = {
    0x20, 0xE000, 0xE001, 0xE002, 0xE004, 0xE011, 0xE012, 0xE014,
    0xE020, 0xE025, 0xE02A, 0xE02F, 0xE030, 0xE031, 0xE032, 0xE033,
    0xE034, 0xE038, 0xE03A, 0xE03C, 0xE03F, 0xE050, 0xE051, 0xE052, 0xE06F,
}
PROOF_SENTENCE_CODEPOINTS = {
    0x20, 0xE000, 0xE012, 0xE02F, 0xE038, 0xE03C, 0xE03F, 0xE050, 0xE06F,
}


class ProofFontTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        subprocess.run(
            [sys.executable, str(ROOT / "font" / "scripts" / "build_proof_font.py"), "--root", str(ROOT)],
            check=True,
        )

    def test_all_formats_open_and_have_required_cmap(self) -> None:
        for filename in ("SD1-Text-Proof.ttf", "SD1-Text-Proof.otf", "SD1-Text-Proof.woff2"):
            path = BUILDS / filename
            self.assertTrue(path.exists(), filename)
            self.assertGreater(path.stat().st_size, 500, filename)
            font = TTFont(path)
            self.assertTrue(REQUIRED.issubset(font.getBestCmap()), filename)
            self.assertIn("GPOS", font, filename)

    def test_first_sentence_is_fully_renderable(self) -> None:
        font = TTFont(BUILDS / "SD1-Text-Proof.ttf")
        self.assertTrue(PROOF_SENTENCE_CODEPOINTS.issubset(font.getBestCmap()))

    def test_svg_master_generated_for_each_proof_pua_glyph(self) -> None:
        svg_dir = ROOT / "font" / "glyphs" / "core-proof"
        generated = {p.stem for p in svg_dir.glob("uni*.svg")}
        expected = {
            name
            for name in TTFont(BUILDS / "SD1-Text-Proof.ttf").getGlyphOrder()
            if name.startswith("uni")
        }
        self.assertEqual(generated, expected)


if __name__ == "__main__":
    unittest.main()
