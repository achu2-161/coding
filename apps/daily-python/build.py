"""Inline engine.js and questions.js into one self-contained page.

Run:  python3 -I apps/daily-python/build.py
Writes apps/daily-python/dist/daily-python.html
"""
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent


def inline(match):
    src = (HERE / match.group(1)).read_text(encoding="utf-8")
    src = src.replace("</script", "<\\/script")  # never close the tag early
    return f"<script>\n{src}\n</script>"


def main():
    html = (HERE / "index.html").read_text(encoding="utf-8")
    out = re.sub(r'<script src="([\w.-]+\.js)"></script>', inline, html)
    if "<script src=" in out:
        raise SystemExit("A script tag was not inlined.")
    dist = HERE / "dist"
    dist.mkdir(exist_ok=True)
    (dist / "daily-python.html").write_text(out, encoding="utf-8")
    print(f"Built {dist / 'daily-python.html'} ({len(out) // 1024} KB)")


if __name__ == "__main__":
    main()
