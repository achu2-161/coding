"""Check every Daily Python question against real Python.

Run:  python3 -I apps/daily-python/verify_questions.py
Exits 1 and lists the problems if any question is wrong.
"""
import itertools
import json
import os
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
TYPES = {"mcq", "predict", "bug", "blank", "order"}
# Set PYTHON=python3.11 to check against an older Python as well.
PYTHON = os.environ.get("PYTHON", sys.executable)
BANNED = ["embodied carbon", "carbon emissions", "carbon-intensive"]


def load_bank():
    js = (
        "const b=require(process.argv[1]);"
        "process.stdout.write(JSON.stringify({q:b.QUESTIONS,u:b.UNLOCKED,t:b.TOPICS}))"
    )
    out = subprocess.run(
        ["node", "-e", js, str(HERE / "questions.js")],
        capture_output=True, text=True, check=True,
    )
    data = json.loads(out.stdout)
    return data["q"], data["u"], data["t"]


def run(code):
    """Return (stdout stripped, error name or None)."""
    try:
        p = subprocess.run(
            [PYTHON, "-I", "-c", code],
            capture_output=True, text=True, timeout=5,
        )
    except subprocess.TimeoutExpired:
        return "", "Timeout"
    err = None
    if p.returncode != 0:
        last = p.stderr.strip().splitlines()[-1] if p.stderr.strip() else "Error"
        err = last.split(":")[0]
    return p.stdout.strip(), err


def check(q, topics):
    problems = []
    qtype = q.get("type")
    for key in ("id", "topic", "type", "prompt", "explain"):
        if not q.get(key):
            problems.append(f"missing '{key}'")
    if qtype not in TYPES:
        return problems + [f"unknown type {qtype!r}"]
    if q.get("topic") not in topics:
        problems.append(f"unknown topic {q.get('topic')!r}")

    # Terminology questions name the banned terms as wrong options on purpose.
    text = "" if q.get("topic") == "terminology" else json.dumps(q).lower()
    for term in BANNED:
        if term in text:
            problems.append(f"banned term {term!r}")

    if qtype in ("mcq", "predict"):
        if not 0 <= q.get("answer", -1) < len(q.get("options", [])):
            problems.append("answer index out of range")
    if qtype == "predict":
        out, err = run(q["code"])
        want = q["options"][q["answer"]]
        if err:
            if want != err:
                problems.append(f"code raises {err}, answer says {want!r}")
        elif out != want:
            problems.append(f"prints {out!r}, answer says {want!r}")
        for i, opt in enumerate(q["options"]):
            if i != q["answer"] and opt == want:
                problems.append("duplicate of the correct option")

    elif qtype == "bug":
        lines = q["code"].split("\n")
        out, err = run(q["code"])
        if not err and out == q["expect"]:
            problems.append("original code already works")
        fixed = lines.copy()
        fixed[q["bugLine"]] = q["fixes"][q["answer"]]
        out, err = run("\n".join(fixed))
        if err or out != q["expect"]:
            problems.append(f"fix gives {err or out!r}, expected {q['expect']!r}")
        for i, f in enumerate(q["fixes"]):
            if i == q["answer"]:
                continue
            alt = lines.copy()
            alt[q["bugLine"]] = f
            o, e = run("\n".join(alt))
            if not e and o == q["expect"]:
                problems.append(f"wrong fix {i} also works")

    elif qtype == "blank":
        if q["code"].count("___") != 1:
            problems.append("code needs exactly one ___")
        else:
            for i, chip in enumerate(q["chips"]):
                o, e = run(q["code"].replace("___", chip))
                works = not e and o == q["expect"]
                if i == q["answer"] and not works:
                    problems.append(f"correct chip gives {e or o!r}, expected {q['expect']!r}")
                if i != q["answer"] and works:
                    problems.append(f"chip {chip!r} also works")

    elif qtype == "order":
        o, e = run("\n".join(q["lines"]))
        if e or o != q["expect"]:
            problems.append(f"lines give {e or o!r}, expected {q['expect']!r}")
        if len(set(q["lines"])) != len(q["lines"]):
            problems.append("duplicate lines make the order ambiguous")
        # Every other order that also prints `expect` must be listed in `alts`,
        # unless the question is marked strictOrder (it works but is bad style).
        n = len(q["lines"])
        allowed = {tuple(range(n))} | {tuple(a) for a in q.get("alts", [])}
        if not q.get("strictOrder"):
            for perm in itertools.permutations(range(n)):
                if perm in allowed:
                    continue
                o, e = run("\n".join(q["lines"][i] for i in perm))
                if not e and o == q["expect"]:
                    problems.append(f"order {list(perm)} also works; add it to alts")
        for a in q.get("alts", []):
            o, e = run("\n".join(q["lines"][i] for i in a))
            if e or o != q["expect"]:
                problems.append(f"alt {a} does not work")
    return problems


def main():
    questions, unlocked, topics = load_bank()
    failures, ids = 0, set()
    for q in questions:
        probs = check(q, topics)
        if q.get("id") in ids:
            probs.append("duplicate id")
        ids.add(q.get("id"))
        if probs:
            failures += 1
            print(f"FAIL {q.get('id')}: " + "; ".join(probs))
    for t in unlocked:
        if t not in topics:
            failures += 1
            print(f"FAIL UNLOCKED has unknown topic {t!r}")
    if failures:
        print(f"{failures} problem question(s) out of {len(questions)}")
        sys.exit(1)
    print(f"OK: {len(questions)} questions verified")


if __name__ == "__main__":
    main()
