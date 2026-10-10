#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["colorthief==0.2.1", "pillow==12.3.0"]
# ///
"""Extract the dominant color of each homepage thumbnail into data/colors.json.

Run from anywhere with: uv run scripts/colors.py
"""

import json
from pathlib import Path

from colorthief import ColorThief

ROOT = Path(__file__).resolve().parent.parent
THUMBNAILS = ROOT / "assets" / "thumbnails"
OUTPUT = ROOT / "data" / "colors.json"

colors = {}
for image in sorted(THUMBNAILS.iterdir()):
    if image.is_file() and not image.name.startswith("."):
        colors[image.name] = str(ColorThief(image).get_color(quality=1))

OUTPUT.write_text(json.dumps(colors, indent=4) + "\n")
print(f"Wrote {len(colors)} colors to {OUTPUT.relative_to(ROOT)}")
