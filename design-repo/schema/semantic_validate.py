#!/usr/bin/env python3
"""Semantic PageSpec validator: Draft-07 schema + every rule JSON Schema cannot express.

Usage: python3 schema/semantic_validate.py <pagespec.json> [...]
Exit 1 if any spec has errors (warnings never fail).
Rule ids mirror compatibility/graph.json exactly (parity is checked by extraction/verify_all.py).
"""
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

from jsonschema import Draft7Validator

REPO = Path(__file__).resolve().parent.parent


def _load(rel):
    return json.loads((REPO / rel).read_text(encoding="utf-8"))


SCHEMA = _load("schema/pagespec.schema.json")
TPL_FILE = _load("templates/templates.json")
TEMPLATES = {t["id"]: t for t in TPL_FILE["templates"]}
GRAPH = {r["id"]: r for r in _load("compatibility/graph.json")["rules"]}
PATTERNS = _load("tokens/00-foundation/motion-patterns.json")["pattern"]
ROLES = {r["id"] for r in _load("assets/asset-roles.json")["roles"]}
FINGERPRINTS = set(_load("assets/original-copy-fingerprints.json")["fingerprints"])
SECTIONS = {}
for _f in sorted((REPO / "sections").glob("*.json")):
    _d = json.loads(_f.read_text(encoding="utf-8"))
    SECTIONS[_d["id"]] = _d
CATEGORY = {k: v["category"] for k, v in SECTIONS.items()}
VALIDATOR = Draft7Validator(SCHEMA)
ROUTE_RX = re.compile(SCHEMA["properties"]["route"]["pattern"])

EXTERNAL_PATTERNS = [
    (re.compile(r"(?i)\b(https?|ftp|mailto|tel|sms|javascript|data|file|wss?|blob):"), "URL scheme"),
    (re.compile(r"(?i)(^|[\s(\"'=])//[a-z0-9-]+(\.[a-z0-9-]+)+"), "protocol-relative host"),
    (re.compile(r"(?i)\bwww\.[a-z0-9-]+"), "www host"),
    (re.compile(r"(?i)<\s*(iframe|script|img|link|object|embed|a|form)\b|\b(href|src|srcset|action)\s*="), "markup that links, loads or submits"),
]
MD_LINK = re.compile(r"\[([^\]]+)\]\(([^)]*)\)")
ASSET_URL = re.compile(r"(?i)(\.(png|webp|jpe?g|gif|avif|svg|woff2?|ttf|otf|mp4|webm)\b|/assets/|/fonts/|/api/media/)")


def wc(s):
    return len(re.findall(r"\S+", s))


def norm_text(s):
    s = unicodedata.normalize("NFKC", s).lower()
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def fingerprint(s):
    return hashlib.sha256(norm_text(s).encode("utf-8")).hexdigest()[:32]


def fingerprint_candidates(s):
    """Whole string + each sentence, normalised, >= 5 words (short labels are too generic)."""
    out = []
    for part in [s] + re.split(r"(?<=[.!?])\s+", s):
        n = norm_text(re.sub(r"\*+|\[([^\]]+)\]\([^)]*\)", r"\1", part))
        if len(n.split()) >= 5:
            out.append(n)
    return out


class Report:
    def __init__(self):
        self.errors, self.warnings = [], []

    def add(self, rule, msg, path=""):
        sev = GRAPH[rule]["severity"] if rule in GRAPH else "error"
        line = f"[{rule}] {path}: {msg}" if path else f"[{rule}] {msg}"
        (self.errors if sev == "error" else self.warnings).append(line)


def route_matches(route, pattern):
    rx = "^" + re.escape(pattern).replace(re.escape(":slug"), "[a-z0-9-]+") + "$"
    return re.match(rx, route or "") is not None


def content_schema(node):
    c = SECTIONS.get(node.get("type"))
    if not c:
        return None
    if "contentByVariant" in c:
        return c["contentByVariant"].get(node.get("variant"))
    return c.get("content")


def walk_budget(schema, value, path, rep):
    """Enforce maxWords + asset roles by walking the contract content alongside the instance."""
    if not isinstance(schema, dict):
        return
    if "oneOf" in schema and isinstance(value, dict):
        for br in schema["oneOf"]:
            kc = br.get("properties", {}).get("kind", {}).get("const")
            if kc is not None and kc == value.get("kind"):
                walk_budget(br, value, path, rep)
                return
        return
    if isinstance(value, str) and "maxWords" in schema:
        if wc(value) > schema["maxWords"]:
            rep.add("MAX_WORDS", f"{wc(value)} words > maxWords {schema['maxWords']}", path)
        return
    if isinstance(value, dict) and "properties" in schema:
        props = schema["properties"]
        if "assetRole" in props:
            role = value.get("assetRole")
            if role not in ROLES or role not in props["assetRole"].get("enum", []):
                rep.add("ASSET_ROLE_REGISTERED", f"assetRole {role!r} is not registered/allowed on this field (allowed {props['assetRole'].get('enum')})", path)
        for k, v in value.items():
            if k in props:
                walk_budget(props[k], v, f"{path}.{k}", rep)
        return
    if isinstance(value, list) and "items" in schema:
        for i, v in enumerate(value):
            walk_budget(schema["items"], v, f"{path}[{i}]", rep)


def iter_strings(obj, path="$"):
    if isinstance(obj, str):
        yield path, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from iter_strings(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from iter_strings(v, f"{path}[{i}]")


def copy_strings(nodes):
    """Strings inside node content only (types/patterns/ids are structure, not copy)."""
    for i, n in enumerate(nodes):
        yield from iter_strings(n.get("content"), f"$.nodes[{i}].content")


# ------------------------------------------------------------------ rules
def r_schema(spec, rep):
    for e in sorted(VALIDATOR.iter_errors(spec), key=lambda e: list(e.absolute_path)):
        rep.errors.append(f"[SCHEMA] $.{'.'.join(str(p) for p in e.absolute_path)}: {e.message[:240]}")


def r_template_sequence(spec, rep, tpl, nodes):
    """Variant-aware sequence match of nodes[] against the DECLARED template's node list."""
    tnodes = tpl["nodes"]
    i = 0
    for ti, tn in enumerate(tnodes):
        lo = tn.get("minCount", 1 if tn["required"] else 0)
        hi = tn.get("maxCount", 99 if tn["repeatable"] else 1)
        nxt = tnodes[ti + 1] if ti + 1 < len(tnodes) else None
        n = 0
        while i < len(nodes) and n < hi and nodes[i].get("type") == tn["section"]:
            v = nodes[i].get("variant")
            if "variants" in tn and v not in tn["variants"]:
                if nxt and nxt["section"] == tn["section"] and v in nxt.get("variants", [v]) and n >= lo:
                    break
                rep.add("TEMPLATE_VARIANT", f"variant {v!r} not allowed by {tpl['id']} for {tn['section']} here (allowed {tn['variants']})", f"nodes[{i}]")
            n += 1
            i += 1
        if n < lo:
            want = f"{lo} x {tn['section']}" + (f" {tn['variants']}" if "variants" in tn else "")
            rep.add("TEMPLATE_NODE_SEQUENCE", f"{tpl['id']} expects {want} at this position, found {n}", f"nodes[{i}]")
    allowed = {tn["section"] for tn in tnodes}
    for j in range(i, len(nodes)):
        t = nodes[j].get("type")
        why = "is not part of" if t not in allowed else "is out of order / repeated for"
        rep.add("TEMPLATE_NODE_SEQUENCE", f"{t} {why} {tpl['id']}", f"nodes[{j}]")


def r_route_template(spec, rep, tpl):
    if not any(route_matches(spec.get("route"), p) for p in tpl["routePatterns"]):
        rep.add("ROUTE_TEMPLATE", f"route {spec.get('route')!r} does not match {tpl['id']} routePatterns {tpl['routePatterns']}")


def r_one_per_page(spec, rep, nodes):
    seen = {}
    for i, n in enumerate(nodes):
        c = SECTIONS.get(n.get("type"))
        if not c or not c["constraints"].get("onePerPage", True):
            continue
        key = (n.get("type"), n.get("variant"))
        if key in seen:
            rep.add("ONE_PER_PAGE", f"{key[0]} (variant {key[1]}) already at nodes[{seen[key]}]", f"nodes[{i}]")
        else:
            seen[key] = i


def r_shell_order(spec, rep, nodes):
    types = [n.get("type") for n in nodes]
    if not types:
        return
    if types[0] != "shell.overlays":
        rep.add("SHELL_ORDER", "shell.overlays must be the first node")
    if types[-1] != "shell.footer":
        rep.add("SHELL_ORDER", "shell.footer must be the last node")


def r_one_hero(spec, rep, nodes):
    p = GRAPH["ONE_HERO"]["parameters"]
    heroes = [i for i, n in enumerate(nodes) if CATEGORY.get(n.get("type")) == "hero"]
    if len(heroes) > 1:
        rep.add("ONE_HERO", f"{len(heroes)} hero sections at {heroes}")
    t = spec.get("template")
    if t in p["heroRequiredTemplates"] and not heroes:
        rep.add("ONE_HERO", f"{t} requires exactly one hero section")
    if t in p["noHeroTemplates"] and heroes:
        rep.add("ONE_HERO", f"{t} is a named no-hero exception: it must not contain a hero section (spec P0.1)")


def r_home_only(spec, rep, nodes):
    only = set(GRAPH["HOME_ROUTE_ONLY"]["parameters"]["sections"])
    if spec.get("route") == "/":
        return
    for i, n in enumerate(nodes):
        if n.get("type") in only:
            rep.add("HOME_ROUTE_ONLY", f"{n.get('type')} exists only on the homepage", f"nodes[{i}]")


def r_header_placement(spec, rep, nodes):
    p = GRAPH["HEADER_PLACEMENT"]["parameters"]
    t = spec.get("template")
    types = [n.get("type") for n in nodes]
    if t in p["embeddedHeaderTemplates"] and "shell.header" in types:
        rep.add("HEADER_PLACEMENT", f"{t} embeds its header inside hero.home; a standalone shell.header is not allowed")
    if t in p["standaloneHeaderTemplates"] and (len(types) < 2 or types[1] != "shell.header"):
        rep.add("HEADER_PLACEMENT", f"{t} requires shell.header directly after shell.overlays")


def r_nav_variant(spec, rep, nodes):
    p = GRAPH["NAV_VARIANT_BY_ROUTE"]["parameters"]
    want = p["routeVariants"].get(spec.get("route"), p["defaultVariant"])
    for i, n in enumerate(nodes):
        if n.get("type") != "shell.header":
            continue
        if n.get("variant") != want:
            rep.add("NAV_VARIANT_BY_ROUTE", f"header variant must be {want!r} on route {spec.get('route')!r}", f"nodes[{i}]")
        has_cta = isinstance(n.get("content"), dict) and "cta" in n["content"]
        if n.get("variant") == "default" and not has_cta:
            rep.add("NAV_VARIANT_BY_ROUTE", "variant 'default' renders the CTA: content.cta is required", f"nodes[{i}]")
        if n.get("variant") == "default-no-cta" and has_cta:
            rep.add("NAV_VARIANT_BY_ROUTE", "variant 'default-no-cta' (/waitlist) has no CTA: remove content.cta", f"nodes[{i}]")


def _is_div(n, variant=None):
    return n.get("type") == "layout.section-divider" and (variant is None or n.get("variant") == variant)


def r_divider_rhythm(spec, rep, nodes):
    main = GRAPH["SECTION_DIVIDER_RHYTHM"]["parameters"]["mainSections"]
    idx = [i for i, n in enumerate(nodes) if n.get("type") in main]
    if not idx:
        return
    for a, b in zip(idx, idx[1:]):
        between = nodes[a + 1:b]
        if not between or not all(_is_div(x, "rule") for x in between):
            rep.add("SECTION_DIVIDER_RHYTHM", f"{nodes[a].get('type')} and {nodes[b].get('type')} must be separated by rule divider(s) only", f"nodes[{b}]")
    first, last = idx[0], idx[-1]
    if first == 0 or not _is_div(nodes[first - 1], "spacer-top"):
        rep.add("SECTION_DIVIDER_RHYTHM", "the first main section must follow the spacer-top divider", f"nodes[{first}]")
    tail = nodes[last + 1:last + 3]
    if len(tail) < 2 or not (_is_div(tail[0], "rule") and _is_div(tail[1], "spacer-bottom")):
        rep.add("SECTION_DIVIDER_RHYTHM", "the last main section must be followed by a rule divider then the spacer-bottom divider", f"nodes[{last}]")


def r_double_divider(spec, rep, nodes):
    p = GRAPH["DOUBLE_DIVIDER_BEFORE_HOW"]["parameters"]
    runs, i = [], 0
    while i < len(nodes):
        if _is_div(nodes[i], "rule"):
            j = i
            while j < len(nodes) and _is_div(nodes[j], "rule"):
                j += 1
            runs.append((i, j - i))
            i = j
        else:
            i += 1
    doubles = [(s, n) for s, n in runs if n >= 2]
    has_how = any(n.get("type") == p["section"] for n in nodes)
    if not has_how and not doubles:
        return
    ok = [(s, n) for s, n in doubles if n == p["count"] and s + n < len(nodes) and nodes[s + n].get("type") == p["section"]]
    if has_how and not ok:
        rep.add("DOUBLE_DIVIDER_BEFORE_HOW", f"{p['section']} must be immediately preceded by exactly {p['count']} rule dividers")
    for s, n in doubles:
        if (s, n) not in ok:
            rep.add("DOUBLE_DIVIDER_BEFORE_HOW", f"{n} consecutive rule dividers at nodes[{s}]: the double divider exists only before {p['section']}")


def r_cta_outside_main(spec, rep, nodes):
    for i, n in enumerate(nodes):
        if n.get("type") == "cta.vortex":
            if i == 0 or not _is_div(nodes[i - 1], "spacer-bottom"):
                rep.add("CTA_OUTSIDE_MAIN", "cta.vortex sits outside <main>: it must follow the closing spacer-bottom divider", f"nodes[{i}]")
            if i + 1 >= len(nodes) or nodes[i + 1].get("type") != "shell.footer":
                rep.add("CTA_OUTSIDE_MAIN", "cta.vortex must directly precede shell.footer", f"nodes[{i}]")


def r_post_state(spec, rep, nodes):
    types = [n.get("type") for n in nodes]
    for i, n in enumerate(nodes):
        if n.get("type") != "post.article":
            continue
        nxt = types[i + 1] if i + 1 < len(types) else None
        if n.get("variant") == "post" and nxt != "post.cta-aside":
            rep.add("POST_STATE_SHAPE", "a found post renders the CTA aside directly after the article", f"nodes[{i}]")
        if n.get("variant") == "not-found" and "post.cta-aside" in types:
            rep.add("POST_STATE_SHAPE", "the not-found state renders no CTA aside (BlogPost.jsx `post &&`)", f"nodes[{i}]")


def r_waitlist_view(spec, rep, nodes):
    if spec.get("template") != "tpl.waitlist":
        return
    views = [n.get("type") for n in nodes if n.get("type") in ("waitlist.form-view", "waitlist.dashboard-view")]
    if len(views) != 1:
        rep.add("WAITLIST_SINGLE_VIEW", f"exactly one of waitlist.form-view / waitlist.dashboard-view is rendered at a time, found {views}")


def r_blog_order(spec, rep, nodes):
    for i, n in enumerate(nodes):
        if n.get("type") == "blog.index-list" and isinstance(n.get("content"), dict):
            dates = [p.get("date", "") for p in n["content"].get("posts", []) if isinstance(p, dict)]
            if dates != sorted(dates, reverse=True):
                rep.add("BLOG_INDEX_NEWEST_FIRST", f"posts must be sorted newest first, got {dates}", f"nodes[{i}].content.posts")


def r_motion(spec, rep, nodes):
    unhandled = set()
    shaders = 0
    presets = GRAPH["SHADER_PRESET_BY_SECTION"]["parameters"]
    for i, n in enumerate(nodes):
        m = n.get("motion") if isinstance(n.get("motion"), dict) else {}
        pat = m.get("pattern")
        c = SECTIONS.get(n.get("type"))
        if "reducedMotionFallback" not in m:
            rep.add("REDUCED_MOTION_FALLBACK", "missing reducedMotionFallback", f"nodes[{i}].motion")
        elif pat in PATTERNS and m["reducedMotionFallback"] != PATTERNS[pat]["reducedMotionFallback"]:
            rep.add("REDUCED_MOTION_FALLBACK", f"fallback for {pat} must be {PATTERNS[pat]['reducedMotionFallback']!r}", f"nodes[{i}].motion")
        if c and pat not in [x["pattern"] for x in c["motion"]["allowed"]]:
            rep.add("MOTION_PATTERN_ALLOWED", f"pattern {pat!r} not allowed for {n.get('type')} (allowed {[x['pattern'] for x in c['motion']['allowed']]})", f"nodes[{i}].motion")
        if pat in PATTERNS and not PATTERNS[pat]["reducedMotionHandledInSource"]:
            unhandled.add(pat)
        want = presets["bySection"].get(n.get("type"))
        if "shaderPreset" in m or want:
            shaders += 1 if "shaderPreset" in m else 0
            if m.get("shaderPreset") != want:
                rep.add("SHADER_PRESET_BY_SECTION", f"{n.get('type')} shaderPreset must be {want!r}, got {m.get('shaderPreset')!r}", f"nodes[{i}].motion")
    if shaders > presets["maxPerPage"]:
        rep.add("SHADER_PRESET_BY_SECTION", f"{shaders} shader canvases > maxPerPage {presets['maxPerPage']}")
    if unhandled:
        rep.add("REDUCED_MOTION_UNHANDLED_IN_SOURCE", f"patterns with no prefers-reduced-motion path in the clone source (the fallback must be implemented by the generator): {sorted(unhandled)}")


def r_budgets(spec, rep, nodes):
    for i, n in enumerate(nodes):
        cs = content_schema(n)
        if cs and isinstance(n.get("content"), dict):
            walk_budget(cs, n["content"], f"nodes[{i}].content", rep)


def r_external(spec, rep, nodes):
    for path, s in iter_strings(spec):
        for rx, what in EXTERNAL_PATTERNS:
            if rx.search(s):
                rep.add("NO_EXTERNAL_TARGETS", f"{what} in {s[:80]!r}", path)
                break
        for m in MD_LINK.finditer(s):
            if not ROUTE_RX.match(m.group(2)):
                rep.add("NO_EXTERNAL_TARGETS", f"inline link target {m.group(2)!r} is not an internal route", path)


def r_backend(spec, rep, nodes):
    pats = [re.compile(p, re.I) for p in GRAPH["NO_BACKEND_ENDPOINTS"]["parameters"]["forbiddenPatterns"]]
    for path, s in iter_strings(spec):
        for rx in pats:
            if rx.search(s):
                rep.add("NO_BACKEND_ENDPOINTS", f"{s[:80]!r} references a backend/third-party service ({rx.pattern})", path)
                break


def r_asset_urls(spec, rep, nodes):
    for path, s in copy_strings(nodes):
        if path.endswith((".assetRole", ".iconKey")):
            continue
        if ASSET_URL.search(s):
            rep.add("NO_ASSET_URLS", f"asset file path/URL in content {s[:80]!r}: media is referenced by assetRole only", path)


def r_brand(spec, rep, nodes):
    rx = re.compile(GRAPH["SOURCE_BRAND_IN_COPY"]["parameters"]["pattern"])
    hits = [p for p, s in copy_strings(nodes) if rx.search(s)]
    if hits:
        rep.add("SOURCE_BRAND_IN_COPY", f"{len(hits)} copy string(s) name the real company (Rig / rig.ai / Rig AI Inc.); acceptable only in this private design review - substitute the client's own brand before any production use. First: {hits[:3]}")


def r_fingerprint(spec, rep, nodes):
    for path, s in copy_strings(nodes):
        for cand in fingerprint_candidates(s):
            if hashlib.sha256(cand.encode("utf-8")).hexdigest()[:32] in FINGERPRINTS:
                rep.add("ORIGINAL_COPY_FINGERPRINT", "string matches a fingerprint of the ORIGINAL site's copy; write new copy", path)
                break


RULES = {
    "TEMPLATE_NODE_SEQUENCE": None, "TEMPLATE_VARIANT": None, "ROUTE_TEMPLATE": None,  # run in validate() against the declared template
    "ONE_PER_PAGE": r_one_per_page, "SHELL_ORDER": r_shell_order, "ONE_HERO": r_one_hero, "HOME_ROUTE_ONLY": r_home_only,
    "HEADER_PLACEMENT": r_header_placement, "NAV_VARIANT_BY_ROUTE": r_nav_variant, "SECTION_DIVIDER_RHYTHM": r_divider_rhythm,
    "DOUBLE_DIVIDER_BEFORE_HOW": r_double_divider, "CTA_OUTSIDE_MAIN": r_cta_outside_main, "POST_STATE_SHAPE": r_post_state,
    "WAITLIST_SINGLE_VIEW": r_waitlist_view, "BLOG_INDEX_NEWEST_FIRST": r_blog_order,
    "MOTION_PATTERN_ALLOWED": r_motion, "REDUCED_MOTION_FALLBACK": None, "REDUCED_MOTION_UNHANDLED_IN_SOURCE": None, "SHADER_PRESET_BY_SECTION": None,
    "MAX_WORDS": r_budgets, "ASSET_ROLE_REGISTERED": None,
    "NO_EXTERNAL_TARGETS": r_external, "NO_BACKEND_ENDPOINTS": r_backend, "NO_ASSET_URLS": r_asset_urls,
    "SOURCE_BRAND_IN_COPY": r_brand, "ORIGINAL_COPY_FINGERPRINT": r_fingerprint,
}
# Rules mapped to None are reported from inside another rule's function:
# TEMPLATE_* / ROUTE_TEMPLATE in validate(); REDUCED_MOTION_* and SHADER_PRESET_BY_SECTION in r_motion;
# ASSET_ROLE_REGISTERED in r_budgets (walk_budget).


def validate(spec):
    rep = Report()
    if not isinstance(spec, dict):
        rep.errors.append("[SCHEMA] PageSpec must be an object")
        return rep
    r_schema(spec, rep)
    nodes = [n for n in spec.get("nodes", []) if isinstance(n, dict)] if isinstance(spec.get("nodes"), list) else []
    tpl = TEMPLATES.get(spec.get("template"))
    if tpl:
        r_template_sequence(spec, rep, tpl, nodes)
        r_route_template(spec, rep, tpl)
    else:
        rep.add("TEMPLATE_NODE_SEQUENCE", f"unknown template {spec.get('template')!r}")
    done = set()
    for fn in RULES.values():
        if fn and fn not in done:
            fn(spec, rep, nodes)
            done.add(fn)
    return rep


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    failed = False
    for p in argv[1:]:
        rep = validate(json.loads(Path(p).read_text(encoding="utf-8")))
        print(f"{p}: {len(rep.errors)} error(s), {len(rep.warnings)} warning(s)")
        for e in rep.errors:
            print("  ERROR", e)
        for w in rep.warnings:
            print("  warn ", w)
        failed |= bool(rep.errors)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
