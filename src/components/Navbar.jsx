// §2 header/nav. Mobile (≤768): toggle opens a full-screen menu; Escape
// closes it and returns focus to the toggle; any link click closes it.
// variant="hero": inside the red hero (black logo, ink links, btn-dark CTA).
// variant="default": secondary pages, static + transparent (Part 2 §P0.2):
//   white logo, paper links, red btn-cta CTA. showCta={false} drops the CTA
//   <li> (/waitlist), which makes the nav 74px tall instead of 86.4.
import { useEffect, useRef, useState } from 'react'
import { nav } from '../content.js'
import '../styles/Navbar.css'

export default function Navbar({ variant = 'hero', showCta = true }) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const onMenuClick = (e) => {
    if (e.target.closest('a')) setOpen(false)
  }

  return (
    <header className="site-header" role="banner" data-variant={variant}>
      <nav className="site-nav" aria-label="Main navigation">
        <a href="/" className="site-logo" aria-label="Rig — Home">
          <img src="/assets/rig-wordmark.svg" alt="" width="60" height="22" />
        </a>
        <button
          ref={toggleRef}
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
        <ul className="site-nav-links" id="nav-menu" role="list" data-open={open} onClick={onMenuClick}>
          {nav.links.map((l) => (
            <li key={l.label}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
          {showCta && (
            <li>
              <a
                id="nav-join-btn"
                href={nav.cta.href}
                className={`btn-chamfer site-nav-cta ${variant === 'hero' ? 'btn-dark' : 'btn-cta'}`}
              >
                {nav.cta.label}
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
