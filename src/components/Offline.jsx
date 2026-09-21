// §5 Work offline — clipped globe + severed 3-card flow | copy.
import '../styles/Offline.css'
import Badge from './Badge.jsx'
import InlineSvg from './InlineSvg.jsx'
import globeSvg from '../svg/globe.svg?raw'
import dashSvg from '../svg/severed-connector-dash.svg?raw'
import xSvg from '../svg/severed-connector-x.svg?raw'
import { offline } from '../content.js'

function Severed() {
  return (
    <div className="offline-severed">
      <InlineSvg svg={dashSvg} />
      <InlineSvg svg={xSvg} />
      <div className="offline-severed-label">{offline.cards.severed}</div>
      <InlineSvg svg={dashSvg} />
    </div>
  )
}

export default function Offline() {
  const { cards } = offline
  return (
    // inline padding:0 / min-height / overflow mirror the original's inline styles (§5)
    <section className="offline-section offline-work" style={{ padding: 0 }}>
      <div className="container" style={{ position: 'relative' }}>
        <div className="offline-layout" style={{ minHeight: 560 }}>
          <div className="offline-visual" style={{ overflow: 'hidden', minHeight: 560, position: 'relative' }}>
            <div className="offline-flow">
              <div className="offline-card offline-card--edge">{cards.cloud}</div>
              <Severed />
              <div className="offline-card offline-card--main">
                <div className="offline-card-title">{cards.machine}</div>
                <div className="offline-card-accent">
                  <span>&#10003;</span> {cards.active}
                </div>
              </div>
              <Severed />
              <div className="offline-card offline-card--edge">{cards.nothing}</div>
            </div>
            <InlineSvg svg={globeSvg} />
          </div>

          <div className="offline-content">
            <Badge icon="offline" className="offline-badge" style={{ marginBottom: '1.5rem' }}>
              {offline.badge}
            </Badge>
            <h2>{offline.title}</h2>
            <p>{offline.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
