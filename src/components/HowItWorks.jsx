// §8 How it works: auto-advancing 3-step stepper + shader1 panel with an
// ASCII bar-chart overlay card whose height tweens between steps.
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { how } from '../content.js'
import Badge from './Badge.jsx'
import ShaderCanvas from './ShaderCanvas.jsx'
import { bindShaderMouse } from '../lib/ditherShader.js'
import '../styles/HowItWorks.css'

const NB = ' '
const BAR_CELLS = 20
const LABEL_COL = 14 // minimum label column (chars) before the bar starts

// One bar row: label padded with nbsp, 20-cell bar (█ filled, ▎ sliver, ░ empty), value.
function BarRow({ row, col }) {
  const tone = row.rig ? 'hl-green' : 'hl-dim'
  // Like the original: one breakable space after the label, then nbsp padding,
  // so a row too long for the card wraps after the label, not inside it.
  const pad = NB.repeat(Math.max(0, col - row.label.length - 1))
  let bar = null
  if (row.fill == null) {
    // No bar: the value sits at the value column, glued to the padding.
    return (
      <>
        <span className={row.rig ? 'hl-bright' : 'hl-dim'}>{row.label}</span> {pad}
        {NB.repeat(BAR_CELLS + 1)}
        <span className={tone}>{row.value}</span>
      </>
    )
  } else {
    const full = Math.floor(row.fill)
    const sliver = row.fill - full > 0 ? '▎' : ''
    const empty = BAR_CELLS - full - (sliver ? 1 : 0)
    const filled = '█'.repeat(full) + sliver
    bar = (
      <>
        {filled && <span className={tone}>{filled}</span>}
        {empty > 0 && <span className="hl-dim">{'░'.repeat(empty)}</span>}
      </>
    )
  }
  return (
    <>
      <span className={row.rig ? 'hl-bright' : 'hl-dim'}>{row.label}</span> {pad}
      {bar} <span className={tone}>{row.value}</span>
    </>
  )
}

// Renders one card's blocks, blank line between blocks, <br> between lines.
function CardChart({ blocks }) {
  const lines = []
  blocks.forEach((b, bi) => {
    if (bi > 0) lines.push(null) // blank line
    if (b.caption) lines.push(<span className="hl-dim">{b.caption}</span>)
    if (b.bars) {
      const col = Math.max(LABEL_COL, ...b.bars.map((r) => r.label.length + 1))
      b.bars.forEach((r) => lines.push(<BarRow row={r} col={col} />))
    }
    if (b.lines) {
      b.lines.forEach((l) =>
        lines.push(
          typeof l === 'string' ? (
            <span className={`hl-${b.tone || 'dim'}`}>{l}</span>
          ) : (
            l.map(([tone, text], i) => (
              <span key={i} className={`hl-${tone}`}>
                {text}
              </span>
            ))
          ),
        ),
      )
    }
  })
  return lines.map((l, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {l}
    </Fragment>
  ))
}

const TWEEN = { duration: 400, easing: 'cubic-bezier(0,0,.58,1)' }

export default function HowItWorks() {
  // Markup starts with step 1 active (fill paused at 0) like the original.
  const [step, setStep] = useState(1)
  const [runId, setRunId] = useState(0) // bumps on every setHowStep, restarts the fill
  const started = useRef(false) // original's `X===0` check
  const inView = useRef(false)
  const hovering = useRef(false)
  const stepRef = useRef(1)
  const prevCardH = useRef(null)
  const tween = useRef(null)
  const sectionRef = useRef(null)
  const stepperRef = useRef(null)
  const illusRef = useRef(null)
  const cardRef = useRef(null)
  const fillRefs = useRef([])

  const applyPlayState = useCallback(() => {
    const fill = fillRefs.current[stepRef.current - 1]
    if (fill) fill.style.animationPlayState = inView.current && !hovering.current ? 'running' : 'paused'
  }, [])

  const setHowStep = useCallback((n) => {
    const card = cardRef.current
    // Tween only after the first activation and when the content changes.
    prevCardH.current = started.current && n !== stepRef.current && card ? card.offsetHeight : null
    started.current = true
    stepRef.current = n
    setStep(n)
    setRunId((r) => r + 1)
  }, [])

  // Restart the progress fill: reset every fill, reflow, clear inline animation.
  useLayoutEffect(() => {
    if (!runId) return
    fillRefs.current.forEach((f) => {
      if (!f) return
      f.style.animation = 'none'
      f.style.animationPlayState = ''
    })
    const fill = fillRefs.current[step - 1]
    if (fill) {
      void fill.offsetHeight
      fill.style.animation = ''
      applyPlayState()
    }
  }, [runId, step, applyPlayState])

  // Card height tween old -> new (400ms cubic-bezier(0,0,.58,1)), then auto.
  useLayoutEffect(() => {
    const card = cardRef.current
    const from = prevCardH.current
    prevCardH.current = null
    if (!card) return
    if (tween.current) {
      tween.current.cancel()
      tween.current = null
    }
    card.style.height = 'auto'
    if (from == null) return
    const to = card.offsetHeight
    card.style.height = `${from}px`
    card.style.overflow = 'hidden'
    const anim = card.animate({ height: [`${from}px`, `${to}px`] }, { ...TWEEN, fill: 'forwards' })
    tween.current = anim
    anim.onfinish = () => {
      if (tween.current !== anim) return
      anim.cancel()
      tween.current = null
      card.style.height = 'auto'
      card.style.overflow = ''
    }
  }, [runId])

  // Auto-advance when the active fill completes.
  useEffect(() => {
    const fill = fillRefs.current[step - 1]
    if (!fill) return
    const onEnd = (e) => {
      if (e.animationName === 'howProgressFill') setHowStep(stepRef.current < 3 ? stepRef.current + 1 : 1)
    }
    fill.addEventListener('animationend', onEnd)
    return () => fill.removeEventListener('animationend', onEnd)
  }, [step, runId, setHowStep])

  // In-view (threshold .1): first intersection activates step 1.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries[0].isIntersecting
        if (hit && !inView.current) {
          inView.current = true
          if (!started.current) setHowStep(1)
          else applyPlayState()
        } else if (!hit && inView.current) {
          inView.current = false
          applyPlayState()
        }
      },
      { threshold: 0.1 },
    )
    io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [setHowStep, applyPlayState])

  // Hovering the stepper pauses the fill.
  useEffect(() => {
    const el = stepperRef.current
    const enter = () => {
      hovering.current = true
      applyPlayState()
    }
    const leave = () => {
      hovering.current = false
      applyPlayState()
    }
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [applyPlayState])

  // Mouse -> shader1 red tint.
  useEffect(() => bindShaderMouse(illusRef.current), [])

  return (
    <section ref={sectionRef} className="how-section" id="our-approach">
      <div className="container">
        <div className="how-intro">
          <Badge icon="approach" className="how-intro-badge">
            {how.badge}
          </Badge>
          <h2 className="how-intro-heading section-title">{how.title}</h2>
          <p className="how-intro-body">{how.body}</p>
        </div>
        <div className="how-stepper" ref={stepperRef}>
          <div className="how-steps-left">
            {how.steps.map((s, i) => (
              <button
                key={i}
                type="button"
                className={`how-step${step === i + 1 ? ' active' : ''}`}
                data-step={i + 1}
                onClick={() => setHowStep(i + 1)}
                aria-label={`Step ${i + 1}: ${s.title.replace(/\.$/, '')}`}
              >
                <div className="how-step-progress">
                  <div className="how-step-progress-fill" ref={(el) => (fillRefs.current[i] = el)} />
                </div>
                <div className="how-step-header">
                  <div className="how-step-num">{s.num}</div>
                  <h3>{s.title}</h3>
                </div>
                <div className="how-step-body">
                  <div className="how-step-body-inner">
                    {s.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="how-illustration" ref={illusRef}>
            <ShaderCanvas preset="how" id="shader1" />
            <div className="shader-overlay-card" id="howCard" ref={cardRef}>
              <span className="card-title" id="howCardTitle">
                {how.steps[step - 1].cardTitle}
              </span>
              {how.cards.map((blocks, i) => (
                <div key={i} className={`card-content${step === i + 1 ? ' active' : ''}`} data-content={i + 1}>
                  <CardChart blocks={blocks} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
