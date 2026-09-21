// /privacy and /terms — CLONE_SPEC.md Part 2 §P4 (one template: main.payload-page).
// Renders the typed blocks from src/legal.js into the shared .prose column.
import { Fragment } from 'react'
import { legal } from '../legal.js'
import Overlays from '../components/Overlays.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import '../styles/Legal.css'

function Inline({ content }) {
  if (typeof content === 'string') return content
  return content.map((run, i) => {
    if (typeof run === 'string') return <Fragment key={i}>{run}</Fragment>
    if (run.br) return <br key={i} />
    if (run.b) return <strong key={i}>{run.b}</strong>
    if (run.u) return <span key={i} style={{ textDecoration: 'underline' }}>{run.u}</span>
    if (run.a)
      return (
        <a key={i} href={run.href}>
          <span style={{ textDecoration: 'underline' }}>{run.a}</span>
        </a>
      )
    return null
  })
}

// Numbered items; a `sub` list becomes a following marker-less <li> that
// wraps the nested <ol> (the CMS markup the original ships).
function OlItems({ items }) {
  return items.map((item, i) => (
    <Fragment key={i}>
      {!item.nestedOnly && (
        <li value={item.value}>
          <Inline content={item.content} />
        </li>
      )}
      {item.sub && (
        <li className="nestedListItem" style={{ listStyleType: 'none' }}>
          <ol className="list-number">
            <OlItems items={item.sub} />
          </ol>
        </li>
      )}
    </Fragment>
  ))
}

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return (
        <p style={block.align ? { textAlign: block.align } : undefined}>
          <Inline content={block.content} />
        </p>
      )
    case 'ul':
      return (
        <ul className="list-bullet">
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline content={item} />
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="list-number">
          <OlItems items={block.items} />
        </ol>
      )
    default:
      return null
  }
}

export default function Legal({ doc }) {
  const { title, blocks } = legal[doc] || legal.privacy

  return (
    <>
      <Overlays />
      <Navbar variant="default" />
      <main className="payload-page">
        <header className="page-hero">
          <div className="page-hero-copy">
            <h1>{title}</h1>
          </div>
        </header>
        <div className="page-layout">
          <section className="content-block prose">
            {blocks.map((block, i) => (
              <Block key={`${doc}-${i}`} block={block} />
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
