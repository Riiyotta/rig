Source: https://rig.ai/?ref=saaspo.com

# Rig landing page: clone build spec

Single route `/`. Astro static build. Measured with Chromium (Playwright) at 1440 / 1280 / 768 / 390 wide, viewport height 900 and DPR 1, on 2026-09-21. Declared values come from `reference/original-site/_astro/*.css`, the inline `<style>` blocks in `index.html` (header and footer styles live **only** there), and `_astro/*.js`.
Inline SVGs are **not** pasted here. `CLONE_ASSETS.json` (next to this file) gives each one's char/byte range in `reference/original-site/index.html`, plus its viewBox, rendered size and animation.
Screenshots are in `/private/tmp/claude-504/-Users-riyaghosh-V2-cloned-rig/d3f5f990-cd80-465d-9021-7e279894597f/scratchpad/shots/`: `full-1440.png`, `full-390.png`, `1440-<section>.png`, `1440-shader1-mousehover.png`, `1440-faq-open.png` and `390-nav-open.png`.

Copy lives in `src/content.js`. Wording in this spec is only for orientation.

---

## 0. Global

### 0.1 Design tokens (`:root`, verbatim, with sRGB equivalents)

| token | declared | sRGB |
|---|---|---|
| `--red` | `oklch(0.6329 0.2075 31.49)` | `#ed462d` / rgb(237,70,45) |
| `--red-glow` | `oklch(0.6329 0.2075 31.49 / 40%)` | rgba(237,70,45,.4) |
| `--blue` | `oklch(0.5312 0.260273 266.7713)` | `#2b4fff` / rgb(43,79,255) |
| `--blue-dim` | same blue `/ 15%` | rgba(43,79,255,.15) |
| `--green` | `oklch(0.8003 0.1821 151.71)` | `#4ade80` |
| `--green-dim` | green `/ 75%` | |
| `--ink` | `oklch(0.1448 0 0)` | `#0a0a0a` |
| `--paper` | `oklch(0.9465 0.0099 87.47)` | `#f0ede6` / rgb(240,237,230) |
| `--paper-dim` | paper `/ 75%` | rgba(240,237,230,.75) |
| `--paper-faint` | paper `/ 8%` | |
| `--border` | paper `/ 14%` | rgba(240,237,230,.14) |
| `--border-dim` | paper `/ 10%` | |
| `--paper-70/60/50/45/40/35/30/25/20/15/12/06/04/02` | `rgba(240,237,230,.NN)` | |
| `--text-muted` | `var(--paper-40)` | |
| `--text-tertiary` | `var(--paper-35)` | |
| `--text-faint` | `var(--paper-25)` | |
| `--chamfer` | `14px` | |

Declare the tokens with the exact oklch values. Browsers compute them as oklch.

Other literal colors used on the page:
- `#22c55e`: green accents in the how card, status dot, "Rig model active" and the SVG trails.
- `#4ade80`: offline card accent on hover.
- `#fff`: blueprint titles, anno titles and offline card hover text.
- `#050505`: terminal window.
- Monitor gradient: `#1a1a1a`, `#111`, `#0d0d0d`.
- `#0a0a0ae0` (rgba(10,10,10,.88)): badge and how-card background.
- `rgba(10,10,10,.95)`: offline and SVG cards.
- `rgba(10,10,10,.15)` / `.3`: hero ticker border and the hero secondary button border.
- `#ffffff05`: capabilities card background.
- `#f0ede604` (rgba(240,237,230,.016)): how-illustration background.
- `#f0ede60a`: `.card`.
- `#ed462d33` / `#ed462d08`: capabilities card hover.
- `#f0ede647`: offline card hover border.
- `#d93d26`: submit button hover.
- `#ff6b6b`: form error.
- `rgba(237,70,45,.2)`: badge border.
- `rgba(237,70,45,.12)`: how-card title rule.
- Selection: `::selection { background:#ed462de5; color:#fffde0 }`.

### 0.2 Fonts

```css
@font-face{font-family:Chalet;src:url(/fonts/chalet_londonnineteensixty.woff2) format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Geist Pixel Square";src:url(/fonts/GeistPixel-Square.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Instrument Sans";font-weight:400 700;font-stretch:100%;font-display:swap;src:url(/fonts/InstrumentSans-latin.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
/* + latin-ext face: InstrumentSans-latin-ext.woff2, range U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF */
@font-face{font-family:"Chivo Mono";font-weight:400 800;font-display:swap;src:url(/fonts/ChivoMono-latin.woff2) format("woff2");/* same two unicode-range split as Instrument Sans */}
```
Preload these four: chalet, GeistPixel-Square, InstrumentSans-latin and ChivoMono-latin (`<link rel=preload as=font type=font/woff2 crossorigin>`).

Font stacks:
- body: `"Instrument Sans", system-ui, sans-serif`
- mono: `"Chivo Mono", monospace`
- display: `Chalet, Inter, sans-serif` (some rules use `Chalet, sans-serif`)
- pixel: `"Geist Pixel Square", monospace`

**GOTCHA: faux-bold.** Chalet ships only weight 400. Every `h1/h2/h3` keeps the UA `font-weight:700`, and the original **renders Chalet with synthesized bold**. Tailwind preflight resets headings to `font-weight:inherit`, so you **must** put `font-weight:700` on every Chalet heading (h1, all h2, the h3s in problem/three-col/how/caps). Spans and summaries stay at 400: `.stat-value`, `.faq-question-text`. Without this, headings look visibly thinner.

### 0.3 Base

```css
*{box-sizing:border-box;margin:0;padding:0}
html{overflow-y:scroll;scrollbar-gutter:stable;scroll-behavior:smooth}
body{font-family:"Instrument Sans",system-ui,sans-serif;background:var(--ink);color:var(--paper);-webkit-font-smoothing:antialiased;overflow-x:hidden}
.mono{font-family:"Chivo Mono",monospace}
.display{font-family:Chalet,Inter,sans-serif;letter-spacing:-.03em}
.display-heavy{font-family:Chalet,Inter,sans-serif;letter-spacing:-.02em}
```
Root font-size is 16px, so rem = 16px throughout.

### 0.4 Text roles (computed at 1440, then the smaller breakpoints)

| role | family | size (declared) | computed @1440 / 1280 / 768 / 390 | weight | line-height | letter-spacing | color |
|---|---|---|---|---|---|---|---|
| Hero h1 | Chalet | `clamp(3.5rem,8vw,7rem)`; ≤768: `clamp(3.5rem,12vw,7rem)` | 112 / 102.4 / 92.16 / 56px | 700 (faux) | .88 (98.56px @1440) | -.04em (-4.48px) | `--ink` |
| Hero sub | Instrument | 1.15rem; ≤768 1rem | 18.4 / 18.4 / 16 / 16 | 600 | 1.6 | normal | ink, opacity .85 |
| Section big title (problem-headline, intro-title) | Chalet | `clamp(3rem,5vw,4.5rem)` | 72 / 64 / 48 / 48 | 700 | .92 | -.03em | paper |
| `.section-title` (how, caps, faq) and `.term-title`/`.ea-title` | Chalet | `clamp(2.5rem,4vw,3.5rem)` | 56 / 51.2 / 40 / 40 | 700 | .92 | -.03em | paper |
| Offline h2 | Chalet | `clamp(2.5rem,5vw,3.5rem)` | 56 / 56 / 40 / 40 | 700 | .9 | -.03em | paper |
| CTA h2 | Chalet | `clamp(4rem,8vw,7rem)`; ≤768 `clamp(2.5rem,8vw,7rem)` | 112 / 102.4 / 61.44 / 40 | 700 | .9 | -.03em | paper |
| Three-col heading (h3) | Chalet | `clamp(1.5rem,2.5vw,2rem)` | 32 / 32 / 24 / 24 | 700 | .95 | -.03em | paper |
| How step h3 | Chalet | `clamp(1.5rem,2.5vw,2rem)` | 32 / 32 / 24 / 24 | 700 | 1.05 | -.02em | active: paper; inactive: `--text-tertiary` (paper .35) |
| Problem card h3 / caps h3 | Chalet | 1.35rem (21.6px) | same at all widths | 700 | 1.05 / 1.1 | -.02em | paper |
| Stat value | Chalet | 2.5rem; ≤768 2rem | 40 / 40 / 32 / 32 | 400 | 1 | normal | paper |
| FAQ question | Chalet | 1.2rem; ≤768 1.05rem | 19.2 / 19.2 / 16.8 / 16.8 | 400 | 1.2 | -.02em | paper |
| Body lead (intro-desc, how-intro-body, offline p) | Instrument | 1rem | 16 | 400 | 1.6 (offline 1.7) | normal | `--paper-dim` |
| EA desc | Instrument | 1.2rem | 19.2 | 400 | 1.6 | normal | paper-dim |
| Small body (problem p) | Instrument | .8rem | 12.8 | 400 | 1.6 | | paper-dim |
| Card body (three-col, caps p) | Instrument | .85rem | 13.6 | 400 | 1.6 | | paper-dim |
| How step p / FAQ answer | Instrument | .9rem; ≤768 .85rem | 14.4 / 13.6 | 400 | 1.7 | | paper-dim |
| Badge text | Chivo | .75rem | 12 | 400 | normal | .12em (1.44px) | red, uppercase |
| `.mono-label` | Chivo | .75rem | 12 | 400 | normal | .15em | uppercase |
| Nav link | Chivo | .75rem; ≤768 (menu open) 1.25rem | 12 / 20 | 700 | normal | .05em | ink @ .7 opacity (hero variant) |
| Button `.btn-chamfer` | Chivo | .85rem; ≤768 .8rem | 13.6 | 700 | normal | normal | |
| Problem card label | Chivo | .65rem | 10.4 | 400 | | .1em | red, uppercase |
| Problem card number | Chivo | .6rem | 9.6 | 400 | | .2em | paper-20 |
| How step num | Chivo | .6rem | 9.6 | 400 | | .2em | `--text-faint`; active red; uppercase |
| Ticker | Geist Pixel Square | .8rem | 12.8 | 400 | normal | .1em | ink, opacity .7, `-webkit-text-stroke:.5px var(--ink)`, uppercase |
| Blueprint text | Geist Pixel | .6rem | 9.6 | 400 | 1.5 | .1em | title #fff / desc paper-45, uppercase |
| Terminal body | Chivo | .85rem; ≤768 .75rem | 13.6 / 12 | 400 | 1.8 | | |
| Footer link / brand p | Instrument | .85rem | 13.6 | 400 | normal / 1.6 | | paper-50 / paper-40 |

### 0.5 Layout system, breakpoints and all `@media` queries

- `.container{max-width:1200px;margin:0 auto;padding:0 3rem}`. At 1440 the content box is 1104px starting at x=168. The **frame** (the vertical lines, dividers and bordered boxes) is 1200px starting at x=120.
- `@media (max-width:1280px)`: `.container, .section-divider, footer>.container {max-width:90%; margin-inline:auto; padding-inline:0}`. `.content-lines::before{left:5%}`, `::after{right:5%}`. `.how-bottom{padding-inline:0}`. `footer{padding-inline:5%}`. At exactly 1280 the container is 1152px starting at x=64.
- `@media (max-width:1024px)`: `.container{padding:0 2rem}`.
- `@media (max-width:768px)`:
  - `.container{padding:0 1.25rem}`. The 90% max-width still applies, so at 768 the container is 691.2px at x=38.4 with a 651.2px content box. At 390 it is 351px at x=19.5 with a 311px content box.
  - `.section-divider{max-width:calc(100% - 2.5rem);margin-inline:1.25rem}`.
  - `.content-lines::before{left:1.25rem}`, `::after{right:1.25rem}`.
  - `.offline-section{padding:4rem 0}`.
  - `.btn-chamfer{padding:.75rem 1.5rem;font-size:.8rem}`.
- Per-component queries are listed in each section. The distinct breakpoints are: `max-width:1280px`, `max-width:1024px`, `(max-width:1024px) and (min-width:769px)` and `max-width:768px`.

### 0.6 Fixed overlays (first children of body, above everything)

```css
.scanlines{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:10002;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px)}
.noise{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10001;opacity:.08;filter:url(#grainy)}
.rgb-fringe{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:10003;
  background:linear-gradient(90deg,#e5332a05,#2b4fff04,#e5332a05);background-size:3px 100%}
```
The `#grainy` filter SVG is `grain-filter` in CLONE_ASSETS.json. It is an feTurbulence fractalNoise with baseFrequency .4, 4 octaves and stitchTiles, plus a SMIL `animate seed 0→100 dur 10s indefinite` and a feColorMatrix `0 0 0 0 1 / 0 0 0 0 1 / 0 0 0 0 1 / 1 0 0 0 0`. The `.noise` div has no background; the filter generates the grain.

### 0.7 Content lines (fixed frame verticals)

`<div class="content-lines">` sits between the hero and `<main>`: `position:fixed;inset:0;pointer-events:none;z-index:9999`. Its `::before` and `::after` are 1px wide, full height, with `background:var(--border)`.
- Default: `left:calc(50% - 600px)` and `right:calc(50% - 600px)`, which puts them at x=120 and x=1319 at 1440.
- ≤1280: at 5%.
- ≤768: at 1.25rem.

The hero, CTA and footer have `z-index:10000`, so they cover the lines. `main.content` does not, so the lines show over all main content.

### 0.8 Section divider

`.section-divider{max-width:1200px;margin:0 auto;height:1px;background:var(--border)}`.

Order of dividers in `<main>`:
1. `<div style="padding-bottom:4rem"><div class="section-divider" style="position:relative;top:4rem"></div></div>`: a 65px spacer whose divider sits at its bottom edge.
2. Problem, then a divider.
3. Intro, then a divider.
4. Offline, then a divider.
5. Three-col, then **two** dividers back to back.
6. How, then a divider.
7. Caps, then a divider.
8. Stats, then a divider.
9. Terminal, then a divider.
10. EA, then a divider.
11. FAQ, then a divider, then `<div style="padding-top:4rem"><div class="section-divider" style="position:relative;top:-4rem"></div></div>`.

`</main>` is followed by the CTA and the footer, both outside main.

### 0.9 `.is-visible` observer (index script_1 small chunk)

An IntersectionObserver on `section, .hero, footer` with `{threshold:0, rootMargin:"200px 0px"}` toggles the `is-visible` class. It is used only to pause CSS animations (`animation-play-state:paused`) when not visible: hero watermark, ticker, eye pupil (`.signal-section`), globe lines, and all CTA SVGs.

**There are no scroll-reveal / fade-in animations on this page.** The 62KB `index script_1` bundle includes the `motion` library, but it is used **only** to tween the How overlay card's height (§8). Nothing else animates on scroll.

### 0.10 Page height and section stack at 1440 (document height 9288)

| block | y | height |
|---|---|---|
| hero | 0 | 588.3 |
| spacer + divider | 588.3 | 65 |
| problem | 653.3 | 708.5 |
| intro | 1362.8 | 1109.7 |
| offline | 2473.5 | 560 |
| three-col | 3034.5 | 199.9 |
| how | 3236.4 | 1040.7 |
| capabilities | 4278.1 | 903 |
| stats | 5182.1 | 158 |
| terminal | 5341.1 | 967.5 |
| early access | 6309.6 | 612.1 |
| faq | 6922.7 | 894.5 |
| spacer + divider | 7818.3 | 65 |
| cta | 7883.3 | 975.6 |
| footer | 8858.8 | 429.2 |

Document heights: 1280 → 9246; 768 → 10342; 390 → 11451.

---

## 1. Components

### 1.1 `.btn-chamfer` (exact)

```css
.btn-chamfer{display:inline-flex;align-items:center;gap:.5rem;padding:1rem 2rem;font-family:"Chivo Mono",monospace;font-weight:700;font-size:.85rem;
  text-decoration:none;border:none;cursor:pointer;position:relative;transition:all .2s cubic-bezier(.25,1,.5,1);
  clip-path:polygon(var(--chamfer) 0,100% 0,100% calc(100% - var(--chamfer)),calc(100% - var(--chamfer)) 100%,0 100%,0 var(--chamfer))}
/* computed: polygon(14px 0px, 100% 0px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0px 100%, 0px 14px) -> top-left and bottom-right corners cut 45deg */
.btn-chamfer:focus-visible{outline:2px solid var(--red);outline-offset:2px}
.btn-red{background:var(--ink);color:var(--paper)}                     /* hover: box-shadow 4px 4px 0 var(--blue) */
.btn-cta{background:var(--red);color:var(--ink)}                       /* hover: box-shadow 4px 4px 0 var(--blue) */
.btn-dark{background:var(--ink);color:var(--paper)}                    /* hover: box-shadow 4px 4px 0 var(--red) */
.btn-outline{background:transparent;color:var(--paper);border:1px solid var(--paper-30);clip-path:none} /* hover border paper, bg #f0ede60d */
.btn-ghost{background:var(--paper-faint);color:var(--paper)}          /* hover bg paper-15 */
/* every variant on :hover also gets: text-shadow:-1px 0 rgba(43,79,255,.35),1px 0 rgba(237,70,45,.35); animation:btn-glitch .3s ease-in-out */
```
`@keyframes btn-glitch`:

| step | transform | text-shadow | opacity |
|---|---|---|---|
| 0% | translate(0) | none | 1 |
| 12% | translate(-1px,.5px) | -1.5px 0 rgba(43,79,255,.4), 1.5px 0 rgba(237,70,45,.4) | .8 |
| 24% | translate(1px,-.5px) | 1px 0 rgba(237,70,45,.3), -1px 0 rgba(43,79,255,.3) | .92 |
| 36% | translate(-.5px) | none | .85 |
| 50% and 100% | translate(0) | none | 1 |

Note: `clip-path` clips the hover `box-shadow`, so the offset shadow is **not visible** on chamfered buttons. Keep the declaration anyway; the visible hover effect is the glitch jitter plus the RGB text-shadow. This was measured: on hover the box-shadow computes but is clipped.

### 1.2 `.badge`

```css
.badge{display:flex;margin:0 auto 2rem;width:fit-content;gap:.6rem;padding:.5rem 1rem;background:#0a0a0ae0;border:1px solid rgba(237,70,45,.2);
  font-family:"Chivo Mono",monospace;font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--red);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
```
- Rendered 34px tall (8 + 16 + 8 + 2 border) with a 9.6px gap. Content is a 16×16 SVG icon (viewBox 0 0 24 24, one pixel-art `<path fill="var(--red)">`) followed by the text node.
- Each section has its own icon; see the `badge-icon-*` entries in CLONE_ASSETS.json.
- Badge `align-items` is the default (stretch). The SVG sits top-aligned inside the 18px line box (it looks centred).
- Centred by default (`margin:0 auto 2rem`). Per-section overrides:
  - `.problem-badge`: margin-bottom 2rem.
  - `.intro-badge`, `.how-intro-badge`, `.term-badge`, `.ea-badge`, `.three-col-badge`: `justify-content:center`. Margin-bottom is 2rem for intro, 1.5rem for how/term/ea and 1rem for three-col.
  - `.offline-badge`: `margin:0 0 1.5rem`, left-aligned. At ≤768 it gets `justify-content:center`, but its margin stays `0 0 1.5rem`, so it remains left-aligned in a centred text column. That is the measured behaviour.
  - Capabilities badge: inline `margin-bottom:1.5rem`.

### 1.3 `.mono-label` / `.section-label`

```css
.mono-label{font-family:"Chivo Mono",monospace;font-size:.75rem;text-transform:uppercase;letter-spacing:.15em}
.section-label{/* same */ color:var(--text-tertiary);margin-bottom:1rem;display:block}
```

### 1.4 `.section-title`

`font-family:Chalet,sans-serif;font-size:clamp(2.5rem,4vw,3.5rem);line-height:.92;letter-spacing:-.03em`, plus weight 700 (see §0.2).

### 1.5 Status dot / blink dot

- `.status`: inline-flex, gap .5rem, mono .75rem, uppercase, letter-spacing .12em.
- `.status-dot`: 6×6, round. Its `::after` sits at `inset:-3px`, `background:inherit`, opacity .4, with `pulse-ring 2s ease-in-out infinite`.
- `.blink-dot`: 8×8, round, red, `blink 2s ease-in-out infinite`, `box-shadow:0 0 8px var(--red-glow)`. `.blink-dot-sm` is 6×6.

### 1.6 `.grid-bg` (terminal section)

```css
.grid-bg{position:relative;overflow:hidden}
.grid-bg:after{content:"";position:absolute;inset:-80% -40% -40%;
  background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:80px 80px;
  transform:perspective(600px) rotateX(55deg);transform-origin:center 60%;
  mask-image:radial-gradient(ellipse 50% 45% at center 55%,rgba(0,0,0,.6) 0%,transparent 100%);pointer-events:none;z-index:0}
.grid-bg>.container{position:relative;z-index:1}
```

---

## 2. Hero (`section.hero`), red full-bleed

### Layout
- `.hero{min-height:50vh;background:var(--red);display:flex;flex-direction:column;position:relative;overflow:hidden;width:100vw;margin-left:calc(-50vw + 50%);z-index:10000}`. Its height is content-driven: 588.3 @1440, 571.5 @1280, 771.6 @768, 669.8 @390.
- The inherited text color is paper, so the watermark's `currentColor` = paper.

### Header / nav (inline `<style>`; the header lives inside the hero)
- `.site-header{display:flex}` with `data-variant="hero"`.
- `.site-nav{max-width:calc(1200px + 6rem);margin:0 auto;padding:1.5rem 3rem;display:flex;justify-content:space-between;align-items:center;position:relative;width:100%}`. At 1440 that is a 1296px box at x=72, 86.4px tall.
  - The nav is not affected by the 1280 rule, so at 1280 it spans the full 1280 and the logo sits at x=48.
  - ≤768: `padding:1rem 1.25rem`, 64px tall.
- Logo: `<img src=/assets/rig-wordmark.svg width=60 height=22>`, `height:22px`. Hero variant uses `filter:brightness(0)` (black); the default variant uses `filter:invert(1) brightness(2)`. Logo top is at y=30.2.
- `.site-nav-links{display:flex;align-items:center;gap:2rem;list-style:none}`. Items: a text link (Blog), then the CTA `a.btn-chamfer.site-nav-cta.btn-dark`.
- Link style: `font:700 .75rem "Chivo Mono";letter-spacing:.05em;opacity:.7;transition:opacity .2s`. Hover opacity 1. Hero variant color is `--ink`.
- CTA: `color:var(--paper)` (btn-dark in hero variant), `height:22px;padding:1.2rem;opacity:1`. With border-box it renders 163.2×38.4 at x=1156.8, y=24 (@1440). Background ink, chamfer clip.
- `.nav-toggle` (hidden above 768):
  - `display:none;background:none;border:none;padding:.5rem;flex-direction:column;gap:5px;z-index:20`, rendered 40×32.
  - Bars are `span.nav-toggle-bar{display:block;width:24px;height:2px;background:var(--paper);transition:transform .3s,opacity .3s;transform-origin:center}`. Hero variant bar color is `--ink`.
  - When `[aria-expanded=true]`: bar1 `translateY(7px) rotate(45deg)`, bar2 `opacity:0`, bar3 `translateY(-7px) rotate(-45deg)`.
- ≤768:
  - The toggle becomes `display:flex`. When expanded it is `position:fixed;top:1rem;right:1.25rem;z-index:10002` and its bars turn paper.
  - `.site-nav-links` becomes `position:fixed;inset:0;flex-direction:column;justify-content:center;gap:2.5rem;background:var(--ink);padding:2rem;z-index:10001;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s`. `[data-open=true]` sets opacity 1 and visibility visible.
  - Menu links are 1.25rem (20px), opacity 1 and paper colored. The CTA gets background red with ink text; measured 246.4×38.4 centred at y≈463 on a 900px-tall viewport.
- JS (Header script):
  - Clicking the toggle flips `aria-expanded` on the button and `data-open` on `#nav-menu`.
  - Escape closes the menu and returns focus to the toggle.
  - Clicking any `<a>` inside the menu closes it.
  - The PostHog "logged-in" swap of the CTA text can be ignored.

### Watermark
- `svg.hero-watermark` (asset `hero-watermark`) is the Rig logo mark, filled with currentColor (paper).
- `position:absolute;right:-5%;top:50%;transform:translateY(-50%);width:55%;opacity:.08;pointer-events:none;animation:watermark-glitch 4s infinite linear`. Rendered 792×777.4 at x=720, y=-94.5 (@1440).
- ≤768: `width:80%;right:-10%`.
- Paused when the hero is not `.is-visible`.
- `@keyframes watermark-glitch`. Every transform is prefixed with `translateY(-50%)`; resting state is `translate(0)`, `filter:none`, opacity .08.

| % | transform (after translateY(-50%)) | filter | opacity |
|---|---|---|---|
| 0 | translate(0) | none | .08 |
| 2 | translate(8px,-3px) | hue-rotate(90deg) saturate(3) | .12 |
| 4 | translate(-6px,2px) | hue-rotate(-60deg) | .06 |
| 5 | rest | | .08 |
| 15 | rest | | .08 |
| 15.5 | translate(-10px) skew(-3deg) | hue-rotate(180deg) saturate(4) | .15 |
| 16 | translate(5px,-2px) skew(2deg) | hue-rotate(-90deg) brightness(1.5) | .1 |
| 17 | translate(-3px,1px) | saturate(2) | .12 |
| 18 | rest | | .08 |
| 40 | rest | | .08 |
| 40.3 | translate(12px) scaleX(1.02) | hue-rotate(120deg) saturate(5) | .18 |
| 40.6 | translate(-8px,3px) scaleX(.98) | hue-rotate(-45deg) | .05 |
| 41 | translate(4px,-1px) | brightness(1.3) | .1 |
| 41.5 | rest | | .08 |
| 65 | rest | | .08 |
| 65.2 | translate(-5px,-4px) skew(-5deg) | hue-rotate(200deg) saturate(3) brightness(1.4) | .2 |
| 65.5 | translate(7px,2px) skew(2deg) | hue-rotate(-120deg) | .04 |
| 66 | translate(-2px) | saturate(2) | .1 |
| 66.5 | rest | | .08 |
| 100 | rest | | .08 |

### Content
- `.hero-content{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:0 3rem;max-width:calc(1200px + 6rem);margin:0 auto;width:100%;position:relative;z-index:10}`. Measured 1296×460 at x=72, y=86.4 (@1440).
  - ≤1280: `max-width:90%;padding-inline:0` (1152 at x=64).
  - ≤1024: `padding:0 2rem`.
  - ≤768: `padding:0 1.25rem` (691.2 at x=38.4, content x=58.4).
- h1 (two lines separated by `<br>`): inline `style="margin-top:2rem"`; CSS `margin-bottom:2rem;position:relative;color:ink`. Size is in §0.4. It measures 990×197 @1440 and starts at y=118.4.
- `.hero-sub{font-size:1.15rem;font-weight:600;color:ink;opacity:.85;max-width:540px;line-height:1.6;margin-bottom:2.5rem}`.
- `.hero-actions{display:flex;gap:1rem;margin-bottom:3rem}`. It holds two buttons:
  1. `a.btn-chamfer.btn-red#hero-join-btn`: ink background, paper text, measured 170.1×52.
  2. `a.btn-chamfer.btn-red` with inline `background:transparent;color:var(--ink);border:2px solid rgba(10,10,10,.3)`, measured 165.9×52. Because of the clip-path, the border is cut off at the two chamfered corners.
  - ≤768: `.hero-actions{flex-wrap:wrap}`, and each button becomes `flex:1 1 100%;justify-content:center;padding:1.25rem 2rem;font-size:1rem` (59px / 63px tall, full width, 15px vertical gap).

### Ticker
- `.hero-ticker{border-top:1px solid rgba(10,10,10,.15);padding:.75rem 0;overflow:hidden;position:relative;z-index:10}`, 42px tall, full-bleed, at the bottom of the hero.
- `.hero-ticker-inner{display:flex;gap:4rem;animation:ticker 18s linear infinite;white-space:nowrap;font-family:"Geist Pixel Square",monospace;font-size:.8rem;color:var(--ink);opacity:.7;letter-spacing:.1em;text-transform:uppercase;-webkit-text-stroke:.5px var(--ink)}`. ≤768: `gap:2rem`.
- Children are spans: 7 phrases alternating with `•` spans, then the whole list repeated. The source has 27 spans (the trailing bullet is missing). One set measures 1900px wide @1440.
- `@keyframes ticker{0%{transform:translate(0)}to{transform:translate(-50%)}}`. **Gotcha:** the flex box itself is only as wide as the viewport (1440), so `-50%` = -720px per 18s (40px/s at 1440, 35.6px/s at 1280) and the loop visibly jumps back. To replicate exactly, keep the inner element as a normal-width flex row; don't size it to its content.
- Paused when the hero is not `.is-visible`.

---

## 3. Problem (`section.signal-section.problem-section`)

- The section has `padding:0`. `.container.problem-container{padding:0}`, so the frame is 1200 wide at x=120 (@1440), 90% below 1280, and 90% at ≤768 as well because padding stays 0 (351 at 390).
- `.problem-outer{border-bottom:1px solid var(--border);position:relative;overflow:hidden}`. The left and right sides of the "box" are the fixed content-lines, not borders. Its top edge is the spacer divider.
- Section height: 708.5 @1440, 693.8 @1280, 1030.3 @768, 1244.6 @390.
- `.problem-top{padding:3rem 3rem 2.5rem}`, 286.5 tall @1440. `(max-width:1024px) and (min-width:769px)`: `padding:2rem !important`. ≤768: `padding:1.5rem 1.25rem !important`.
  - Badge: centred, 154.6×34.
  - `h2.display.problem-headline{font-size:clamp(3rem,5vw,4.5rem);line-height:.92}`: two lines, left-aligned, 1104 wide @1440.
- `.problem-divider{border-top:1px solid var(--border)}` spans the full width.
- `.problem-grid{display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;min-height:420px}`. @1440 the columns are 400/400/400 and the rows 210/210.
  - Child 1 is `.problem-eye-col{grid-row:1/3;border-right:1px solid var(--border);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}`. It holds `.problem-eye-wrapper{width:380px;height:380px}` with the SVG at 100%.
  - Children 2–5 are `.problem-card{padding:2rem}`. `:nth-child(2)` and `:nth-child(4)` have a right border; `:nth-child(2)` and `:nth-child(3)` have a bottom border (all `1px solid var(--border)`).
  - Card header: `.problem-card-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:.75rem}`, containing a label (red, .65rem, .1em, uppercase) and a number (`001`… at .6rem, .2em, paper-20).
  - Card h3: `class="display-heavy"`, 1.35rem, lh 1.05, mb .75rem.
  - Card p: paper-dim, .8rem, lh 1.6, containing `<br>` line breaks.
  - ≤768: `grid-template-columns:1fr !important;grid-template-rows:auto !important;min-height:auto !important`. The eye col gets `grid-row:auto;border-right:none;border-bottom:1px solid var(--border);min-height:280px` with a 280×280 wrapper. Cards get `padding:1.25rem !important;border-right:none !important;border-bottom:1px solid var(--border) !important`, except `:last-child` which has no bottom border.
- **Eye SVG** (`surveillance-eye`, 480 viewBox):
  - `#eye-pupil{animation:pupil-glitch 4s infinite linear}`, paused when `.signal-section` is not `.is-visible`.
  - `@keyframes pupil-glitch` (opacity / translate): 0% and 100% 1 / 0; 2% .8 / (2px,-1px); 3% .5 / (-2px,1px); 4% 1 / 0; 40% 1 / 0; 40.3% .6 / (-3px); 40.8% .3 / (2px,-1px); 41.5% 1 / 0; 75% 1 / 0; 75.2% .7 / (1px,2px); 75.6% .4 / (-2px,-1px); 76% 1 / 0.
  - `.eye-blink-target{transform-origin:240px 240px;transform:scaleY(1);transition:transform .25s cubic-bezier(.7,0,1,.5)}`. With `.shut`: `transform:scaleY(.02);transition:transform .2s cubic-bezier(0,.5,.3,1)`.
  - `.eye-linework{transition:opacity .1s ease}` (base attribute opacity .22). `.problem-eye-col:hover .eye-linework{opacity:.28;transition:opacity 0s}`.
  - **Mouse tracking** (inline script): on document `mousemove`, take the vector from the SVG centre to the cursor, with distance `u`. Set pupil `cx = 240 + dx/u*16*min(u/150,1)`, and cy the same way. The maximum offset is 16 viewBox units, with no easing. Reset the static cx/cy to 240/240 (see the asset note).
  - **Blink loop:**
    - An IntersectionObserver on the section (threshold .1) starts the loop 2000–5000ms (random) after it first becomes visible.
    - Each blink:
      - It glitches the whole SVG for 300ms. Every rAF frame it rolls `r = Math.random()`:
        - r < .3: `filter:hue-rotate(±20deg) saturate(.5–1.5)` and `opacity` .4–1.
        - .3 ≤ r < .5: `filter:brightness(.3–1)` and `opacity` .6–1.
        - otherwise: filter and opacity are cleared.
      - It adds `.shut` to both `.eye-blink-target`s at 60ms and removes it at 180ms.
      - With 30% probability it double-blinks: a 200ms glitch plus shut at 400ms, open at 520ms.
    - The next blink comes 6000–14000ms later. The loop stops when the section leaves the viewport.

---

## 4. Introducing (`section#intro-rig.offline-section.three-col`)

- `.offline-section{padding:8rem 0;position:relative;overflow:hidden}`. The `.three-col` class hides the `::before` centre line. ≤768 padding is 4rem 0.
- Section height: 1109.7 @1440, 1094.9 @1280, 763.1 @768, 662.8 @390.
- **Shader background:**
  - `.intro-shader-wrap{position:absolute;top:0;height:0;left:calc(50% - 600px);right:calc(50% - 600px);overflow:hidden;z-index:0;pointer-events:none;mix-blend-mode:lighten;transform:translateY(-140px)}`. ≤1280 `left/right:5%`; ≤768 `left/right:0`.
  - Canvas `#shader3.shader-bg{position:absolute;inset:0;width:100%;height:100%}`.
  - JS sizes the wrap on load and resize. Let `pad = 0.5rem(8px) + 50` = 58px. Then `top = headlineWrap.top - section.top - pad`, and `height = headlineWrap.height + 2*pad`. Measured 1200×389.7 at y=1292.8 (@1440), i.e. it starts 70px above the section top and bleeds over the divider.
- `.container.intro-container{position:relative;z-index:1}`. `.intro-flex{display:flex;flex-direction:column;align-items:center}`.
- `.intro-headline-wrap{text-align:center;max-width:650px;margin-bottom:3rem}` contains:
  - the badge;
  - `h2.display.intro-title{font-size:clamp(3rem,5vw,4.5rem);line-height:.92;margin-bottom:1.5rem}`;
  - `p.intro-desc{color:var(--paper-dim);font-size:1rem;line-height:1.6;text-wrap:balance}`.
  - All three get `text-shadow:0 0 8px var(--ink),0 0 16px var(--ink),0 0 32px var(--ink),0 0 60px var(--ink),0 0 100px var(--ink)` so they read over the shader.
- Then `.intro-spacer{height:2rem}` followed by `.intro-diagram-wrap{width:100%;max-width:1000px;position:relative}`. `svg.intro-diagram{width:100%;display:block}` also gets `will-change:transform;contain:layout style paint;transform:translateZ(0)`. Rendered 1000×500 @1440 and 1280, 651.2×325.6 @768, 311×155.5 @390.
- **Diagram animation** is SMIL inside the SVG, so copy it verbatim:
  - Green 3×3 "shooting star" rects travel along `#path-code-rig` (M130,125→193,125) and `#path-rig-resp` (M353,125→423,125). `dur 2s`, linear, indefinite; the second has `begin 1s`. Opacity keyframes `0;1;1;0` at `0;.1;.8;1`. Trail lines pulse opacity `.2;.6;.2` over 2s.
  - Red blocked stars travel `#path-cloud-down` (273,37→57) and `#path-rig-telem` (273,172→192) with `dur 1.5s`; the second has `begin .75s`. Opacity `.8;.8;0` at `0;.6;1`.
  - Structure: an X mark on each blocked line, a dashed "YOUR MACHINE" boundary rect (stroke paper .08, dash 4 4), and `g.svg-card` boxes with fill rgba(10,10,10,.95) and stroke paper .15.
  - Hover rules. On `.svg-card:hover`:
    - `rect` gets `fill:var(--paper-faint);stroke:var(--border)`;
    - `.card-title` gets `fill:var(--paper)`;
    - `.card-sub` gets `fill:#f0ede680`;
    - `.card-accent` gets `fill:var(--green)`;
    - `.card-divider` gets `stroke:#f0ede62e`.
    - Timing: the transitions are `fill .15s ease, stroke .15s ease` out and `0s` in.
  - In React, inline the SVG markup via `dangerouslySetInnerHTML` (or a `?raw` import) so the SMIL attributes survive untouched.

---

## 5. Work offline (`section.offline-section`, inline `padding:0`)

- `::before` is a vertical centre line: `left:50%;width:1px;top:0;bottom:0;background:var(--border);z-index:1`, at x=720 @1440. ≤768 it is hidden and replaced by `.offline-visual::after`, the same kind of line centred in the visual only.
- `.container` has inline `position:relative`. ≤1280: `max-width:90%;padding-inline:0`.
- `.offline-layout{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}` with inline `min-height:560px`. @1440 the columns are 520/520 (in the 1104 content box); @1280 544/544. `(max-width:1024px) and (min-width:769px)`: `gap:2rem`. ≤768: `grid-template-columns:1fr;gap:2rem`.
- `.offline-visual{position:relative;display:flex;align-items:center;justify-content:center;min-height:420px;margin-left:-3rem}` with inline `overflow:hidden;min-height:560px`. @1440 it is 568×560 at x=120, so it extends to the frame line. ≤1280 margin 0. ≤768 `min-height:300px` (the inline 560 wins), `margin-left:0`, `border-bottom:1px solid var(--border)`.
  - **Globe** (`svg.globe-svg`): `width:900px;height:900px;position:absolute;top:50%;left:0;transform:translate(-40%,-50%)`, clipped by the visual. ≤768 it is 700×700.
  - **3-card flow** (absolute, centred, z 3): an inline div with `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:0`. Measured 201.4×301.4.
    - Small card (`.offline-card`): Chivo .7rem, .15em, uppercase, color rgba(240,237,230,.4), `padding:.75rem 1.5rem`, bg rgba(10,10,10,.95), `border:1px solid rgba(240,237,230,.1)`. 159.2×40 (cloud).
    - Severed connector: a column with `padding:.25rem 0`, align-items center. It contains `dash svg 2×16`, `x svg 16×16 (margin 2px 0)`, the label "Severed" (Chivo .5rem, .15em, uppercase, red, margin 2px 0), then another `dash svg`.
    - Middle card: Chivo uppercase, .15em, `padding:1.25rem 2rem`, same bg, `border:1px solid rgba(240,237,230,.2)`, centred. The title `.offline-card-title` is .8rem paper with mb .4rem. The accent `.offline-card-accent` is .55rem `#22c55e`, opacity .8, flex centred with gap .3rem, content "✓ ..." (`&#10003;`).
    - Last card: same as the first.
    - Hover on `.offline-card`: `border-color:#f0ede647;color:#fff` (0s in, .1s out). The accent goes to opacity 1 and color `#4ade80`.
- `.offline-content`:
  - `.offline-badge{margin:0 0 1.5rem}`.
  - h2: Chalet `clamp(2.5rem,5vw,3.5rem)`, lh .9, -.03em, mb 1.5rem.
  - `>p`: paper-dim, 1rem, lh 1.7, max-width 440px, mb 2.5rem.
  - ≤768: `text-align:center`, p margin-inline auto.
- Animations:
  - `.globe-line-left{animation:disconnect-drift-left 6s ease-in-out infinite}`. At 0/80/100%: translate(0), opacity .5. 85%: (-6px,2px) at .3. 90%: (-10px,4px) at .15. 95%: (-4px,1px) at .4.
  - `-right` mirrors it with positive x and negative y.
  - Wi-Fi-off icon: inline `animation:signal-flicker 4s ease-in-out infinite`. At 0/92/100%: opacity 1, translate 0. 93%: .4 at (-2px,1px). 95%: .8 at (1px,-1px). 97%: .3 at (-1px).
  - All paused when the section is not `.is-visible`.

---

## 6. Three-column details (`section.offline-section.three-col`)

- The section has `padding:0` and a height of 199.9 @1440 (221.6 @1280, 535.4 @768, 644.1 @390).
- `.three-col-container{position:relative;padding-inline:0}`, so the grid spans the full 1200 frame.
- `.three-col-grid{display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;align-items:center}`. @1440 the tracks are 399.33 / 1 / 399.33 / 1 / 399.34. The first cell gets `padding-left:2rem` and the last `padding-right:2rem` (declared on the child div selectors).
- `.three-col-divider{background:var(--border);width:1px;align-self:stretch}`.
- `.three-col-cell{display:flex;flex-direction:column;padding:0 2rem;justify-content:center;align-items:center}`, containing `.three-col-inner{padding:2rem 0;text-align:center}`, which holds the badge (mb 1rem), `h3.three-col-heading` and `p.three-col-text`.
- ≤768: `grid-template-columns:1fr`, and the dividers become `width:100%;height:1px;align-self:auto` horizontal rules.

---

## 7. Double divider

Two `.section-divider`s follow each other directly here (two 1px lines, stacked).

---

## 8. How it works (`section.how-section#our-approach`)

- `.how-section{padding:8rem 0 0}` (≤768 `4rem 0 0`). `>.container{padding-inline:0}` (≤768 `padding-inline:1.25rem`). Section height 1040.7 @1440.
- `.how-intro{text-align:center;margin-bottom:1rem;padding:0 3rem}` contains:
  - the badge (mb 1.5rem);
  - `h2.how-intro-heading.section-title`;
  - `p.how-intro-body{color:paper-dim;font-size:1rem;line-height:1.6;max-width:620px;margin:1.5rem auto 0}`.
- `.how-stepper{display:grid;grid-template-columns:2fr 3fr;gap:0;margin-top:3rem;align-items:start}`. @1440 the tracks are 480/720, 680 tall. `(769–1024)`: `1fr 1fr` and the illustration min-height 500. ≤768: `1fr`, with the illustration `order:2` and the steps `order:1`.
- Left column: `.how-steps-left{display:flex;flex-direction:column}` with three `<button class="how-step" data-step="n">`:
  - `.how-step{padding:1.5rem 2rem 1.5rem 1.25rem;border:none;border-top:1px solid var(--border);cursor:pointer;position:relative;background:none;color:inherit;font:inherit;text-align:left;width:100%;display:block;outline:none;appearance:none;overflow:visible}`. `:last-child` also has a bottom border. `:focus-visible{outline:2px solid var(--red);outline-offset:-2px}`. ≤768: `padding:1.25rem 1.25rem 1.25rem 1rem;border-right:1px solid var(--border)`.
  - Progress rail: `.how-step-progress{position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--paper-faint)}`, containing `.how-step-progress-fill{position:absolute;top:0;left:0;width:100%;height:0%;background:var(--red);transition:none}`. For `.active`: `animation:howProgressFill 6s linear forwards;animation-play-state:paused` (JS sets it to running), where `@keyframes howProgressFill{0%{height:0%}to{height:100%}}`.
  - Header: `.how-step-header{display:flex;flex-direction:column;gap:.5rem}` with `.how-step-num` ("Step 01"; its color transitions .3s) and the h3 (color transitions .3s).
  - Body: `.how-step-body{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .4s ease,opacity .3s ease}`. `.active` sets `1fr` and opacity 1. Inside is `.how-step-body-inner{overflow:hidden}` holding 2 `<p>`: paper-dim, .9rem, lh 1.7, mt 1rem; the second p has mt .5rem.
  - Measured @1440: the active step is 281.6 tall (h3 2 lines = 67.2px, body 2 paragraphs); inactive step 2 is 135.2 tall (h3 2 lines, body collapsed to 0).
- Right column: `.how-illustration{position:relative;min-height:680px;border:1px solid var(--border);border-right:none;background:#f0ede604;overflow:hidden;display:flex;align-items:center;justify-content:center}`. 720×680 @1440. ≤768 `min-height:400px;border-right:1px solid var(--border)`.
  - Canvas `#shader1.shader-bg{position:absolute;inset:0;width:100%;height:100%;z-index:0}`.
  - Overlay card `#howCard.shader-overlay-card{position:relative;z-index:1;background:#0a0a0ae0;border:1px solid #ed462d;border-radius:6px;padding:1.75rem 2rem;max-width:380px;width:90%;font-family:"Chivo Mono";font-size:.7rem;line-height:1.8;color:var(--paper-45);backdrop-filter:blur(8px);overflow:hidden}`. 380×327.4 on step 1, 267 on step 2.
    - `.card-title` (#howCardTitle): block, paper, .65rem, .15em, uppercase, mb 1rem, pb .75rem, `border-bottom:1px solid rgba(237,70,45,.12)`. Its text per step (JS map) is 1 "Training Focus", 2 "Model Size", 3 "Performance".
    - There are 3 `.card-content[data-content=n]` blocks: `display:none`, with `.active` set to `display:block`. They are ASCII bar charts built from spans:
      - `.hl-red` = red;
      - `.hl-green` = `#22c55e`;
      - `.hl-bright` = paper-70;
      - `.hl-dim` = paper-45;
      - bars use the glyphs █ ░ ▎, with `&nbsp;` for alignment and `<br>` for line breaks.
      - Copy them from index.html (char offsets 61073–65447 region).
- `.how-bottom` (declared in CSS, not present in the current markup): margin-top .5rem, centred, max-width 600, padding 0 3rem, p text-muted .9rem lh 1.7, `.highlight` paper-70.
- **Stepper JS** (in the motion bundle):
  - State: `X` = current step (starts at 0), `z` = section in view, `Xt` = hovering the stepper.
  - `setHowStep(n)` (also `window.setHowStep`, and the step buttons `onclick="setHowStep(n,true)"`):
    - It first resets `animation:none` on all fills and removes `.active` from all steps.
    - Then it adds `.active` to step n, forces a reflow on its fill, clears the inline animation (so the CSS animation restarts) and applies the play state.
    - Next it swaps `.card-content.active` and the title text.
    - The first call (`X==0`) sets the height to auto with no tween.
    - Otherwise it measures the old height, swaps content, measures the new height, sets the old px height with `overflow:hidden`, and animates height old→new with motion `animate(el,{height:[a,b]},{duration:.4,easing:[.25,.1,.25,1]})`. On finish it sets `height:auto` and clears overflow. Use a 400ms `cubic-bezier(.25,.1,.25,1)` height tween.
  - Auto-advance: listen for `animationend` with `animationName==="howProgressFill"` on the active fill, then go to `X<3 ? X+1 : 1`. The interval is **6s per step** (the fill grows linearly; measured ~46.9px/s on a 281.6px step).
  - Play state: `running` only if the section is intersecting (IO threshold .1) AND the mouse is not over `.how-stepper` (mouseenter/mouseleave pause). The first intersection calls `setHowStep(1)`.
- Mouse → shader: `mousemove` over `.how-illustration` sets the global `window._shaderMouse=[x/w, 1-y/h]`; mouseleave sets it to null. See §15.

---

## 9. Capabilities (`section.illust-features`)

- `.illust-features{padding:8rem 0}` (≤768 `4rem 0`), 903 tall @1440. `.container{padding:0 1.5rem}` (1152 content box @1440, x=144). Note this overrides the ≤1024 and ≤768 container paddings as well, because it has higher specificity: 1.5rem at all widths, inside the 90% max-width.
- Badge: centred, inline mb 1.5rem. h2 `.section-title` with inline `margin-bottom:2rem;text-align:center`.
- `.illust-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:4rem}`: 368×3 columns, rows 224.75 @1440. ≤1024: `repeat(2,1fr)`. ≤768: `1fr`, `gap:1rem;margin-top:2rem`.
- `.illust-card{background:#ffffff05;border:1px solid var(--border);padding:2.5rem 2rem 2rem;transition:all .3s;clip-path:<chamfer polygon, same as .btn-chamfer>}`. Hover: `border-color:#ed462d33;background:#ed462d08`. ≤768: `padding:1.5rem 1.25rem 1.25rem`.
  - The chamfer clips the border at the two corners, so no diagonal border line appears.
  - `.illust-label.mono-label`: text `[ 01 ]`, .7rem, red, 700, mb .75rem.
  - h3: Chalet 1.35rem, -.02em, lh 1.1, mb .75rem.
  - p: paper-dim, .85rem, lh 1.6.
  - A CSS rule exists for `svg{72×72;mb 1.75rem}`, but the current markup has **no SVGs** in the cards.

---

## 10. Stats strip (`section.stats-strip`)

- `display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border);max-width:1200px;margin:0 auto`. 1200×158 @1440. ≤1280 `max-width:90%`. ≤1024 `repeat(2,1fr)`. ≤768 `1fr`.
- `.stat-box{padding:2rem;border-right:1px solid var(--border);display:flex;flex-direction:column;gap:.75rem}`. `:last-child` has no right border.
  - ≤1024: `nth-child(2)` loses its right border; children 1 and 2 get a bottom border.
  - ≤768: no right border, a bottom border on all but the last, `padding:1.5rem 1.25rem`.
- Contents, in order:
  - `span.stat-label.mono-label` (red);
  - `span.stat-value` (Chalet 2.5rem, lh 1, weight 400);
  - `span.stat-note` (Chivo .75rem, text-muted).

---

## 11. Terminal (`section.terminal-section.grid-bg`)

- `.terminal-section{padding:8rem 0;position:relative;clip-path:inset(0 calc(50% - 600px))}`. The clip-path restricts the perspective grid to the 1200 frame. ≤1280 `inset(0 5%)`; ≤768 `padding:4rem 0;clip-path:inset(0 1.25rem)`. Height 967.5 @1440.
- `.grid-bg:after` is the perspective floor grid (§1.6). Computed inset @1440: -774 / -576 / -387 / -576px.
- `.term-header{text-align:center;margin-bottom:3rem}` contains the badge (mb 1.5rem) and `h2.display.term-title{font-size:clamp(2.5rem,4vw,3.5rem);line-height:.92}`.
- `.terminal-artifact{position:relative;max-width:630px;margin:0 auto}`: 630×554 @1440, 630×454 @768 (the aspect-ratio drops at ≤768).
- **Blueprint annotations** (hidden ≤1024):
  - `.terminal-blueprint-left/right{position:absolute;top:0;bottom:0;width:200px;pointer-events:none}` at `left:-220px` / `right:-220px`.
  - Each holds 3 `.bp-anno{position:absolute;display:flex;align-items:center;gap:0}` placed at `.bp-at-34/50/66` (top 34%/50%/66%). Left side anchors `right:0`, right side `left:0`.
  - Left anno order: `.bp-text` (right-aligned), then `.bp-line-left{width:40px;height:1px;background:var(--paper-15);margin-left:12px}`, then `.bp-dot{width:4px;height:4px;border:1px solid var(--text-faint);background:none}`. The right side is mirrored: dot, `.bp-line-right` (margin-right 12px), text.
  - `.bp-text`: Geist Pixel .6rem, .1em, uppercase, lh 1.5. `.bp-title` is #fff; `.bp-desc` is paper-45. Measured left anno text box 155.1×43.2.
- **Monitor:**
  - `.monitor-casing{background:linear-gradient(160deg,#1a1a1a,#111,#0d0d0d);padding:1.25rem;border-radius:10px;border:1px solid var(--paper-06);position:relative;box-shadow:0 2px 0 var(--paper-04),0 -1px #00000080,0 20px 60px #0006}`.
  - `.monitor-vents{display:flex;gap:4px;margin-bottom:.75rem}` holds 5 `.monitor-vent{height:3px;flex-grow:1;background:var(--paper-04);border-radius:1px}`.
  - `.monitor-screen-bezel{border:2px solid var(--paper-06);border-radius:6px;overflow:hidden;box-shadow:inset 0 2px 8px #00000080;aspect-ratio:16/12;display:flex;flex-direction:column}`: 588×441 @1440. ≤768 `aspect-ratio:auto`.
  - `.terminal-window{background:#050505;overflow:hidden;position:relative;flex:1;display:flex;flex-direction:column}`:
    - `.terminal-bar{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.25rem;border-bottom:1px solid var(--paper-06);background:var(--paper-02)}`, 39 tall. It contains `.terminal-dots` (flex gap 6px, 3 spans 8×8 round `--border-dim`), `.terminal-title` (Chivo .75rem, paper-30, uppercase, .1em) and `.blink-dot.blink-dot-sm` (6×6 red blink 2s).
    - `.terminal-body{padding:1.75rem;font-family:"Chivo Mono";font-size:.85rem;line-height:1.8;flex:1}` (≤768 `padding:1rem;font-size:.75rem`). Lines are `div.term-line`, with the extra classes `term-line-gap-sm` (pt .5rem) and `term-line-gap` (pt .75rem).
    - Spans:
      - `.prompt` (λ) red;
      - `.cmd` paper;
      - `.flag` blue;
      - `.output` text-muted;
      - `.success` red (yes, red);
      - `.info` text-faint at .75rem (≤768 .65rem);
      - `.term-off` red.
    - `pre.term-ascii`: Chivo .6rem, lh 1.3, paper-20; it is the "RIG" block-letter art (copy it from the HTML).
    - Last line: `λ` + `span#typing-text.cmd` + `span.cursor-block{display:inline-block;width:8px;height:15px;background:var(--red);animation:blink 1s step-end infinite;vertical-align:middle}`.
  - `.monitor-bezel-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:1.25rem;padding-top:1rem;padding-bottom:.5rem;border-top:1px solid var(--paper-04);font:.6rem "Chivo Mono";letter-spacing:.2em;text-transform:uppercase;color:var(--text-faint)}`. Items: span, `.monitor-led` (4×4 red round, `box-shadow:0 0 6px var(--red-glow)`, `blink 3s ease-in-out infinite`), `span.model-tag` (red, opacity .5), span.
- **Mobile annotation grid:** `.terminal-annotations-grid{display:none}`. At ≤1024 it becomes `display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:2rem;border:1px solid var(--border)` (≤768 margin-top 1.5rem).
  - Items are `.terminal-anno-item{text-align:center;padding:1.25rem .75rem;border-bottom:1px solid var(--border)}`. `:nth-child(odd)` has a right border; `:nth-last-child(-n+2)` has no bottom border.
  - Title: Geist Pixel .65rem, .1em, uppercase, #fff, mb .25rem. Desc: Geist Pixel .6rem, paper-45, lh 1.5.
  - The order interleaves left and right: L1, R1, L2, R2, L3, R3.
- **Line reveal** (CSS, runs on **page load**, not on scroll):
  - `.term-line{opacity:0;animation:terminalLineIn .01s step-end forwards}` with `@keyframes terminalLineIn{0%{opacity:0}.01%{opacity:1}to{opacity:1}}`.
  - `nth-child` delays for 1–8: .4s, 1s, 1.8s, 2.4s, 3.2s, 3.6s, 4.2s, 4.8s.
- **Typing** (inline script):
  - Phrases come from an array (use `content.terminal.prompts`).
  - Type at **70ms per char** (`textContent = phrase.slice(0,i)` for i = 0..len).
  - Hold **2000ms**, then delete at **30ms per char**, pause **400ms**, and move to the next phrase (cycling).
  - Starts 500ms after `.terminal-section` intersects (IO threshold .1); stops when it leaves and resumes on re-entry.
  - The initial static text in the HTML is "explain this regex to ".

---

## 12. Early access (`section#early-access.promise-section`)

- `.promise-section{padding:8rem 0;position:relative;overflow:hidden}` (≤768 `4rem 0`). 612.1 tall @1440.
- Shader: `#early-access .shader-wrap{position:absolute;top:0;height:0;left:calc(50% - 600px);right:calc(50% - 600px);overflow:hidden;z-index:0;mix-blend-mode:lighten;transform:translateY(-125px)}` (≤1280 5%; ≤768 0). It holds canvas `#shader2`. JS positioning is as in the intro but with `extraPad:40` on `.ea-headline-wrap`, so pad = 48. Measured 1200×291 at y=6264.6 @1440.
- `.ea-container{position:relative;z-index:1}`. `.ea-content{text-align:center;max-width:500px;margin:0 auto}` contains:
  - `.ea-headline-wrap`: the badge (mb 1.5rem), `h2.display.ea-title` (`clamp(2.5rem,4vw,3.5rem)`, lh .92, mb 1.5rem) and `p.ea-desc` (paper-dim, 1.2rem, lh 1.6, mb 2rem, text-wrap balance). The h2, p and badge get the same 5-layer ink text-shadow as the intro.
  - The waitlist form.
- **Waitlist form** (`index.DGyztNce.css`):
  - `.waitlist-form-wrapper{width:100%;max-width:480px;margin:0 auto}`.
  - `.form-row{display:flex;gap:.75rem}` (≤768 `flex-direction:column`).
  - `.email-input{flex:1;padding:.85rem 1.2rem;font:.8rem "Chivo Mono";letter-spacing:.02em;background:var(--paper-04);border:1px solid var(--paper-15);color:var(--paper);outline:none;transition:border-color .2s}`, 313.9×44.2 @1440. Focus border paper-35; placeholder paper-30.
  - `.submit-button.btn-chamfer{display:inline-flex;align-items:center;justify-content:center;padding:.85rem 1.5rem;background:var(--red);color:var(--ink);border:none;font:700 .75rem "Chivo Mono";letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;transition:background .2s}`, 154.1×44.2, chamfered. `:hover:not(:disabled){background:#d93d26}`; disabled opacity .7. ≤768: `width:100%`.
  - Loading state: `[data-loading=true]` hides `.button-text` and shows the `.spinner` (18×18, `wl-spin 1s linear infinite`, `@keyframes wl-spin{to{transform:rotate(360deg)}}`).
  - `.form-error{color:#ff6b6b;font-size:.75rem;margin-top:.5rem;min-height:1rem}`, hidden when `:empty`.
  - `.hp-field` is an offscreen honeypot.
  - `.turnstile-container{margin-top:1rem;text-align:left}` holds the Cloudflare Turnstile widget (3rd-party; skip it or leave an empty div).
  - Success state (hidden): `.success-heading` (Chalet 1.8rem), `.position-number` (red 700) and `.referral-section` (bg paper-04, border border-dim, padding 1.25rem) with a copy button (40×40, hover red) and `.dashboard-link` (red, Chivo .75rem).
  - Build the success view statically, but it does not need backend wiring.
- `mousemove` over `#early-access` also feeds `_shaderMouse` (§15).

---

## 13. FAQ (`section.faq-section`)

- `.faq-section{padding:8rem 0 0}` (≤768 `4rem 0`), 894.5 tall @1440, all items closed.
- `.container` holds `.badge.faq-badge` (default centred, mb 2rem), `h2.section-title.faq-title{margin-bottom:4rem;text-align:center}` (≤768 mb 2rem) and `.faq-list{width:100%}`.
- Items are `details.faq-item{padding:0 1.5rem;border-top:1px solid var(--border)}`; `:last-child` also has a bottom border. Closed item height is 73 @1440 and 65 @≤768.
  - `summary.faq-question{display:flex;align-items:center;gap:1.25rem;padding:1.5rem 0;cursor:pointer;list-style:none;user-select:none}`. Hide the marker (`::-webkit-details-marker{display:none}`). ≤768: `padding:1.25rem 0;gap:1rem`.
    - `span.faq-question-number.mono-label`: red, .7rem, 700, flex-shrink 0 (text "01".."08").
    - `span.faq-question-text`: Chalet 1.2rem, -.02em, lh 1.2, flex 1. On summary hover it stays paper.
    - `span.faq-chevron`: paper-35, `transition:transform .3s ease,color .3s ease`. Contains the 20×20 chevron SVG; the span box is 20×24.
      - On summary hover the chevron turns paper-50.
      - `[open]` sets `transform:rotate(180deg);color:var(--red)`.
  - `.faq-answer-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .3s ease}`; `[open]` sets `1fr`. Inside, `.faq-answer{overflow:hidden}` holds a `p` with `padding:0 0 1.5rem 2.25rem;color:paper-dim;font-size:.9rem;line-height:1.7;max-width:600px` (≤768 `padding-left:2.5rem;font-size:.85rem`). Item 1 open measures 243.9 tall @1440.
  - **Gotcha:** a native `<details>` shows its content instantly on open, so the grid-rows transition only plays in modern Chromium when the content is always rendered. To get the .3s open animation reliably in React, control `open` state yourself: `onClick` preventDefault on the summary, toggle the state, and set the `open` attribute. Keep the same CSS. Closing on the original is effectively instant.
  - `summary:focus-visible{outline:2px solid var(--red);outline-offset:2px}`.
- The original also injects FAQPage JSON-LD. That is optional.

---

## 14. CTA (`section.cta-section`, outside `<main>`)

- `.cta-section{padding:12rem 0 16rem;text-align:center;position:relative;z-index:10000;border-top:1px solid var(--border);clip-path:inset(0 -100vw -100vw -100vw)}`. That clips only above the top edge, so the vortex can bleed sideways.
  - `(769–1024)`: `padding:8rem 0 10rem`. ≤768: `padding:6rem 0 8rem`.
  - Heights: 975.6 @1440, 958.3 @1280, 575.3 @768, 592 @390.
- Vortex: `.cta-vortex-wrap{position:absolute;bottom:0;left:50%;transform:translate(-50%);width:105vw;pointer-events:none}` containing `<picture><source srcset=/assets/cta-vortex.webp type=image/webp><img class=cta-vortex-img src=/assets/cta-vortex.png loading=lazy></picture>`, with `.cta-vortex-img{width:100%;display:block}`. Rendered 1512×938.3 @1440 (image 2106×1307), anchored to the section bottom, starting 37px below the top border. The red wireframe funnel fills the section.
- `svg.cta-oversized-svg{position:absolute;bottom:-120px;right:-100px;width:900px;height:900px;pointer-events:none;opacity:.04}`, hidden ≤768.
- `.cta-container{position:relative;z-index:2}` contains:
  - The `svg.cta-bloom-filter` (0×0, defines `#bloom`).
  - `.cta-logo-wrap{position:relative;display:block;width:65px;height:64px;margin:0 auto 3rem}` holding:
    - `svg.cta-logo-glow{height:64px;width:auto;position:absolute;top:0;left:0;filter:url(#bloom);animation:hdr-glow-pulse 3s ease-in-out infinite}`, with `@keyframes hdr-glow-pulse{0%,to{opacity:.4;filter:blur(8px)}50%{opacity:.7;filter:blur(12px)}}`. The keyframe filter replaces `url(#bloom)` while animating; measured computed filter was `blur(8px)`, opacity .4.
    - `svg.cta-logo{height:64px;width:auto;position:relative}`, filled red.
  - `.cta-heading-wrap{position:relative;display:inline-block}` holding:
    - `.cta-heading-blur{position:absolute;top:20%;left:50%;transform:translate(-50%,-50%);width:375%;height:600%;background:radial-gradient(ellipse,var(--ink) 25%,transparent 60%);pointer-events:none;z-index:-1;opacity:.6;filter:blur(8px)}`. This is a dark halo behind the heading that hides the vortex lines; it measures 2250×1497.6 @1440.
    - `h2.glitch-text[data-text="…"]`: Chalet `clamp(4rem,8vw,7rem)`, lh .9, -.03em, `margin-bottom:3rem;max-width:600px;margin-inline:auto`. 600×201.6 @1440 (two lines).
  - `.cta-btn-wrap{display:flex;justify-content:center;width:100%}` holding `button.btn-chamfer.btn-cta.cta-btn{padding:2rem 3rem;font-size:1.3rem;box-shadow:0 0 40px var(--red-glow);width:100%;max-width:500px;justify-content:center;gap:.75rem}`: 500×89 @1440, red bg, ink text, with the 18×18 return-arrow icon after the text. ≤768: `padding:1.25rem 2rem !important;font-size:1rem !important` (59 tall). Its onclick smooth-scrolls to `#early-access`. The glow box-shadow is clipped by the chamfer as well.
  - `p.cta-fine-print{margin-top:.75rem;font-size:.7rem;color:var(--text-muted)}`. The more specific `.cta-section p` rule wins on font (Chivo .85rem, paper-50, mb 3rem); measured 13.6px Chivo, paper .5.
- **Glitch heading:**
  - `.glitch-text{position:relative;display:inline-block}`.
  - `::before` and `::after` both have `content:attr(data-text);position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden`.
  - `::before`: `left:.5px;text-shadow:-.5px 0 rgba(43,79,255,.2);clip:rect(24px,9999px,90px,0);animation:glitch-subtle-1 5s infinite linear alternate-reverse;opacity:.6`.
  - `::after`: `left:-.5px;text-shadow:.5px 0 rgba(237,70,45,.2);clip:rect(85px,9999px,140px,0);animation:glitch-subtle-2 4.5s infinite linear alternate-reverse;opacity:.6`.
  - `glitch-subtle-1` clip rects (top, bottom): 0% 12/5, 20% 80/100, 40% 40/5, 60% 10/80, 80% 120/50, 100% 60/100.
  - `glitch-subtle-2`: 0% 65/100, 20% 10/80, 40% 90/10, 60% 20/5, 80% 50/120, 100% 10/60. All are `rect(Tpx,9999px,Bpx,0)`.
  - `.hero .glitch-text` pseudos get a red background and `.content .glitch-text` pseudos an ink one. The CTA is in **neither**, so here the pseudos are **transparent**. Measured: the effect is just faint offset colored copies inside moving clip bands. `clip` needs `position:absolute`, which is already set.
- All CTA SVG animations are paused when the section is not `.is-visible`.

---

## 15. Shaders (index script_2): WebGL, 3 canvases

**Port the GLSL verbatim**. The full vertex and fragment shader strings are in `reference/original-site/_astro/index.astro_astro_type_script_index_2_lang.BozKVjHC.js`. The fragment shader has simplex noise, voronoi, 6 dither types, 9 base shapes, a contour render mode, glow and mouse tint.

- Setup:
  - `canvas.getContext("webgl",{antialias:false,alpha:false})`.
  - One full-screen TRIANGLE_STRIP quad `[-1,-1, 1,-1, -1,1, 1,1]`.
  - One rAF loop drives all canvases, with `u_time = performance.now()*0.001`.
- Each frame, per canvas, only if its closest `section` is intersecting. The IO uses `{threshold:0, rootMargin:"200px 0px"}`.
  - Size: `dpr=min(devicePixelRatio,2)`; the canvas buffer is `round(parentRect.w*dpr) × round(parentRect.h*dpr)`, resized when it changes. Skip the frame if the parent is 0×0.
  - `u_pixelSize = config.pixelSize*dpr`.
  - `u_mouse = window._shaderMouse || [-1,-1]` (shared global), `u_mouseColor = #ED462D`, `u_mouseRadius = .25`.
- Configs:

| uniform | shader1 (How panel) `v` | shader2 (Early access) and shader3 (Intro) `m` |
|---|---|---|
| baseShape | 8 (row-band segments) | 8 |
| renderMode | 1 (contour) | 1 |
| ditherType | 4 (line dither: `fract(y*.5)`) | 4 |
| pixelSize | 14 | 8 |
| speed | .06 | .25 |
| scale | .4 | 1.3 |
| threshold | .62 | .11 |
| warp | .12 | .12 |
| contrast | .75 | .75 |
| angle | 261 | 238 |
| vignette | 0 | 0 |
| glow | .6 | .6 |
| octaves | 4 | 4 |
| fadeTop / fadeBottom | 0 / 0 | 0 / 0 |
| vertFade | .7 | .7 |
| lineCount | 17 | 2 |
| lineWeight | .16 | .12 |
| invert | 0 | 0 |
| mouseInfluence | 0 | 0 |
| fgColor | `#0A0A0A` | `#000000` |
| bgColor | `#121212` | `#ed462d` |

- Visual look:
  - **shader1**: a barely visible field of dark-grey horizontal pixel dashes (`#121212` on `#0A0A0A`, 14px cells) drifting slowly behind the How card, denser toward the top (vertFade .7). When the mouse is over `.how-illustration`, the bg color blends to red `#ED462D` within 0.25 UV of the cursor (smoothstep .25→.1625), so red dash segments appear around the cursor. See `shots/1440-shader1-mousehover.png`.
  - **shader2 / shader3**: bright red (`#ed462d`) horizontal dash bars, 8px pixel rows, on black. The wrapper uses `mix-blend-mode:lighten` over the ink page, so black disappears and you see red scan-dash streaks. They fade toward the bottom (vertFade), scroll slowly along 238°, and cluster at the top of the headline block. See `shots/1440-intro.png` and `shots/1440-earlyaccess.png`.
  - The headline text-shadow halo (5× ink) keeps the text readable over the dashes.
- Mouse: `mousemove` on `.how-illustration` and `#early-access` sets `_shaderMouse=[(x-left)/w, 1-(y-top)/h]`; mouseleave sets null. For shader2 the mouse color equals the bg, so there is no visible change.

---

## 16. Footer (`footer`)

(Inline `<style>`.)
- `footer{border-top:1px solid var(--border);padding:4rem 0 10rem;position:relative;overflow:hidden;z-index:10000;background:#0a0a0a}`. ≤1280 adds `padding-inline:5%`. ≤768 `padding:3rem 0 6rem`. Height 429.2 @1440 and 617.9 @≤768.
- `footer>.container`: the standard container, 1104 content box @1440 at x=168.
- `.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2rem;position:relative;z-index:2}`: 520/260/260 @1440.
  - ≤1024: `1fr 1fr`, with `.footer-brand{grid-column:1/-1}`.
  - ≤768: `1fr`, `.footer-brand{grid-column:auto}`.
  - Measured: at 768 and 390 it is a single 691.2 / 351px column; 2 columns only apply at 769–1024.
- `.footer-brand`: `a > img.footer-logo{height:18px;filter:invert(1) brightness(2)}` (47.2×18) and `p{color:var(--text-muted);font-size:.85rem;max-width:280px;line-height:1.6;margin-top:1rem}`.
- `.footer-col`:
  - `h3.mono-label{color:var(--text-muted);margin-bottom:1.25rem}`. It computes to weight 700 (h3 UA bold) with Chivo.
  - `ul{list-style:none}`, `li{margin-bottom:.6rem}`.
  - `a{color:var(--paper-50);text-decoration:none;font-size:.85rem;transition:color .2s}`, hover red.
- `.footer-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:4rem;padding-top:2rem;border-top:1px solid var(--border);position:relative;z-index:2}`. ≤768: `flex-direction:column;gap:1rem;align-items:flex-start`.
  - Left: `span.mono-label` (tertiary, `letter-spacing:.1em`, overriding .15em).
  - Right: `.status.footer-status{color:var(--paper-50);gap:.6rem}` containing `span.footer-status-dot{width:6px;height:6px;background:var(--red);animation:blink 1.5s step-end infinite;flex-shrink:0}` (square, not round) and the text.
  - `@keyframes blink{0%,to{opacity:1}50%{opacity:0}}`.
- `svg.footer-watermark{color:var(--paper-06);position:absolute;bottom:-80px;right:-60px;width:600px;opacity:.03;pointer-events:none}`, stroke-only logo, hidden ≤768. It is practically invisible (.06 × .03).

---

## 17. Keyframes index

| name | used by | duration / easing / iteration |
|---|---|---|
| `ticker` | `.hero-ticker-inner` | 18s linear infinite, translate 0 → -50% |
| `watermark-glitch` | `.hero-watermark` | 4s linear infinite |
| `btn-glitch` | all `.btn-*:hover` | .3s ease-in-out, once |
| `glitch-subtle-1` / `-2` | `.glitch-text::before` / `::after` | 5s / 4.5s linear infinite alternate-reverse |
| `glitch-shift` | (declared, unused) | 0/90/100% translate 0; 92% (-2px,1px); 94% (2px,-1px); 96% (-1px,-1px); 98% (1px) |
| `pupil-glitch` | `#eye-pupil` | 4s linear infinite |
| `disconnect-drift-left` / `-right` | globe meridian groups | 6s ease-in-out infinite |
| `signal-flicker` | wifi-off icon (inline style) | 4s ease-in-out infinite |
| `howProgressFill` | active `.how-step-progress-fill` | 6s linear forwards (JS play/pause) |
| `terminalLineIn` | `.term-line` | .01s step-end forwards, staggered delays .4–4.8s |
| `blink` | cursor (1s step-end), terminal blink-dot (2s ease-in-out), monitor LED (3s ease-in-out), footer dot (1.5s step-end) | infinite |
| `pulse-ring` | `.status-dot::after` | 2s ease-in-out infinite (0/100%: opacity .4, scale 1; 50%: opacity 0, scale 2) |
| `hdr-glow-pulse` | `.cta-logo-glow` | 3s ease-in-out infinite |
| `wl-spin` | form spinner | 1s linear infinite |
| SMIL `animate seed` | `#grainy` turbulence | 10s indefinite |
| SMIL `animateMotion` + `animate` | intro diagram | 2s (begin 0/1s) and 1.5s (begin 0/.75s) |

Transitions:
- how step color .3s ease; step body rows .4s ease plus opacity .3s;
- FAQ rows .3s ease; chevron .3s;
- nav link opacity .2s; footer link color .2s;
- capabilities card all .3s; svg-card fill .15s; offline card .1s;
- eye blink .25s / .2s (curves in §3); mobile menu opacity/visibility .3s; toggle bars .3s.

---

## 18. Builder gotchas (summary)

1. Tailwind preflight versus the original's UA defaults:
   - Headings must be `font-bold` (faux-bold Chalet, §0.2).
   - Preflight's `svg{display:block}` changes baseline alignment of the inline icons. The badge icons were inline in a flex row; add `display:inline` or keep them as flex items.
   - `img{display:block}` is fine.
   - Summary needs `list-style:none`.
2. The frame is 1200px (x=120 @1440). Content is 1104px (x=168) because of the 3rem container padding. Hero-content and nav are 1296 max, so the hero text also starts at x=120, flush with the frame line. At ≤1280 everything is 90% wide with 0 padding.
3. The hero, CTA and footer use z-index 10000 to cover the fixed content-lines (9999). The overlays sit at 10001–10003, above everything including the open mobile menu (the menu is inside the hero's stacking context).
4. Chamfer clip-path clips the box-shadows (hover shadow, CTA glow) and the cut corners of borders. This matches the original; don't "fix" it.
5. The ticker's -50% refers to the flex box width (= viewport), not the content width, so the loop jumps. Replicate as is.
6. Terminal line reveals are tied to page load, not scroll. Typing starts on intersect.
7. No scroll-reveal library behaviour exists. Don't add fade-ins.
8. The eye pupil's static cx/cy in the HTML are a mouse-offset snapshot. Reset them to 240/240.
9. The hidden `display:none` SVG inside `.offline-visual` (char 43174–48650) is dead markup. Skip it.
10. The vortex `<img>` is lazy. Give it `width:100%` and let the aspect ratio set its height (938.3 @1440), anchored at `bottom:0`.
11. Turnstile, PostHog and the waitlist API are third-party or backend and can't be recreated. The form UI can be built without them.

---

# Part 2 — Secondary pages

Routes: `/blog`, `/blog/<slug>` (4 posts, one template), `/waitlist`, `/privacy`, `/terms`. Measured live with Chromium (Playwright 1.63) at 1440 / 1280 / 768 / 390 wide, viewport height 900, DPR 1, on 2026-09-21. Declared CSS comes from `reference/original-site/_astro/_slug_.syMwFS_H.css` (this is the **same global sheet** as the homepage: tokens, fonts, base, overlays, `.btn-*`, `.badge`, `.card`, `.container`, `.mono-label`, and the `.prose` rules at the end), `index.DGyztNce.css` (WaitlistForm component), `index.b3kNMUYY.css` (waitlist page), and each page's inline `<style>` (header, footer, and page-scoped rules).
Screenshots: `/private/tmp/claude-504/-Users-riyaghosh-V2-cloned-rig/d3f5f990-cd80-465d-9021-7e279894597f/scratchpad/shots/pages/`, with `<page>-full-1440.png` / `<page>-full-390.png` for page ∈ {blog, manifesto, inference, compressing, teaching, waitlist, privacy, terms}, plus `waitlist-dashboard-{1440,1280,768,390}.png`, `post-cta-success-{1440,390}.png` (forced form-success state) and `blog-390-nav-open.png`.
**Screenshot artifact:** in full-page shots, the fixed `.noise`/`.scanlines` overlays only cover the first 900px, so the top looks lighter and grainier. On screen they cover every viewport. Don't reproduce the band.
Inline SVGs: see `CLONE_ASSETS_PAGES.json`. Most are the same as the homepage assets in `CLONE_ASSETS.json`.
Copy is placeholder in the clone. Only structure, counts and lengths are recorded here.

## P0. Shared shell for all secondary pages

### P0.1 Page skeleton
```
body
  svg#grainy (hidden filter, same as home) · .scanlines · .noise · .rgb-fringe   (Part 1 §0.6, identical)
  header.site-header[data-variant="default"]
  <page content>          (blog: section.blog-section · post: article.blog-post + aside.cta · waitlist: section.waitlist-page · legal: main.payload-page)
  footer                  (Part 1 §16, byte-identical CSS and markup)
```
- **No `.content-lines`** (the fixed frame verticals of Part 1 §0.7), no `<main class=content>` wrapper, no section dividers, no shaders, no `.is-visible` observer, except that `/waitlist` loads the §0.9 observer script. It only toggles classes and has no visual effect there.
- Body is `--ink` with paper text, as on the homepage. No page has a hero band.

### P0.2 Header, default variant (`data-variant="default"`)
Same markup and CSS as Part 1 §2 "Header / nav". Differences from the hero variant:
- The header is **not inside a hero**. It is a plain block in normal flow at the top of the body: `position:static`, no background (ink shows through), no border, no z-index, **not sticky**, no blur, and it scrolls away.
- Logo `img{height:22px;filter:invert(1) brightness(2)}` makes it white. Measured 60×22 at x=120, y=30.2 @1440; x=20, y=19 @≤768.
- Links: `color:var(--paper)`, Chivo 700 .75rem, `letter-spacing:.05em` (0.6px), opacity .7 → 1 on hover (.2s).
- CTA is `a#nav-join-btn.btn-chamfer.site-nav-cta.btn-cta`:
  - Red bg, ink text. Rule: `.site-nav-cta{color:var(--ink);height:22px;padding:1.2rem;opacity:1}`.
  - Renders 163.2×38.4 at x=1156.8, y=24 @1440.
  - Hover is `.btn-cta:hover`: `box-shadow:4px 4px 0 var(--blue)`, the RGB text-shadow and `btn-glitch .3s` (Part 1 §1.1).
- **`/waitlist` has no CTA `<li>`, only "Blog".** Because of that the nav is **74px** tall there (24px padding + 26px logo line), not 86.4. Its single link sits at x=1288.8 @1440. Every other secondary page has the CTA and an 86.4px nav.
- Nav box: 1296 max width at x=72 @1440. At 1280 it is full width with the logo at x=48. ≤768: `padding:1rem 1.25rem`, 64px tall, toggle 40×32 at x=330 (@390).
- Mobile menu (≤768) is the same as Part 1:
  - Fixed full-screen ink panel, opacity/visibility .3s, links 20px paper.
  - CTA 246.4×38.4 centred at y=462.8 (@390×900), red bg, ink text. The 20px font-size also applies to the CTA; its height stays 38.4 because of the `height:22px` + padding.
  - Toggle becomes `position:fixed`, and its bars are paper in both variants.

### P0.3 Footer
Identical to Part 1 §16: same inline CSS, same markup, `border-top:1px solid var(--border)`, `#0a0a0a`, 429.2 tall @≥1025 and 617.9 @≤768, with the footer watermark. Reuse the homepage component unchanged. On blog posts, note there is also an **article `<footer>`** (back link, P2.6). Don't let global `footer{}` selectors hit it: the original's rules are cid-scoped. The article footer only gets `padding-left:0` and its own border.

### P0.4 New tokens/colors used only on these pages
| value | where |
|---|---|
| `var(--paper-60)` rgba(240,237,230,.6) | `.prose` body text, excerpt |
| `var(--paper-15)` | blog index row rules |
| `#f0ede680` (paper .5) | waitlist description, feature items, referral/hw descriptions, `#joined-date`, loading text |
| `#f0ede699` (paper .6) | `.features-heading` |
| `#f0ede666` (paper .4) | stat/hw/referral labels |
| `#f0ede64d` (paper .3) | `.joined-date`, dev-reset text |
| `#f0ede640` | `.hw-input::placeholder` |
| `#ed462d1a` | `.status-badge` bg |
| `#000` + `#0077b5` | Share on X / LinkedIn buttons |
| `#fff` | share buttons, `.hw-submit` text |

---

## P1. Blog index `/blog`

### Layout
- `section.blog-section{padding:5rem 1.5rem}`, ≤640px `padding:3rem 1rem`.
- `.blog-section .container{max-width:700px;margin:0 auto}`. This element **also has the global `.container` class**, so it inherits `.container` padding: `0 3rem` >1280, **0** at ≤1280 (from the 1280 media rule), `0 2rem` ≤1024, `0 1.25rem` ≤768. The `max-width:90%` from the 1280 rule loses to the more specific 700px rule. Resulting content box:

| vw | container x / width | content box x / width |
|---|---|---|
| 1440 | 370 / 700 | 418 / 604 |
| 1280 | 290 / 700 | 290 / **700** (padding 0) |
| 768 | 34 / 700 | 54 / 660 |
| 390 | 16 / 358 | 36 / 318 |

- Page height: 1296 @1440, 1258 @1280, 1417 @768, 1561 @390. The section is 780.9 tall @1440 and starts at y=86.4.

### Title block
- `h1` only: no kicker, no description, no hero image.
- `font:700 clamp(2rem,5vw,3rem) Chalet,sans-serif` (faux-bold) → 48 / 48 / 38.4 / 32px. `letter-spacing:-.02em`, `line-height:normal`, which is about .94 for Chalet (45px box @48). Color paper, `margin:0 0 3rem`.

### Post list
- `ul.blog-list{list-style:none}` with 4 items, sorted **newest first** by `datePublished`. No featured post, no tags, no read time, no images, no pagination.
- Each `li` has `border-top:1px solid var(--paper-15)`, and the last also gets `border-bottom` in the same color. Rows are separated by these hairlines. There are no cards.
- `a.blog-row` (the whole row is the link):
  - `display:flex;gap:2.5rem;align-items:baseline;padding:1.5rem 0;color:paper;text-decoration:none;transition:opacity .15s`.
  - Hover: `opacity:.7`. That is the only hover effect: no color change, no underline, no motion.
- `time`: `flex-shrink:0;width:120px`, Chivo .75rem (12px), uppercase, `letter-spacing:.08em` (.96px), `--paper-40`. The format is the short date "Mmm D, YYYY".
- `.blog-row-text{flex:1;min-width:0}`:
  - `h2`: Chalet 1.25rem (20px), weight 700 (UA h2 bold, faux), `letter-spacing:-.01em`, line-height normal (19px per line), `margin:0 0 .35rem` (5.6px), paper.
  - `p` (excerpt): .9rem (14.4px) / 1.5 (21.6px), `--paper-40`, margin 0.
- Row heights @1440: 134.8 / 134.8 / 115.8 / 137.4. Titles take 1–2 lines and excerpts 2–3 lines. Text column is 444px @1440 (x=578), 500 @768, 318 @390.
- ≤640px: `.blog-row{flex-direction:column;gap:.25rem}` and `time{width:auto}`. The date stacks above the title with a 4px gap.
- Placeholder content: 4 posts with titles of 4–9 words and excerpts of 1–2 sentences (18–35 words).

---

## P2. Blog post template `/blog/<slug>`

All four posts use the identical template: same components, same CSS, the same `.blog-post` / `.cta` inline styles, and the same WaitlistForm. Verified for manifesto, building-inference-engine, compressing-a-model-to-run-locally and teaching-a-model-to-code.

### P2.1 Skeleton
```
article.blog-post
  header.blog-post-header
    h1
    div.blog-post-meta > address.blog-post-author("By " + name) + time (long date)
  div.blog-post-content.prose
    p.excerpt
    div > div.payload-richtext  (the rich text blocks)
  footer > a[href=/blog] (svg.icon + "All Posts")
aside.cta
  h3.cta-title · p · p · div.waitlist-form-wrapper (WaitlistForm, P3.3)
```
There is no tag/category, no reading time, no author avatar, no TOC, no progress bar, no prev/next and no related posts.

### P2.2 Article box
- `.blog-post{max-width:720px;margin:0 auto;padding:4rem 1.5rem;color:paper;font-family:Instrument Sans}`.
- Content column is **672px** at x=384 @1440 (x=304 @1280, 48 @768, 24 @390 where it is 342 wide).
- There is no responsive override: the padding stays 64/24 at every width.

### P2.3 Title block
- `.blog-post-header{margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid var(--border-dim)}`.
- `h1`: Chalet 700 (faux), `clamp(2rem,5vw,3rem)` → 48 / 48 / 38.4 / 32px, `line-height:1.15` (55.2px @48), `letter-spacing:-.02em`, `margin:0 0 .75rem`, paper. It takes 1–2 lines @1440 and 2–4 lines @390.
- `.blog-post-meta{display:flex;align-items:center;gap:.5rem}`: Chivo .8rem (12.8px), uppercase, `letter-spacing:.1em` (1.28px), `--text-muted` (paper .4), 15px line box.
  - `address{font-style:normal}` holds "By" + name.
  - `time::before{content:"·";margin-right:.5rem}`.
  - Date format is long: "Month D, YYYY".
- Measured @1440 for a 2-line title: h1 at y=150.4, h=110.4; meta at y=272.8; the header rule sits at y≈320.

### P2.4 Prose typography (`.prose`, from the global sheet)
| element | rule (declared) | computed |
|---|---|---|
| `.prose` base | `font-size:1.0625rem;line-height:1.75;color:var(--paper-60)` | 17px / 29.75px, rgba(240,237,230,.6), Instrument Sans 400 |
| `.excerpt` (lead) | `font-size:1.2rem;line-height:1.6;color:var(--paper-60);margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:1px solid var(--border-dim)` | 19.2 / 30.72px. 2–3 lines @1440 (94.4 / 125.2 box incl. padding) |
| `p` | `margin:0 0 1.5rem` | 24px bottom |
| `h2` | `font-family:Chalet,sans-serif;font-size:1.75rem;line-height:1.25;letter-spacing:-.01em;margin:3rem 0 1rem;color:paper` | 28 / 35px, weight 700 (UA, faux), -0.28px |
| `h3` | `Chalet;font-size:1.35rem;line-height:1.3;margin:2.5rem 0 .75rem;color:paper` | 21.6 / 28.08px, 700 |
| `h4` | `font-size:1.1rem;font-weight:600;margin:2rem 0 .5rem;color:paper` | (declared; unused in current posts) |
| `a` | `color:var(--red);text-decoration:underline;text-underline-offset:2px;transition:color .15s`; hover `color:paper` | |
| `strong` | `color:paper;font-weight:600` | |
| `em` | UA italic, inherits paper-60 | |
| `ul, ol` | `margin:0 0 1.5rem;padding-left:1.5rem` | disc / decimal |
| `li` | `margin-bottom:.5rem`; `li::marker{color:var(--text-muted)}` | marker rgba(240,237,230,.4) |
| `blockquote` | `margin:2rem 0;padding:.75rem 1.25rem;border-left:3px solid var(--red);color:var(--paper-50);font-style:italic`; `blockquote p:last-child{margin-bottom:0}` | the posts' blockquotes hold inline text directly (no `<p>`) |
| `code` | `font-family:Chivo Mono;font-size:.875em;background:var(--paper-06);padding:.15em .4em;border-radius:4px` | **declared but no post uses it** |
| `pre` | `margin:2rem 0;padding:1.25rem 1.5rem;background:var(--paper-04);border:1px solid var(--border-dim);border-radius:6px;overflow-x:auto;line-height:1.5`; `pre code{background:none;padding:0;font-size:.85rem}` | **declared but unused.** Build it anyway if placeholder posts include code |
| `img` | `max-width:100%;height:auto;border-radius:6px;margin:2rem 0` | see image note below |
| `hr` | `border:none;border-top:1px solid var(--border-dim);margin:3rem 0` | 1px line, 48px above and below |

No tables, figures/captions, callouts, `h4` or code blocks appear in any post.

**Image block (`building-inference-engine`, the only image):**
- Markup is `<picture>` with three `<source type=image/png>` entries:
  - `(max-width:400px)` → `/api/media/file/rigd-flow-400x300.png`
  - `(max-width:768px)` → `rigd-flow-768x1024.png`
  - `(max-width:1920px)` → `rigd-flow-1920x1080.png`
- The fallback is `<img src=/api/media/file/rigd-flow.png width=1568 height=2600 alt="rid inference flow">`.
- All of these return **502** on the origin, so the live page only shows a 150×29.8 broken-image alt box.
- The `<picture>` is a bare inline child of the rich-text div, sitting between a `p` (10 words, "The full inference stack…") and a `p` (34 words), right after the 7th `h2`.
- Placeholder: use a block-level box, full column width, 6px radius, `margin:2rem 0`, with an aspect ratio per breakpoint that matches the source actually selected:
  - >768: 16:9, i.e. **672×378** @1440/1280.
  - 401–768: 3:4, i.e. **672×896** @768.
  - ≤400: 4:3, i.e. **342×256.5** @390.
- If you want one ratio, use the fallback's 1568:2600 (672×1114).
- Make the `picture`/`img` `display:block`, so that inline baseline gaps don't add space.

### P2.5 Block inventory per post (rich-text children, in order; `p(b)` = paragraph that is entirely `<strong>` and acts as a pull line)
- **manifesto** (1700px of rich text @1440). 21 blocks, all `p`:
  - Sequence: `p p p p p(b) p p p p(b) p p p p p p p p(b) p p p p(b)`.
  - 17 normal paragraphs of 3–37 words (median 25) and 4 bold one-liners of 3–7 words.
  - No headings, lists or links. The excerpt runs 3 lines.
- **building-inference-engine** (6765px). 51 blocks: 10 `h2` (2–7 words), 31 `p` (1–67 words, median 35), 6 `ul` (2, 2, 5, 4, 4, 5 items), 2 `ol` (5, 3 items), 1 picture and 1 `hr` near the end.
  - List items typically begin with a `strong` lead-in (28 `strong` in total) followed by 10–25 words.
  - The first paragraph has 2 inline red links. After the `hr` comes an italic series note with 2 links.
  - Pattern: `p p | h2 p p ul p | h2 p ul p p | h2 p×5 | h2 p p ul p | h2 p ol p p | h2 p p p ul | h2 p picture p | h2 p ul | h2 p ul | h2 p ol p p | hr p p`.
- **compressing-a-model-to-run-locally** (8018px). 65 blocks. It opens with a **blockquote** (38 words, italic, with 1 link), then 7 `h2`, 2 `h3` (inside the 5th h2 section), 54 `p` (3–126 words, median 36), `hr`, then a closing italic series note with 2 links.
- **teaching-a-model-to-code** (7147px). 65 blocks: opening blockquote (32 words), 8 `h2`, 55 `p` (2–93 words, median 28; includes a run of 6 very short 2–16-word lines), `hr`, closing italic note.
- Vertical rhythm (measured): p→p gap 24px; p→h2 gap 48px (the p's 24 bottom margin collapses into the h2's 48 top margin); h2→p 16px; p→h3 40px; h3→p 12px; list→next 24px; li→li 8px.

### P2.6 Back link (article footer)
- `.blog-post>footer{margin-top:3rem;padding-top:1.5rem;padding-left:0;border-top:1px solid var(--border-dim)}`, 47px tall.
- `a`: Chivo .8rem, uppercase, `.1em`, `--text-muted`, no underline, `transition:color .15s`. Hover sets `color:paper` and `svg{fill:paper}`.
- `svg.icon`: 24×24 pixel-art "return" arrow (`CLONE_ASSETS_PAGES.json` → `back-arrow`), `fill:var(--text-muted);margin-bottom:-6px;transform:scale(.75)` (renders 18×18). The icon comes before the text.

### P2.7 End-of-post CTA (`aside.cta`)
- `max-width:720px;margin:0 auto 6rem;padding:0 1.5rem`. It sits directly below the article and aligns with the 672 column.
- `.cta-title` (an `h3`):
  - **Instrument Sans, not Chalet.** Only `font-size:2rem` is set, with UA bold 700: 32px, normal line-height (39px box), paper, `margin-bottom:1.5rem`.
- `p`: two short lines, `color:var(--text-muted);margin:.5rem 0`, 16px.
- `.waitlist-form-wrapper{margin:2rem 0 0}`. This overrides the component's `margin:0 auto`, so the 480px form is **left-aligned**. Form details are in P3.3.
- **Specificity gotcha:** the nested `.cta p{…}` beats the component's `p` rules. Inside the CTA, the form-success `.success-position` and `.referral-label` render paper-40 with `margin:8px 0`. See `post-cta-success-*.png`.
- Height is 187.2 @1440 (≥ all posts) and 260–345 @390, where the form stacks and the text wraps. It grows by 69px while the Cloudflare Turnstile widget is visible (see gotchas).

### P2.8 Page heights @1440 / 390
manifesto 3105 / 4288 · inference 8224 / 12785 · compressing 9392 / 14956 · teaching 8467 / 13344.

---

## P3. Waitlist `/waitlist`

### P3.1 Page frame
- `section.waitlist-page{min-height:calc(100vh - 200px);padding:6rem 0;display:flex;align-items:center}`. The 700px min-height on a 900px viewport means the content is vertically centred when short.
- `.wl-container{width:100%;max-width:640px;margin:0 auto;padding:0 1.5rem}`, giving a 592px column at x=424 @1440, x=88 @768, and 342 at x=24 @390.
- The page holds two sibling views, `#waitlist-form-view` and `#waitlist-dashboard-view`, toggled with `hidden`.
- Page heights: 1314 (@1440/1280), 1531 (@768), 1439 (@390) for the form view; 1898 / 1898 / 2069 / 2347 for the dashboard.

### P3.2 Form view (`.waitlist-content{text-align:center}`)
Top to bottom, @1440:
1. **Badge**: the global `.badge` (Part 1 §1.2) with inline `justify-content:center;margin-bottom:1.5rem`.
   - Contains a 16px envelope icon (same as homepage `badge-icon-early-access`) and one word.
   - 128.7×34 centred at y=170. Red Chivo 12px, `.12em`, uppercase, `#0a0a0ae0` bg, red/.2 border, blur(8px) backdrop.
2. **`h1.page-heading`**: Chalet 700 (faux), `clamp(2.5rem,5vw,3.5rem)` → 56 / 56 / 40px, and **32px at ≤480** (`font-size:2rem`). `line-height:.92`, `letter-spacing:-.03em`, `margin-bottom:1rem`, paper. One line.
3. **`p.page-description`**: 1.1rem (17.6px) / 1.6, `#f0ede680`, `max-width:480px;margin:0 auto 2.5rem`. 3 lines (84.4px box).
4. **`.waitlist-container{margin:0 auto 3rem}`** wraps the WaitlistForm. The wrapper has an extra `form-centered` class, which carries no styles. It is 480px wide and centred (x=480 @1440).
5. **`.features-preview`**:
   - `text-align:left;background:#f0ede60a;border:1px solid rgba(240,237,230,.1);padding:1.5rem`. Full 592 width, 192 tall.
   - `h2.features-heading`: Chivo .75rem 700, `.1em`, uppercase, `#f0ede699`, `margin-bottom:1.25rem`.
   - `ul.features-list{list-style:none;display:flex;flex-direction:column;gap:.75rem}`, 4 items.
   - `.feature-item{display:flex;align-items:center;gap:.75rem;color:#f0ede680;font-size:.9rem}`, 18px rows.
   - `svg.feature-icon{width:18px;height:18px;color:var(--red)}` is a stroke check (`polyline 20 6 9 17 4 12`).

### P3.3 WaitlistForm component (shared by `/waitlist` and the post CTA; `index.DGyztNce.css`)
- `.waitlist-form-wrapper{width:100%;max-width:480px;margin:0 auto}`.
- `.form-row{display:flex;gap:.75rem}`. ≤768: `flex-direction:column`, and the button gets `width:100%;justify-content:center`.
- `input.email-input` (type=email, placeholder like "you@company.com"):
  - `flex:1;padding:.85rem 1.2rem;font:.8rem "Chivo Mono";letter-spacing:.02em;background:var(--paper-04);border:1px solid var(--paper-15);color:paper;outline:none;transition:border-color .2s`.
  - `:focus` sets `border-color:var(--paper-35)`. `::placeholder` is `var(--paper-30)`.
  - Measured 313.9×44.2 @1440.
- `button.submit-button.btn-chamfer`:
  - `padding:.85rem 1.5rem;background:var(--red);color:var(--ink);font:700 .75rem "Chivo Mono";letter-spacing:.08em;uppercase;white-space:nowrap;transition:background .2s` plus the chamfer clip-path.
  - Hover (not disabled): `background:#d93d26`. It has **no** btn-glitch or box-shadow, because it isn't `.btn-cta`.
  - `:disabled{opacity:.7;cursor:not-allowed}`.
  - Size: 154.1×44.2 in the row (stretched to the input height), 41.2 tall when stacked at ≤768.
  - Loading: `[data-loading=true]` hides `.button-text` and shows `.button-loading` (an 18px `svg.spinner`, `wl-spin 1s linear infinite`).
- Honeypot `input.hp-field` is positioned off-screen.
- `p.form-error`: `color:#ff6b6b;font-size:.75rem;margin-top:.5rem;min-height:1rem`, and `:empty{display:none}`.
- `.turnstile-container{margin-top:1rem;text-align:left}`. It is empty in the clone: render a 0-height div with the 16px top margin.
- **Success state** (`.waitlist-success`, replaces the form, `text-align:center`):
  - `.success-icon{margin-bottom:1rem}` holding a 40×40 red stroke circle-check.
  - `h4.success-heading`: Chalet 1.8rem (28.8px) 700, paper, `mb .5rem`.
  - `p.success-position`: paper-60, 1rem, `mb 1.5rem` (but paper-40 with `margin:8px 0` inside the post CTA). `span.position-number` is red 700 and reads "#N".
  - `.referral-section`: `background:paper-04;border:1px solid var(--border-dim);padding:1.25rem;margin-bottom:1rem`. Inside:
    - `p.referral-label`: Chivo .65rem 700, `.1em`, uppercase, paper-50, `mb .75rem`.
    - `.referral-link-row{display:flex;gap:.5rem}` containing `input.referral-link` (readonly; `flex:1;padding:.65rem .85rem`, Chivo .75rem, paper-04 bg, border-dim border; 40 tall) and `button.copy-button` (40×40, same bg/border, paper-50 icon color, hover red icon and border, `transition:color .2s,border-color .2s`).
    - The copy button holds an 18px copy icon. After a click the check icon (red) shows for 2s.
  - `a.dashboard-link`: red Chivo .75rem, `.03em`, UA underline, pointing at `/waitlist`.

### P3.4 Dashboard view (`#waitlist-dashboard-view`, not text-centered)
**How the original decides:** `index.astro` script 0.
- If there is a `?cid=CODE` query param, or PostHog has a persisted `referral_code` super-property (PostHog localStorage `ph_<key>_posthog`), it hides the form view, shows the dashboard (loading), then fetches `GET https://cms.rig.ai/api/waitlist/entry/CODE`. Success renders the dashboard; failure falls back to the form view.
- A `waitlist:signup` CustomEvent (fired by the form on success, detail `{referralCode, position, referralCount}`) switches straight to the dashboard with `createdAt = now`.
- `?reset` unregisters the code and shows the form.
- For the clone, persist `{referralCode, position, referralCount, createdAt}` in localStorage under a key of your choice and branch on that.
- I forced the state by dispatching `waitlist:signup` (position 1234, referrals 3). Screens: `waitlist-dashboard-*.png`.

States:
- **Loading** `.loading-state{padding:4rem 0}`: `.spinner` is 40×40 with `border:3px solid rgba(240,237,230,.1);border-top-color:var(--red);border-radius:50%;margin:0 auto 1.5rem;animation:spin 1s linear infinite`. The `p` is Chivo .8rem `#f0ede680`. Neither is centred by text-align, but the spinner is centred by its auto margins.
- **Error** `.error-state{padding:4rem 0}`: 64×64 red stroke "alert circle" icon (`margin:0 auto 1.5rem`), `h1.error-heading` Chalet 1.5rem paper `mb .5rem`, `p.error-message` `#f0ede680`.
- **Success** (`.success-state`), top to bottom @1440 (592 column, x=424):
  1. `.dashboard-header{text-align:center}` containing:
     - `.status-badge`: inline-flex, `gap:.5rem;padding:.5rem 1rem;background:#ed462d1a;color:red`, Chivo .75rem 700, `.08em`, uppercase, `mb 1.5rem`. 170.4×30, **square corners, no border**.
     - `.badge-dot`: 8px red circle, `pulse-dot 2s ease-in-out infinite` (opacity 1 → .4 → 1).
     - `h1.dashboard-heading`: Chalet 700, `clamp(2rem,4vw,2.5rem)` → 40 @1440/1280, 32 @768/390. `letter-spacing:-.03em`, line-height normal (38px box), `mb 2rem`.
  2. `.stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-bottom:2rem}`, two 288×112 cards. ≤480: 1 column, cards 342×104.
     - `.stat-card`: `background:#f0ede60a;border:1px solid rgba(240,237,230,.1);padding:1.5rem;display:flex;flex-direction:column;align-items:center;gap:.5rem`.
     - `.stat-label`: Chivo .7rem (11.2) 700, `.1em`, uppercase, `#f0ede666`.
     - `.stat-value`: Chalet 2.5rem (40px; 2rem ≤480) 700, **red**, `line-height:1`. Values are "#N" and N.
  3. `.card` (global `.card`, Part 1 §0.1 colors):
     - `margin:1rem 0;background:#f0ede60a;border:1px solid rgba(240,237,230,.1);padding:1.5rem;display:flex;flex-direction:column;gap:.5rem`. 592×173.
     - `h2.referral-heading.card-title`: Chalet 1.25rem (20px) 700, paper, `mb .5rem`.
     - `.card-body`: `color:var(--paper-dim)` (paper .75), 16px; `p{line-height:150%}`, `p+p{margin-top:1rem}`. Two paragraphs, 1 line and 2 lines.
  4. `.hw-survey` (hidden until the entry fetch settles; then shown even if the fetch failed):
     - Same box as the card but `text-align:left;margin-bottom:1.5rem`. 592×361.
     - `h2.hw-heading`: Chalet 1.25rem 700 `mb .5rem`.
     - `p.hw-description`: .9rem / 1.6, `#f0ede680`, `mb 1.25rem`, 2 lines.
     - `form.hw-form{display:flex;flex-direction:column;gap:1rem}` containing two `.hw-field{display:flex;flex-direction:column;gap:.4rem}`:
       - `label.hw-label`: Chivo .7rem 700, `.1em`, uppercase, `#f0ede666`.
       - `select.hw-input`: `appearance:none;border:1px solid rgba(240,237,230,.1);background:#f0ede60a url(<12px chevron-down, stroke #f0ede6>) no-repeat right .85rem center/12px 12px;color:paper;font:.9rem "Chivo Mono";padding:1rem;outline:none`, 542×52.
       - Select 1 "Chip" has a placeholder option plus 21 options: M1–M5 variants, Intel Mac, Windows, Linux. Select 2 "RAM" has a placeholder plus 9 options (8–128GB).
     - `.hw-actions{display:flex;align-items:center;gap:1rem;margin-top:.5rem}` containing:
       - `button.hw-submit`: `padding:.6rem 1.25rem;background:red;border:none;color:#fff`, Chivo .75rem 700, `.05em`, uppercase, `transition:opacity .2s`, hover opacity .9. Measured 71.2×33.2 and rectangular (no chamfer).
       - `[disabled]{opacity:.5;cursor:default}`. It is disabled until either select differs from its saved value.
       - Loading swaps the text to "Saving…" (`.hw-submit-loading`, Chivo .75rem `#f0ede680`).
       - `span.hw-success`: Chivo .75rem red, one word, shown after a successful save.
  5. `.referral-section` (page version):
     - Box like the card, `text-align:left;margin-bottom:1.5rem`, 592×267.
     - `h2.referral-heading` (Chalet 1.25rem), `p.referral-description` (.9rem / 1.6 `#f0ede680`, `mb 1.25rem`).
     - `.referral-link-container{mb 1.25rem}` containing `label.referral-link-label` (Chivo .7rem 700, `.1em`, uppercase, `#f0ede666`, `mb .5rem`) and `.referral-link-row{display:flex;gap:.5rem}`, which holds `input.referral-link-input` (`flex:1;padding:.65rem .85rem`, `border:1px solid rgba(240,237,230,.1)`, `#f0ede60a`, Chivo .8rem; 494×40) and `#copy-button` (40×40, same as P3.3).
     - The link value is `https://rig.ai/?rc=CODE`.
     - `.share-buttons{display:flex;gap:.5rem}` (≤480: column) holds two `a.share-button`:
       - Shared: `flex:1;inline-flex;center;gap:.5rem;padding:.75rem 1rem`, Chivo .7rem 700, `.05em`, uppercase, `#fff`, `transition:opacity .2s`, hover .9. Each is 268×42 / 266×42 with a 16px icon.
       - **They keep the UA underline** (no `text-decoration:none`).
       - `.share-twitter{background:#000;border:1px solid rgba(240,237,230,.1)}` with the X logo.
       - `.share-linkedin{background:#0077b5}` with no border and the LinkedIn logo.
       - Targets: `https://twitter.com/intent/tweet?text=…&url=…` and `https://www.linkedin.com/feed/?shareActive=true&text=…`, both `target=_blank`.
  6. `p.joined-date`: Chivo .75rem `#f0ede64d`, **left-aligned**. It contains `span#joined-date` (`#f0ede680`) with the en-US long date ("Month D, YYYY").
  7. `button.dev-reset-button`: `margin-top:1.5rem;padding:.5rem 1rem;background:transparent;border:1px dashed rgba(240,237,230,.2);color:#f0ede64d`, Chivo .7rem, hover red text and border. 168.4×32.
     - It is `hidden` unless `.waitlist-page[data-dev="true"]`, so it is **never shown in production**. Clicking it resets to the form view.
     - Only render it behind a dev flag.
- @768 the dashboard looks the same as 1440, apart from the 32px heading. @390 the stats stack, share buttons stack (292×42 each, 8px gap) and the card body wraps to 245px.

---

## P4. Privacy `/privacy` and Terms `/terms` (one template: `main.payload-page`)

### Layout
- `.payload-page{width:min(100% - 3rem,960px);margin:0 auto;padding:4rem 0 6rem;color:paper}`. ≤720px: `width:min(100% - 2rem,960px);padding:3rem 0 4rem`.
  - Measured: 960 at x=240 @1440, x=160 @1280; 720 at x=24 @768; 358 at x=16 @390.
- `header.page-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,.7fr);gap:3rem;align-items:center;margin-bottom:3rem}` (≤720: 1 column, gap 2rem).
  - It only contains `.page-hero-copy > h1`. The **second grid column is empty**, but it still constrains the h1 to 536.5px @1440 and 395.3 @768.
  - Keep the grid, or set an equivalent max-width, so long titles wrap the same way.
  - The template also has unused `.page-hero-copy>p`, `.page-hero-image`, feature/testimonial/cta blocks. Skip them.
- `h1`: Chalet 700 (faux), `clamp(2.25rem,7vw,4.5rem)` → 72 / 72 / 53.76 / 36px, `line-height:1.05`, `letter-spacing:-.03em`, `margin:0`. One line.
- `.page-layout{display:grid;gap:4rem}` → `section.content-block.prose{max-width:720px}`, which is left-aligned inside the 960 box (x=240–960 @1440). It uses **the same `.prose` rules as P2.4**: 17px / 29.75, paper-60, p mb 24, lists padding-left 24, li mb 8, marker paper-40, red underlined links, strong paper 600.
- There is **no TOC, no sticky nav, no anchors and no `h2`/`h3`**. Section headings are paragraphs whose whole content is `<strong>` (paper, 600, body size).
- Inline `style="text-align:center|justify"` from the CMS is kept on most paragraphs. Nearly all body paragraphs are **justified**; the document title lines are centred. Preserve `text-align` per block.
- Page heights: privacy 19854 (@1440/1280) / 20001 / 30228; terms 16511 / 16511 / 16659 / 32895.

### Privacy inventory (107 top-level blocks)
1. Centred bold doc title line, then a justified bold "Last Revised: M/D/YY" line.
2. Intro paragraphs (160 and 109 words), each preceded by a bold heading line (3–5 words). They contain 2 red underlined links; the link text is wrapped in `span style="text-decoration:underline"`.
3. A flattened data table: 4 centred bold "column header" lines (4–9 words). Then **10 repeated groups** of `p` (category name, 2–9 words) + `p` ("Examples…", 3 words) + `ul.list-bullet` (12–18 items of 1–10 words). The table was flattened into this markup, so there is no `<table>`.
4. About 70 justified paragraphs (1–127 words, typically 40–100), with 10 more bold heading lines (3–9 words) and 7 more short `ul`s (3–10 items).
- 18 `ul` and 186 `li` in total. There is no `ol`. 11 links in total.

### Terms inventory (21 top-level blocks; content is mostly nested lists)
1. One centred `p` with two bold lines separated by `<br>`: the doc title and a "Revised: M/D/YY" line.
2. Sections are `ol.list-number` fragments. Each contains one `li` with a bold ALL-CAPS section title (auto-numbered 1., 2., … through `value`). The next item is `li.nestedListItem{list-style-type:none}`, which wraps a nested `ol` of sub-clauses: each `li` starts with a bold term ("Grant.") followed by 50–150 words, numbered 1., 2., ….
3. Nesting depth is up to 3 levels. Each level indents 24px, and all levels use decimal markers in paper-40.
4. Between sections are long justified `p` blocks (25–296 words). Several are entirely UPPERCASE legal text, and one opens with a bold uppercase run.
- 22 `ol` and 90 `li` in total. There is no `ul`. Underlined defined terms are `span style="text-decoration:underline"`: they stay paper-60 and are not links.
- Nested `ol` has no extra margin rule: it is `margin:0 0 1.5rem;padding-left:1.5rem`.

---

## P5. Motion and interaction on secondary pages
Nothing animates on load or scroll: there is no IntersectionObserver reveal, no scroll listener, and no shader. `document.getAnimations()` on every page returns only the footer `blink` (1.5s step-end) dot. The dashboard adds `pulse-dot`.

| name | where | timing |
|---|---|---|
| `blink` | footer square dot | 1.5s step-end infinite (Part 1 §17) |
| `pulse-dot` (new) | `.badge-dot` | `0%,to{opacity:1} 50%{opacity:.4}`, 2s ease-in-out infinite |
| `spin` (new) | dashboard loading `.spinner` | `to{transform:rotate(360deg)}`, 1s linear infinite |
| `wl-spin` | form button spinner | 1s linear infinite (Part 1 §17) |
| `btn-glitch` | header CTA hover only | .3s ease-in-out |
| SMIL grain seed | `#grainy` | 10s (Part 1) |

Transitions and hovers:
- blog row opacity .15s → .7;
- prose/legal link color .15s red → paper;
- back link color .15s muted → paper (icon fill as well);
- nav links opacity .2s; footer links color .2s;
- email input border-color .2s (focus paper-35);
- submit bg .2s → `#d93d26`;
- copy buttons color/border .2s → red; share buttons and hw-submit opacity .2s → .9;
- dev-reset color/border .2s → red;
- mobile menu .3s; toggle bars .3s.

---

## P6. Assets on these pages
- Downloaded OK (200), all **already present** in the clone from Part 1:
  - `/assets/rig-wordmark.svg`
  - the 4 preloaded fonts (`chalet_londonnineteensixty`, `GeistPixel-Square`, `InstrumentSans-latin`, `ChivoMono-latin`); no page requests the latin-ext files
  - `_slug_.syMwFS_H.css`, `index.DGyztNce.css`, `index.b3kNMUYY.css`.
- **New raster, unavailable:** `/api/media/file/rigd-flow{,-400x300,-768x1024,-1920x1080}.png` all return **502**. Use a placeholder (P2.4).
- Third-party: Cloudflare Turnstile (`challenges.cloudflare.com`, site key `0x4AAAAAAClpxyYUGDwFaChz`, theme dark, `appearance:"interaction-only"`) is loaded by every page that has a WaitlistForm (posts, waitlist). Don't clone it.
- Other network calls: backend `https://cms.rig.ai/api/waitlist/{signup,entry/:code,hardware/:code}`. PostHog is referenced but no PostHog host was requested during the run. `privacy`/`terms` load Cloudflare's `email-decode.min.js` (obfuscated emails). None of these are needed.
- The favicon is an inline data-URI SVG (ink rounded square with the red Rig mark), identical on all pages.
- Inline SVGs are listed with offsets in `CLONE_ASSETS_PAGES.json`. New ones: back-arrow, feature check, error-alert, X logo, LinkedIn logo. The rest are identical to homepage assets and can be reused.

## P7. Gotchas (secondary pages)
1. **Header differs by page:**
   - Default variant everywhere: white logo, paper links, **red** `btn-cta` CTA, static (not sticky), transparent.
   - `/waitlist` omits the CTA, so its header is 74px, not 86.4px.
2. **Blog index content width jumps at 1280.** The `.container` padding-0 rule at ≤1280 widens the list from 604 to 700px. This is real behaviour; replicate it.
3. **Headings need `font-weight:700`** under Tailwind preflight (faux-bold Chalet) for: blog h1/h2, post h1 and prose h2/h3, page-heading, dashboard-heading, stat-value, card/hw/referral headings, success-heading and legal h1. **The post CTA title is Instrument Sans 700, not Chalet.**
4. **Prose `strong` = paper, 600.** Legal "headings" are just bold paragraphs. Keep the per-paragraph `text-align` (justify/center).
5. **Turnstile placeholder height.** Headless Chromium got the interactive Turnstile widget, which adds 69px under forms (visible in `waitlist-full-1440.png` and in the inference post CTA). Real users usually see nothing. Build `.turnstile-container` as an empty div with `margin-top:1rem`.
6. **The post CTA's `.cta p` override** recolors and re-margins the form-success paragraphs (P2.7). The waitlist page never shows the inline success because the dashboard replaces it immediately.
7. **Share buttons keep their underline.** `.hw-submit` and the share buttons are rectangles; only `.submit-button` and the nav CTA are chamfered.
8. The blog image is the only media and it is broken on the origin. Make its placeholder `display:block`.
9. The dev-reset button and the loading/error states exist in the markup. Only the success dashboard and the form view are normally visible.
10. There are no fixed frame lines (`.content-lines`) on any secondary page. Don't mount the homepage's frame.
