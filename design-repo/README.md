# Rig clone design-repo

A machine-validated PageSpec system extracted from the rig.ai clone in the parent folder
(React 18 + Vite 5 + Tailwind CSS 3, custom pushState router). An AI generator can compose new
on-brand pages from it without inventing colours, copy budgets, sections, motion or assets.

**Status:** `design-review-pending`, `productionApproved: false`. Private design-review artifact:
do not publish it or present it as Rig's design system.

## Counts (recomputed from disk; `verify_all.py` fails if any row drifts)

| Layer | Count |
|---|---|
| Foundation tokens | 192 |
| Semantic tokens | 33 |
| Component tokens | 24 |
| Layout tokens | 24 |
| Tokens total | 273 |
| Motion patterns | 15 |
| Shader presets | 2 |
| Primitives | 14 |
| Components | 17 |
| Sections | 23 |
| Templates | 5 |
| Routes covered | 10 |
| Asset roles | 15 |
| Compatibility rules | 26 |
| Real-content fixtures | 10 |
| Adversarial mutations | 76 |
| Original-copy fingerprints | 1427 |

## Layout

```
registry.manifest.json      status, counts, versions, entry points (in-repo only)
tokens/00-foundation/       color (CSS vars + literal histogram), typography, radius, breakpoint, elevation, layering, icon-size, motion, motion-patterns
tokens/10-semantic/         semantic colour roles (aliases with usage citations)
tokens/20-component/        component-scoped token applications
tokens/30-layout/           containers, frame, section spacing
tokens/themes/dark.json     the single theme, every alias resolved (red hero = brand surface inside it)
tokens/llm/                 component-allowlist, token-catalog, token-policy
assets/                     asset-roles.json (closed assetRole enum + generation/licensing/font policy), original-copy-fingerprints.json (hashes only)
primitives/ components/     building-block contracts (tokensUsed, variants, states)
sections/                   one contract per observed section type (content + maxWords evidence, motion, structured responsive)
templates/templates.json    5 page shapes with structured nodes; 10-route inventory (1:1)
compatibility/graph.json    rules with severity error|warn, parameters cross-checked against templates.json
schema/                     pagespec.schema.json (draft-07), example.pagespec.json (homepage), fixtures/ (every other template/state), semantic_validate.py, tests/
extraction/                 measured-values.json (external citations + findings), verify_all.py, drift_selftest.py
```

## Templates and routes

| Template | Routes | Nodes |
|---|---|---|
| `tpl.home` | `/` | 27 |
| `tpl.blog-index` | `/blog` | 4 |
| `tpl.blog-post` | `/blog/manifesto`, `/blog/building-inference-engine`, `/blog/compressing-a-model-to-run-locally`, `/blog/teaching-a-model-to-code`, `/blog/:unknown-slug` | 5 |
| `tpl.waitlist` | `/waitlist` | 5 |
| `tpl.legal` | `/privacy`, `/terms` | 4 |

- The 10 inventory routes are the 9 concrete paths in `src/App.jsx` plus `/blog/:unknown-slug`, which is the
  **not-found state of `tpl.blog-post`** (same article template, variant `not-found`, no CTA aside) - not a
  separate template. `tpl.waitlist` likewise has two states (form view / dashboard view, exactly one rendered).
- Any other path falls through to `<Home />`: there is no 404 page, so generators must not invent one.
- Homepage node order: overlays, hero (embedded hero-variant header + ticker), frame lines, spacer-top divider,
  problem, intro, offline, three-col, **double divider**, how-it-works, capabilities, stats, terminal, early-access,
  FAQ, rule + spacer-bottom dividers, CTA (outside `<main>`), footer. The double divider is real (Home.jsx) and is
  enforced by `DOUBLE_DIVIDER_BEFORE_HOW`, keyed on (section, variant).

## Copy rule (read before generating)
Every word of page copy in the clone is **original placeholder text written for the clone** (`src/content.js`,
`src/blog.js`, `src/legal.js`) - not rig.ai's copy, by deliberate decision. The example, all fixtures and every
`maxWords` budget derive from that clone copy (budget = word count of the longest real value, with
`evidence.citation` + `evidence.longestObserved`; the spec's line-count constraints are recorded as
`evidence.lineConstraint`). rig.ai's own wording is never included: `assets/original-copy-fingerprints.json` holds
SHA-256 prefixes of the original site's text blocks/sentences only, and `ORIGINAL_COPY_FINGERPRINT` rejects any match.
That check found one verbatim original line in the clone itself (the footer copyright/legal-name line); it is withheld
here and replaced by a neutral "Example Company" line in the specs (see findings).

## Real-company policy (rig.ai is a live company)
- Generators must **not reproduce the Rig name as a mark**: the wordmark (`public/assets/rig-wordmark.svg`), the logo
  mark SVGs (hero/footer watermark, CTA logo + glow + line-art, favicon) and the RIG ASCII art are `must-not-fabricate`
  roles - render neutral placeholders. Media fields are `{assetRole}` objects only; `NO_ASSET_URLS` rejects file paths.
- **Chalet London Nineteen Sixty is a commercially licensed font** - not redistributable for production (`fontPolicy`).
- The clone's copy still names the real company ("Rig", "Rig AI Inc.", "rig.ai" link text): `SOURCE_BRAND_IN_COPY`
  warns on every spec that does; production output must use the client's own brand.
- Every role carries explicit generation guidance:

| Asset role | Generation |
|---|---|
| `brand.wordmark` | must-not-fabricate |
| `brand.logo-mark` | must-not-fabricate |
| `text.ascii-brand-art` | must-not-fabricate |
| `icon.badge-pixel` | must-reuse-exact |
| `icon.ui` | must-reuse-exact |
| `icon.social-share` | must-reuse-exact |
| `illustration.surveillance-eye` | must-reuse-exact |
| `illustration.flow-diagram` | must-reuse-exact |
| `illustration.globe` | must-reuse-exact |
| `illustration.severed-connector` | must-reuse-exact |
| `image.cta-vortex` | must-reuse-exact |
| `placeholder.blog-diagram` | must-not-fabricate |
| `effect.svg-filter` | must-reuse-exact |
| `effect.dither-shader` | must-reuse-exact |
| `chart.ascii-bars` | may-generate-new |

## No backend
All forms (home early-access, post CTA aside, `/waitlist` form, dashboard hardware survey) are **front-end only**:
validation plus a timed fake success; the dashboard reads/writes `localStorage` (`rig-clone-waitlist`). The original's
Cloudflare Turnstile, PostHog and waitlist API were intentionally not recreated (an empty `.turnstile-container`
keeps the 1rem margin). In the schema `submission.mode` is `const "local-only"`; `NO_BACKEND_ENDPOINTS` rejects
endpoints and third-party service references. **Generated pages must not wire real submission endpoints without
human review.** Share buttons are `share-intent` link kinds (URL built at runtime), footer socials are placeholders.

## Motion
There are **no scroll-reveal / fade-in animations** anywhere. Motion is a closed enum of 15 patterns
(`tokens/00-foundation/motion-patterns.json`): ticker marquee + watermark glitch, eye glitch/tracking/blink, shader +
SMIL diagram, globe drift, stepper auto-advance (6s fill, .4s body rows, 400ms `cubic-bezier(0,0,.58,1)` card tween),
terminal load-reveal + typing (70ms/char, 2s hold, 30ms delete, 400ms pause), FAQ grid-rows .3s, CTA glitch + glow,
status blink, spinners, mobile menu fade; off-screen animation pauses via `.is-visible`. Motion objects are closed to
`pattern`, `reducedMotionFallback` (required, const per pattern) and `shaderPreset` (closed enum `headline | how`,
const per shader section). The clone has **no prefers-reduced-motion handling at all**, so the fallbacks are
requirements for generated pages (`REDUCED_MOTION_UNHANDLED_IN_SOURCE` warns). Faithful quirks that must not be
"fixed": chamfer clip-paths clip hover shadows/glows, and the ticker's -50% loop visibly jumps.

## Rules

| Rule | Severity |
|---|---|
| `TEMPLATE_NODE_SEQUENCE` | error |
| `TEMPLATE_VARIANT` | error |
| `ROUTE_TEMPLATE` | error |
| `ONE_PER_PAGE` | error |
| `SHELL_ORDER` | error |
| `ONE_HERO` | error |
| `HOME_ROUTE_ONLY` | error |
| `HEADER_PLACEMENT` | error |
| `NAV_VARIANT_BY_ROUTE` | error |
| `SECTION_DIVIDER_RHYTHM` | error |
| `DOUBLE_DIVIDER_BEFORE_HOW` | error |
| `CTA_OUTSIDE_MAIN` | error |
| `POST_STATE_SHAPE` | error |
| `WAITLIST_SINGLE_VIEW` | error |
| `BLOG_INDEX_NEWEST_FIRST` | error |
| `MOTION_PATTERN_ALLOWED` | error |
| `REDUCED_MOTION_FALLBACK` | error |
| `REDUCED_MOTION_UNHANDLED_IN_SOURCE` | warn |
| `SHADER_PRESET_BY_SECTION` | error |
| `MAX_WORDS` | error |
| `ASSET_ROLE_REGISTERED` | error |
| `NO_EXTERNAL_TARGETS` | error |
| `NO_BACKEND_ENDPOINTS` | error |
| `NO_ASSET_URLS` | error |
| `SOURCE_BRAND_IN_COPY` | warn |
| `ORIGINAL_COPY_FINGERPRINT` | error |

## Verify

```bash
python3 extraction/verify_all.py          # structure, parity, counts, versions, graph/template agreement, tokens, budgets, schema + semantic checks, citations
python3 schema/tests/adversarial_test.py  # every mutation rejected, every control passes
python3 extraction/drift_selftest.py      # proves each drift check fails on injected drift in a scratch copy
python3 schema/semantic_validate.py schema/example.pagespec.json
```

Requires Python 3 with `jsonschema` (Draft7Validator). Citations are `path:line[-line]` relative to the parent folder
of `design-repo/`; without that sibling tree `verify_all.py` warns and skips them (self-contained mode).

## Packaging notes
- The parent project is **not a git repository**, so there is no `.gitignore` to update; `design-repo.zip` is a
  sibling build artifact generated fresh with the CLI `zip` tool after verification (never Finder), excluding
  `.DS_Store`, `__MACOSX` and `__pycache__`. If the project is ever put under git, ignore `design-repo.zip`.
- This repo is a snapshot of the clone as built; re-diff versions, counts and findings against the source if the
  clone changes.
