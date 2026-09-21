// WebGL dither / pixel-band shader (CLONE_SPEC.md §15).
//
// Original implementation: the GLSL below is written for this project, not
// ported. It reproduces the *look* of the reference: a grid of pixel cells,
// a drifting fbm field sampled once per row, contour banding of that field
// into horizontal dash segments, an ordered/line dither, vertical fade, glow
// haze and a mouse-radius colour tint.
//
// API
//   const s = createDitherShader(canvas, options)  -> { update(opts), destroy() }
//   setShaderMouse([x, y] | null)                  -> shared mouse (UV, y up)
//   bindShaderMouse(element)                       -> attaches mousemove/leave, returns cleanup
//   SHADER_PRESETS.how / SHADER_PRESETS.headline   -> the two configs from §15
//
// One requestAnimationFrame loop drives every live instance. An instance only
// draws while its closest <section> (or the canvas parent) is within
// 200px of the viewport. The buffer is sized to parent size x min(DPR, 2).

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_px;          // cell size in device pixels
uniform float u_speed;
uniform float u_scale;
uniform float u_threshold;
uniform float u_warp;
uniform float u_contrast;
uniform float u_angle;       // degrees, drift direction
uniform float u_vignette;
uniform float u_fadeTop;
uniform float u_fadeBottom;
uniform float u_vertFade;
uniform float u_glow;
uniform float u_lineCount;
uniform float u_lineWeight;
uniform float u_mouseInfluence;
uniform float u_mouseRadius;
uniform vec2  u_mouse;       // UV, y up; (-1,-1) = none
uniform vec3  u_fg;          // "off" colour
uniform vec3  u_bg;          // "on" colour
uniform vec3  u_mouseColor;
uniform int   u_shape;       // 0 = fbm field, 8 = row-band segments
uniform int   u_mode;        // 0 = threshold fill, 1 = contour bands
uniform int   u_dither;      // 0 bayer2, 1 bayer4, 2 bayer8, 3 halftone, 4 line, 5 noise
uniform int   u_octaves;
uniform int   u_invert;
uniform float u_stretch;     // horizontal field stretch for shape 8 (smaller = longer dashes)
uniform float u_rowJitter;   // 0 = coherent field across rows (contour chains), 1 = per-row phase
uniform vec3  u_haze;        // additive haze on cells outside the contour bands
uniform vec4  u_env;         // vertical density envelope, top-origin: bandA [x,y], bandB [z,w]
uniform float u_envSoft;     // envelope edge width
uniform float u_centerDip;   // 0..1 density reduction around the horizontal centre
uniform float u_unit;        // device px per field unit (0 = canvas height)
uniform float u_minRun;      // 1 = drop isolated single lit cells

// ---- hashing / noise ---------------------------------------------------
float hash1(float n) {
  return fract(sin(n * 91.3458) * 47453.5453);
}
float hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  mat2 rot = mat2(0.82, -0.57, 0.57, 0.82);
  for (int i = 0; i < 8; i++) {
    if (i >= u_octaves) break;
    sum += amp * valueNoise(p);
    norm += amp;
    p = rot * p * 2.07 + vec2(11.3, 5.7);
    amp *= 0.5;
  }
  return sum / norm;
}

// ---- dither threshold maps (evaluated on integer cell coords) ----------
float bayer2(vec2 c) {
  c = floor(mod(c, 2.0));
  return (c.x * 2.0 + c.y * 3.0 - 4.0 * c.x * c.y + 0.5) / 4.0;
}
float bayer4(vec2 c) {
  return bayer2(floor(c * 0.5)) * 0.25 + bayer2(c);
}
float bayer8(vec2 c) {
  return bayer4(floor(c * 0.5)) * 0.25 + bayer2(c);
}
float halftone(vec2 c) {
  vec2 tile = mod(c, 4.0) - 1.5;
  return clamp(length(tile) / 2.2, 0.0, 1.0);
}
float lineMap(vec2 c) {
  // Scan-row dither: only every other cell row can switch on.
  return mod(c.y, 2.0) < 1.0 ? 0.5 : 2.0;
}
float ditherMap(vec2 c) {
  if (u_dither == 0) return fract(bayer2(c));
  if (u_dither == 1) return fract(bayer4(c));
  if (u_dither == 2) return fract(bayer8(c));
  if (u_dither == 3) return halftone(c);
  if (u_dither == 4) return lineMap(c);
  return hash2(c + 0.5);
}

// Field value (after contrast) for one cell; p = field coords of its centre.
float shapeField(vec2 cell, vec2 p, vec2 dir, float t) {
  float n;
  if (u_shape == 8) {
    // Row-band segments: stretch the field horizontally so features become
    // long dashes; optional per-row phase decorrelates rows.
    float rowSeed = hash1(cell.y + 7.0);
    vec2 q = vec2(p.x * u_stretch, p.y) * u_scale * 3.0;
    q += dir * t;
    // With jitter 0 neighbouring rows share one field, so a contour that
    // crosses several rows reads as a stepped chain of dashes.
    q.x += rowSeed * 3.0 * u_rowJitter;
    q.x += u_warp * (fbm(q * 0.6 + 21.0) - 0.5) * 6.0;
    n = fbm(q);
  } else {
    vec2 q = p * u_scale * 3.0 + dir * t;
    q += u_warp * (vec2(fbm(q + 3.1), fbm(q + 8.7)) - 0.5) * 4.0;
    n = fbm(q);
  }
  // Contrast around mid-grey.
  return clamp((n - 0.5) * (1.0 + u_contrast * 2.0) + 0.5, 0.0, 1.0);
}

// Contour band test used by the isolated-cell filter (plateaus count as off).
float bandAt(float n) {
  float v = fract(n * u_lineCount);
  return step(v, u_lineWeight * 0.9) * step(u_threshold, n) * step(n, 0.999);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_px);
  vec2 cellCenter = (cell + 0.5) * u_px;
  vec2 uv = cellCenter / u_res;               // 0..1, y up

  float a = radians(u_angle);
  vec2 dir = vec2(cos(a), sin(a));
  float t = u_time * u_speed;

  bool hasMouse = u_mouse.x >= 0.0;
  float mouseDist = hasMouse ? distance(uv, u_mouse) : 10.0;
  float mouseK = hasMouse ? smoothstep(u_mouseRadius, u_mouseRadius * 0.65, mouseDist) : 0.0;

  // Aspect-stable field coordinates (height = 1 unit).
  vec2 p = cellCenter / (u_unit > 0.0 ? u_unit : u_res.y);
  p += (u_mouse - uv) * u_mouseInfluence * mouseK;

  float n = shapeField(cell, p, dir, t);

  float level;
  float halo;
  if (u_mode == 1) {
    // Contour bands: switch on where the field sits just above one of
    // lineCount iso-levels; weight is the band thickness in field units.
    float v = fract(n * u_lineCount);
    float band = 1.0 - smoothstep(u_lineWeight * 0.8, u_lineWeight, v);
    // Saturated plateaus would light whole rows: split them into per-row
    // segments whose length shrinks as lineCount grows.
    if (n > 0.999 && u_rowJitter > 0.0) {
      float seg = valueNoise(vec2(cell.x * 0.02 * u_lineCount + hash1(cell.y) * 50.0, cell.y * 3.1));
      band = step(0.5, seg);
    }
    level = band * step(u_threshold, n);
    halo = (1.0 - smoothstep(0.0, u_lineWeight * 3.0, min(v, 1.0 - v))) * step(u_threshold, n);
    if (n > 0.999 && u_rowJitter == 0.0) { level = 0.0; halo = 0.0; }
    // Isolated-cell filter: a lit cell needs a lit horizontal neighbour, so
    // steep contour crossings don't leave single-pixel specks.
    if (u_minRun > 0.0 && level > 0.5) {
      vec2 dx = vec2(u_px / (u_unit > 0.0 ? u_unit : u_res.y), 0.0);
      float l = bandAt(shapeField(cell - vec2(1.0, 0.0), p - dx, dir, t));
      float r = bandAt(shapeField(cell + vec2(1.0, 0.0), p + dx, dir, t));
      level *= max(l, r);
    }
  } else {
    level = smoothstep(u_threshold - 0.05, u_threshold + 0.05, n);
    halo = smoothstep(u_threshold - 0.2, u_threshold, n);
  }

  // Vertical fade: cells thin out toward the bottom (denser at the top).
  if (u_vertFade > 0.0) {
    // Smooth along x (so dashes aren't chopped), independent per row.
    // Whole rows drop out (static per-row hash) so dashes keep their length.
    float keep = mix(1.0, uv.y, u_vertFade);
    level *= step(hash1(cell.y * 1.618 + 3.0), keep);
  }

  // Edge fades / vignette.
  if (u_fadeTop > 0.0) level *= smoothstep(0.0, u_fadeTop, 1.0 - uv.y);
  if (u_fadeBottom > 0.0) level *= smoothstep(0.0, u_fadeBottom, uv.y);
  if (u_vignette > 0.0) level *= 1.0 - u_vignette * smoothstep(0.25, 0.75, length(uv - 0.5));

  // Vertical envelope: dashes only live inside two horizontal zones.
  if (u_envSoft > 0.0) {
    float yt = 1.0 - uv.y;
    float envA = smoothstep(u_env.x - u_envSoft, u_env.x + u_envSoft, yt) *
                 (1.0 - smoothstep(u_env.y - u_envSoft, u_env.y + u_envSoft, yt));
    float envB = smoothstep(u_env.z - u_envSoft, u_env.z + u_envSoft, yt) *
                 (1.0 - smoothstep(u_env.w - u_envSoft, u_env.w + u_envSoft, yt));
    // Strict test: a row whose hash is exactly 0 must still be culled at env = 0.
    level *= step(hash1(cell.y * 2.371 + 11.0) + 1e-3, max(envA, envB));
  }
  // Centre thinning: low-frequency gate so dashes are removed in chunks.
  if (u_centerDip > 0.0) {
    float cx = (uv.x - 0.5) / 0.2;
    float keepC = 1.0 - u_centerDip * exp(-cx * cx);
    level *= step(valueNoise(vec2(cell.x * 0.03 + hash1(cell.y) * 40.0, cell.y * 0.37)), keepC);
  }

  float inBand = level > 0.5 ? 1.0 : 0.0;
  float on = level > ditherMap(cell) ? 1.0 : 0.0;
  if (u_invert == 1) on = 1.0 - on;

  vec3 onColor = mix(u_bg, u_mouseColor, mouseK);
  vec3 col = mix(u_fg, onColor, on);
  // Haze lifts everything outside the bands; band cells on rejected dither
  // rows stay bare fg (dark dashes); lit dashes pick up a little of it.
  col += u_haze * (1.0 - inBand) * (1.0 - on);
  col += u_haze * on * smoothstep(0.6, 1.0, halo) * u_glow;
  gl_FragColor = vec4(col, 1.0);
}
`

// ---- presets (CLONE_SPEC.md §15 config table) ---------------------------
const BASE = {
  baseShape: 8,
  renderMode: 1,
  ditherType: 4,
  warp: 0.12,
  contrast: 0.75,
  vignette: 0,
  glow: 0.6,
  octaves: 4,
  fadeTop: 0,
  fadeBottom: 0,
  vertFade: 0.7,
  invert: 0,
  mouseInfluence: 0,
  mouseColor: '#ED462D',
  mouseRadius: 0.25,
  // Tuning knobs for this implementation (not in the original config table).
  stretch: 0.3,
  rowJitter: 0,
  hazeColor: '#000000',
  envelope: null, // [aTop, aBottom, bTop, bBottom] in 0..1 from the top
  envelopeSoft: 0.03,
  centerDip: 0,
  unitPx: 0, // CSS px per field unit; 0 = canvas height
  minRun: false,
}

export const SHADER_PRESETS = {
  // shader1 — How it works illustration panel
  how: {
    ...BASE,
    pixelSize: 14,
    speed: 0.06,
    scale: 0.4,
    threshold: 0.62,
    angle: 261,
    lineCount: 17,
    lineWeight: 0.16,
    fgColor: '#0A0A0A',
    bgColor: '#121212',
    // Tuned against the live panel: uniform density (~8% lit / ~6% dark cells),
    // 2-6 cell dashes, slow churn (17 contour levels make motion very sensitive).
    threshold: 0.2,
    contrast: 0.4,
    lineWeight: 0.18,
    speed: 0.005,
    vertFade: 0,
    stretch: 0.25,
    rowJitter: 1,
    hazeColor: '#040302',
  },
  // shader2 / shader3 — Early access + Intro headline streaks
  headline: {
    ...BASE,
    pixelSize: 8,
    speed: 0.25,
    scale: 1.3,
    threshold: 0.11,
    angle: 238,
    lineCount: 2,
    lineWeight: 0.12,
    fgColor: '#000000',
    bgColor: '#ed462d',
    // Tuned against the live frames (coverage, dash length, churn, row chaining).
    octaves: 3,
    scale: 0.7,
    contrast: 0.3,
    lineWeight: 0.32,
    speed: 0.1,
    vertFade: 0,
    unitPx: 300,
    stretch: 0.22,
    rowJitter: 0.1,
    hazeColor: '#030100',
    envelope: [0.34, 0.58, 0.82, 1.1],
    envelopeSoft: 0.03,
    centerDip: 0.3,
    minRun: true,
  },
}

const DEFAULTS = { ...SHADER_PRESETS.headline }

// ---- shared mouse -------------------------------------------------------
let sharedMouse = null

/** Set the shared mouse position in UV of the hovered element (y up), or null. */
export function setShaderMouse(pos) {
  sharedMouse = pos
}

/** Feed the shared mouse from an element's mousemove; clears on mouseleave. */
export function bindShaderMouse(el) {
  if (!el) return () => {}
  const move = (e) => {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    setShaderMouse([(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height])
  }
  const leave = () => setShaderMouse(null)
  el.addEventListener('mousemove', move)
  el.addEventListener('mouseleave', leave)
  return () => {
    el.removeEventListener('mousemove', move)
    el.removeEventListener('mouseleave', leave)
    leave()
  }
}

// ---- helpers ------------------------------------------------------------
function hexToRgb(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
}

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[ditherShader] compile error:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

const UNIFORMS = [
  'u_res', 'u_time', 'u_px', 'u_speed', 'u_scale', 'u_threshold', 'u_warp', 'u_contrast',
  'u_angle', 'u_vignette', 'u_fadeTop', 'u_fadeBottom', 'u_vertFade', 'u_glow', 'u_lineCount',
  'u_lineWeight', 'u_mouseInfluence', 'u_mouseRadius', 'u_mouse', 'u_fg', 'u_bg', 'u_mouseColor',
  'u_shape', 'u_mode', 'u_dither', 'u_octaves', 'u_invert',
  'u_stretch', 'u_rowJitter', 'u_haze', 'u_env', 'u_envSoft', 'u_centerDip', 'u_unit', 'u_minRun',
]

// ---- shared render loop -------------------------------------------------
const instances = new Set()
let rafId = 0

function frame() {
  const time = performance.now() * 0.001
  for (const inst of instances) inst.draw(time)
  rafId = instances.size ? requestAnimationFrame(frame) : 0
}
function ensureLoop() {
  if (!rafId && instances.size) rafId = requestAnimationFrame(frame)
}

// ---- factory ------------------------------------------------------------
export function createDitherShader(canvas, options = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
  if (!gl) {
    console.warn('[ditherShader] WebGL unavailable')
    return { update() {}, destroy() {} }
  }

  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return { update() {}, destroy() {} }
  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[ditherShader] link error:', gl.getProgramInfoLog(program))
    return { update() {}, destroy() {} }
  }
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const loc = {}
  for (const name of UNIFORMS) loc[name] = gl.getUniformLocation(program, name)

  let opts = { ...DEFAULTS, ...options }
  let colors = {}
  const setColors = () => {
    colors = { fg: hexToRgb(opts.fgColor), bg: hexToRgb(opts.bgColor), mouse: hexToRgb(opts.mouseColor), haze: hexToRgb(opts.hazeColor) }
  }
  setColors()

  // Size tracking: parent box (CSS px), re-read by ResizeObserver.
  const parent = canvas.parentElement || canvas
  let cssW = parent.clientWidth
  let cssH = parent.clientHeight
  const ro = new ResizeObserver(() => {
    cssW = parent.clientWidth
    cssH = parent.clientHeight
  })
  ro.observe(parent)

  // Visibility: closest section (fallback parent), 200px margin.
  let visible = false
  const target = canvas.closest('section') || parent
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) visible = e.isIntersecting
    },
    { threshold: 0, rootMargin: '200px 0px' },
  )
  io.observe(target)

  let lost = false
  const onLost = (e) => {
    e.preventDefault()
    lost = true
  }
  canvas.addEventListener('webglcontextlost', onLost)

  const inst = {
    draw(time) {
      if (!visible || lost || !cssW || !cssH) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(cssW * dpr)
      const h = Math.round(cssH * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
      gl.useProgram(program)

      const m = sharedMouse || [-1, -1]
      gl.uniform2f(loc.u_res, w, h)
      gl.uniform1f(loc.u_time, time)
      gl.uniform1f(loc.u_px, opts.pixelSize * dpr)
      gl.uniform1f(loc.u_speed, opts.speed)
      gl.uniform1f(loc.u_scale, opts.scale)
      gl.uniform1f(loc.u_threshold, opts.threshold)
      gl.uniform1f(loc.u_warp, opts.warp)
      gl.uniform1f(loc.u_contrast, opts.contrast)
      gl.uniform1f(loc.u_angle, opts.angle)
      gl.uniform1f(loc.u_vignette, opts.vignette)
      gl.uniform1f(loc.u_fadeTop, opts.fadeTop)
      gl.uniform1f(loc.u_fadeBottom, opts.fadeBottom)
      gl.uniform1f(loc.u_vertFade, opts.vertFade)
      gl.uniform1f(loc.u_glow, opts.glow)
      gl.uniform1f(loc.u_lineCount, opts.lineCount)
      gl.uniform1f(loc.u_lineWeight, opts.lineWeight)
      gl.uniform1f(loc.u_mouseInfluence, opts.mouseInfluence)
      gl.uniform1f(loc.u_mouseRadius, opts.mouseRadius)
      gl.uniform2f(loc.u_mouse, m[0], m[1])
      gl.uniform3fv(loc.u_fg, colors.fg)
      gl.uniform3fv(loc.u_bg, colors.bg)
      gl.uniform3fv(loc.u_mouseColor, colors.mouse)
      gl.uniform1i(loc.u_shape, opts.baseShape)
      gl.uniform1i(loc.u_mode, opts.renderMode)
      gl.uniform1i(loc.u_dither, opts.ditherType)
      gl.uniform1i(loc.u_octaves, opts.octaves)
      gl.uniform1i(loc.u_invert, opts.invert)
      gl.uniform1f(loc.u_stretch, opts.stretch)
      gl.uniform1f(loc.u_rowJitter, opts.rowJitter)
      gl.uniform3fv(loc.u_haze, colors.haze)
      gl.uniform4fv(loc.u_env, opts.envelope || [0, 1, 0, 0])
      gl.uniform1f(loc.u_envSoft, opts.envelope ? opts.envelopeSoft : 0)
      gl.uniform1f(loc.u_centerDip, opts.centerDip)
      gl.uniform1f(loc.u_unit, (opts.unitPx || 0) * dpr)
      gl.uniform1f(loc.u_minRun, opts.minRun ? 1 : 0)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
  }
  instances.add(inst)
  ensureLoop()

  return {
    update(next) {
      opts = { ...opts, ...next }
      setColors()
    },
    destroy() {
      instances.delete(inst)
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}
