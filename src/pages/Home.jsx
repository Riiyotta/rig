// Homepage skeleton — CLONE_SPEC.md §0.8 / §0.10.
import Overlays from '../components/Overlays.jsx'
import Hero from '../components/Hero.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import Problem from '../components/Problem.jsx'
import Intro from '../components/Intro.jsx'
import Offline from '../components/Offline.jsx'
import ThreeCol from '../components/ThreeCol.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Capabilities from '../components/Capabilities.jsx'
import Stats from '../components/Stats.jsx'
import Terminal from '../components/Terminal.jsx'
import EarlyAccess from '../components/EarlyAccess.jsx'
import Faq from '../components/Faq.jsx'
import Cta from '../components/Cta.jsx'
import Footer from '../components/Footer.jsx'
import { useVisibilityClasses } from '../lib/visibility.js'

export default function Home() {
  useVisibilityClasses()

  return (
    <>
      <Overlays />
      <Hero />
      <div className="content-lines" />
      <main className="content">
        {/* 65px spacer; its divider sits on the bottom edge */}
        <div style={{ paddingBottom: '4rem' }}>
          <SectionDivider style={{ position: 'relative', top: '4rem' }} />
        </div>
        <Problem />
        <SectionDivider />
        <Intro />
        <SectionDivider />
        <Offline />
        <SectionDivider />
        <ThreeCol />
        {/* §7 double divider */}
        <SectionDivider />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <Capabilities />
        <SectionDivider />
        <Stats />
        <SectionDivider />
        <Terminal />
        <SectionDivider />
        <EarlyAccess />
        <SectionDivider />
        <Faq />
        <SectionDivider />
        <div style={{ paddingTop: '4rem' }}>
          <SectionDivider style={{ position: 'relative', top: '-4rem' }} />
        </div>
      </main>
      <Cta />
      <Footer />
    </>
  )
}
