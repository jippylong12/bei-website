import { useEffect, useMemo, useRef, useState } from 'react';
import { geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { MAP_HEIGHT, MAP_WIDTH, TAG_SIZE, pinRadius, pinsFor, placesOf, tagsFor } from './speakerPlaces';
import styles from './Faculty.module.css';

// The Portal's speakers on a map (/faculty/portal?tab=speakers&view=map): a
// map of the United States with a gold pin for each place, as big as the
// number of speakers there (a plain dot is one speaker; a bigger pin carries
// its number), the names of the bigger places beside their pins, and beside
// the map a panel listing every place. Choosing a place, by its pin or in the
// panel, lists its speakers in the panel; "All places" goes back. Pointing at
// a place in the panel lights its pin, and pointing at a pin lights its row.
// The search and area filter above (People.jsx) apply here as in the list.
//
// Where each place is comes from the backend: every speaker arrives with the
// `lat` and `lon` of their `location` (places.csv beside the speaker list, in
// the btc_rag project; see docs/FACULTY.md there), so this public repository
// holds none of it. A place outside the United States (London) is not on the
// map but is in the panel and in the note under the map, as are the speakers
// whose place is not known.
//
// Portal.jsx loads this file only when the map is opened, so d3-geo and the
// state outlines (us-atlas, about 80 KB) stay out of the site's bundle.
//
// The pins are for the mouse; the panel is the way in by keyboard and screen
// reader (the map is one image to them), and holds everything the map shows.

const UNKNOWN = 'Place not known';
const placeLabel = (place) => place.name || UNKNOWN;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const namesOf = (pin) => pin.places.map((place) => place.name);

// The pins drawn in the key under the map: one speaker, five, ten.
const KEY = [1, 5, 10];

// The state outlines as two SVG paths, made once and kept for the visit.
let outlines;
function loadOutlines() {
  outlines ??= import('us-atlas/states-albers-10m.json')
    .then(({ default: us }) => {
      const path = geoPath(); // already projected: no projection here
      return {
        nation: path(feature(us, us.objects.nation)),
        borders: path(mesh(us, us.objects.states, (a, b) => a !== b)),
      };
    })
    .catch((error) => {
      outlines = undefined; // the next visit to the map tries again
      throw error;
    });
  return outlines;
}

// How wide `ref` is drawn, in pixels, followed as the window changes. Before
// it is measured (and in tests, which have no layout) it is the map's own width.
function useWidth(ref) {
  const [width, setWidth] = useState(MAP_WIDTH);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// Scroll so that `element` is just under the site's menu, if it is out of view.
// What is on screen is the visual viewport: on a phone innerHeight can be
// taller than the screen.
function bringIntoView(element) {
  if (!element) return;
  const top = element.getBoundingClientRect().top;
  const menuBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
  const screenHeight = window.visualViewport?.height ?? window.innerHeight;
  if (top >= menuBottom && top <= screenHeight - 96) return;
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: window.scrollY + top - menuBottom - 16, behavior: still ? 'auto' : 'smooth' });
}

export default function SpeakerMap({ people }) {
  const svg = useRef(null);
  const panel = useRef(null);
  const scroller = useRef(null);
  const heading = useRef(null);
  const moved = useRef(false);
  const [land, setLand] = useState(null); // { nation, borders } | 'failed'
  const [chosen, setChosen] = useState(null); // names of the places open in the panel
  const [pointed, setPointed] = useState(null); // names of the places pointed at (a pin, or a row)

  const scale = useWidth(svg) / MAP_WIDTH; // screen pixels per map unit
  const places = useMemo(() => placesOf(people), [people]);
  const pins = useMemo(() => pinsFor(places, scale), [places, scale]);
  const tags = useMemo(() => tagsFor(pins, scale), [pins, scale]);
  const offMap = places.filter((place) => !place.at);
  const most = Math.max(1, ...places.map((place) => place.people.length));

  // The places open in the panel. A search or filter can leave none of them;
  // the panel then shows every place again.
  const open = chosen ? places.filter((place) => chosen.includes(place.name)) : [];

  useEffect(() => {
    let live = true;
    loadOutlines().then(
      (paths) => live && setLand(paths),
      () => live && setLand('failed'),
    );
    return () => {
      live = false;
    };
  }, []);

  // After choosing, the panel shows its new top, its heading takes the
  // keyboard focus, and the page scrolls to the panel if it is out of view
  // (on a phone, the panel is under the map).
  useEffect(() => {
    if (!moved.current) return;
    if (scroller.current) scroller.current.scrollTop = 0;
    heading.current?.focus({ preventScroll: true });
    bringIntoView(panel.current);
  }, [chosen]);

  const choose = (names) => {
    moved.current = true;
    setPointed(null); // what was pointed at may be gone from the panel now
    setChosen(names);
  };
  const point = (names) => ({
    onMouseEnter: () => setPointed(names),
    onMouseLeave: () => setPointed(null),
  });

  const isOpen = (pin) => pin.places.some((place) => open.includes(place));
  const isPointed = (pin) => Boolean(pointed) && namesOf(pin).some((name) => pointed.includes(name));
  const openPin = pins.find(isOpen);
  const pointedPin = pins.find(isPointed);

  // The pin pointed at, or else the open one, is named in white. A name that
  // is already beside the pin just lights up where it is. Any other goes
  // above the pin, or below it when the pin is too near the top of the map for
  // room above; near the left or right edge it runs inwards from the pin, so
  // a long name stays on the map.
  const named = pointedPin ?? openPin;
  const label = named && {
    text: named.places
      .filter((place) => (pointedPin ? pointed.includes(place.name) : open.includes(place)))
      .map(placeLabel)
      .join(' · '),
  };
  const tag = label && tags.find((t) => t.pin === named && t.text === label.text);
  if (tag) {
    Object.assign(label, { x: tag.x, y: tag.y, anchor: tag.anchor, dy: '0.35em' });
  } else if (label) {
    label.anchor = named.x < MAP_WIDTH / 4 ? 'start' : named.x > (MAP_WIDTH * 3) / 4 ? 'end' : 'middle';
    label.x = named.x + { start: -named.r, middle: 0, end: named.r }[label.anchor];
    const above = named.y - named.r - 8 / scale;
    label.y = above > 16 / scale ? above : named.y + named.r + 18 / scale;
  }

  return (
    <div className={styles.mapView}>
      <figure className={styles.mapFigure}>
        <svg
          ref={svg}
          className={`${styles.mapSvg} ${open.length > 0 ? styles.mapFocused : ''}`}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label={`Map of the United States with the speakers' places: ${plural(pins.length, 'pin', 'pins')}. Every place is listed beside the map.`}
        >
          {land && land !== 'failed' && (
            <g className={styles.land}>
              <path className={styles.nation} d={land.nation} />
              <path className={styles.borders} d={land.borders} />
            </g>
          )}
          {pins.map((pin, order) => {
            const names = pin.places.map(placeLabel).join(' · ');
            const classes = [styles.pin, isOpen(pin) && styles.pinOpen, isPointed(pin) && styles.pinPointed];
            return (
              <g
                key={names}
                className={classes.filter(Boolean).join(' ')}
                transform={`translate(${pin.x} ${pin.y})`}
                data-places={names}
                onClick={() => choose(namesOf(pin))}
                {...point(namesOf(pin))}
              >
                <title>{`${names}: ${plural(pin.count, 'speaker', 'speakers')}`}</title>
                <g className={styles.pinMark} style={{ '--order': order }}>
                  <circle r={pin.r} />
                  {pin.count > 1 && (
                    <text dy="0.35em" fontSize={11 / scale}>
                      {pin.count}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
          {tags
            .filter((tag) => tag.pin !== named)
            .map((tag) => (
              <text
                key={tag.text}
                className={styles.placeTag}
                x={tag.x}
                y={tag.y}
                dy="0.35em"
                textAnchor={tag.anchor}
                fontSize={TAG_SIZE / scale}
                strokeWidth={3 / scale}
              >
                {tag.text}
              </text>
            ))}
          {/* Last, so it is over every pin and name. */}
          {label && (
            <text
              className={styles.pinLabel}
              x={label.x}
              y={label.y}
              dy={label.dy}
              textAnchor={label.anchor}
              fontSize={(tag ? TAG_SIZE : 13) / scale}
              strokeWidth={4 / scale}
            >
              {label.text}
            </text>
          )}
        </svg>
        <figcaption className={styles.mapFoot}>
          <MapKey />
          {(offMap.length > 0 || land === 'failed') && (
            <p className={styles.mapNote}>
              {land === 'failed' && <span>The state outlines could not be loaded. </span>}
              {offMap.length > 0 && (
                <>
                  Not on the map:{' '}
                  {offMap.map((place, i) => (
                    <span key={place.name}>
                      {i > 0 && ' · '}
                      <button className={styles.linkButton} type="button" onClick={() => choose([place.name])}>
                        {placeLabel(place)}
                      </button>{' '}
                      ({place.people.length})
                    </span>
                  ))}
                </>
              )}
            </p>
          )}
        </figcaption>
      </figure>

      <div className={styles.mapPanel} ref={panel}>
        <div className={styles.mapPanelBody}>
          {open.length === 0 ? (
            <>
              <div className={styles.mapPanelHead}>
                <h2 className={styles.mapHeading} ref={heading} tabIndex={-1}>
                  {plural(places.filter((place) => place.name).length, 'place', 'places')}
                </h2>
                <p className={styles.mapCount}>Choose one, here or on the map, to see its speakers.</p>
              </div>
              <ul className={`${styles.placeList} ${styles.mapScroll}`} ref={scroller}>
                {places.map((place) => (
                  <li key={place.name}>
                    <button
                      className={`${styles.placeButton} ${pointed?.includes(place.name) ? styles.placeLit : ''}`}
                      type="button"
                      aria-label={`${placeLabel(place)}: ${plural(place.people.length, 'speaker', 'speakers')}`}
                      onClick={() => choose([place.name])}
                      onFocus={() => setPointed([place.name])}
                      onBlur={() => setPointed(null)}
                      {...point([place.name])}
                    >
                      <span className={place.name ? '' : styles.placeUnknown}>{placeLabel(place)}</span>{' '}
                      <span className={styles.placeCount}>{place.people.length}</span>
                      <span
                        className={styles.placeBar}
                        style={{ '--share': place.people.length / most }}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <PlaceSpeakers open={open} heading={heading} scroller={scroller} onBack={() => choose(null)} />
          )}
        </div>
      </div>
    </div>
  );
}

// The key under the map: pins for one, five and ten speakers, drawn as on the
// map. The panel says every number in words, so screen readers skip it.
function MapKey() {
  const GAP = 10;
  const radii = KEY.map(pinRadius);
  const height = 2 * radii.at(-1) + 2;
  // Each pin's middle: past the pins before it, with a gap after each.
  const keyPins = KEY.map((count, i) => ({
    count,
    r: radii[i],
    cx: 1 + radii.slice(0, i).reduce((sum, r) => sum + 2 * r + GAP, 0) + radii[i],
  }));
  const width = keyPins.at(-1).cx + radii.at(-1) + 1;
  return (
    <div className={styles.mapKey} aria-hidden="true">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {keyPins.map(({ count, cx, r }) => (
          <g key={count} className={styles.keyPin} transform={`translate(${cx} ${height / 2})`}>
            <circle r={r} />
            {count > 1 && (
              <text dy="0.35em" fontSize={11}>
                {count}
              </text>
            )}
          </g>
        ))}
      </svg>
      <span>Speakers per place; a dot is one</span>
    </div>
  );
}

// The speakers of the places open in the panel, a group per place when a pin
// stands for more than one.
function PlaceSpeakers({ open, heading, scroller, onBack }) {
  const total = open.reduce((n, place) => n + place.people.length, 0);
  const grouped = open.length > 1;
  const Name = grouped ? 'h4' : 'h3';

  return (
    <>
      <div className={styles.mapPanelHead}>
        <button className={`${styles.linkButton} ${styles.mapBack}`} type="button" onClick={onBack}>
          All places
        </button>
        <h2 className={styles.mapHeading} ref={heading} tabIndex={-1}>
          {open.map(placeLabel).join(' · ')}
        </h2>
        <p className={styles.mapCount}>{plural(total, 'speaker', 'speakers')}</p>
      </div>
      <div className={styles.mapScroll} ref={scroller}>
        {open.map((place) => (
          <div key={place.name} className={styles.placeGroup}>
            {grouped && (
              <h3 className={styles.placeSub}>
                {placeLabel(place)} <span className={styles.placeCount}>{place.people.length}</span>
              </h3>
            )}
            <ul className={styles.mapPeople}>
              {place.people.map((person, i) => {
                const role = [person.title, person.affiliation].filter(Boolean).join(', ');
                const more = [person.area, person.class_speaker && `Class speaker: ${person.class_speaker}`]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <li key={i}>
                    <Name className={styles.mapName}>
                      {person.first_name} {person.last_name}
                    </Name>
                    {role && <p className={styles.role}>{role}</p>}
                    {more && <p className={styles.mapMore}>{more}</p>}
                    {person.email && (
                      <a className={styles.email} href={`mailto:${person.email}`}>
                        {person.email}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
