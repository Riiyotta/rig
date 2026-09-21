// §16 Footer: brand + link columns, bottom bar with status dot, logo watermark.
import { footer } from '../content.js'
import InlineSvg from './InlineSvg.jsx'
import watermark from '../svg/footer-watermark.svg?raw'
import '../styles/Footer.css'

const isExternal = (href) => /^https?:\/\//.test(href)

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/">
              <img className="footer-logo" src="/assets/rig-wordmark.svg" alt={footer.logoAlt} />
            </a>
            <p>{footer.tagline}</p>
          </div>
          {footer.cols.map((col) => (
            <div className="footer-col" key={col.title}>
              <h3 className="mono-label">{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} {...(isExternal(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span className="mono-label">{footer.copyright}</span>
          <div className="status footer-status">
            <span className="footer-status-dot" />
            <span>{footer.status}</span>
          </div>
        </div>
      </div>
      <InlineSvg svg={watermark} />
    </footer>
  )
}
