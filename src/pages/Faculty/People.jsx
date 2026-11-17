import { useMemo, useState } from 'react';
import styles from './Faculty.module.css';

// A searchable list of people, one row each: [headshot] [name, title]
// [organisation], with the person's bio, if they have one, under the name.
// The Faculty Affiliates page and the Portal's Speakers both use it. `imageUrl(kind, name)` says where a row's pictures are; without it
// the list has no pictures at all (the Speakers: BEI has no photos of them).
// A row also shows what else it carries: the place, area and class-speaker
// note under the title, and the email as a link (only the signed-in speaker
// list has these; the public directory never sends them). `searchLabel` names
// the search box for screen readers.
//
// The Portal's Speakers also has a map (SpeakerMap.jsx), which shows the same
// search and filter, so for it:
// - `aside` sits at the end of the count line (the List | Map switch);
// - `renderShown(people)` draws the people the search and filter leave
//   instead of the rows (the map);
// - `rise` is the class that brings content in (Faculty.module.css .enter),
//   put on the search and count, and separately on what is under them, and
//   `bodyKey` names what is under them: when it changes (List to Map), only
//   that part is new and rises in again, and what was typed in the search
//   stays. Without `rise` the caller brings the whole list in.
export default function People({ people, imageUrl, searchLabel, aside, renderShown, rise, bodyKey }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState(''); // '' = every area

  // Areas present in the list, most people first, each with its head count.
  const areas = useMemo(() => {
    const counts = new Map();
    for (const person of people) {
      if (person.area) counts.set(person.area, (counts.get(person.area) || 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [people]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return people
      .map((person, index) => ({ person, index }))
      .filter(({ person }) => {
        if (area && person.area !== area) return false;
        const text =
          `${person.first_name} ${person.last_name} ${person.title} ${person.affiliation}`.toLowerCase();
        return words.every((word) => text.includes(word));
      });
  }, [people, query, area]);

  const total = `${people.length} ${people.length === 1 ? 'person' : 'people'}`;

  return (
    <>
      <div className={rise}>
        <div className={styles.toolbar}>
          <input
            className={`${styles.input} ${styles.search}`}
            type="search"
            aria-label={searchLabel}
            placeholder="Search by name or organization"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {/* Only when the list gives areas: an "All" button alone filters nothing. */}
          {areas.length > 0 && (
            <div className={styles.areas} role="group" aria-label="Show one area">
              <AreaButton label="All" count={people.length} active={!area} onClick={() => setArea('')} />
              {areas.map(([name, count]) => (
                <AreaButton
                  key={name}
                  label={name}
                  count={count}
                  active={area === name}
                  onClick={() => setArea(name)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.countBar}>
          <p className={styles.count} role="status">
            {shown.length === people.length ? total : `${shown.length} of ${total}`}
          </p>
          {aside}
        </div>
      </div>

      <div key={bodyKey} className={rise}>
        {shown.length === 0 ? (
          <p className={styles.empty}>
            Nobody matches that.{' '}
            <button
              className={styles.linkButton}
              type="button"
              onClick={() => {
                setQuery('');
                setArea('');
              }}
            >
              Show everyone
            </button>
          </p>
        ) : renderShown ? (
          renderShown(shown.map(({ person }) => person))
        ) : (
          <PersonRows shown={shown} imageUrl={imageUrl} />
        )}
      </div>
    </>
  );
}

// One row per person: [headshot] [name, title, details, email] [organisation].
function PersonRows({ shown, imageUrl }) {
  return (
    <ul className={styles.people}>
      {shown.map(({ person, index }) => (
        <li
          key={index}
          className={[styles.person, !imageUrl && styles.personPlain, person.bio && styles.personWithBio]
            .filter(Boolean)
            .join(' ')}
        >
          {imageUrl && <Portrait person={person} imageUrl={imageUrl} />}
          <div className={styles.personMain}>
            <h2 className={styles.name}>
              {person.first_name} {person.last_name}
            </h2>
            {person.title && <p className={styles.role}>{person.title}</p>}
            {details(person) && <p className={styles.role}>{details(person)}</p>}
            {person.email && (
              <a className={styles.email} href={`mailto:${person.email}`}>
                {person.email}
              </a>
            )}
          </div>
          {person.affiliation && <p className={styles.org}>{person.affiliation}</p>}
          {person.bio && <Bio person={person} />}
        </li>
      ))}
    </ul>
  );
}

// A bio longer than this many characters (more than four lines across a
// wide screen) shows its first four lines, with "Read more" to open the rest.
// All of it is in the page either way: the shortening is only what is drawn,
// so screen readers and search engines get the whole bio.
const LONG_BIO = 320;

function Bio({ person }) {
  const [whole, setWhole] = useState(false);
  const long = person.bio.length > LONG_BIO;
  const action = whole ? 'Show less' : 'Read more';
  return (
    <div className={styles.bio}>
      <p className={long && !whole ? styles.bioShort : undefined}>{person.bio}</p>
      {long && (
        <button
          className={`${styles.linkButton} ${styles.bioMore}`}
          type="button"
          aria-expanded={whole}
          aria-label={`${action} of ${person.first_name} ${person.last_name}’s bio`}
          onClick={() => setWhole(!whole)}
        >
          {action}
        </button>
      )}
    </div>
  );
}

// A row's second line of detail, such as "Austin · Mining · Class speaker:
// Agreed", or '' when it has none of them.
const details = (person) =>
  [person.location, person.area, person.class_speaker && `Class speaker: ${person.class_speaker}`]
    .filter(Boolean)
    .join(' · ');

// The headshot with the organisation's logo set into its corner. Both are
// decorative: the name and the organisation are in text right beside them. If
// a picture is missing or fails to load, the person's initials stand in for
// the headshot and the logo is simply left out. Each picture fades in once it
// has loaded instead of popping in (its space is held, so nothing moves).
function Portrait({ person, imageUrl }) {
  const [headshotFailed, setHeadshotFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [loaded, setLoaded] = useState({ headshot: false, logo: false });
  const shown = (which) => () => setLoaded((was) => ({ ...was, [which]: true }));
  const initials = `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className={styles.portrait}>
      {person.headshot && !headshotFailed ? (
        <img
          className={`${styles.headshot} ${styles.picture} ${loaded.headshot ? styles.pictureShown : ''}`}
          src={imageUrl('headshots', person.headshot)}
          alt=""
          width="440"
          height="550"
          loading="lazy"
          onLoad={shown('headshot')}
          onError={() => setHeadshotFailed(true)}
        />
      ) : (
        <span className={`${styles.headshot} ${styles.initials}`} aria-hidden="true">
          {initials}
        </span>
      )}
      {person.logo && !logoFailed && (
        <img
          className={`${styles.seal} ${styles.picture} ${loaded.logo ? styles.pictureShown : ''}`}
          src={imageUrl('logos', person.logo)}
          alt=""
          width="44"
          height="44"
          loading="lazy"
          onLoad={shown('logo')}
          onError={() => setLogoFailed(true)}
        />
      )}
    </div>
  );
}

function AreaButton({ label, count, active, onClick }) {
  return (
    <button
      className={`${styles.areaButton} ${active ? styles.areaActive : ''}`}
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      {label} <span className={styles.areaCount}>{count}</span>
    </button>
  );
}
