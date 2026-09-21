// Blog post template /blog/<slug> — CLONE_SPEC.md Part 2 §P0 (shell) + §P2.
// Posts are arrays of typed blocks (src/blog.js); unknown slugs render a
// "Post not found" state in the same article template with the back link.
import Overlays from '../components/Overlays.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import WaitlistForm from '../components/WaitlistForm.jsx'
import { blogCopy, getPost, longDate } from '../blog.js'
import '../styles/BlogPost.css'

// Inline markup: **strong**, *em*, [label](href). Nested inside em/strong is allowed.
const INLINE_RE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g
function inline(text) {
  const out = []
  let last = 0
  let m
  const re = new RegExp(INLINE_RE)
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const k = out.length
    if (m[1] != null) out.push(<strong key={k}>{inline(m[1])}</strong>)
    else if (m[2] != null) out.push(<em key={k}>{inline(m[2])}</em>)
    else out.push(<a key={k} href={m[4]}>{m[3]}</a>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2>{inline(block.text)}</h2>
    case 'h3':
      return <h3>{inline(block.text)}</h3>
    case 'h4':
      return <h4>{inline(block.text)}</h4>
    case 'ul':
    case 'ol': {
      const List = block.type
      return (
        <List>
          {block.items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </List>
      )
    }
    case 'blockquote':
      return <blockquote>{inline(block.text)}</blockquote>
    case 'code':
      return (
        <pre>
          <code>{block.code}</code>
        </pre>
      )
    case 'hr':
      return <hr />
    case 'figure':
      // §P2.4 image block: the origin's rigd-flow PNGs all 502, so this is a
      // neutral placeholder box at the per-breakpoint size of the source the
      // original <picture> would select.
      return (
        <div className="prose-diagram" role="img" aria-label={block.alt}>
          <span className="prose-diagram-caption">{blogCopy.diagramCaption}</span>
        </div>
      )
    default:
      return <p>{inline(block.text)}</p>
  }
}

const BackArrow = () => (
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M 6 12 L 8 12 L 8 14 L 18 14 L 18 4 L 20 4 L 20 16 L 8 16 L 8 18 L 6 18 L 6 16 L 4 16 L 4 14 L 6 14 Z M 8 10 L 10 10 L 10 12 L 8 12 Z M 8 18 L 10 18 L 10 20 L 8 20 Z" />
  </svg>
)

export default function BlogPost({ slug }) {
  const post = getPost(slug)

  return (
    <>
      <Overlays />
      <Navbar variant="default" />
      <article className="blog-post">
        <header className="blog-post-header">
          <h1>{post ? post.title : blogCopy.notFoundTitle}</h1>
          {post && (
            <div className="blog-post-meta">
              <address className="blog-post-author">
                {blogCopy.byPrefix} {post.author}
              </address>
              <time dateTime={post.date}>{longDate(post.date)}</time>
            </div>
          )}
        </header>
        <div className="blog-post-content prose">
          {post ? (
            <>
              <p className="excerpt">{post.excerpt}</p>
              <div>
                <div className="payload-richtext">
                  {post.blocks.map((b, i) => (
                    <Block key={i} block={b} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p>{blogCopy.notFoundBody}</p>
          )}
        </div>
        <footer>
          <a href="/blog">
            <BackArrow /> {blogCopy.backLabel}
          </a>
        </footer>
      </article>
      {post && (
        <aside className="cta blog-cta">
          <h3 className="cta-title">{blogCopy.cta.title}</h3>
          {blogCopy.cta.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
          <WaitlistForm />
        </aside>
      )}
      <Footer />
    </>
  )
}
