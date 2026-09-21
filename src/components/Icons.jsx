// Badge icons, one per section (CLONE_ASSETS.json `badge-icon-*`).
// Usage: <Badge icon="problem">…</Badge>
import problem from '../svg/badge-icon-problem.svg?raw'
import intro from '../svg/badge-icon-intro.svg?raw'
import offline from '../svg/badge-icon-offline.svg?raw'
import unlimited from '../svg/badge-icon-unlimited.svg?raw'
import privacy from '../svg/badge-icon-privacy.svg?raw'
import latency from '../svg/badge-icon-latency.svg?raw'
import approach from '../svg/badge-icon-approach.svg?raw'
import capabilities from '../svg/badge-icon-capabilities.svg?raw'
import terminal from '../svg/badge-icon-terminal.svg?raw'
import earlyAccess from '../svg/badge-icon-early-access.svg?raw'
import faq from '../svg/badge-icon-faq.svg?raw'
import InlineSvg from './InlineSvg.jsx'

export const badgeIcons = {
  problem,
  intro,
  offline,
  unlimited,
  privacy,
  latency,
  approach,
  capabilities,
  terminal,
  'early-access': earlyAccess,
  faq,
}

export function BadgeIcon({ name }) {
  const svg = badgeIcons[name]
  if (!svg) {
    if (import.meta.env.DEV) console.warn(`[BadgeIcon] unknown icon "${name}"`)
    return null
  }
  return <InlineSvg svg={svg} />
}
