import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Maps.module.css';

// Bitcoin Classes Worldwide: who teaches Bitcoin where, from the BEI 2026 and 2027
// conference forms. The map is its own page in public/maps-app/ (generated on Tiger by
// ~/projects/bitcoin_corpus/teaching_talks/export_static.py, public copy: no form answers or
// syllabus links) with bei.css for the site's look. It is framed here so it keeps the site
// header without bringing its D3 code into the React bundle.
//
// To update it: on Tiger run `python3 export_static.py /tmp/maps-export --css bei.css`,
// copy the four files into public/maps-app/, then commit and push.
const MAP_URL = `${import.meta.env.BASE_URL}maps-app/index.html`;

// Height used until the map page is ready and has been measured.
const INITIAL_HEIGHT = 1600;

// The map page arrives the way the site's other pages do: its title rises in, and the rest
// rises in once its data is there (see "Arrival" in the map page's styles). Until then that
// rest is hidden but shorter than it will be, so the frame keeps INITIAL_HEIGHT and fits to
// the page only when the page marks <body> "ready" and says "mapready": the footer moves once,
// not up and then down again.

export default function Maps() {
  const frameRef = useRef(null);
  const observerRef = useRef(null);
  const [height, setHeight] = useState(INITIAL_HEIGHT);

  // The frame is as tall as the map page, so the browser window does the only scrolling.
  // Same origin, so the frame's document can be measured directly.
  const fitToContent = useCallback(() => {
    const body = frameRef.current?.contentDocument?.body;
    if (!body) return;
    const style = body.ownerDocument.defaultView.getComputedStyle(body);
    const margins = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    setHeight(Math.ceil(body.scrollHeight + margins));
  }, []);

  const handleLoad = useCallback(() => {
    observerRef.current?.disconnect();
    const frame = frameRef.current;
    const body = frame?.contentDocument?.body;
    if (!body) return;
    const follow = () => {
      fitToContent();
      // From then on the map page changes height as people filter or select.
      observerRef.current = new ResizeObserver(fitToContent);
      observerRef.current.observe(body);
    };
    if (body.classList.contains('ready')) follow();
    else frame.contentWindow.addEventListener('mapready', follow, { once: true });
  }, [fitToContent]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <section className={styles.wrap}>
      <iframe
        ref={frameRef}
        className={styles.frame}
        src={MAP_URL}
        title="Bitcoin Classes Worldwide: map of educators who teach Bitcoin"
        style={{ height }}
        onLoad={handleLoad}
      />
    </section>
  );
}
