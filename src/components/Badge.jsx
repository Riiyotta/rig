// §1.2 badge: 16x16 pixel icon + uppercase mono text.
// `className` adds the per-section modifier (e.g. "problem-badge");
// `style` is for the inline overrides the spec lists (e.g. capabilities mb).
import { BadgeIcon } from './Icons.jsx'

export default function Badge({ icon, className = '', style, children }) {
  return (
    <div className={`badge ${className}`.trim()} style={style}>
      {icon && <BadgeIcon name={icon} />}
      {children}
    </div>
  )
}
