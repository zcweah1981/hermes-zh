#!/usr/bin/env python3
"""Generate subsetted Chinese web fonts for Hermes 中文站.

The production CSS keeps stable URLs (`/fonts/noto-*-sc.woff2`), so this script
replaces those binaries with smaller WOFF2 subsets generated from repo-visible
UI/content text. It is intentionally manual, not part of `npm run build`, to keep
font binary changes reviewable and easy to roll back with git.
"""
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "public" / "fonts"
DEFAULT_TEXT_DIRS = ["app", "components", "lib", "content-cache/generated", "docs"]
TEXT_EXTS = {".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".mdx", ".txt", ".yaml", ".yml", ".html"}
SKIP_PARTS = {".next", "node_modules", ".git", "__pycache__"}

# Common UI/ASCII/CJK safety characters beyond the currently committed text.
SAFETY_CHARS = """
	r
 ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~
，。？！、；：《》“”‘’（）【】「」『』—…·￥％±×÷→←↑↓↔　
的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处理世推今集金件管色保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞
"""

FONT_BACKUPS = {
    "noto-sans-sc.woff2": Path("/tmp/hermes-zh-font-backups/noto-sans-sc.woff2"),
    "noto-serif-sc.woff2": Path("/tmp/hermes-zh-font-backups/noto-serif-sc.woff2"),
}


def iter_text_files(paths: list[str]):
    for rel in paths:
        base = (ROOT / rel).resolve() if not Path(rel).is_absolute() else Path(rel)
        if not base.exists():
            continue
        candidates = [base] if base.is_file() else base.rglob("*")
        for path in candidates:
            if path.is_file() and path.suffix.lower() in TEXT_EXTS and not any(part in SKIP_PARTS for part in path.parts):
                yield path


def collect_chars(paths: list[str]) -> str:
    chars: set[str] = set(SAFETY_CHARS)
    file_count = 0
    for path in iter_text_files(paths):
        try:
            chars.update(path.read_text(encoding="utf-8"))
        except UnicodeDecodeError:
            continue
        file_count += 1
    # CJK punctuation and fullwidth forms are small and prevent common copy/paste fallback.
    chars.update(chr(cp) for cp in range(0x3000, 0x303F + 1))
    chars.update(chr(cp) for cp in range(0xFF01, 0xFF5E + 1))
    print(f"source files: {file_count}")
    return "".join(sorted(ch for ch in chars if not ch.isspace() or ch in {" ", "\n", "\t"}))


def source_font(font_path: Path, backup_path: Path) -> Path:
    backup_path.parent.mkdir(parents=True, exist_ok=True)
    # If a full-size backup exists, keep using it so reruns don't subset an already-subset font.
    if backup_path.exists() and backup_path.stat().st_size > font_path.stat().st_size:
        return backup_path
    backup_path.write_bytes(font_path.read_bytes())
    return backup_path


def subset_font(font_name: str, text_file: Path) -> tuple[int, int]:
    font_path = FONT_DIR / font_name
    backup_path = FONT_BACKUPS[font_name]
    src_path = source_font(font_path, backup_path)
    original_size = src_path.stat().st_size
    tmp_path = font_path.with_suffix(".subset.tmp.woff2")
    cmd = [
        "pyftsubset",
        str(src_path),
        f"--text-file={text_file}",
        f"--output-file={tmp_path}",
        "--flavor=woff2",
        "--with-zopfli",
        "--layout-features=*",
        "--glyph-names",
        "--symbol-cmap",
        "--legacy-cmap",
        "--notdef-glyph",
        "--notdef-outline",
        "--recommended-glyphs",
        "--name-IDs=*",
        "--name-legacy",
        "--name-languages=*",
    ]
    subprocess.run(cmd, check=True, cwd=ROOT)
    tmp_path.replace(font_path)
    return original_size, font_path.stat().st_size


def main() -> None:
    parser = argparse.ArgumentParser(description="Subset Hermes 中文站 self-hosted Noto SC fonts.")
    parser.add_argument("--text-dir", action="append", dest="text_dirs", help="Relative/absolute text directory or file to include. Repeatable.")
    args = parser.parse_args()

    FONT_DIR.mkdir(parents=True, exist_ok=True)
    text_file = FONT_DIR / "subset-chars.txt"
    chars = collect_chars(args.text_dirs or DEFAULT_TEXT_DIRS)
    text_file.write_text(chars, encoding="utf-8")
    print(f"subset chars: {len(chars)}")
    print(f"charset file: {text_file.relative_to(ROOT)}")
    for font_name in FONT_BACKUPS:
        before, after = subset_font(font_name, text_file)
        print(f"{font_name}: {before} -> {after} bytes (saved {before - after})")


if __name__ == "__main__":
    main()
