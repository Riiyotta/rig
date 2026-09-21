// Minimal pushState router — no dependency. Same-origin <a href="/..."> clicks
// are intercepted globally, so components can keep plain anchors.
import { useEffect, useState } from 'react'

const listeners = new Set()

export function navigate(to) {
  const url = new URL(to, location.href)
  if (url.pathname === location.pathname && url.search === location.search && url.hash) {
    history.pushState(null, '', url)
    document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  history.pushState(null, '', url)
  listeners.forEach((fn) => fn())
}

export function usePath() {
  const [path, setPath] = useState(location.pathname)

  useEffect(() => {
    const update = () => setPath(location.pathname)
    listeners.add(update)
    window.addEventListener('popstate', update)

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest('a[href]')
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname && url.hash) return // native in-page anchor
      e.preventDefault()
      navigate(url.pathname + url.search + url.hash)
    }
    document.addEventListener('click', onClick)

    return () => {
      listeners.delete(update)
      window.removeEventListener('popstate', update)
      document.removeEventListener('click', onClick)
    }
  }, [])

  // New page: jump to its hash target, or the top.
  useEffect(() => {
    const id = location.hash.slice(1)
    const el = id && document.getElementById(id)
    if (el) el.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [path])

  return path.replace(/\/+$/, '') || '/'
}
