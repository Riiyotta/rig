// §3 Problem — bordered box: badge + headline, then eye | 2x2 cards.
import { Fragment, useEffect, useRef } from 'react'
import '../styles/Problem.css'
import Badge from './Badge.jsx'
import InlineSvg from './InlineSvg.jsx'
import eyeSvg from '../svg/surveillance-eye.svg?raw'
import { problem } from '../content.js'

const MAX_OFFSET = 16

// Per-frame random glitch on the whole SVG for `ms` (original inline script).
function glitch(el, ms) {
  const start = performance.now()
  const base = el.style.filter || ''
  function frame() {
    if (performance.now() - start > ms) {
      el.style.filter = base
      el.style.opacity = ''
      return
    }
    const r = Math.random()
    if (r < 0.3) {
      el.style.filter = `hue-rotate(${Math.random() * 40 - 20}deg) saturate(${0.5 + Math.random()})`
      el.style.opacity = String(0.4 + Math.random() * 0.6)
    } else if (r < 0.5) {
      el.style.filter = `brightness(${0.3 + Math.random() * 0.7})`
      el.style.opacity = String(0.6 + Math.random() * 0.4)
    } else {
      el.style.filter = base
      el.style.opacity = ''
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

export default function Problem() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const svg = section.querySelector('#surveillance-eye')
    const pupil = section.querySelector('#eye-pupil')
    const targets = section.querySelectorAll('.eye-blink-target')
    if (!svg || !pupil) return undefined

    // Mouse tracking: pupil follows the cursor, max 16 viewBox units, no easing.
    const onMove = (e) => {
      const r = svg.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const u = Math.sqrt(dx * dx + dy * dy)
      if (u === 0) return
      const k = Math.min(u / 150, 1)
      pupil.setAttribute('cx', 240 + (dx / u) * MAX_OFFSET * k)
      pupil.setAttribute('cy', 240 + (dy / u) * MAX_OFFSET * k)
    }
    document.addEventListener('mousemove', onMove)

    // Blink loop.
    const timers = new Set()
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
      return id
    }
    const setShut = (on) => targets.forEach((t) => t.classList.toggle('shut', on))
    let running = false
    let next = null

    function blink() {
      if (!running) {
        next = null
        return
      }
      glitch(svg, 300)
      later(() => setShut(true), 60)
      later(() => setShut(false), 180)
      if (Math.random() < 0.3) {
        later(() => {
          glitch(svg, 200)
          setShut(true)
        }, 400)
        later(() => setShut(false), 520)
      }
      next = later(blink, 6000 + Math.random() * 8000)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true
          if (!next) next = later(blink, 2000 + Math.random() * 3000)
        } else if (!entry.isIntersecting && running) {
          running = false
          if (next) {
            clearTimeout(next)
            timers.delete(next)
            next = null
          }
        }
      },
      { threshold: 0.1 },
    )
    io.observe(section)

    return () => {
      document.removeEventListener('mousemove', onMove)
      io.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <section ref={sectionRef} className="signal-section problem-section">
      <div className="container problem-container">
        <div className="problem-outer">
          <div className="problem-top">
            <Badge icon="problem" className="problem-badge">
              {problem.badge}
            </Badge>
            <h2 className="display problem-headline">
              {problem.titleLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h2>
          </div>

          <div className="problem-divider" />

          <div className="problem-grid">
            <div className="problem-eye-col">
              <div className="problem-eye-wrapper">
                <InlineSvg svg={eyeSvg} />
              </div>
            </div>

            {problem.cards.map((card) => (
              <div className="problem-card" key={card.num}>
                <div className="problem-card-header">
                  <span className="mono problem-card-label">{card.label}</span>
                  <span className="mono problem-card-number">{card.num}</span>
                </div>
                <h3 className="display-heavy">{card.title}</h3>
                <p>
                  {card.body.map((line, i) => (
                    <Fragment key={i}>
                      {i > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
