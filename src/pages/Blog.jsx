// Blog index /blog — CLONE_SPEC.md Part 2 §P0 (shell) + §P1.
import Overlays from '../components/Overlays.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { blogCopy, posts, shortDate } from '../blog.js'
import '../styles/Blog.css'

// Newest first by date (§P1 "sorted newest first by datePublished").
const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))

export default function Blog() {
  return (
    <>
      <Overlays />
      <Navbar variant="default" />
      <section className="blog-section">
        <div className="container">
          <h1>{blogCopy.indexTitle}</h1>
          <ul className="blog-list" role="list">
            {sorted.map((p) => (
              <li key={p.slug}>
                <a className="blog-row" href={`/blog/${p.slug}`}>
                  <time dateTime={p.date}>{shortDate(p.date)}</time>
                  <div className="blog-row-text">
                    <h2>{p.title}</h2>
                    <p>{p.excerpt}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
    </>
  )
}
