#!/usr/bin/env python3
"""One-stop verification for this design-repo.

Checks: JSON validity, no absolute machine paths, manifest entry points inside the repo,
recomputed counts (manifest + README + CHANGELOG), version parity, allowlist <-> contract
parity, allowlist <-> schema parity, asset-role parity, graph <-> validator rule parity,
graph rule parameters <-> templates.json agreement, template/route coverage (1:1), token
alias resolution + theme recomputation, motion registry, maxWords evidence, the
original-copy fingerprint file, Draft-07 + semantic validation of the example and every
fixture, and citation validity (range + quoted content) against the sibling source tree.

Citations resolve against DESIGN_REPO_SOURCE_ROOT or the parent folder of the repo. If no
source tree is found there, citation checks WARN and are skipped (the repo stays
self-contained). Exit 1 on any FAIL.
"""
import importlib
import json
import os
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SRC_ROOT = Path(os.environ.get("DESIGN_REPO_SOURCE_ROOT") or REPO.parent).resolve()
SOURCE_PRESENT = (SRC_ROOT / "src" / "App.jsx").is_file() and (SRC_ROOT / "CLONE_SPEC.md").is_file()

RESULTS = []


def record(status, check, msg=""):
    RESULTS.append((status, check, msg))
    print(f"{status:4} {check}{': ' + msg if msg else ''}")


def fail(check, msg):
    record("FAIL", check, msg)


def ok(check, msg=""):
    record("PASS", check, msg)


def warn(check, msg):
    record("WARN", check, msg)


def load(rel):
    return json.loads((REPO / rel).read_text(encoding="utf-8"))


def wc(s):
    return len(re.findall(r"\S+", s))


def jfiles():
    return sorted(p for p in REPO.rglob("*.json") if "__pycache__" not in p.parts)


def section_files():
    return {json.loads(f.read_text(encoding="utf-8"))["id"]: json.loads(f.read_text(encoding="utf-8")) for f in sorted((REPO / "sections").glob("*.json"))}


# ------------------------------------------------------------------ json / paths / entry points
def check_json():
    bad = []
    for p in jfiles():
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001
            bad.append(f"{p.relative_to(REPO)}: {e}")
    fail("json_valid", "; ".join(bad)) if bad else ok("json_valid", f"{len(jfiles())} JSON files parse")


ABS = re.compile(r"(/[U]sers/|/home/[a-z]|/private/(tmp|var)|/var/[f]olders/|[A-Z]:\\\\[U]sers)")


def check_abs_paths():
    hits = []
    for p in REPO.rglob("*"):
        if p.is_file() and "__pycache__" not in p.parts and p.suffix in (".json", ".md", ".py", ".txt", ""):
            for i, line in enumerate(p.read_text(encoding="utf-8", errors="ignore").split("\n"), 1):
                if ABS.search(line):
                    hits.append(f"{p.relative_to(REPO)}:{i}")
    fail("no_absolute_paths", ", ".join(hits[:10])) if hits else ok("no_absolute_paths", "no machine-specific absolute paths anywhere in the repo")


def check_entrypoints(man):
    bad = []

    def walk(v):
        if isinstance(v, str):
            if v.startswith(("../", "/")) or ".." in Path(v).parts:
                bad.append(f"{v} (outside repo)")
            elif not (REPO / v).exists():
                bad.append(f"{v} (missing)")
        elif isinstance(v, dict):
            for x in v.values():
                walk(x)
        elif isinstance(v, list):
            for x in v:
                walk(x)
    walk(man["entryPoints"])
    fail("manifest_entrypoints_internal", "; ".join(bad)) if bad else ok("manifest_entrypoints_internal", "every entry point is a file inside design-repo/")


# ------------------------------------------------------------------ tokens
def _collect(d, prefix, out):
    for k, v in d.items():
        if k.startswith("$") or not isinstance(v, dict):
            continue
        key = f"{prefix}.{k}" if prefix else k
        if "$value" in v:
            out[key] = v["$value"]
        else:
            _collect(v, key, out)


def token_index(layers=("00-foundation", "10-semantic", "20-component", "30-layout")):
    idx = {}
    for layer in layers:
        for f in sorted((REPO / "tokens" / layer).glob("*.json")):
            _collect(json.loads(f.read_text(encoding="utf-8")), "", idx)
    return idx


def token_layer_counts():
    out = {layer: len(token_index((layer,))) for layer in ("00-foundation", "10-semantic", "20-component", "30-layout")}
    out["total"] = sum(out.values())
    return out


def resolve(v, idx, seen=()):
    m = re.fullmatch(r"\{([^}]+)\}", v) if isinstance(v, str) else None
    if not m:
        return v
    k = m.group(1)
    if k in seen or k not in idx:
        raise KeyError(k)
    return resolve(idx[k], idx, seen + (k,))


def resolved_aliases():
    idx = token_index()
    return {k: resolve(v, idx) for k, v in sorted(idx.items()) if isinstance(v, str) and v.startswith("{")}


# ------------------------------------------------------------------ counts
def adversarial_count():
    sys.path.insert(0, str(REPO / "schema" / "tests"))
    mod = importlib.import_module("adversarial_test")
    return len(mod.M)


def compute_counts():
    tpl = load("templates/templates.json")
    reg = load("tokens/00-foundation/motion-patterns.json")
    return {
        "tokens": token_layer_counts(),
        "motionPatterns": len(reg["pattern"]),
        "shaderPresets": len(reg["shaderPreset"]),
        "primitives": len(list((REPO / "primitives").glob("*.json"))),
        "components": len(list((REPO / "components").glob("*.json"))),
        "sections": len(list((REPO / "sections").glob("*.json"))),
        "templates": len(tpl["templates"]),
        "routes": len(tpl["routeInventory"]["routes"]),
        "assetRoles": len(load("assets/asset-roles.json")["roles"]),
        "graphRules": len(load("compatibility/graph.json")["rules"]),
        "fixtures": len(list((REPO / "schema/fixtures").glob("*.pagespec.json"))),
        "adversarialMutations": adversarial_count(),
        "originalCopyFingerprints": len(load("assets/original-copy-fingerprints.json")["fingerprints"]),
    }


README_ROWS = [("Foundation tokens", ("tokens", "00-foundation")), ("Semantic tokens", ("tokens", "10-semantic")), ("Component tokens", ("tokens", "20-component")),
               ("Layout tokens", ("tokens", "30-layout")), ("Tokens total", ("tokens", "total")), ("Motion patterns", ("motionPatterns",)), ("Shader presets", ("shaderPresets",)),
               ("Primitives", ("primitives",)), ("Components", ("components",)), ("Sections", ("sections",)), ("Templates", ("templates",)), ("Routes covered", ("routes",)),
               ("Asset roles", ("assetRoles",)), ("Compatibility rules", ("graphRules",)), ("Real-content fixtures", ("fixtures",)), ("Adversarial mutations", ("adversarialMutations",)),
               ("Original-copy fingerprints", ("originalCopyFingerprints",))]


def _get(d, path):
    for k in path:
        d = d[k]
    return d


def check_counts(man):
    counts = compute_counts()
    if counts != man["counts"]:
        fail("manifest_counts", f"disk {counts} != manifest {man['counts']}")
    else:
        ok("manifest_counts", json.dumps(counts, separators=(",", ":")))
    readme = (REPO / "README.md").read_text(encoding="utf-8")
    miss = [f"{label}={_get(counts, path)}" for label, path in README_ROWS if f"| {label} | {_get(counts, path)} |" not in readme]
    fail("readme_counts", "README table disagrees with disk: " + ", ".join(miss)) if miss else ok("readme_counts", f"{len(README_ROWS)} README rows equal recomputed counts")
    ch = (REPO / "CHANGELOG.md").read_text(encoding="utf-8")
    want = changelog_count_line(counts)
    fail("changelog_counts", f"CHANGELOG lacks the recomputed count line: {want!r}") if want not in ch else ok("changelog_counts")


def changelog_count_line(c):
    return (f"{c['tokens']['total']} tokens, {c['primitives']} primitives, {c['components']} components, {c['sections']} sections, "
            f"{c['templates']} templates covering {c['routes']} routes; {c['assetRoles']} asset roles; {c['graphRules']} compatibility rules; "
            f"{c['fixtures']} real-content fixtures; {c['adversarialMutations']} adversarial mutations.")


# ------------------------------------------------------------------ versions
def check_versions(man):
    allow = load("tokens/llm/component-allowlist.json")
    errs = []
    for rel, key in (("tokens/llm/component-allowlist.json", "allowlistVersion"), ("assets/asset-roles.json", "version"), ("templates/templates.json", "version"), ("compatibility/graph.json", "version")):
        v = load(rel)[key]
        if v != man["allowlistVersion"]:
            errs.append(f"{rel} {key} {v} != manifest allowlistVersion {man['allowlistVersion']}")
    if man["pageSpecVersion"] != load("schema/pagespec.schema.json")["properties"]["pageSpecVersion"]["const"]:
        errs.append("manifest pageSpecVersion != schema pageSpecVersion const")
    if man.get("status") != "design-review-pending" or man.get("productionApproved") is not False:
        errs.append("status/productionApproved must stay design-review-pending/false")
    fail("version_parity", "; ".join(errs)) if errs else ok("version_parity", f"allowlist {allow['allowlistVersion']} (= asset-roles/templates/graph), pageSpec {man['pageSpecVersion']}; repositoryVersion is documentation-only")


# ------------------------------------------------------------------ allowlist parity
def schema_branches():
    out = {}
    for br in load("schema/pagespec.schema.json")["definitions"]["node"]["allOf"]:
        out[br["if"]["properties"]["type"]["const"]] = br["then"]
    return out


def branch_content_keys(th):
    if "allOf" in th:
        keys = set()
        for sub in th["allOf"]:
            keys |= set(sub["then"]["properties"]["content"]["properties"])
        return keys
    return set(th["properties"]["content"]["properties"])


def check_allowlist():
    allow = load("tokens/llm/component-allowlist.json")
    schema = load("schema/pagespec.schema.json")
    errs = []
    for kind, folder in (("sections", "sections"), ("components", "components"), ("primitives", "primitives")):
        listed = {e["id"]: e["contract"] for e in allow[kind]}
        files = {json.loads(f.read_text(encoding="utf-8"))["id"]: f"{folder}/{f.name}" for f in (REPO / folder).glob("*.json")}
        errs += [f"phantom allowlist {kind} entry {i} (no contract file)" for i in sorted(set(listed) - set(files))]
        errs += [f"orphan {kind} contract {i} (no allowlist entry)" for i in sorted(set(files) - set(listed))]
        errs += [f"{i} contract path {listed[i]} != {files[i]}" for i in sorted(set(listed) & set(files)) if listed[i] != files[i]]
    fail("allowlist_contract_parity", "; ".join(errs)) if errs else ok("allowlist_contract_parity", "allowlist ids == contract files (sections, components, primitives)")

    errs = []
    br = schema_branches()
    secs = {e["id"]: e for e in allow["sections"]}
    types = set(schema["definitions"]["node"]["properties"]["type"]["enum"])
    if types != set(secs) or set(br) != set(secs):
        errs.append(f"schema node types / branches != allowlist sections: {sorted(types ^ set(secs))}")
    for sid, th in br.items():
        e = secs.get(sid)
        if not e:
            continue
        mkeys = set()
        for o in th["properties"]["motion"]["oneOf"]:
            mkeys |= set(o["properties"])
        exp = {"type"} | ({"variant"} if "variant" in th["properties"] else set()) | {f"content.{k}" for k in branch_content_keys(th)} | {f"motion.{k}" for k in mkeys}
        if exp != set(e["settable"]):
            errs.append(f"{sid} settable differs from schema: {sorted(set(e['settable']) ^ exp)}")
        if sorted(th["properties"].get("variant", {}).get("enum", [])) != sorted(e["variants"]):
            errs.append(f"{sid} variants differ from schema")
        if sorted(o["properties"]["pattern"]["const"] for o in th["properties"]["motion"]["oneOf"]) != sorted(e["motionPatterns"]):
            errs.append(f"{sid} motion patterns differ from schema")
    tpl_ids = [t["id"] for t in load("templates/templates.json")["templates"]]
    if sorted(tpl_ids) != sorted(allow["templates"]) or sorted(tpl_ids) != sorted(schema["properties"]["template"]["enum"]):
        errs.append("template ids differ between templates.json / allowlist / schema")
    reg = load("tokens/00-foundation/motion-patterns.json")
    if sorted(allow["motionPatterns"]) != sorted(reg["pattern"]) or sorted(allow["shaderPresets"]) != sorted(reg["shaderPreset"]):
        errs.append("allowlist motionPatterns/shaderPresets != motion-patterns.json")
    icons = set()

    def walk(v):
        if isinstance(v, dict):
            if "iconKey" in v.get("properties", {}):
                icons.update(v["properties"]["iconKey"]["enum"])
            for x in v.values():
                walk(x)
        elif isinstance(v, list):
            for x in v:
                walk(x)
    walk(schema)
    if sorted(icons) != sorted(allow["badgeIcons"]):
        errs.append(f"allowlist badgeIcons != schema iconKey enum: {sorted(icons ^ set(allow['badgeIcons']))}")
    fail("allowlist_schema_parity", "; ".join(errs)) if errs else ok("allowlist_schema_parity", "settable props / variants / motion / templates / presets / badge icons match the schema")


# ------------------------------------------------------------------ asset roles
def _roles_in(v, acc):
    if isinstance(v, dict):
        if "assetRole" in v.get("properties", {}):
            acc.update(v["properties"]["assetRole"].get("enum", []))
        for x in v.values():
            _roles_in(x, acc)
    elif isinstance(v, list):
        for x in v:
            _roles_in(x, acc)
    return acc


def _instance_roles(v, acc):
    if isinstance(v, dict):
        if "assetRole" in v:
            acc.add(v["assetRole"])
        for x in v.values():
            _instance_roles(x, acc)
    elif isinstance(v, list):
        for x in v:
            _instance_roles(x, acc)
    return acc


def check_asset_roles():
    reg = load("assets/asset-roles.json")
    allow = load("tokens/llm/component-allowlist.json")
    roles = {r["id"] for r in reg["roles"]}
    errs = []
    if roles != set(allow["assetRoles"]):
        errs.append(f"registry != allowlist: {sorted(roles ^ set(allow['assetRoles']))}")
    used = _roles_in(load("schema/pagespec.schema.json"), set())
    if not used <= roles:
        errs.append(f"schema enums not registered: {sorted(used - roles)}")
    listed = set()
    for sid, d in section_files().items():
        declared = set(d["assetRoles"])
        inside = _roles_in(d.get("content") or d.get("contentByVariant"), set())
        listed |= declared
        if declared != inside:
            errs.append(f"{sid} assetRoles {sorted(declared)} != roles in its content contract {sorted(inside)}")
        fixed = set(d.get("fixedAssetRoles", []))
        listed |= fixed
        if fixed & declared:
            errs.append(f"{sid} fixedAssetRoles overlap assetRoles")
    if not listed <= roles:
        errs.append(f"section assetRoles not registered: {sorted(listed - roles)}")
    if roles - used - listed:
        errs.append(f"registered but never referenced: {sorted(roles - used - listed)}")
    for r in reg["roles"]:
        if r["generation"] not in reg["generationValues"] or not r.get("guidance") or not r.get("forbidden"):
            errs.append(f"{r['id']} lacks generation guidance / forbidden list")
    if not reg.get("realCompanyPolicy", {}).get("forbiddenToReproduce"):
        errs.append("realCompanyPolicy.forbiddenToReproduce missing")
    if reg.get("fontPolicy", {}).get("Chalet", {}).get("license") != "commercial":
        errs.append("fontPolicy must flag Chalet as commercial")
    mnf = {r["id"] for r in reg["roles"] if r["generation"] == "must-not-fabricate"}
    if not {"brand.wordmark", "brand.logo-mark", "text.ascii-brand-art"} <= mnf:
        errs.append("real-company brand roles must be must-not-fabricate")
    ex = _instance_roles(load("schema/example.pagespec.json"), set())
    for p in (REPO / "schema/fixtures").glob("*.pagespec.json"):
        ex |= _instance_roles(json.loads(p.read_text(encoding="utf-8")), set())
    if not ex or not ex <= roles:
        errs.append(f"example/fixture asset roles invalid/empty: {sorted(ex - roles)}")
    fail("asset_role_parity", "; ".join(errs)) if errs else ok("asset_role_parity", f"{len(roles)} roles wired through registry/schema/sections/allowlist/example+fixtures ({len(ex)} used)")


# ------------------------------------------------------------------ graph
def check_graph_validator():
    sys.path.insert(0, str(REPO / "schema"))
    sv = importlib.import_module("semantic_validate")
    graph = load("compatibility/graph.json")
    g = {r["id"] for r in graph["rules"] if r["enforcedBy"] == "semantic_validate.py"}
    v = set(sv.RULES)
    errs = []
    if g != v:
        errs.append(f"graph-only {sorted(g - v)}; validator-only {sorted(v - g)}")
    for r in graph["rules"]:
        if r["severity"] not in ("error", "warn"):
            errs.append(f"{r['id']} bad severity {r['severity']!r}")
    src = (REPO / "schema/semantic_validate.py").read_text(encoding="utf-8")
    for rid in sorted(g):
        if src.count(f'"{rid}"') < 2:
            errs.append(f"{rid} registered but never reported by any rule function")
    fail("graph_validator_parity", "; ".join(errs)) if errs else ok("graph_validator_parity", f"{len(g)} rule ids identical in graph.json and semantic_validate.py, each reported")
    return sv


def check_graph_templates():
    g = {r["id"]: r for r in load("compatibility/graph.json")["rules"]}
    tpls = load("templates/templates.json")["templates"]
    secs = section_files()
    cat = {k: v["category"] for k, v in secs.items()}
    errs = []
    hero_req = sorted(t["id"] for t in tpls if any(cat.get(n["section"]) == "hero" and n["required"] for n in t["nodes"]))
    no_hero = sorted(t["id"] for t in tpls if not any(cat.get(n["section"]) == "hero" for n in t["nodes"]))
    p = g["ONE_HERO"]["parameters"]
    if sorted(p["heroRequiredTemplates"]) != hero_req or sorted(p["noHeroTemplates"]) != no_hero:
        errs.append(f"ONE_HERO params {p} != templates (hero required {hero_req}, no hero {no_hero})")
    exc = sorted(x for e in g["ONE_HERO"].get("exceptions", []) for x in e["templates"])
    if exc != no_hero:
        errs.append(f"ONE_HERO named exceptions {exc} != hero-less templates {no_hero}")
    home = next(t for t in tpls if t["id"] == "tpl.home")
    others = {n["section"] for t in tpls if t["id"] != "tpl.home" for n in t["nodes"]}
    home_only = sorted({n["section"] for n in home["nodes"]} - others)
    if sorted(g["HOME_ROUTE_ONLY"]["parameters"]["sections"]) != home_only:
        errs.append(f"HOME_ROUTE_ONLY sections != sections only in tpl.home {home_only}")
    emb = sorted(t["id"] for t in tpls if not any(n["section"] == "shell.header" for n in t["nodes"]))
    std = sorted(t["id"] for t in tpls if len(t["nodes"]) > 1 and t["nodes"][1]["section"] == "shell.header")
    hp = g["HEADER_PLACEMENT"]["parameters"]
    if sorted(hp["embeddedHeaderTemplates"]) != emb or sorted(hp["standaloneHeaderTemplates"]) != std:
        errs.append(f"HEADER_PLACEMENT params != templates (embedded {emb}, standalone {std})")
    nv = g["NAV_VARIANT_BY_ROUTE"]["parameters"]
    for t in tpls:
        for n in t["nodes"]:
            if n["section"] == "shell.header":
                want = sorted({nv["routeVariants"].get(r, nv["defaultVariant"]) for r in t["routes"]})
                if sorted(n.get("variants", [])) != want:
                    errs.append(f"NAV_VARIANT_BY_ROUTE: {t['id']} header variants {n.get('variants')} != {want}")
    ids = [n["section"] for n in home["nodes"]]
    main = [s for s in ids[ids.index("layout.section-divider"):] if s != "layout.section-divider" and cat.get(s) in ("content", "conversion") and s != "cta.vortex"]
    if g["SECTION_DIVIDER_RHYTHM"]["parameters"]["mainSections"] != main:
        errs.append(f"SECTION_DIVIDER_RHYTHM mainSections != tpl.home main sections {main}")
    dd = g["DOUBLE_DIVIDER_BEFORE_HOW"]["parameters"]
    k = ids.index(dd["section"])
    prev = home["nodes"][k - 1]
    if not (prev["section"] == "layout.section-divider" and prev.get("minCount") == dd["count"] == prev.get("maxCount") and prev.get("variants") == ["rule"]):
        errs.append("DOUBLE_DIVIDER_BEFORE_HOW: tpl.home does not declare the double rule divider directly before how.stepper")
    by = {sid: m["shaderPreset"] for sid, d in secs.items() for m in d["motion"]["allowed"] if "shaderPreset" in m}
    if g["SHADER_PRESET_BY_SECTION"]["parameters"]["bySection"] != by:
        errs.append(f"SHADER_PRESET_BY_SECTION bySection != section motion presets {by}")
    bp = next(t for t in tpls if t["id"] == "tpl.blog-post")
    art = next(n for n in bp["nodes"] if n["section"] == "post.article")
    aside = next(n for n in bp["nodes"] if n["section"] == "post.cta-aside")
    if sorted(art.get("variants", [])) != ["not-found", "post"] or aside["required"]:
        errs.append("POST_STATE_SHAPE: tpl.blog-post must allow post|not-found and make the aside optional")
    wl = next(t for t in tpls if t["id"] == "tpl.waitlist")
    if any(n["required"] for n in wl["nodes"] if n["section"].startswith("waitlist.")):
        errs.append("WAITLIST_SINGLE_VIEW: both waitlist views must be optional template nodes (exactly-one is the rule)")
    rep = sorted(sid for sid, d in secs.items() if not d["constraints"].get("onePerPage", True))
    if rep != ["layout.section-divider"]:
        errs.append(f"ONE_PER_PAGE prose says only the divider repeats; contracts say {rep}")
    fail("graph_template_agreement", "; ".join(errs)) if errs else ok("graph_template_agreement", "every parameterised graph rule agrees with templates.json / section contracts")


# ------------------------------------------------------------------ templates / routes
def check_templates():
    t = load("templates/templates.json")
    secs = set(section_files())
    errs, used = [], set()
    for tp in t["templates"]:
        if not tp.get("routePatterns"):
            errs.append(f"{tp['id']} has no routePatterns")
        for n in tp["nodes"]:
            if not isinstance(n, dict) or not {"section", "required", "repeatable"} <= set(n):
                errs.append(f"{tp['id']} node not structured: {n}")
                continue
            used.add(n["section"])
            if n["section"] not in secs:
                errs.append(f"{tp['id']} uses missing section {n['section']}")
    if secs - used:
        errs.append(f"sections unused by any template: {sorted(secs - used)}")
    assigned = [r for tp in t["templates"] for r in tp["routes"]]
    inv = t["routeInventory"]["routes"]
    real = [r["route"] for r in inv]
    if len(assigned) != len(set(assigned)):
        errs.append("a route is assigned to more than one template")
    if sorted(assigned) != sorted(real):
        errs.append(f"route coverage gap: {sorted(set(assigned) ^ set(real))}")
    owner = {r: tp["id"] for tp in t["templates"] for r in tp["routes"]}
    for r in inv:
        if owner.get(r["route"]) != r["template"]:
            errs.append(f"{r['route']} inventory template {r['template']} != owner {owner.get(r['route'])}")
    fail("template_route_coverage", "; ".join(errs)) if errs else ok("template_route_coverage", f"{len(real)} routes -> {len(t['templates'])} templates, 1:1, structured nodes")


def check_tokens():
    idx = token_index()
    errs = []
    try:
        res = resolved_aliases()
    except KeyError as e:
        res = {}
        errs.append(f"unresolved alias {e}")
    for k, v in idx.items():
        if isinstance(v, dict):
            for kk, vv in v.items():
                if isinstance(vv, str) and vv.startswith("{"):
                    try:
                        resolve(vv, idx)
                    except KeyError as e:
                        errs.append(f"{k}.{kk} -> unresolved {e}")
    theme = load("tokens/themes/dark.json")
    if theme["resolved"] != res:
        errs.append(f"themes/dark.json stale: {sorted(set(theme['resolved'].items()) ^ set(res.items()))[:4]}")
    ids = set()
    for folder in ("primitives", "components"):
        for f in (REPO / folder).glob("*.json"):
            d = json.loads(f.read_text(encoding="utf-8"))
            ids.add(d["id"])
            errs += [f"{d['id']} tokensUsed {x} does not exist" for x in d["tokensUsed"] if x not in idx]
    for f in (REPO / "components").glob("*.json"):
        d = json.loads(f.read_text(encoding="utf-8"))
        errs += [f"{d['id']} composes {x} missing" for x in d["composes"] if x not in ids]
    for sid, d in section_files().items():
        errs += [f"{sid} composedOf {x} missing" for x in d["composedOf"] if x not in ids]
    cat = load("tokens/llm/token-catalog.json")
    for e in cat["tokens"]:
        if e["id"] not in idx:
            errs.append(f"catalog token {e['id']} missing")
        elif e["value"] != (res.get(e["id"], idx[e["id"]])):
            errs.append(f"catalog token {e['id']} value stale")
    for tkey in load("tokens/llm/token-policy.json")["flaggedTokens"]:
        if tkey not in idx:
            errs.append(f"policy flags unknown token {tkey}")
    fail("token_resolution", "; ".join(errs[:10])) if errs else ok("token_resolution", f"{len(idx)} tokens, {len(res)} aliases resolve; theme + catalog recomputed")


def check_motion():
    reg = load("tokens/00-foundation/motion-patterns.json")
    pats = reg["pattern"]
    errs, used = [], set()
    for sid, d in section_files().items():
        for m in d["motion"]["allowed"]:
            used.add(m["pattern"])
            r = pats.get(m["pattern"])
            if not r:
                errs.append(f"{sid} unknown pattern {m['pattern']}")
                continue
            if m["reducedMotionFallback"] != r["reducedMotionFallback"]:
                errs.append(f"{sid} fallback drift for {m['pattern']}")
            if m.get("shaderPreset") != r.get("shaderPreset"):
                errs.append(f"{sid} shaderPreset drift for {m['pattern']}")
            if m.get("shaderPreset") and m["shaderPreset"] not in reg["shaderPreset"]:
                errs.append(f"{sid} unknown shader preset {m['shaderPreset']}")
    if set(pats) - used:
        errs.append(f"patterns never allowed by any section: {sorted(set(pats) - used)}")
    for sid, th in schema_branches().items():
        for o in th["properties"]["motion"]["oneOf"]:
            if o.get("additionalProperties") is not False or not set(o["properties"]) <= {"pattern", "reducedMotionFallback", "shaderPreset"} or "reducedMotionFallback" not in o["required"]:
                errs.append(f"{sid} motion schema not closed / fallback not required")
    fail("motion_registry", "; ".join(errs)) if errs else ok("motion_registry", f"{len(pats)} patterns, {len(reg['shaderPreset'])} shader presets; motion objects closed, fallback required")


def check_budgets():
    errs, n = [], 0

    def walk(v, where):
        nonlocal n
        if isinstance(v, dict):
            ev = v.get("evidence")
            if isinstance(ev, dict) and "maxWords" in v:
                n += 1
                if ev.get("withheld"):
                    if ev.get("observedWordCount") != v["maxWords"]:
                        errs.append(f"{where}: maxWords {v['maxWords']} != observedWordCount {ev.get('observedWordCount')}")
                elif wc(ev.get("longestObserved", "")) != v["maxWords"]:
                    errs.append(f"{where}: maxWords {v['maxWords']} != words in longestObserved ({wc(ev.get('longestObserved', ''))})")
            if v.get("type") == "string" and "maxWords" not in v and not {"enum", "pattern", "const"} & set(v):
                errs.append(f"{where}: text field without maxWords")
            for k, x in v.items():
                walk(x, f"{where}.{k}")
        elif isinstance(v, list):
            for i, x in enumerate(v):
                walk(x, f"{where}[{i}]")
    for sid, d in section_files().items():
        walk(d.get("content") or d.get("contentByVariant"), sid)
    fail("maxwords_evidence", "; ".join(errs[:10])) if errs else ok("maxwords_evidence", f"{n} budgets equal the word count of their cited longest real clone value")


def check_fingerprints():
    d = load("assets/original-copy-fingerprints.json")
    fp = d["fingerprints"]
    errs = []
    if any(not re.fullmatch(r"[0-9a-f]{32}", x) for x in fp):
        errs.append("fingerprint entries must be 32-hex hashes only (no plaintext wording)")
    if fp != sorted(set(fp)) or d.get("count") != len(fp):
        errs.append("fingerprints must be sorted, unique and match count")
    fail("fingerprint_file", "; ".join(errs)) if errs else ok("fingerprint_file", f"{len(fp)} hash-only fingerprints of the original site's copy")


def check_schema(sv):
    from jsonschema import Draft7Validator
    schema = load("schema/pagespec.schema.json")
    try:
        Draft7Validator.check_schema(schema)
    except Exception as e:  # noqa: BLE001
        fail("schema_draft07", str(e)[:300])
        return
    specs = ["schema/example.pagespec.json"] + sorted(p.relative_to(REPO).as_posix() for p in (REPO / "schema/fixtures").glob("*.pagespec.json"))
    errs, warns = [], 0
    for rel in specs:
        rep = sv.validate(load(rel))
        warns += len(rep.warnings)
        errs += [f"{rel}: {e}" for e in rep.errors]
    fail("pagespec_validation", "; ".join(errs[:5])) if errs else ok("pagespec_validation", f"{len(specs)} specs (example + fixtures), 0 errors, {warns} warnings")


# ------------------------------------------------------------------ citations
CITE = re.compile(r"^((?:src|public|reference|scripts)/[^\s:]+|CLONE_SPEC\.md|CLONE_ASSETS(?:_PAGES)?\.json|index\.html|tailwind\.config\.js|package\.json|vite\.config\.js)(?::(\d+)(?:-(\d+))?)?$")


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def check_citations():
    if not SOURCE_PRESENT:
        warn("citations", "sibling source tree not found at the repo's parent (or DESIGN_REPO_SOURCE_ROOT); citation checks skipped (self-contained mode)")
        return
    cache = {}
    errs, n, quoted = [], 0, 0

    def file_lines(rel):
        if rel not in cache:
            p = SRC_ROOT / rel
            cache[rel] = p.read_text(encoding="utf-8", errors="ignore").split("\n") if p.is_file() else None
        return cache[rel]

    def check(s, where, quote=None):
        nonlocal n, quoted
        m = CITE.match(s)
        if not m:
            return
        n += 1
        rel, a, b = m.group(1), m.group(2), m.group(3)
        if not (SRC_ROOT / rel).exists():
            errs.append(f"{where}: {s} -> file missing")
            return
        if a is None:
            return
        ls = file_lines(rel)
        lo, hi = int(a), int(b or a)
        if ls is None or lo < 1 or hi < lo or hi > len(ls):
            errs.append(f"{where}: {s} out of range (file has {len(ls) if ls else 0} lines)")
            return
        if quote is not None:
            quoted += 1
            block = "\n".join(ls[lo - 1:hi])
            if quote not in block and norm(quote) not in norm(" ".join(ls[lo - 1:hi])):
                errs.append(f"{where}: {s} does not contain {quote[:60]!r}")

    PAIRS = (("citation", "quote"), ("measuredFrom", "evidenceQuote"), ("citation", "longestObserved"))

    def walk(v, where):
        if isinstance(v, dict):
            q = {}
            for ck, qk in PAIRS:
                if isinstance(v.get(ck), str) and isinstance(v.get(qk), str) and not v.get("observedVia") and not v.get("withheld"):
                    q[ck] = v[qk]
            for k, x in v.items():
                if isinstance(x, str):
                    check(x, f"{where}.{k}", q.get(k))
                else:
                    walk(x, f"{where}.{k}")
        elif isinstance(v, list):
            for i, x in enumerate(v):
                if isinstance(x, str):
                    check(x, f"{where}[{i}]")
                else:
                    walk(x, f"{where}[{i}]")
    for p in jfiles():
        walk(json.loads(p.read_text(encoding="utf-8")), p.relative_to(REPO).as_posix())
    fail("citations", f"{len(errs)} bad: " + "; ".join(errs[:8])) if errs else ok("citations", f"{n} citations resolve in range; {quoted} quoted-content checks matched")


def main():
    print(f"design-repo: {REPO.name}  source tree: {'present' if SOURCE_PRESENT else 'absent'}")
    man = load("registry.manifest.json")
    check_json()
    check_abs_paths()
    check_entrypoints(man)
    check_counts(man)
    check_versions(man)
    check_allowlist()
    check_asset_roles()
    sv = check_graph_validator()
    check_graph_templates()
    check_templates()
    check_tokens()
    check_motion()
    check_budgets()
    check_fingerprints()
    check_schema(sv)
    check_citations()
    f = sum(1 for r in RESULTS if r[0] == "FAIL")
    w = sum(1 for r in RESULTS if r[0] == "WARN")
    print(f"\nSUMMARY: {len(RESULTS) - f - w} passed, {f} failed, {w} warnings")
    return 1 if f else 0


if __name__ == "__main__":
    sys.exit(main())
