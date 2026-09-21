// /waitlist — CLONE_SPEC.md Part 2 §P3. Two sibling views: the signup form and
// the dashboard (loading / error / success). No backend: the entry lives in
// localStorage under STORAGE_KEY.
//   - signup            -> button spinner, then dashboard success (createdAt = now)
//   - load with entry   -> dashboard loading, then success
//   - ?cid=CODE         -> dashboard loading, then success if CODE matches the
//                          stored entry, otherwise the error state
//   - ?reset            -> clears the entry, shows the form
//   - ?dev              -> shows the dev reset button (hidden in production, §P3.4)
import { useEffect, useRef, useState } from 'react'
import { waitlistPage as copy } from '../content.js'
import Overlays from '../components/Overlays.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Badge from '../components/Badge.jsx'
import InlineSvg from '../components/InlineSvg.jsx'
import { useVisibilityClasses } from '../lib/visibility.js'
import spinnerSvg from '../svg/form-spinner.svg?raw'
import copySvg from '../svg/copy-icon.svg?raw'
import checkSvgRaw from '../svg/check-icon.svg?raw'
import featureCheckSvg from '../svg/feature-check.svg?raw'
import errorSvg from '../svg/error-alert.svg?raw'
import xLogoSvg from '../svg/x-logo.svg?raw'
import linkedinSvg from '../svg/linkedin-logo.svg?raw'
import '../styles/Waitlist.css'

const STORAGE_KEY = 'rig-clone-waitlist'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SIGNUP_MS = 800
const LOOKUP_MS = 600
const SAVE_MS = 600

// The extracted check icon carries `hidden`; visibility is React-controlled here.
const checkSvg = checkSvgRaw.replace(' hidden>', '>')

function readEntry() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}
function writeEntry(entry) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

// Initial view from the URL + storage. 'form' | 'loading'
function initialState() {
  const params = new URLSearchParams(location.search)
  if (params.has('reset')) {
    localStorage.removeItem(STORAGE_KEY)
    return { view: 'form', cid: null }
  }
  const cid = params.get('cid')
  if (cid || readEntry()) return { view: 'loading', cid }
  return { view: 'form', cid: null }
}

export default function Waitlist() {
  useVisibilityClasses()
  const [{ view: initialView, cid }] = useState(initialState)
  const [view, setView] = useState(initialView) // form | loading | error | success
  const [entry, setEntry] = useState(null)
  const dev = new URLSearchParams(location.search).has('dev')

  // Fake entry lookup.
  useEffect(() => {
    if (view !== 'loading') return
    const t = setTimeout(() => {
      const stored = readEntry()
      if (stored && (!cid || cid === stored.referralCode)) {
        setEntry(stored)
        setView('success')
      } else {
        setView('error')
      }
    }, LOOKUP_MS)
    return () => clearTimeout(t)
  }, [view, cid])

  const onSignup = (email) => {
    const next = {
      email,
      position: 1000 + Math.floor(Math.random() * 4000),
      referralCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      referralCount: 0,
      joinedAt: new Date().toISOString(),
    }
    writeEntry(next)
    setEntry(next)
    setView('success')
  }

  const onReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setEntry(null)
    setView('form')
    const params = new URLSearchParams(location.search)
    params.delete('cid')
    const q = params.toString().replace(/=(?=&|$)/g, '') // keep bare flags like ?dev
    history.replaceState(null, '', location.pathname + (q ? `?${q}` : ''))
  }

  return (
    <>
      <Overlays />
      <Navbar variant="default" showCta={false} />
      <section className="waitlist-page" data-dev={dev ? 'true' : undefined}>
        <div className="wl-container">
          {view === 'form' ? (
            <FormView onSignup={onSignup} />
          ) : (
            <div className="dashboard-content" id="waitlist-dashboard-view">
              {view === 'loading' && (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>{copy.loading}</p>
                </div>
              )}
              {view === 'error' && (
                <div className="error-state">
                  <div className="error-icon">
                    <InlineSvg svg={errorSvg} />
                  </div>
                  <h1 className="error-heading">{copy.error.heading}</h1>
                  <p className="error-message">{copy.error.message}</p>
                </div>
              )}
              {view === 'success' && entry && (
                <Dashboard entry={entry} onEntryChange={setEntry} dev={dev} onReset={onReset} />
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}

/* ---- Form view (§P3.2 + §P3.3) ------------------------------------------ */
function FormView({ onSignup }) {
  const c = copy.form
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => onSignup(email.trim()), SIGNUP_MS)
    return () => clearTimeout(t)
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e) => {
    e.preventDefault()
    if (loading) return
    const value = email.trim()
    if (!value) return setError(c.errorEmpty)
    if (!EMAIL_RE.test(value)) return setError(c.errorInvalid)
    setError('')
    setLoading(true)
  }

  return (
    <div className="waitlist-content" id="waitlist-form-view">
      <Badge icon="early-access" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
        {c.badge}
      </Badge>
      <h1 className="page-heading">{c.heading}</h1>
      <p className="page-description">{c.description}</p>

      <div className="waitlist-container">
        <div className="waitlist-form-wrapper form-centered">
          <form className="waitlist-form" noValidate onSubmit={onSubmit}>
            <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="form-row">
              <input
                type="email"
                name="email"
                placeholder={c.placeholder}
                required
                className="email-input"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                aria-invalid={error ? 'true' : undefined}
              />
              <button type="submit" className="submit-button btn-chamfer" disabled={loading} data-loading={loading ? 'true' : 'false'}>
                <span className="button-text">{c.button}</span>
                <span className="button-loading" aria-hidden="true">
                  <InlineSvg svg={spinnerSvg} />
                </span>
              </button>
            </div>
            <p className="form-error" role="alert" aria-live="polite">
              {error}
            </p>
            {/* Cloudflare Turnstile slot: not cloned, empty 0-height div (§P7.5). */}
            <div className="turnstile-container" />
          </form>
        </div>
      </div>

      <div className="features-preview">
        <h2 className="features-heading">{c.featuresHeading}</h2>
        <ul className="features-list">
          {c.features.map((f) => (
            <li className="feature-item" key={f}>
              <InlineSvg svg={featureCheckSvg} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---- Dashboard success (§P3.4) ------------------------------------------ */
function Dashboard({ entry, onEntryChange, dev, onReset }) {
  const d = copy.dashboard
  const link = `${location.origin}/?rc=${entry.referralCode}`
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(d.referral.shareText)}&url=${encodeURIComponent(link)}`
  const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${d.referral.shareText} ${link}`)}`

  return (
    <div className="success-state">
      <div className="dashboard-header">
        <div className="status-badge">
          <span className="badge-dot" />
          {d.badge}
        </div>
        <h1 className="dashboard-heading">{d.heading}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">{d.positionLabel}</span>
          <span className="stat-value">#{entry.position}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{d.referralsLabel}</span>
          <span className="stat-value">{entry.referralCount}</span>
        </div>
      </div>

      <div className="card">
        <h2 className="referral-heading card-title">{d.giveaway.heading}</h2>
        <div className="card-body">
          {d.giveaway.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      <HardwareSurvey entry={entry} onEntryChange={onEntryChange} />

      <div className="referral-section">
        <h2 className="referral-heading">{d.referral.heading}</h2>
        <p className="referral-description">{d.referral.description}</p>
        <div className="referral-link-container">
          <label htmlFor="referral-link" className="referral-link-label">
            {d.referral.linkLabel}
          </label>
          <div className="referral-link-row">
            <CopyField value={link} label={d.referral.copyLabel} />
          </div>
        </div>
        <div className="share-buttons">
          <a href={shareUrl} className="share-button share-twitter" target="_blank" rel="noopener">
            <InlineSvg svg={xLogoSvg} />
            {d.referral.shareX}
          </a>
          <a href={linkedinUrl} className="share-button share-linkedin" target="_blank" rel="noopener">
            <InlineSvg svg={linkedinSvg} />
            {d.referral.shareLinkedIn}
          </a>
        </div>
      </div>

      <p className="joined-date">
        {d.joined}
        <span id="joined-date">{formatDate(entry.joinedAt)}</span>
      </p>

      {dev && (
        <button type="button" className="dev-reset-button" onClick={onReset}>
          {d.devReset}
        </button>
      )}
    </div>
  )
}

function CopyField({ value, label }) {
  const inputRef = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      inputRef.current?.select()
      document.execCommand('copy')
    }
    setCopied(true)
  }

  return (
    <>
      <input
        type="text"
        id="referral-link"
        className="referral-link-input"
        readOnly
        value={value}
        ref={inputRef}
        onFocus={(e) => e.target.select()}
      />
      <button type="button" className="copy-button" id="copy-button" aria-label={label} onClick={onCopy}>
        <InlineSvg svg={copied ? checkSvg : copySvg} />
      </button>
    </>
  )
}

function HardwareSurvey({ entry, onEntryChange }) {
  const s = copy.dashboard.survey
  const saved = entry.hardware || { chip: '', ram: '' }
  const [chip, setChip] = useState(saved.chip)
  const [ram, setRam] = useState(saved.ram)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const dirty = chip !== saved.chip || ram !== saved.ram

  useEffect(() => {
    if (!saving) return
    const t = setTimeout(() => {
      const next = { ...entry, hardware: { chip, ram } }
      writeEntry(next)
      onEntryChange(next)
      setSaving(false)
      setDone(true)
    }, SAVE_MS)
    return () => clearTimeout(t)
  }, [saving]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e) => {
    e.preventDefault()
    if (!dirty || saving) return
    setSaving(true)
  }
  const change = (setter) => (e) => {
    setter(e.target.value)
    setDone(false)
  }

  return (
    <div className="hw-survey" id="hw-survey">
      <h2 className="hw-heading">{s.heading}</h2>
      <p className="hw-description">{s.description}</p>
      <form className="hw-form" onSubmit={onSubmit}>
        <div className="hw-field">
          <label htmlFor="hw-mchip" className="hw-label">
            {s.chipLabel}
          </label>
          <select id="hw-mchip" name="hw-mchip" className="hw-input" value={chip} onChange={change(setChip)}>
            <option value="">{s.chipPlaceholder}</option>
            {s.chipOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="hw-field">
          <label htmlFor="hw-ram" className="hw-label">
            {s.ramLabel}
          </label>
          <select id="hw-ram" name="hw-ram" className="hw-input" value={ram} onChange={change(setRam)}>
            <option value="">{s.ramPlaceholder}</option>
            {s.ramOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="hw-actions">
          <button type="submit" className="hw-submit" disabled={!dirty || saving}>
            {saving ? <span className="hw-submit-loading">{s.saving}</span> : <span className="hw-submit-text">{s.submit}</span>}
          </button>
          {done && <span className="hw-success">{s.saved}</span>}
        </div>
      </form>
    </div>
  )
}
