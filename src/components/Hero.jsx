// §2 Hero: red full-bleed block with nav, watermark, headline, CTAs, ticker.
import { Fragment } from 'react'
import { hero } from '../content.js'
import watermark from '../svg/hero-watermark.svg?raw'
import Navbar from './Navbar.jsx'
import InlineSvg from './InlineSvg.jsx'
import '../styles/Hero.css'

// One set = phrase, •, phrase, •, … (7 phrases). The source repeats the set
// and drops the final bullet: 27 spans total.
const tickerSet = hero.ticker.flatMap((p) => [p, '•'])
const tickerItems = [...tickerSet, ...tickerSet].slice(0, -1)

export default function Hero() {
  return (
    <section className="hero">
      <Navbar variant="hero" />
      <InlineSvg svg={watermark} />
      <div className="hero-content">
        <h1 style={{ marginTop: '2rem' }}>
          {hero.titleLines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h1>
        <p className="hero-sub">{hero.sub}</p>
        <div className="hero-actions">
          <a href="#early-access" className="btn-chamfer btn-red" id="hero-join-btn">
            {hero.primary}
          </a>
          <a
            href="#our-approach"
            className="btn-chamfer btn-red"
            style={{
              background: 'transparent',
              color: 'var(--ink)',
              border: '2px solid rgba(10,10,10,0.3)',
              textDecoration: 'none',
            }}
          >
            {hero.secondary}
          </a>
        </div>
      </div>
      <div className="hero-ticker">
        <div className="hero-ticker-inner">
          {tickerItems.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
