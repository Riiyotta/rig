// §6 Three-column details — Unlimited / Privacy / Latency.
import { Fragment } from 'react'
import '../styles/ThreeCol.css'
import Badge from './Badge.jsx'
import { threeCol } from '../content.js'

const ICONS = ['unlimited', 'privacy', 'latency']

export default function ThreeCol() {
  return (
    <section className="offline-section three-col three-col-section">
      <div className="container three-col-container">
        <div className="three-col-grid">
          {threeCol.map((col, i) => (
            <Fragment key={col.badge}>
              {i > 0 && <div className="three-col-divider" />}
              <div className="three-col-cell">
                <div className="three-col-inner">
                  <Badge icon={ICONS[i]} className="three-col-badge">
                    {col.badge}
                  </Badge>
                  <h3 className="three-col-heading">{col.title}</h3>
                  <p className={col.dim ? 'three-col-text three-col-text--dim' : 'three-col-text'}>{col.body}</p>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
