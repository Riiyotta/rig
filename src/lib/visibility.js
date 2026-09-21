// §0.9 — toggles .is-visible on every section / .hero / footer so CSS can
// pause off-screen animations (`:not(.is-visible) … {animation-play-state:paused}`).
// Called once from App.jsx after all sections have mounted.
import { useEffect } from 'react'

export function useVisibilityClasses() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle('is-visible', e.isIntersecting)
      },
      { threshold: 0, rootMargin: '200px 0px' },
    )
    document.querySelectorAll('section, .hero, footer').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
