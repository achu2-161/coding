"""Browser regression tests for the built page.

Run:  python3 -I apps/daily-python/build.py && python3 apps/daily-python/tests/ui_test.py
Needs Playwright and Chrome (google-chrome).
"""
import datetime as dt
import json
import pathlib
import subprocess
import sys

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent.parent
PAGE = HERE / "dist" / "daily-python.html"
KEY = "dailyPython.v1"
ALL_IDS = json.loads(subprocess.run(
    ["node", "-e", "process.stdout.write(JSON.stringify(require(process.argv[1]).QUESTIONS.map(q=>q.id)))",
     str(HERE / "questions.js")], capture_output=True, text=True, check=True).stdout)


def state(**kw):
    s = {"v": 1, "cards": {}, "days": [], "streak": 0, "best": 0, "freezes": 2, "lastDay": None}
    s.update(kw)
    return s


def only_new(qid):
    """Every card except qid scheduled far in the future, so qid is the only question."""
    return {i: {"box": 5, "due": "2099-01-01"} for i in ALL_IDS if i != qid}


def open_page(p, saved=None, clock=None):
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg = b.new_page(viewport={"width": 390, "height": 844})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    if clock:
        pg.clock.install(time=clock)
    if saved is not None:
        pg.add_init_script(f"localStorage.setItem('{KEY}', {json.dumps(json.dumps(saved))})")
    pg.goto(PAGE.as_uri())
    return b, pg, errors


def answer_whatever(pg):
    if pg.locator("#pre").count():
        pg.locator("#pre .ln").first.click()
        if pg.locator("#fixes .opt").count():
            pg.locator("#fixes .opt").first.click()
    elif pg.locator("#slot").count():
        pg.locator(".chip").first.click()
    elif pg.locator("#pile").count():
        for k in range(pg.locator("#pile .chip").count()):
            pg.locator("#pile .chip").nth(k).click()
        pg.click("#check")
    else:
        pg.locator(".opt").first.click()
    pg.click("#next")


def test_alternative_order_is_correct(p):
    b, pg, errors = open_page(p, state(cards=only_new("zip-4")))
    pg.click("#go")
    # alt order [1, 0, 2, 3]: kg line first, then names
    for text in ["kg = [900, 40]", 'names = ["clay", "straw"]',
                 "for n, q in zip(names, kg):", '    print(f"{n}: {q}")']:
        pg.locator("#pile .chip", has_text=text.strip()).first.click()
    pg.click("#check")
    assert "Correct" in pg.inner_text("#fb"), pg.inner_text("#fb")
    assert not errors, errors
    b.close()


def test_session_across_midnight_counts_for_start_day(p):
    start = dt.datetime(2026, 11, 26, 23, 58)
    saved = state(streak=5, best=5, freezes=0, lastDay="2026-11-25", days=["2026-11-25"])
    b, pg, errors = open_page(p, saved, clock=start)
    pg.click("#go")
    pg.clock.fast_forward("05:00")  # now 00:03 on the 27th
    for _ in range(5):
        answer_whatever(pg)
    s = json.loads(pg.evaluate(f"localStorage.getItem('{KEY}')"))
    assert s["streak"] == 6 and s["lastDay"] == "2026-11-26", (s["streak"], s["lastDay"])
    assert not errors, errors
    b.close()


def test_lapsed_streak_shows_zero(p):
    saved = state(streak=12, best=12, freezes=2, lastDay="2026-11-16", days=["2026-11-16"])
    b, pg, errors = open_page(p, saved, clock=dt.datetime(2026, 11, 26, 9, 0))
    assert pg.inner_text(".carve b") == "0"
    assert pg.inner_text(".figs .fig b >> nth=0") == "12"  # best is kept
    assert not errors, errors
    b.close()


def test_no_runtime_network_and_no_new_css_functions(p):
    html = PAGE.read_text(encoding="utf-8")
    assert "fonts.googleapis" not in html
    assert "light-dark(" not in html and "color-mix(" not in html  # need iOS 17.5+
    b, pg, errors = open_page(p)
    requests = []
    pg.on("request", lambda r: requests.append(r.url))
    pg.reload()
    external = [u for u in requests if not u.startswith("file:")]
    assert not external, external
    b.close()


if __name__ == "__main__":
    tests = [v for k, v in dict(globals()).items() if k.startswith("test_")]
    failed = 0
    with sync_playwright() as p:
        for t in tests:
            try:
                t(p)
                print(f"ok   {t.__name__}")
            except AssertionError as e:
                failed += 1
                print(f"FAIL {t.__name__}: {e}")
    print(f"{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
