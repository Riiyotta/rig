# Rig clone

A local React 18 + Vite + Tailwind v3 clone of rig.ai, built for design study.
All page copy is placeholder text (`src/content.js`, `src/blog.js`,
`src/legal.js`). The Rig name, logos and the licensed Chalet font belong to
their owners, so don't deploy this publicly as-is.

Run it with `npx vite --port 5174 --strictPort` (or `npm run dev` when port
5173 is free).

## Information architecture

- **Edit by hand:** `ia.json` is the single source of truth for routes,
  templates and sections.
- **Generated, don't edit:** `IA.md` and `matrix.csv` are rebuilt from
  `ia.json` and will be overwritten.

After changing `ia.json`, re-run:

```bash
node validate.mjs && node build.mjs
```

### What the data shows

- **9 routes use 5 templates.** Four of the routes are blog posts from a single
  template. Waitlist and the two legal pages account for another three.
- **Only 3 of the 26 sections are shared between templates:** the overlays,
  the footer, and the default header. The other 23 each belong to one template
  and should stay page-local until a second page needs them.
- **Most of the build effort is on the homepage.** It is 1 of 9 routes, but 15
  of its 17 sections appear nowhere else.
- **One component sits behind two different sections.** The homepage's
  early-access band and the blog post's end-of-article CTA are separate
  sections, but both render the same `WaitlistForm.jsx`. The waitlist page uses
  its own form. The section reuse counts can't show this, so it's recorded in
  each section's `implementedBy` field.
- **The waitlist template has two sections that never appear together.** The
  signup and dashboard sections are alternate states of the same slot. The
  matrix lists both.

Every section in `ia.json` names the component that renders it
(`implementedBy`). The measured values behind each section are in
`CLONE_SPEC.md`: Part 1 covers the homepage, Part 2 the secondary pages.
