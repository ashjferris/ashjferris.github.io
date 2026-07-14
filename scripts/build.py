#!/usr/bin/env python3
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_CSS = ROOT / "css"
SRC_JS = ROOT / "js"
DIST = ROOT / "dist"
DIST_CSS = DIST / "css"
DIST_JS = DIST / "js"


def ensure_dirs():
    DIST.mkdir(exist_ok=True)
    DIST_CSS.mkdir(parents=True, exist_ok=True)
    DIST_JS.mkdir(parents=True, exist_ok=True)


def minify_css(css: str) -> str:
    # Remove comments
    css = re.sub(r"/\*[^*]*\*+(?:[^/*][^*]*\*+)*/", "", css)
    # Collapse whitespace
    css = re.sub(r"\s+", " ", css)
    # Remove spaces around symbols
    css = re.sub(r"\s*([{};:,>+~=\(\)])\s*", r"\1", css)
    # Final trim
    return css.strip()


def copy_js(src: Path, dest: Path):
    # For safety, copy JS as-is (vendor files already minified)
    shutil.copy2(src, dest)


def process_css():
    if not SRC_CSS.exists():
        return
    for path in sorted(SRC_CSS.glob("*.css")):
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        try:
            minified = minify_css(content)
        except Exception:
            # Fallback to original on any unexpected issue
            minified = content
        out_path = DIST_CSS / path.name
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(minified)


def process_js():
    if not SRC_JS.exists():
        return
    for path in sorted(SRC_JS.glob("*.js")):
        out_path = DIST_JS / path.name
        copy_js(path, out_path)


def main():
    ensure_dirs()
    process_css()
    process_js()
    print(f"Built assets → {DIST}")


if __name__ == "__main__":
    main()
