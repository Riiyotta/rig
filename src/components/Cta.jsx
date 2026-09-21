// §14 CTA: vortex image, oversized line-art logo, bloom logo, glitch heading,
// big chamfer button that smooth-scrolls to #early-access, fine print.
import { cta } from '../content.js'
import InlineSvg from './InlineSvg.jsx'
import lineart from '../svg/cta-oversized-lineart.svg?raw'
import bloomFilter from '../svg/cta-bloom-filter.svg?raw'
import logoGlow from '../svg/cta-logo-glow.svg?raw'
import logo from '../svg/cta-logo.svg?raw'
import returnIcon from '../svg/cta-btn-return-icon.svg?raw'
import '../styles/Cta.css'

const scrollToEarlyAccess = () => {
  document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Cta() {
  return (
    <section className="cta-section">
      <div className="cta-vortex-wrap">
        <picture>
          <source srcSet="/assets/cta-vortex.webp" type="image/webp" />
          <img className="cta-vortex-img" src="/assets/cta-vortex.png" alt="" loading="lazy" />
        </picture>
      </div>
      <InlineSvg svg={lineart} />
      <div className="container cta-container">
        <InlineSvg svg={bloomFilter} />
        <div className="cta-logo-wrap">
          <InlineSvg svg={logoGlow} />
          <InlineSvg svg={logo} />
        </div>
        <div className="cta-heading-wrap">
          <div className="cta-heading-blur" />
          <h2 className="glitch-text" data-text={cta.title}>
            {cta.title}
          </h2>
        </div>
        <div className="cta-btn-wrap">
          <button type="button" className="btn-chamfer btn-cta cta-btn" onClick={scrollToEarlyAccess}>
            {cta.button}
            <InlineSvg svg={returnIcon} />
          </button>
        </div>
        <p className="cta-fine-print">{cta.fine}</p>
      </div>
    </section>
  )
}
