// Route table. Pages live in src/pages; unknown paths fall back to the blog
// post template (for /blog/<slug>) or the homepage.
import { usePath } from './lib/router.jsx'
import Home from './pages/Home.jsx'
import Blog from './pages/Blog.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Waitlist from './pages/Waitlist.jsx'
import Legal from './pages/Legal.jsx'

export default function App() {
  const path = usePath()

  if (path === '/blog') return <Blog />
  if (path.startsWith('/blog/')) return <BlogPost slug={path.slice('/blog/'.length)} />
  if (path === '/waitlist') return <Waitlist />
  if (path === '/privacy') return <Legal doc="privacy" />
  if (path === '/terms') return <Legal doc="terms" />
  return <Home />
}
