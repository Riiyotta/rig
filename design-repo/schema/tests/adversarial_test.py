#!/usr/bin/env python3
"""Adversarial suite: every mutation must be rejected with its expected rule id (warn-severity
cases must warn and produce no errors); every control (the example + every real-content
fixture, i.e. every template and state) must produce zero errors."""
import copy
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
sys.path.insert(0, str(REPO / "schema"))
import semantic_validate as sv  # noqa: E402


def load(rel):
    return json.loads((REPO / rel).read_text(encoding="utf-8"))


EXAMPLE = load("schema/example.pagespec.json")
FIX = {p.name.split(".")[0]: json.loads(p.read_text(encoding="utf-8")) for p in sorted((REPO / "schema/fixtures").glob("*.pagespec.json"))}


def node(spec, type_, nth=0):
    return [n for n in spec["nodes"] if n["type"] == type_][nth]


def idx(spec, type_, nth=0):
    return [i for i, n in enumerate(spec["nodes"]) if n["type"] == type_][nth]


def mut(base, fn):
    s = copy.deepcopy(base)
    fn(s)
    return s


M = []  # (name, spec, expected rule, expected severity)


def add(name, base, fn, rule, sev="error"):
    M.append((name, mut(base, fn), rule, sev))


RULE_DIV = {"type": "layout.section-divider", "variant": "rule", "content": {}, "motion": {"pattern": "none", "reducedMotionFallback": "none"}}
POST = FIX["blog-post-manifesto"]
INF = FIX["blog-post-building-inference-engine"]

# ---- schema layer
add("unknown template enum", EXAMPLE, lambda s: s.update(template="tpl.landing"), "SCHEMA")
add("invented node type alias", EXAMPLE, lambda s: node(s, "hero.home").update(type="hero.marketing"), "SCHEMA")
add("missing motion", EXAMPLE, lambda s: node(s, "faq.accordion").pop("motion"), "SCHEMA")
add("missing reducedMotionFallback", EXAMPLE, lambda s: node(s, "faq.accordion")["motion"].pop("reducedMotionFallback"), "REDUCED_MOTION_FALLBACK")
add("wrong fallback for pattern", EXAMPLE, lambda s: node(s, "faq.accordion")["motion"].update(reducedMotionFallback="none"), "REDUCED_MOTION_FALLBACK")
add("invented motion field", EXAMPLE, lambda s: node(s, "hero.home")["motion"].update(inventedAnimation="parallax"), "SCHEMA")
add("scroll-reveal pattern smuggled in", EXAMPLE, lambda s: node(s, "stats.strip").update(motion={"pattern": "fade-in-on-scroll", "reducedMotionFallback": "none"}), "MOTION_PATTERN_ALLOWED")
add("motion pattern not allowed for section", EXAMPLE, lambda s: node(s, "stats.strip").update(motion={"pattern": "faq-grid-rows", "reducedMotionFallback": "instant-toggle"}), "MOTION_PATTERN_ALLOWED")
add("invented shader preset", EXAMPLE, lambda s: node(s, "intro.shader-diagram")["motion"].update(shaderPreset="plasma"), "SHADER_PRESET_BY_SECTION")
add("shader preset swapped (how on intro)", EXAMPLE, lambda s: node(s, "intro.shader-diagram")["motion"].update(shaderPreset="how"), "SHADER_PRESET_BY_SECTION")
add("extra content property (style override)", EXAMPLE, lambda s: node(s, "hero.home")["content"].update(backgroundColor="#ff00ff"), "SCHEMA")
add("missing required content field", EXAMPLE, lambda s: node(s, "hero.home")["content"].pop("sub"), "SCHEMA")
add("bad divider variant", EXAMPLE, lambda s: node(s, "layout.section-divider", 1).update(variant="thick"), "SCHEMA")
add("variant on variant-less section", EXAMPLE, lambda s: node(s, "faq.accordion").update(variant="dark"), "SCHEMA")
add("invented assetRole", EXAMPLE, lambda s: node(s, "problem.signal-grid")["content"].update(eye={"assetRole": "photo.team-headshot"}), "ASSET_ROLE_REGISTERED")
add("registered assetRole on the wrong field (wordmark as CTA vortex)", EXAMPLE, lambda s: node(s, "cta.vortex")["content"].update(vortex={"assetRole": "brand.wordmark"}), "ASSET_ROLE_REGISTERED")
add("asset file path instead of role", EXAMPLE, lambda s: node(s, "shell.footer")["content"].update(logo={"assetRole": "brand.wordmark", "src": "/assets/rig-wordmark.svg"}), "SCHEMA")
add("invented badge icon key", EXAMPLE, lambda s: node(s, "faq.accordion")["content"]["badge"]["icon"].update(iconKey="rocket"), "SCHEMA")
add("array overflow (8 ticker phrases)", EXAMPLE, lambda s: node(s, "hero.home")["content"]["ticker"].append("One more phrase"), "SCHEMA")
add("array overflow (5 stats)", EXAMPLE, lambda s: node(s, "stats.strip")["content"]["stats"].append({"label": "Extra", "value": "1", "note": "More"}), "SCHEMA")
add("three-line hero title", EXAMPLE, lambda s: node(s, "hero.home")["content"]["titleLines"].append("And a third line."), "SCHEMA")
add("theme not validated (light)", EXAMPLE, lambda s: s.update(theme="light"), "SCHEMA")
add("pageSpecVersion drift", EXAMPLE, lambda s: s.update(pageSpecVersion="2.0.0"), "SCHEMA")
add("form submission endpoint mode", EXAMPLE, lambda s: node(s, "early-access.waitlist")["content"]["form"].update(submission={"mode": "api"}), "SCHEMA")
add("form action field smuggled", EXAMPLE, lambda s: node(s, "early-access.waitlist")["content"]["form"]["submission"].update(action="/signup"), "SCHEMA")
add("dashboard storage swapped to remote", FIX["waitlist-dashboard"], lambda s: node(s, "waitlist.dashboard-view")["content"].update(storage={"mode": "remote", "key": "x"}), "SCHEMA")
add("external URL as link target (schema)", EXAMPLE, lambda s: node(s, "shell.footer")["content"]["columns"][0]["links"][0].update(target={"kind": "route", "route": "https://x.com/rig"}), "SCHEMA")
add("link kind not allowed on field (placeholder on hero CTA)", EXAMPLE, lambda s: node(s, "hero.home")["content"]["primaryCta"].update(target={"kind": "placeholder"}), "SCHEMA")
add("real inbox as email placeholder", FIX["legal-privacy"], lambda s: [r.update(target={"kind": "email-placeholder", "address": "support@rig.ai"}) for b in node(s, "legal.document")["content"]["blocks"] if b["kind"] == "p" for r in b["runs"] if r["kind"] == "link" and r["target"]["kind"] == "email-placeholder"], "SCHEMA")

# ---- structural (declared template <-> nodes, rhythm, variants)
add("duplicate hero", EXAMPLE, lambda s: s["nodes"].insert(2, copy.deepcopy(node(s, "hero.home"))), "ONE_HERO")
add("duplicate one-per-page section (faq twice)", EXAMPLE, lambda s: s["nodes"].insert(idx(s, "faq.accordion"), copy.deepcopy(node(s, "faq.accordion"))), "ONE_PER_PAGE")
add("mandatory footer removed", EXAMPLE, lambda s: s["nodes"].pop(), "TEMPLATE_NODE_SEQUENCE")
add("footer not last", EXAMPLE, lambda s: s["nodes"].insert(1, s["nodes"].pop()), "SHELL_ORDER")
add("overlays not first", FIX["blog-index"], lambda s: s["nodes"].insert(1, s["nodes"].pop(0)), "SHELL_ORDER")
add("sections reordered (faq before capabilities)", EXAMPLE, lambda s: s["nodes"].insert(idx(s, "capabilities.card-grid"), s["nodes"].pop(idx(s, "faq.accordion"))), "TEMPLATE_NODE_SEQUENCE")
add("declared template contradicts nodes", EXAMPLE, lambda s: s.update(template="tpl.legal", route="/privacy"), "TEMPLATE_NODE_SEQUENCE")
add("legal nodes declared as blog index", FIX["legal-terms"], lambda s: s.update(template="tpl.blog-index", route="/blog"), "TEMPLATE_NODE_SEQUENCE")
add("section outside template (stats on blog index)", FIX["blog-index"], lambda s: s["nodes"].insert(3, copy.deepcopy(node(EXAMPLE, "stats.strip"))), "TEMPLATE_NODE_SEQUENCE")
add("route not in template routes", EXAMPLE, lambda s: s.update(route="/blog"), "ROUTE_TEMPLATE")
add("double divider collapsed to one", EXAMPLE, lambda s: s["nodes"].pop(idx(s, "how.stepper") - 1), "DOUBLE_DIVIDER_BEFORE_HOW")
add("extra double divider before capabilities", EXAMPLE, lambda s: s["nodes"].insert(idx(s, "capabilities.card-grid"), copy.deepcopy(RULE_DIV)), "DOUBLE_DIVIDER_BEFORE_HOW")
add("divider removed between problem and intro", EXAMPLE, lambda s: s["nodes"].pop(idx(s, "intro.shader-diagram") - 1), "SECTION_DIVIDER_RHYTHM")
add("spacer-top variant swapped for rule", EXAMPLE, lambda s: node(s, "layout.section-divider", 0).update(variant="rule"), "TEMPLATE_VARIANT")
add("closing spacer-bottom removed", EXAMPLE, lambda s: s["nodes"].pop(idx(s, "cta.vortex") - 1), "CTA_OUTSIDE_MAIN")
add("cta moved inside main (before faq)", EXAMPLE, lambda s: s["nodes"].insert(idx(s, "faq.accordion"), s["nodes"].pop(idx(s, "cta.vortex"))), "CTA_OUTSIDE_MAIN")
add("hero on a no-hero template (blog index)", FIX["blog-index"], lambda s: s["nodes"].insert(2, copy.deepcopy(node(EXAMPLE, "hero.home"))), "ONE_HERO")
add("hero removed from home", EXAMPLE, lambda s: s["nodes"].pop(idx(s, "hero.home")), "ONE_HERO")
add("standalone header added to home", EXAMPLE, lambda s: s["nodes"].insert(1, copy.deepcopy(node(FIX["blog-index"], "shell.header"))), "HEADER_PLACEMENT")
add("header missing on legal", FIX["legal-privacy"], lambda s: s["nodes"].pop(1), "HEADER_PLACEMENT")
add("default header variant on /waitlist", FIX["waitlist-form"], lambda s: node(s, "shell.header").update(variant="default"), "NAV_VARIANT_BY_ROUTE")
add("CTA present on default-no-cta header", FIX["waitlist-form"], lambda s: node(s, "shell.header")["content"].update(cta=copy.deepcopy(node(FIX["blog-index"], "shell.header")["content"]["cta"])), "NAV_VARIANT_BY_ROUTE")
add("frame lines on a legal page", FIX["legal-terms"], lambda s: s["nodes"].insert(2, copy.deepcopy(node(EXAMPLE, "shell.frame-lines"))), "HOME_ROUTE_ONLY")
add("section divider on a blog post", POST, lambda s: s["nodes"].insert(3, copy.deepcopy(RULE_DIV)), "HOME_ROUTE_ONLY")
add("not-found post with CTA aside", FIX["blog-post-not-found"], lambda s: s["nodes"].insert(3, copy.deepcopy(node(POST, "post.cta-aside"))), "POST_STATE_SHAPE")
add("found post without CTA aside", POST, lambda s: s["nodes"].pop(idx(s, "post.cta-aside")), "POST_STATE_SHAPE")
add("post content shape under not-found variant", POST, lambda s: node(s, "post.article").update(variant="not-found"), "SCHEMA")
add("waitlist renders both views", FIX["waitlist-form"], lambda s: s["nodes"].insert(3, copy.deepcopy(node(FIX["waitlist-dashboard"], "waitlist.dashboard-view"))), "WAITLIST_SINGLE_VIEW")
add("waitlist renders no view", FIX["waitlist-form"], lambda s: s["nodes"].pop(2), "WAITLIST_SINGLE_VIEW")
add("blog index not newest first", FIX["blog-index"], lambda s: node(s, "blog.index-list")["content"]["posts"].reverse(), "BLOG_INDEX_NEWEST_FIRST")
add("shader preset on a non-shader section", EXAMPLE, lambda s: node(s, "capabilities.card-grid")["motion"].update(shaderPreset="headline"), "SCHEMA")

# ---- runtime budgets (real fields)
add("maxWords overflow: hero sub", EXAMPLE, lambda s: node(s, "hero.home")["content"].update(sub=node(s, "hero.home")["content"]["sub"] + " It also does much more than that for everyone."), "MAX_WORDS")
add("maxWords overflow: nested faq answer", EXAMPLE, lambda s: node(s, "faq.accordion")["content"]["items"][0].update(a=" ".join(["word"] * 80)), "MAX_WORDS")
add("maxWords overflow: cta title", EXAMPLE, lambda s: node(s, "cta.vortex")["content"].update(title="Take back every one of your tools today"), "MAX_WORDS")
add("maxWords overflow: post paragraph", POST, lambda s: node(s, "post.article")["content"]["blocks"][0].update(text=" ".join(["filler"] * 200)), "MAX_WORDS")
add("maxWords overflow: ascii chart bar value", EXAMPLE, lambda s: node(s, "how.stepper")["content"]["chart"]["cards"][0][1]["rows"][0].update(value="one hundred percent of all weights"), "MAX_WORDS")
add("maxWords overflow: legal run", FIX["legal-terms"], lambda s: node(s, "legal.document")["content"]["blocks"][1]["runs"][0].update(text=" ".join(["clause"] * 400)), "MAX_WORDS")

# ---- compliance: links, backend, assets, original copy
add("external markdown link in post", INF, lambda s: node(s, "post.article")["content"]["blocks"][0].update(text="Read [the guide](https://example.com/guide) first."), "NO_EXTERNAL_TARGETS")
add("mailto scheme in copy", EXAMPLE, lambda s: node(s, "shell.footer")["content"].update(tagline="Write to mailto:team@rig.ai for access."), "NO_EXTERNAL_TARGETS")
add("www host in copy", EXAMPLE, lambda s: node(s, "early-access.waitlist")["content"].update(desc="Sign up at www.example-waitlist.com today."), "NO_EXTERNAL_TARGETS")
add("iframe markup in copy", EXAMPLE, lambda s: node(s, "faq.accordion")["content"].update(title="<iframe src=x>"), "NO_EXTERNAL_TARGETS")
add("backend endpoint in form copy", EXAMPLE, lambda s: node(s, "early-access.waitlist")["content"]["form"].update(errorEmpty="POST /api/waitlist/signup failed"), "NO_BACKEND_ENDPOINTS")
add("turnstile reference in copy", POST, lambda s: node(s, "post.cta-aside")["content"].update(title="Complete the Turnstile check"), "NO_BACKEND_ENDPOINTS")
add("asset file path smuggled into copy", EXAMPLE, lambda s: node(s, "shell.footer")["content"].update(tagline="Logo: /assets/rig-wordmark.svg"), "NO_ASSET_URLS")

_FP_TARGET = node(EXAMPLE, "intro.shader-diagram")["content"]["desc"]


def _fp_case(s):
    # Prove the mechanism without storing original wording: register this string's fingerprint
    # at runtime (restored after the run) and confirm the validator rejects it.
    for cand in sv.fingerprint_candidates(_FP_TARGET):
        sv.FINGERPRINTS.add(hashlib.sha256(cand.encode("utf-8")).hexdigest()[:32])


M.append(("original-copy fingerprint match", copy.deepcopy(EXAMPLE), "ORIGINAL_COPY_FINGERPRINT", "error"))

# ---- warn-severity rules must warn, not fail
add("warn: real company domain in copy", FIX["blog-index"], lambda s: node(s, "blog.index-list")["content"]["posts"][0].update(excerpt="Notes from the team at rig.ai."), "SOURCE_BRAND_IN_COPY", "warn")
add("warn: motion pattern with no reduced-motion path in source", FIX["legal-terms"], lambda s: None, "REDUCED_MOTION_UNHANDLED_IN_SOURCE", "warn")


def main():
    failures = 0
    print("CONTROLS")
    controls = [("schema/example.pagespec.json", EXAMPLE)] + [(f"schema/fixtures/{k}.pagespec.json", v) for k, v in FIX.items()]
    for name, spec in controls:
        rep = sv.validate(spec)
        good = not rep.errors
        failures += not good
        print(f"  {'PASS' if good else 'FAIL'} control {name}: {len(rep.errors)} errors, {len(rep.warnings)} warnings")
        for e in rep.errors:
            print("       ", e)
    print("MUTATIONS")
    saved = set(sv.FINGERPRINTS)
    for name, spec, rule, sev in M:
        if rule == "ORIGINAL_COPY_FINGERPRINT":
            _fp_case(spec)
        rep = sv.validate(spec)
        sv.FINGERPRINTS.clear()
        sv.FINGERPRINTS.update(saved)
        bucket = rep.errors if sev == "error" else rep.warnings
        hit = any(x.startswith(f"[{rule}]") for x in bucket)
        good = hit and (sev == "error" or not rep.errors)
        failures += not good
        print(f"  {'PASS' if good else 'FAIL'} [{sev}:{rule}] {name}")
        if not good:
            for e in rep.errors + rep.warnings:
                print("       ", e[:300])
    total = len(controls) + len(M)
    print(f"\n{total - failures}/{total} passed ({len(controls)} controls, {len(M)} mutations)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
