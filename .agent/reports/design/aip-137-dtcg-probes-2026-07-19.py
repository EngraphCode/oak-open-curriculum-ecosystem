#!/usr/bin/env python3
"""AIP-137 Stage-A empirical probes.

Probe A: CSS<->DTCG consistency (is the dtcg/ export consistent with the CSS
         it is declared to be generated from?)
Probe B: four-theme contrast computation over dtcg/contrast-pairings.json,
         with AA and AAA verdicts per pair per theme.

Resolution model (stated, not assumed silently): the dark / high-contrast /
colour-safe dtcg trees are override deltas applied over the light base --
mirroring the CSS, where light-dark() carries the light/dark polarity and
[data-theme='high-contrast'|'colour-safe'] blocks override role values.
Unresolvable values (color-mix, currentColor, alpha-bearing, non-hex) are
reported as typed refusals, never fudged.
"""
import json, re, sys, itertools
from pathlib import Path

WS = Path("packages/design/oak-design-system")
DT = WS / "dtcg"

# ---------- dtcg loading ----------

def flatten(tree, path=""):
    out = {}
    for k, v in tree.items():
        if k.startswith("$"):
            continue
        if isinstance(v, dict):
            if "$value" in v:
                out[path + k] = v["$value"]
            else:
                out.update(flatten(v, path + k + "."))
    return out

def load(name):
    return flatten(json.load(open(DT / name)))

palette = load("palette.json")          # oak.color.*
primitives = load("primitives.json")    # space.*, font.*, border.*, ...
component = load("component.json")      # btn.*, card.*, ...
sem = {t: load(f"semantic.{t}.json") for t in ["light", "dark", "high-contrast", "colour-safe"]}
pairs = json.load(open(DT / "contrast-pairings.json"))["pairs"]

# ---------- CSS parsing (brace-tracking state machine) ----------

def parse_css(path):
    """Return list of (context, prop, value). Context = selector chain."""
    text = Path(path).read_text()
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)  # strip comments
    decls, stack, buf = [], [], ""
    for ch in text:
        if ch == "{":
            stack.append(buf.strip()); buf = ""
        elif ch == "}":
            if buf.strip():
                for d in buf.split(";"):
                    if ":" in d and d.strip().startswith("--"):
                        p, v = d.split(":", 1)
                        decls.append((" >> ".join(stack), p.strip(), v.strip()))
            if stack: stack.pop()
            buf = ""
        elif ch == ";":
            buf += ch
            # declarations are collected at block close; keep buffering
        else:
            buf += ch
    return decls

def norm(v):
    v = v.strip().rstrip(";").lower()
    v = v.replace("'", '"')                  # quote-style is not a semantic difference
    v = re.sub(r"\s+", " ", v)
    v = re.sub(r"\s*([(),*])\s*", r"\1", v)  # tighten around punctuation incl calc's *
    return v

def path_to_var(path):
    """dtcg path -> CSS custom property, with the export's known naming transforms:
    oak.color.x -> --oak-x; font.family.x -> --font-x (family segment elided)."""
    if path.startswith("oak.color."):
        return "--oak-" + path[len("oak.color."):]
    if path.startswith("oak."):
        return "--oak-" + path[len("oak."):]
    if path.startswith("font.family."):
        return "--font-" + path[len("font.family."):]
    return "--" + path.replace(".", "-")

def ref_to_var(v):
    """Translate dtcg refs to CSS var() form via path_to_var."""
    return re.sub(r"\{([^}]+)\}", lambda m: f"var({path_to_var(m.group(1))})", v)

# ---------- Probe A ----------

ct_decls = parse_css(WS / "colors_and_type.css")
comp_decls = parse_css(WS / "components.css")

def context_class(ctx):
    c = ctx.lower()
    if "@media" in c or "@supports" in c or "forced-colors" in c or "print" in c:
        return "excluded"
    if "high-contrast" in c: return "hc"
    if "colour-safe" in c: return "cs"
    if "'dark'" in c or '"dark"' in c: return "dark"
    if "data-theme" in c or "data-motion" in c: return "other-theme"
    return "base"

css_base, css_hc, css_cs, css_dark, css_excluded = {}, {}, {}, {}, 0
for ctx, p, v in ct_decls + comp_decls:
    cc = context_class(ctx)
    if cc == "base": css_base.setdefault(p, v)
    elif cc == "hc": css_hc.setdefault(p, v)
    elif cc == "cs": css_cs.setdefault(p, v)
    elif cc == "dark": css_dark.setdefault(p, v)
    elif cc == "excluded": css_excluded += 1

LD = re.compile(r"^light-dark\(\s*(.*?)\s*,\s*(.*?)\s*\)$", re.S)

def split_light_dark(v):
    m = LD.match(v.strip())
    if not m: return None
    # naive split fails on nested commas inside var(); do a paren-aware split
    inner = v.strip()[len("light-dark("):-1]
    depth, idx = 0, None
    for i, ch in enumerate(inner):
        if ch == "(": depth += 1
        elif ch == ")": depth -= 1
        elif ch == "," and depth == 0: idx = i; break
    if idx is None: return None
    return inner[:idx].strip(), inner[idx+1:].strip()

report = {"palette": [], "sem_light": [], "sem_dark": [], "sem_hc": [], "sem_cs": [],
          "component": [], "coverage": {}}

# palette: oak.color.x vs --oak-x
for path, val in palette.items():
    name = path_to_var(path)
    cssv = css_base.get(name)
    if cssv is None:
        report["palette"].append((path, val, "MISSING-IN-CSS"))
    elif norm(str(val)) != norm(cssv):
        report["palette"].append((path, val, cssv))
css_oak = {p for p in css_base if p.startswith("--oak-")}
dt_oak = {"--oak-" + p[len("oak.color."):] for p in palette}
report["coverage"]["css_oak_not_in_palette"] = sorted(css_oak - dt_oak)

# semantic light/dark vs base decls
for path, val in sem["light"].items():
    name = path_to_var(path)
    cssv = css_base.get(name)
    want = norm(ref_to_var(str(val)))
    if cssv is None:
        report["sem_light"].append((path, val, "MISSING-IN-CSS")); continue
    ld = split_light_dark(cssv)
    got = norm(ld[0]) if ld else norm(cssv)
    if want != got:
        report["sem_light"].append((path, val, cssv))

for path, val in sem["dark"].items():
    name = path_to_var(path)
    cssv = css_base.get(name)
    want = norm(ref_to_var(str(val)))
    if cssv is None:
        report["sem_dark"].append((path, val, "MISSING-IN-CSS")); continue
    ld = split_light_dark(cssv)
    if ld:
        if want != norm(ld[1]):
            report["sem_dark"].append((path, val, cssv))
        continue
    # non-colour roles (e.g. filter) cannot use light-dark(); their dark values
    # live in the explicit [data-theme='dark'] override block.
    darkv = css_dark.get(name)
    if darkv is None:
        report["sem_dark"].append((path, val, f"NO-light-dark AND no dark-block value: {cssv}"))
    elif want != norm(darkv):
        report["sem_dark"].append((path, val, f"dark-block: {darkv}"))

for key, tree, cssmap in [("sem_hc", sem["high-contrast"], css_hc),
                          ("sem_cs", sem["colour-safe"], css_cs)]:
    for path, val in tree.items():
        name = path_to_var(path)
        cssv = cssmap.get(name)
        want = norm(ref_to_var(str(val)))
        if cssv is None:
            report[key].append((path, val, "MISSING-IN-CSS-OVERRIDE-BLOCK")); continue
        if want != norm(cssv):
            report[key].append((path, val, cssv))

# component tier
for path, val in component.items():
    name = path_to_var(path)
    cssv = css_base.get(name)
    want = norm(ref_to_var(str(val)))
    if cssv is None:
        report["component"].append((path, val, "MISSING-IN-CSS")); continue
    ld = split_light_dark(cssv)
    got = norm(ld[0]) if ld else norm(cssv)
    if want != got:
        report["component"].append((path, val, cssv))

# ---------- Probe B ----------

def theme_map(theme):
    m = {}
    m.update(palette); m.update(primitives); m.update(component)
    m.update(sem["light"])
    if theme != "light":
        m.update(sem[theme])
    return m

HEX = re.compile(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")

def resolve(m, path, depth=0):
    if depth > 12: return None, f"ref-depth-exceeded at {path}"
    if path not in m: return None, f"unknown token {path}"
    v = str(m[path]).strip()
    ref = re.fullmatch(r"\{([^}]+)\}", v)
    if ref: return resolve(m, ref.group(1), depth + 1)
    if "color-mix" in v or "currentcolor" in v.lower():
        return None, f"non-static value: {v}"
    if HEX.match(v):
        h = v[1:]
        if len(h) in (4, 8):
            alpha = h[-1] if len(h) == 4 else h[-2:]
            if alpha.lower() not in ("f", "ff"):
                return None, f"alpha-bearing value: {v}"
            h = h[:-1] if len(h) == 4 else h[:-2]
        if len(h) == 3: h = "".join(c * 2 for c in h)
        return h, None
    return None, f"non-hex value: {v}"

def lum(h):
    def chan(c):
        c /= 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)

def ratio(h1, h2):
    l1, l2 = lum(h1), lum(h2)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

contrast = {}
for theme in ["light", "dark", "high-contrast", "colour-safe"]:
    m = theme_map(theme)
    rows = []
    for p in pairs:
        fg, ferr = resolve(m, p["foreground"])
        bg, berr = resolve(m, p["background"])
        if ferr or berr:
            rows.append({**p, "status": "UNRESOLVABLE", "reason": ferr or berr})
            continue
        r = ratio(fg, bg)
        aa_min = 4.5 if p["context"] == "text" else 3.0
        aaa_min = 7.0 if p["context"] == "text" else None
        rows.append({**p, "fg": "#" + fg, "bg": "#" + bg, "ratio": round(r, 2),
                     "AA": r >= aa_min,
                     "AAA": (r >= aaa_min) if aaa_min else None})
    contrast[theme] = rows

# ---------- output ----------

out = {"probeA": {k: v for k, v in report.items()}, "probeB": contrast,
       "meta": {"css_base_props": len(css_base), "css_hc_props": len(css_hc),
                 "css_cs_props": len(css_cs), "css_excluded_decls": css_excluded,
                 "pairs": len(pairs)}}
json.dump(out, open(sys.argv[1], "w"), indent=1, default=str)

print("META:", out["meta"])
print("\nPROBE A mismatches/misses:")
for k in ["palette", "sem_light", "sem_dark", "sem_hc", "sem_cs", "component"]:
    print(f"  {k}: {len(report[k])}")
    for row in report[k][:12]:
        print(f"    {row[0]!r}: dtcg={row[1]!r} css={row[2]!r}")
print("  css --oak-* not in palette.json:", len(report["coverage"]["css_oak_not_in_palette"]),
      report["coverage"]["css_oak_not_in_palette"][:6])
print("\nPROBE B per theme:")
for theme, rows in contrast.items():
    unres = [r for r in rows if r.get("status") == "UNRESOLVABLE"]
    aa_fail = [r for r in rows if r.get("AA") is False]
    aaa = [r for r in rows if r.get("AAA") is not None]
    aaa_pass = [r for r in aaa if r["AAA"]]
    print(f"  {theme}: {len(rows)} pairs, AA fail {len(aa_fail)}, "
          f"AAA {len(aaa_pass)}/{len(aaa)} pass, unresolvable {len(unres)}")
    for r in aa_fail:
        print(f"    AA-FAIL {r['foreground']} on {r['background']} ({r['context']}): "
              f"{r['ratio']} [{r['fg']} on {r['bg']}]")
    for r in aaa:
        if not r["AAA"]:
            print(f"    AAA-miss {r['foreground']} on {r['background']}: {r['ratio']} "
                  f"[{r['fg']} on {r['bg']}]")
    for r in unres:
        print(f"    UNRESOLVABLE {r['foreground']}/{r['background']}: {r['reason']}")
