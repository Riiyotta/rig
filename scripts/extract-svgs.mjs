// Extracts the inline SVGs listed in CLONE_ASSETS.json from the reference HTML
// into src/svg/<name>.svg. Uses the manifest's UTF-8 *byte* ranges so that
// multi-byte characters earlier in the file can't shift the slices.
//
//   node scripts/extract-svgs.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(join(root, 'CLONE_ASSETS.json'), 'utf8'))
const html = readFileSync(join(root, manifest.html)) // Buffer -> byte offsets
const outDir = join(root, 'src/svg')
mkdirSync(outDir, { recursive: true })

const written = []
for (const asset of manifest.inlineSvgs) {
  if (/unused/i.test(asset.name)) continue
  const [start, end] = asset.byte
  let svg = html.subarray(start, end).toString('utf8').trim()

  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
    throw new Error(`${asset.name}: byte range does not cover a full <svg> element`)
  }

  // Astro scoping attributes are meaningless outside the original build.
  svg = svg.replace(/\s+data-astro-cid-[\w-]+(="[^"]*")?/g, '')

  if (asset.name === 'surveillance-eye') {
    // Gotcha: the saved HTML froze the pupil mid-mousemove. Reset to centre.
    const before = svg
    svg = svg.replace(/(<circle\b[^>]*\bid="eye-pupil"[^>]*>)/, (tag) =>
      tag.replace(/\bcx="[^"]*"/, 'cx="240"').replace(/\bcy="[^"]*"/, 'cy="240"'),
    )
    if (svg === before) throw new Error('surveillance-eye: could not find #eye-pupil to reset')
  }

  const file = `${asset.name}.svg`
  writeFileSync(join(outDir, file), svg + '\n')
  written.push(`${file} (${Buffer.byteLength(svg)} B)`)
}

console.log(`Wrote ${written.length} SVGs to src/svg:\n  ` + written.join('\n  '))
