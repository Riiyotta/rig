// §13 FAQ: numbered <details> accordion, React-controlled.
// Opening is two-phase so the .3s grid-template-rows transition actually plays:
// 1) set `open` (content renders at 0fr), 2) next frame set data-expanded (-> 1fr).
// Closing is instant, as on the original.
import { useEffect, useRef, useState } from 'react'
import { faq } from '../content.js'
import Badge from './Badge.jsx'
import InlineSvg from './InlineSvg.jsx'
import chevron from '../svg/faq-chevron.svg?raw'
import '../styles/Faq.css'

function FaqItem({ index, q, a }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const raf = useRef(0)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const toggle = (e) => {
    e.preventDefault()
    cancelAnimationFrame(raf.current)
    if (open) {
      setExpanded(false)
      setOpen(false)
      return
    }
    setOpen(true)
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => setExpanded(true))
    })
  }

  return (
    <details className="faq-item" open={open} data-expanded={expanded ? 'true' : 'false'}>
      <summary className="faq-question" onClick={toggle}>
        <span className="faq-question-number mono-label">{String(index + 1).padStart(2, '0')}</span>
        <span className="faq-question-text">{q}</span>
        <span className="faq-chevron" aria-hidden="true">
          <InlineSvg svg={chevron} />
        </span>
      </summary>
      <div className="faq-answer-wrap">
        <div className="faq-answer">
          <p>{a}</p>
        </div>
      </div>
    </details>
  )
}

export default function Faq() {
  return (
    <section className="faq-section">
      <div className="container">
        <Badge icon="faq" className="faq-badge">
          {faq.badge}
        </Badge>
        <h2 className="section-title faq-title">{faq.title}</h2>
        <div className="faq-list">
          {faq.items.map((item, i) => (
            <FaqItem key={i} index={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
