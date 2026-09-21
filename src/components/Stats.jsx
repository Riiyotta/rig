// §10 Stats strip: 4 bordered stat boxes.
import { stats } from '../content.js'
import '../styles/Stats.css'

export default function Stats() {
  return (
    <section className="stats-strip">
      {stats.map((s, i) => (
        <div key={i} className="stat-box">
          <span className="stat-label mono-label">{s.label}</span>
          <span className="stat-value">{s.value}</span>
          <span className="stat-note">{s.note}</span>
        </div>
      ))}
    </section>
  )
}
