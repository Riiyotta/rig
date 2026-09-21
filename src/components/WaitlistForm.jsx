// Shared WaitlistForm (spec §12 / Part 2 §P3.3), used by the homepage early-access
// section and the end-of-post CTA. No backend: submit validates, shows the
// spinner ~800ms, then the success view with a fake queue position and a
// referral link that copies to the clipboard.
//
// Props:
//   copy       strings (defaults to content.js earlyAccess: placeholder, button,
//              errorEmpty, errorInvalid, successHeading, successPosition,
//              referralLabel, copyLabel, dashboardLink)
//   className  extra classes on the .waitlist-form-wrapper root
//   formId     id for the <form> (the homepage keeps its original "waitlist-form")
import { useEffect, useRef, useState } from 'react'
import { earlyAccess } from '../content.js'
import InlineSvg from './InlineSvg.jsx'
import spinnerSvg from '../svg/form-spinner.svg?raw'
import successSvg from '../svg/form-success-icon.svg?raw'
import copySvg from '../svg/copy-icon.svg?raw'
import checkSvgRaw from '../svg/check-icon.svg?raw'
import '../styles/WaitlistForm.css'

// The extracted check icon carries `hidden`; visibility is React-controlled here.
const checkSvg = checkSvgRaw.replace(' hidden>', '>')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOADING_MS = 800

export default function WaitlistForm({ copy = earlyAccess, className = '', formId }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { position, link }
  const [copied, setCopied] = useState(false)
  const referralRef = useRef(null)

  // Loading -> success after LOADING_MS.
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => {
      const code = Math.random().toString(36).slice(2, 8).toUpperCase()
      setResult({
        position: 1000 + Math.floor(Math.random() * 4000),
        link: `${window.location.origin}/?rc=${code}`,
      })
      setLoading(false)
    }, LOADING_MS)
    return () => clearTimeout(t)
  }, [loading])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const onSubmit = (e) => {
    e.preventDefault()
    if (loading) return
    const value = email.trim()
    if (!value) return setError(copy.errorEmpty)
    if (!EMAIL_RE.test(value)) return setError(copy.errorInvalid)
    setError('')
    setLoading(true)
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.link)
    } catch {
      referralRef.current?.select()
      document.execCommand('copy')
    }
    setCopied(true)
  }

  return (
    <div className={`waitlist-form-wrapper${className ? ` ${className}` : ''}`}>
      {!result ? (
        <form className="waitlist-form" id={formId} noValidate onSubmit={onSubmit}>
          <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder={copy.placeholder}
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
              <span className="button-text">{copy.button}</span>
              <span className="button-loading" aria-hidden="true">
                <InlineSvg svg={spinnerSvg} />
              </span>
            </button>
          </div>
          <p className="form-error" role="alert" aria-live="polite">
            {error}
          </p>
          {/* Cloudflare Turnstile slot (3rd-party, not recreated — §18.11). */}
          <div className="turnstile-container" />
        </form>
      ) : (
        <div className="waitlist-success">
          <div className="success-icon">
            <InlineSvg svg={successSvg} />
          </div>
          <h4 className="success-heading">{copy.successHeading}</h4>
          <p className="success-position">
            {copy.successPosition}
            <span className="position-number">#{result.position}</span>
          </p>
          <div className="referral-section">
            <p className="referral-label">{copy.referralLabel}</p>
            <div className="referral-link-row">
              <input type="text" className="referral-link" readOnly value={result.link} ref={referralRef} onFocus={(e) => e.target.select()} />
              <button type="button" className="copy-button" aria-label={copy.copyLabel} onClick={onCopy}>
                <InlineSvg svg={copied ? checkSvg : copySvg} />
              </button>
            </div>
          </div>
          <a className="dashboard-link" href="/waitlist">
            {copy.dashboardLink}
          </a>
        </div>
      )}
    </div>
  )
}
