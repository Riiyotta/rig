// §11 Terminal: perspective grid, monitor casing with a boot session that
// reveals line by line on load, typing loop over content.terminal.prompts,
// blueprint annotations (desktop) / annotation grid (≤1024).
import { useEffect, useRef } from 'react'
import { terminal } from '../content.js'
import Badge from './Badge.jsx'
import '../styles/Terminal.css'

// "RIG" block-letter logo (spec §11: art copied from the original markup).
const ASCII_LOGO = `  ██████╗  ██╗  ██████╗
  ██╔══██╗ ██║ ██╔════╝
  ██████╔╝ ██║ ██║ ███╗
  ██╔══██╗ ██║ ██║  ██║
  ██║  ██║ ██║ ╚██████║
  ╚═╝  ╚═╝ ╚═╝  ╚═════╝`

const TYPE_MS = 70
const DELETE_MS = 30
const HOLD_MS = 2000
const PAUSE_MS = 400
const START_DELAY_MS = 500

function useTypingLoop(sectionRef, textRef) {
  useEffect(() => {
    const section = sectionRef.current
    const el = textRef.current
    if (!section || !el) return
    const phrases = terminal.prompts
    let idx = 0
    let active = false // section in view
    let running = false // a loop is in flight
    const timers = new Set()
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
    }

    const type = (phrase, done) => {
      let i = 0
      const tick = () => {
        if (!active) return (running = false)
        if (i <= phrase.length) {
          el.textContent = phrase.slice(0, i)
          i++
          later(tick, TYPE_MS)
        } else later(done, HOLD_MS)
      }
      tick()
    }
    const erase = (done) => {
      const tick = () => {
        if (!active) return (running = false)
        const t = el.textContent
        if (t.length > 0) {
          el.textContent = t.slice(0, -1)
          later(tick, DELETE_MS)
        } else later(done, PAUSE_MS)
      }
      tick()
    }
    const loop = () => {
      if (!active) return (running = false)
      running = true
      type(phrases[idx], () =>
        erase(() => {
          idx = (idx + 1) % phrases.length
          loop()
        }),
      )
    }

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries[0].isIntersecting
        if (hit && !active) {
          active = true
          if (!running) later(loop, START_DELAY_MS)
        } else if (!hit && active) {
          active = false
        }
      },
      { threshold: 0.1 },
    )
    io.observe(section)
    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
      timers.clear()
    }
  }, [sectionRef, textRef])
}

function BpAnno({ side, pos, item }) {
  const text = (
    <div className="bp-text">
      <div className="bp-title">{item.title}</div>
      <div className="bp-desc">{item.desc}</div>
    </div>
  )
  return (
    <div className={`bp-anno bp-at-${pos}`}>
      {side === 'left' ? (
        <>
          {text}
          <div className="bp-line-left" />
          <div className="bp-dot" />
        </>
      ) : (
        <>
          <div className="bp-dot" />
          <div className="bp-line-right" />
          {text}
        </>
      )}
    </div>
  )
}

const POSITIONS = [34, 50, 66]

export default function Terminal() {
  const sectionRef = useRef(null)
  const typingRef = useRef(null)
  useTypingLoop(sectionRef, typingRef)

  const { ready, bezel } = terminal
  const interleaved = terminal.left.flatMap((l, i) => [l, terminal.right[i]])

  return (
    <section ref={sectionRef} className="terminal-section grid-bg">
      <div className="container">
        <div className="term-header">
          <Badge icon="terminal" className="term-badge">
            {terminal.badge}
          </Badge>
          <h2 className="display term-title">{terminal.title}</h2>
        </div>

        <div className="terminal-artifact">
          <div className="terminal-blueprint-left">
            {terminal.left.map((item, i) => (
              <BpAnno key={i} side="left" pos={POSITIONS[i]} item={item} />
            ))}
          </div>
          <div className="terminal-blueprint-right">
            {terminal.right.map((item, i) => (
              <BpAnno key={i} side="right" pos={POSITIONS[i]} item={item} />
            ))}
          </div>

          <div className="monitor-casing">
            <div className="monitor-vents">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="monitor-vent" />
              ))}
            </div>
            <div className="monitor-screen-bezel">
              <div className="terminal-window">
                <div className="terminal-bar">
                  <div className="terminal-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="terminal-title">{terminal.windowTitle}</span>
                  <div className="blink-dot blink-dot-sm" />
                </div>
                {/* Exactly 8 .term-line children: nth-child drives the reveal delays. */}
                <div className="terminal-body">
                  <div className="term-line">
                    <span className="prompt">λ</span> <span className="cmd">{terminal.command}</span>
                  </div>
                  <div className="term-line term-line-gap-sm">
                    <pre className="term-ascii">{ASCII_LOGO}</pre>
                  </div>
                  <div className="term-line output term-line-gap-sm">{terminal.boot[0]}</div>
                  <div className="term-line output">{terminal.boot[1]}</div>
                  <div className="term-line output">
                    {terminal.boot[2]} <span className="success">{terminal.bootOk}</span>
                  </div>
                  <div className="term-line output">{terminal.boot[3]}</div>
                  <div className="term-line term-line-gap">
                    <span className="success">{ready.mark}</span> <span className="cmd">{ready.text}</span>{' '}
                    <span className="info">
                      {ready.network}: <span className="term-off">{ready.off}</span> · {ready.telemetry}:{' '}
                      <span className="term-off">{ready.off}</span>
                    </span>
                  </div>
                  <div className="term-line term-line-gap">
                    <span className="prompt">λ</span>{' '}
                    <span id="typing-text" className="cmd" ref={typingRef}>
                      {terminal.typingInitial}
                    </span>
                    <span className="cursor-block" />
                  </div>
                </div>
              </div>
            </div>
            <div className="monitor-bezel-bottom">
              <span>{bezel[0]}</span>
              <div className="monitor-led" />
              <span className="model-tag">{bezel[1]}</span>
              <span>{bezel[2]}</span>
            </div>
          </div>
        </div>

        <div className="terminal-annotations-grid">
          {interleaved.map((item, i) => (
            <div key={i} className="terminal-anno-item">
              <div className="terminal-anno-title">{item.title}</div>
              <div className="terminal-anno-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
