// §12 Early access: shader2 streaks behind the headline + waitlist form.
// Form logic/markup lives in the shared WaitlistForm component.
import { useEffect, useRef } from 'react'
import { earlyAccess as copy } from '../content.js'
import Badge from './Badge.jsx'
import ShaderCanvas from './ShaderCanvas.jsx'
import WaitlistForm from './WaitlistForm.jsx'
import { bindShaderMouse } from '../lib/ditherShader.js'
import '../styles/EarlyAccess.css'

export default function EarlyAccess() {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const shaderWrapRef = useRef(null)

  // §12 / §15: shader wrap = headline-wrap box + pad (0.5rem + extraPad 40) on each side.
  useEffect(() => {
    const section = sectionRef.current
    const wrap = headlineRef.current
    const shader = shaderWrapRef.current
    const place = () => {
      const r = section.getBoundingClientRect()
      const u = wrap.getBoundingClientRect()
      const pad = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5 + 40
      shader.style.top = `${u.top - r.top - pad}px`
      shader.style.height = `${u.height + pad * 2}px`
    }
    place()
    document.fonts?.ready.then(place)
    window.addEventListener('resize', place)
    window.addEventListener('load', place)
    const unbind = bindShaderMouse(section)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('load', place)
      unbind()
    }
  }, [])

  return (
    <section id="early-access" className="promise-section" ref={sectionRef}>
      <div className="shader-wrap" ref={shaderWrapRef}>
        <ShaderCanvas preset="headline" id="shader2" />
      </div>
      <div className="container ea-container">
        <div className="ea-content">
          <div className="ea-headline-wrap" ref={headlineRef}>
            <Badge icon="early-access" className="ea-badge">
              {copy.badge}
            </Badge>
            <h2 className="display ea-title">{copy.title}</h2>
            <p className="ea-desc">{copy.desc}</p>
          </div>

          <WaitlistForm copy={copy} className="ea-form-centered" formId="waitlist-form" />
        </div>
      </div>
    </section>
  )
}
