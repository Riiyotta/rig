// §4 Introducing — shader3 behind the headline, SMIL flow diagram below.
import { Fragment, useEffect, useRef } from 'react'
import '../styles/Intro.css'
import Badge from './Badge.jsx'
import InlineSvg from './InlineSvg.jsx'
import ShaderCanvas from './ShaderCanvas.jsx'
import diagramSvg from '../svg/intro-diagram.svg?raw'
import { intro } from '../content.js'

const EXTRA_PAD = 50

export default function Intro() {
  const sectionRef = useRef(null)
  const wrapRef = useRef(null)
  const headlineRef = useRef(null)

  // §4: shader wrap = headline box grown by (0.5rem + 50px) on top and bottom.
  useEffect(() => {
    const size = () => {
      const section = sectionRef.current
      const head = headlineRef.current
      const wrap = wrapRef.current
      if (!section || !head || !wrap) return
      const r = section.getBoundingClientRect()
      const h = head.getBoundingClientRect()
      const pad = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5 + EXTRA_PAD
      wrap.style.top = `${h.top - r.top - pad}px`
      wrap.style.height = `${h.height + pad * 2}px`
    }
    size()
    window.addEventListener('resize', size)
    window.addEventListener('load', size)
    document.fonts?.ready.then(size)
    return () => {
      window.removeEventListener('resize', size)
      window.removeEventListener('load', size)
    }
  }, [])

  return (
    <section ref={sectionRef} className="offline-section three-col intro-section" id="intro-rig">
      <div ref={wrapRef} className="intro-shader-wrap">
        <ShaderCanvas preset="headline" id="shader3" />
      </div>
      <div className="container intro-container">
        <div className="intro-flex">
          <div ref={headlineRef} className="intro-headline-wrap">
            <Badge icon="intro" className="intro-badge">
              {intro.badge}
            </Badge>
            <h2 className="display intro-title">
              {intro.titleLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h2>
            <p className="intro-desc">{intro.desc}</p>
          </div>
          <div className="intro-spacer" />
          <div className="intro-diagram-wrap">
            <InlineSvg svg={diagramSvg} />
          </div>
        </div>
      </div>
    </section>
  )
}
