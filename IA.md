# https://rig.ai/ (cloned locally as a React 18 + Vite + Tailwind v3 app)

Source: https://rig.ai/ (cloned locally as a React 18 + Vite + Tailwind v3 app) · Local clone at the project root; original HTML/CSS/JS snapshot in reference/original-site/
Status: **measured-from-mirror** · production approved: **false**
9 routes · 5 templates · 26 unique sections

> Generated from `ia.json` by `build.mjs`. Edit the JSON, not this file.

## Shape of the site

The largest 3 templates (Blog post, Legal document, Homepage) account for 7 of 9 routes (78%). The remaining 2 routes span 2 templates.

| template | routes | share |
|---|---:|---:|
| Blog post | 4 | 44% |
| Legal document | 2 | 22% |
| Homepage | 1 | 11% |
| Blog index | 1 | 11% |
| Waitlist | 1 | 11% |

## Page chrome

**1 routes carry chrome = `full-hero`** — Homepage.

**7 routes carry chrome = `default`** — Blog index, Blog post, Legal document.

**1 routes carry chrome = `default-no-cta`** — Waitlist.

## Sections by reuse

How widely a section is shared determines whether it belongs in a shared
component library or stays local to its page.

| section | category | templates | routes | implementation | scope |
|---|---|---:|---:|---|---|
| `shell.overlays` | SHELL | 5 | 9 | `src/components/Overlays.jsx` | Present on all 9 routes, rendered first on every page. |
| `shell.footer` | SHELL | 5 | 9 | `src/components/Footer.jsx` | Present on all 9 routes, rendered last on every page. |
| `shell.header-default` | SHELL | 4 | 8 | `src/components/Navbar.jsx (variant="default")` | Every secondary page (8 routes); the waitlist route renders it without the CTA. |
| `content.post-header` | CONTENT | 1 | 4 | `src/pages/BlogPost.jsx > .blog-post-header` | All 4 blog post routes. |
| `content.post-body` | CONTENT | 1 | 4 | `src/pages/BlogPost.jsx > .blog-post-content + Block` | All 4 blog post routes. |
| `conversion.post-cta` | CONVERSION | 1 | 4 | `src/pages/BlogPost.jsx > aside.blog-cta + src/components/WaitlistForm.jsx` | All 4 blog post routes. |
| `hero.page-title` | HERO | 1 | 2 | `src/pages/Legal.jsx > .page-hero` | The two legal routes (privacy and terms). |
| `content.legal-prose` | CONTENT | 1 | 2 | `src/pages/Legal.jsx > .content-block.prose + src/legal.js` | The two legal routes (privacy and terms). |
| `shell.header-hero` | SHELL | 1 | 1 | `src/components/Navbar.jsx (variant="hero")` | Homepage only (1 route). |
| `shell.content-lines` | SHELL | 1 | 1 | `src/pages/Home.jsx > .content-lines` | Homepage only (1 route). |
| `shell.section-divider` | SHELL | 1 | 1 | `src/components/SectionDivider.jsx` | Homepage only (1 route). |
| `hero.home` | HERO | 1 | 1 | `src/components/Hero.jsx` | Homepage only (1 route). |
| `narrative.problem` | NARRATIVE | 1 | 1 | `src/components/Problem.jsx` | Homepage only (1 route). |
| `narrative.intro` | NARRATIVE | 1 | 1 | `src/components/Intro.jsx` | Homepage only (1 route). |
| `narrative.offline` | NARRATIVE | 1 | 1 | `src/components/Offline.jsx` | Homepage only (1 route). |
| `narrative.three-col` | NARRATIVE | 1 | 1 | `src/components/ThreeCol.jsx` | Homepage only (1 route). |
| `features.how-it-works` | FEATURES | 1 | 1 | `src/components/HowItWorks.jsx` | Homepage only (1 route). |
| `features.capabilities` | FEATURES | 1 | 1 | `src/components/Capabilities.jsx` | Homepage only (1 route). |
| `features.stats` | FEATURES | 1 | 1 | `src/components/Stats.jsx` | Homepage only (1 route). |
| `features.terminal` | FEATURES | 1 | 1 | `src/components/Terminal.jsx` | Homepage only (1 route). |
| `conversion.early-access` | CONVERSION | 1 | 1 | `src/components/EarlyAccess.jsx + src/components/WaitlistForm.jsx` | Homepage only (1 route). |
| `content.faq` | CONTENT | 1 | 1 | `src/components/Faq.jsx` | Homepage only (1 route). |
| `conversion.cta` | CONVERSION | 1 | 1 | `src/components/Cta.jsx` | Homepage only (1 route). |
| `content.blog-index` | CONTENT | 1 | 1 | `src/pages/Blog.jsx > .blog-section` | The blog index route only. |
| `conversion.waitlist-signup` | CONVERSION | 1 | 1 | `src/pages/Waitlist.jsx > FormView` | The waitlist route only, in its signed-out state. |
| `conversion.waitlist-dashboard` | CONVERSION | 1 | 1 | `src/pages/Waitlist.jsx > Dashboard + HardwareSurvey` | The waitlist route only, in its signed-up state. |

**3 shared sections** appear in more than one template and belong in a component library.

**23 single-use sections** appear in exactly one template. Building these
as "reusable" components up front would be speculative — keep them page-local
until a second caller actually appears.

## Templates

### Homepage — `template.home`

1 route · `/` · chrome: **full-hero**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.overlays` | shared ×5 |
| 2 | SHELL | `shell.header-hero` | page-local |
| 3 | HERO | `hero.home` | page-local |
| 4 | SHELL | `shell.content-lines` | page-local |
| 5 | SHELL | `shell.section-divider` | page-local |
| 6 | NARRATIVE | `narrative.problem` | page-local |
| 7 | NARRATIVE | `narrative.intro` | page-local |
| 8 | NARRATIVE | `narrative.offline` | page-local |
| 9 | NARRATIVE | `narrative.three-col` | page-local |
| 10 | FEATURES | `features.how-it-works` | page-local |
| 11 | FEATURES | `features.capabilities` | page-local |
| 12 | FEATURES | `features.stats` | page-local |
| 13 | FEATURES | `features.terminal` | page-local |
| 14 | CONVERSION | `conversion.early-access` | page-local |
| 15 | CONTENT | `content.faq` | page-local |
| 16 | CONVERSION | `conversion.cta` | page-local |
| 17 | SHELL | `shell.footer` | shared ×5 |

### Blog index — `template.blog-index`

1 route · `/blog` · chrome: **default**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.overlays` | shared ×5 |
| 2 | SHELL | `shell.header-default` | shared ×4 |
| 3 | CONTENT | `content.blog-index` | page-local |
| 4 | SHELL | `shell.footer` | shared ×5 |

### Blog post — `template.blog-post`

4 routes · `/blog/{slug}` · chrome: **default**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.overlays` | shared ×5 |
| 2 | SHELL | `shell.header-default` | shared ×4 |
| 3 | CONTENT | `content.post-header` | page-local |
| 4 | CONTENT | `content.post-body` | page-local |
| 5 | CONVERSION | `conversion.post-cta` | page-local |
| 6 | SHELL | `shell.footer` | shared ×5 |

### Waitlist — `template.waitlist`

1 route · `/waitlist` · chrome: **default-no-cta**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.overlays` | shared ×5 |
| 2 | SHELL | `shell.header-default` | shared ×4 |
| 3 | CONVERSION | `conversion.waitlist-signup` | page-local |
| 4 | CONVERSION | `conversion.waitlist-dashboard` | page-local |
| 5 | SHELL | `shell.footer` | shared ×5 |

### Legal document — `template.legal`

2 routes · `/privacy`, `/terms` · chrome: **default**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.overlays` | shared ×5 |
| 2 | SHELL | `shell.header-default` | shared ×4 |
| 3 | HERO | `hero.page-title` | page-local |
| 4 | CONTENT | `content.legal-prose` | page-local |
| 5 | SHELL | `shell.footer` | shared ×5 |

## Section reference

### SHELL

_Page chrome shared across routes: fixed visual overlays, header/nav variants, frame lines, section dividers, footer._

**`shell.overlays`** — Three fixed, pointer-transparent full-viewport overlays stacked above everything: scanlines, grain noise, and RGB fringe.

· Present on all 9 routes, rendered first on every page. · appears on 9 routes · implemented by `src/components/Overlays.jsx`

**`shell.header-hero`** — Header variant that sits inside the red homepage hero: black wordmark, ink-coloured links, dark chamfer CTA; collapses to a full-screen toggle menu at 768px and below.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Navbar.jsx (variant="hero")`

**`shell.header-default`** — Static, transparent header variant for dark secondary pages: white wordmark, paper-coloured links, red chamfer CTA. The CTA list item can be dropped via showCta={false}, which shortens the header.

· Every secondary page (8 routes); the waitlist route renders it without the CTA. · appears on 8 routes · implemented by `src/components/Navbar.jsx (variant="default")`

**`shell.content-lines`** — Fixed vertical frame lines that bound the homepage's main content column.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/pages/Home.jsx > .content-lines`

**`shell.section-divider`** — Full-width hairline divider between homepage sections. Rendered 13 times on the page: a top and bottom spacer divider, one between each pair of sections, and a doubled divider before How it works.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/SectionDivider.jsx`

**`shell.footer`** — Site footer: brand column with wordmark and tagline, Connect and Legal link columns, bottom bar with copyright and a blinking 'all systems local' status dot, and a giant logo watermark.

· Present on all 9 routes, rendered last on every page. · appears on 9 routes · implemented by `src/components/Footer.jsx`

### HERO

_Page-opening block that sets the page title or the primary homepage message._

**`hero.home`** — Full-viewport red homepage hero: faded logo watermark, two-line display headline, subline, two chamfer buttons (primary + outline), and a looping marquee ticker along the bottom edge. Hosts the hero header variant.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Hero.jsx`

**`hero.page-title`** — Plain title block at the top of a legal document: h1 capped in width inside the 960px legal box, with a last-updated line.

· The two legal routes (privacy and terms). · appears on 2 routes · implemented by `src/pages/Legal.jsx > .page-hero`

### NARRATIVE

_Homepage storytelling blocks that frame the problem and the product's answer to it._

**`narrative.problem`** — Bordered box with badge and two-line headline, a full-width divider, then a grid of a surveillance-eye illustration (mouse-tracking pupil) beside four numbered problem cards.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Problem.jsx`

**`narrative.intro`** — Product introduction: WebGL dither-shader band behind a centred badge, two-line headline and description, followed by an animated (SMIL) solution-flow diagram.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Intro.jsx`

**`narrative.offline`** — Two-column 'work offline' block: an oversized drifting globe clipped by the section, overlaid with a three-card vertical flow joined by severed connectors, beside a badge, heading and short body.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Offline.jsx`

**`narrative.three-col`** — Three equal columns separated by 1px dividers, each with a badge, heading and one-paragraph body (unlimited / privacy / latency).

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/ThreeCol.jsx`

### FEATURES

_Homepage blocks explaining how the product works and what it can do, including stats and the terminal demo._

**`features.how-it-works`** — Intro block (badge, title, body) above a two-column stepper: three auto-advancing expandable steps with progress fills on the left, a shader panel with an overlay card of ASCII bar charts that swaps and tweens height per step on the right.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/HowItWorks.jsx`

**`features.capabilities`** — Badge and centred section title above a grid of six numbered capability cards ([ 01 ] to [ 06 ]), each with a heading and paragraph.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Capabilities.jsx`

**`features.stats`** — Full-width strip of four stat boxes, each a mono label, a large value and a short note.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Stats.jsx`

**`features.terminal`** — Grid-background block with badge and title above a monitor casing (vents, bezel, LED strip) framing a terminal window: ASCII logo, boot lines revealed on load, and a typing loop of prompts. Blueprint annotations sit left and right on desktop and become a two-column grid below the monitor on smaller screens.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Terminal.jsx`

### CONVERSION

_Waitlist sign-up surfaces and calls to action, including the waitlist dashboard._

**`conversion.early-access`** — Homepage waitlist band: dither-shader background behind a badge, headline and description, with the shared inline email form (input + chamfer submit, loading, error, and success-with-referral-link states) and a reserved verification-widget slot.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/EarlyAccess.jsx + src/components/WaitlistForm.jsx`

**`conversion.cta`** — Closing homepage call to action outside the main column: vortex image, oversized line-art logo, bloom-glow logo, glitch heading, a large chamfer button that smooth-scrolls to the early-access band, and fine print.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Cta.jsx`

**`conversion.post-cta`** — End-of-article waitlist box: sans-serif title, two short lines, and the shared inline email form. Omitted for an unknown slug.

· All 4 blog post routes. · appears on 4 routes · implemented by `src/pages/BlogPost.jsx > aside.blog-cta + src/components/WaitlistForm.jsx`

**`conversion.waitlist-signup`** — Waitlist page form view: badge, headline, description, checkmarked feature list, and a self-contained email form. Shown when no saved sign-up exists.

· The waitlist route only, in its signed-out state. · appears on 1 routes · implemented by `src/pages/Waitlist.jsx > FormView`

**`conversion.waitlist-dashboard`** — Waitlist page dashboard view, shown instead of the form once a sign-up is saved: loading and error states, then position and referral-count stat cards, a giveaway card, a hardware survey (chip + RAM selects, save), referral link with copy, share-on-X and LinkedIn buttons, joined date, and a dev-only reset.

· The waitlist route only, in its signed-up state. · appears on 1 routes · implemented by `src/pages/Waitlist.jsx > Dashboard + HardwareSurvey`

### CONTENT

_Substantive reading content: FAQ, blog listing, blog article body, legal prose._

**`content.faq`** — Badge and title above a numbered list of eight accordion rows; each opens with a grid-row height transition and a rotating chevron.

· Homepage only (1 route). · appears on 1 routes · implemented by `src/components/Faq.jsx`

**`content.blog-index`** — Single-column blog listing: h1 above hairline-separated rows, newest first, each row a date beside a title and excerpt; rows dim to 0.7 opacity on hover.

· The blog index route only. · appears on 1 routes · implemented by `src/pages/Blog.jsx > .blog-section`

**`content.post-header`** — Article title block: h1 plus a meta row with byline and long-form date. For an unknown slug it renders a 'post not found' title with no meta row.

· All 4 blog post routes. · appears on 4 routes · implemented by `src/pages/BlogPost.jsx > .blog-post-header`

**`content.post-body`** — Article body in a 672px column: lead excerpt, then typed rich-text blocks (h2, h3, p, lists, blockquote, figure placeholder, hr; styles also exist for h4, code and pre), ending with a back-to-blog link.

· All 4 blog post routes. · appears on 4 routes · implemented by `src/pages/BlogPost.jsx > .blog-post-content + Block`

**`content.legal-prose`** — Legal document body in a 720px column: bold-paragraph section headings, mostly justified paragraphs, bullet lists, numbered lists nested up to three levels, and a block of centred bold lines.

· The two legal routes (privacy and terms). · appears on 2 routes · implemented by `src/pages/Legal.jsx > .content-block.prose + src/legal.js`
