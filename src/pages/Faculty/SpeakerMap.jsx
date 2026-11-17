import { useEffect, useMemo, useRef, useState } from 'react';
import { geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { MAP_HEIGHT, MAP_WIDTH, pinsFor, placesOf } from './speakerPlaces';
import styles from './Faculty.module.css';

// The Portal's speakers on a map (/faculty/portal?tab=speakers&view=map): a
// map of the United States with a gold pin for each place, as big as the
// number of speakers there, and beside it a panel listing every place. Choosing
// a place, by its pin or in the panel, lists its speakers in the panel; "All
// places" goes back. The search and area filter above (People.jsx) apply here
// as in the list.
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
  const heading = useRef(null);
  const moved = useRef(false);
  const [land, setLand] = useState(null); // { nation, borders } | 'failed'
  const [chosen, setChosen] = useState(null); // names of the places open in the panel

  const scale = useWidth(svg) / MAP_WIDTH; // screen pixels per map unit
  const places = useMemo(() => placesOf(people), [people]);
  const pins = useMemo(() => pinsFor(places, scale), [places, scale]);
  const offMap = places.filter((place) => !place.at);

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

  // After choosing, the panel's new heading takes the keyboard focus, and the
  // page scrolls to the top of the panel ("All places" and the heading) if it
  // is out of view (on a phone, the panel is under the map).
  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus({ preventScroll: true });
    bringIntoView(panel.current);
  }, [chosen]);

  const choose = (names) => {
    moved.current = true;
    setChosen(names);
  };

  const isOpen = (pin) => pin.places.some((place) => open.includes(place));
  const openPin = pins.find(isOpen);
  // The open pin's name goes above it, or below it when the pin is too near
  // the top of the map for room above. Near the left or right edge it runs
  // inwards from the pin, so a long name stays on the map.
  const label = openPin && {
    anchor: openPin.x < MAP_WIDTH / 4 ? 'start' : openPin.x > (MAP_WIDTH * 3) / 4 ? 'end' : 'middle',
    above: openPin.y - openPin.r - 8 / scale,
  };
  if (label) {
    label.x = openPin.x + { start: -openPin.r, middle: 0, end: openPin.r }[label.anchor];
    label.y = label.above > 16 / scale ? label.above : openPin.y + openPin.r + 18 / scale;
  }

  return (
    <div className={styles.mapView}>
      <figure className={styles.mapFigure}>
        <svg
          ref={svg}
          className={styles.mapSvg}
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
          {pins.map((pin) => {
            const names = pin.places.map(placeLabel).join(' · ');
            return (
              <g
                key={names}
                className={`${styles.pin} ${isOpen(pin) ? styles.pinOpen : ''}`}
                transform={`translate(${pin.x} ${pin.y})`}
                data-places={names}
                onClick={() => choose(pin.places.map((place) => place.name))}
              >
                <title>{`${names}: ${plural(pin.count, 'speaker', 'speakers')}`}</title>
                <circle r={pin.r} />
                <text dy="0.35em" fontSize={11 / scale}>
                  {pin.count}
                </text>
              </g>
            );
          })}
          {/* Last, so it is over every pin. */}
          {openPin && (
            <text
              className={styles.pinLabel}
              x={label.x}
              y={label.y}
              textAnchor={label.anchor}
              fontSize={13 / scale}
              strokeWidth={4 / scale}
            >
              {openPin.places.filter((place) => open.includes(place)).map(placeLabel).join(' · ')}
            </text>
          )}
        </svg>
        {(offMap.length > 0 || land === 'failed') && (
          <figcaption className={styles.mapNote}>
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
          </figcaption>
        )}
      </figure>

      <div className={styles.mapPanel} ref={panel}>
        {open.length === 0 ? (
          <>
            <h2 className={styles.mapHeading} ref={heading} tabIndex={-1}>
              {plural(places.filter((place) => place.name).length, 'place', 'places')}
            </h2>
            <ul className={styles.placeList}>
              {places.map((place) => (
                <li key={place.name}>
                  <button
                    className={styles.placeButton}
                    type="button"
                    aria-label={`${placeLabel(place)}: ${plural(place.people.length, 'speaker', 'speakers')}`}
                    onClick={() => choose([place.name])}
                  >
                    <span className={place.name ? '' : styles.placeUnknown}>{placeLabel(place)}</span>{' '}
                    <span className={styles.placeCount}>{place.people.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <PlaceSpeakers open={open} heading={heading} onBack={() => choose(null)} />
        )}
      </div>
    </div>
  );
}

// The speakers of the places open in the panel, a group per place when a pin
// stands for more than one.
function PlaceSpeakers({ open, heading, onBack }) {
  const total = open.reduce((n, place) => n + place.people.length, 0);
  const grouped = open.length > 1;
  const Name = grouped ? 'h4' : 'h3';

  return (
    <>
      <button className={`${styles.linkButton} ${styles.mapBack}`} type="button" onClick={onBack}>
        All places
      </button>
      <h2 className={styles.mapHeading} ref={heading} tabIndex={-1}>
        {open.map(placeLabel).join(' · ')}
      </h2>
      <p className={styles.mapCount}>{plural(total, 'speaker', 'speakers')}</p>
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
                  {more && <p className={styles.role}>{more}</p>}
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
    </>
  );
}
