// React wrapper for src/lib/ditherShader.js.
//   <ShaderCanvas preset="how" id="shader1" />
//   <ShaderCanvas preset="headline" options={{ speed: 0.3 }} />
// The canvas fills its parent (class .shader-bg: absolute, inset 0); the
// parent must be positioned and sized. The shader reads the parent's size.
import { useEffect, useRef } from 'react'
import { createDitherShader, SHADER_PRESETS } from '../lib/ditherShader.js'

const fill = { position: 'absolute', inset: 0, width: '100%', height: '100%' }

export default function ShaderCanvas({ preset = 'headline', options, className = 'shader-bg', style, ...rest }) {
  const ref = useRef(null)
  const shader = useRef(null)
  const merged = { ...SHADER_PRESETS[preset], ...options }
  const key = JSON.stringify(merged)

  useEffect(() => {
    shader.current = createDitherShader(ref.current, merged)
    return () => {
      shader.current.destroy()
      shader.current = null
    }
    // Recreate only if the preset changes; option tweaks go through update().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  useEffect(() => {
    shader.current?.update(merged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return <canvas ref={ref} className={className} style={{ ...fill, ...style }} aria-hidden="true" {...rest} />
}
