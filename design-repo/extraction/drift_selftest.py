#!/usr/bin/env python3
"""Prove verify_all.py catches drift: copy the repo to a scratch dir, inject one defect at a
time, and assert the matching check FAILS; the unmodified copy must pass.

Usage: python3 extraction/drift_selftest.py [--workdir DIR]
Citation injections need the sibling source tree (passed to the copies through
DESIGN_REPO_SOURCE_ROOT); without it they are reported as SKIP.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SRC_ROOT = Path(os.environ.get("DESIGN_REPO_SOURCE_ROOT") or REPO.parent).resolve()
HAS_SOURCE = (SRC_ROOT / "src" / "App.jsx").is_file() and (SRC_ROOT / "CLONE_SPEC.md").is_file()


def jload(p):
    return json.loads(p.read_text(encoding="utf-8"))


def jsave(p, d):
    p.write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def edit(rel, fn):
    def inj(r):
        p = r / rel
        d = jload(p)
        fn(d)
        jsave(p, d)
    return inj


def inj_absolute_path(r):
    p = r / "README.md"
    p.write_text(p.read_text(encoding="utf-8") + "\nSource: " + "/" + "Users/someone/rig\n", encoding="utf-8")


def inj_readme_count(r):
    p = r / "README.md"
    s = p.read_text(encoding="utf-8")
    man = jload(r / "registry.manifest.json")
    n = man["counts"]["sections"]
    p.write_text(s.replace(f"| Sections | {n} |", f"| Sections | {n + 1} |"), encoding="utf-8")


def _set_first_evidence_citation(d):
    ev = d["content"]["properties"]["stats"]["items"]["properties"]["label"]["evidence"]
    ev["citation"] = "src/content.js:1"  # in range, but the quoted text is not on that line


CASES = [
    ("phantom allowlist entry", edit("tokens/llm/component-allowlist.json", lambda d: d["components"].append({"id": "component.ghost-divider", "contract": "components/ghost-divider.json"})), "allowlist_contract_parity", False),
    ("orphan contract (allowlist entry dropped)", edit("tokens/llm/component-allowlist.json", lambda d: d.update(primitives=[e for e in d["primitives"] if e["id"] != "primitive.badge"])), "allowlist_contract_parity", False),
    ("allowlist settable drift vs schema", edit("tokens/llm/component-allowlist.json", lambda d: d["sections"][0]["settable"].append("content.inventedField")), "allowlist_schema_parity", False),
    ("out-of-range citation", edit("sections/cta.vortex.json", lambda d: d["implementedBy"][0].update(citation="src/components/Cta.jsx:16-9999")), "citations", True),
    ("in-range citation with wrong content", edit("sections/stats.strip.json", _set_first_evidence_citation), "citations", True),
    ("token value no longer matches cited source line", edit("tokens/00-foundation/color.json", lambda d: d["color"]["red"].update({"$value": "oklch(0.5 0.1 20)", "evidenceQuote": "oklch(0.5 0.1 20)"})), "citations", True),
    ("allowlistVersion drift (manifest)", edit("registry.manifest.json", lambda d: d.update(allowlistVersion="9.9.9")), "version_parity", False),
    ("allowlistVersion drift (allowlist file)", edit("tokens/llm/component-allowlist.json", lambda d: d.update(allowlistVersion="1.0.1")), "version_parity", False),
    ("graph rule without validator implementation", edit("compatibility/graph.json", lambda d: d["rules"].append({"id": "NO_CAROUSELS", "severity": "error", "description": "x", "enforcedBy": "semantic_validate.py", "evidence": []})), "graph_validator_parity", False),
    ("graph rule parameter contradicts templates (ONE_HERO exception list)", edit("compatibility/graph.json", lambda d: next(r for r in d["rules"] if r["id"] == "ONE_HERO")["parameters"]["noHeroTemplates"].remove("tpl.legal")), "graph_template_agreement", False),
    ("absolute machine path", inj_absolute_path, "no_absolute_paths", False),
    ("manifest count drift", edit("registry.manifest.json", lambda d: d["counts"].update(sections=d["counts"]["sections"] + 1)), "manifest_counts", False),
    ("README count drift", inj_readme_count, "readme_counts", False),
    ("entry point outside repo", edit("registry.manifest.json", lambda d: d["entryPoints"].update(spec="../CLONE_SPEC.md")), "manifest_entrypoints_internal", False),
    ("broken token alias", edit("tokens/10-semantic/color.json", lambda d: d["color"]["text.primary"].update({"$value": "{color.paper-99}"})), "token_resolution", False),
    ("stale theme value", edit("tokens/themes/dark.json", lambda d: d["resolved"].update({"color.text.primary": "#ffffff"})), "token_resolution", False),
    ("maxWords no longer equals evidence", edit("sections/cta.vortex.json", lambda d: d["content"]["properties"]["title"].update(maxWords=d["content"]["properties"]["title"]["maxWords"] + 3)), "maxwords_evidence", False),
    ("asset role removed from registry", edit("assets/asset-roles.json", lambda d: d.update(roles=[x for x in d["roles"] if x["id"] != "chart.ascii-bars"])), "asset_role_parity", False),
    ("route assigned to two templates", edit("templates/templates.json", lambda d: d["templates"][0]["routes"].append("/blog")), "template_route_coverage", False),
    ("plaintext wording in fingerprint file", edit("assets/original-copy-fingerprints.json", lambda d: d.update(fingerprints=sorted(d["fingerprints"] + ["some original sentence"]), count=d["count"] + 1)), "fingerprint_file", False),
    ("motion schema reopened", edit("schema/pagespec.schema.json", lambda d: d["definitions"]["node"]["allOf"][0]["then"]["properties"]["motion"]["oneOf"][0].update(additionalProperties=True)), "motion_registry", False),
]


def run_verify(copy_root, with_source):
    env = dict(os.environ)
    if with_source:
        env["DESIGN_REPO_SOURCE_ROOT"] = str(SRC_ROOT)
    else:
        env.pop("DESIGN_REPO_SOURCE_ROOT", None)
    r = subprocess.run([sys.executable, str(copy_root / "extraction/verify_all.py")], capture_output=True, text=True, env=env)
    return r.returncode, r.stdout + r.stderr


def main():
    work = None
    if "--workdir" in sys.argv:
        work = Path(sys.argv[sys.argv.index("--workdir") + 1])
        work.mkdir(parents=True, exist_ok=True)
    base = Path(tempfile.mkdtemp(prefix="drift-", dir=work))
    ignore = shutil.ignore_patterns("__pycache__", "*.zip", ".DS_Store")
    failures = 0
    ctl = base / "control" / "design-repo"
    shutil.copytree(REPO, ctl, ignore=ignore)
    code, out = run_verify(ctl, HAS_SOURCE)
    good = code == 0
    failures += not good
    print(f"{'PASS' if good else 'FAIL'} control copy verifies clean (source {'on' if HAS_SOURCE else 'off'})")
    if not good:
        print(out)
    for name, fn, check, needs_source in CASES:
        if needs_source and not HAS_SOURCE:
            print(f"SKIP {name} (no sibling source tree)")
            continue
        root = base / f"case{CASES.index((name, fn, check, needs_source)):02d}" / "design-repo"
        shutil.copytree(REPO, root, ignore=ignore)
        fn(root)
        code, out = run_verify(root, needs_source or HAS_SOURCE)
        line = next((l for l in out.splitlines() if l.startswith(f"FAIL {check}")), "")
        caught = code != 0 and bool(line)
        failures += not caught
        print(f"{'PASS' if caught else 'FAIL'} {name} -> {check} {'caught' if caught else 'NOT caught'}  {line[:150]}")
    shutil.rmtree(base, ignore_errors=True)
    print(f"\n{'ALL DRIFT INJECTIONS CAUGHT' if not failures else str(failures) + ' problem(s)'}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
