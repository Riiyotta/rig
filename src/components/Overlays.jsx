// §0.6 fixed overlays + the #grainy filter the .noise layer references.
import grainFilter from '../svg/grain-filter.svg?raw'

export default function Overlays() {
  return (
    <>
      <div className="grain-defs" aria-hidden="true" dangerouslySetInnerHTML={{ __html: grainFilter }} />
      <div className="scanlines" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <div className="rgb-fringe" aria-hidden="true" />
    </>
  )
}
