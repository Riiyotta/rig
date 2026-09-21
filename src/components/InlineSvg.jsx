// Renders a raw SVG string (imported with `?raw`) without a wrapper box:
// the <span> uses display:contents, so the <svg> itself is the layout child
// (flex item, absolutely positioned element, etc.) and SMIL keeps running.
export default function InlineSvg({ svg, ...rest }) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} {...rest} />
}
