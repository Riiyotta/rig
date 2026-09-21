// §9 Capabilities: badge, title, 3x2 grid of chamfered cards.
import { capabilities } from '../content.js'
import Badge from './Badge.jsx'
import '../styles/Capabilities.css'

export default function Capabilities() {
  return (
    <section className="illust-features">
      <div className="container">
        <Badge icon="capabilities" style={{ marginBottom: '1.5rem' }}>
          {capabilities.badge}
        </Badge>
        <h2 className="section-title" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          {capabilities.title}
        </h2>
        <div className="illust-grid">
          {capabilities.items.map((item, i) => (
            <div key={i} className="illust-card">
              <div className="illust-label mono-label">[ {String(i + 1).padStart(2, '0')} ]</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
