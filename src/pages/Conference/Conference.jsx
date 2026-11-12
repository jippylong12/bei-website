import { Link, useSearchParams } from 'react-router-dom';
import Conference2026 from './Conference2026';
import Conference2027 from './Conference2027';
import styles from './Conference.module.css';

// The one Conference page, at /conference. It shows the coming conference
// (2027) unless the address asks for another year: /conference?year=2026.
// The year switch at the top of the page changes it. The old addresses
// /conference-2026 and /conference-2027 lead here (see main.jsx).

const DEFAULT_YEAR = '2027';

// Newest first, as the switch shows them.
const YEARS = [
  { year: '2027', place: 'Nashville', Page: Conference2027 },
  { year: '2026', place: 'Washington, DC', Page: Conference2026 },
];

export default function Conference() {
  const [params] = useSearchParams();
  const asked = YEARS.find(({ year }) => year === params.get('year'));
  const { year: current, Page } = asked || YEARS.find(({ year }) => year === DEFAULT_YEAR);

  return <Page yearSwitch={<YearSwitch current={current} />} />;
}

function YearSwitch({ current }) {
  return (
    <nav className={styles.years} aria-label="Conference year">
      {YEARS.map(({ year, place }) => (
        <Link
          key={year}
          to={year === DEFAULT_YEAR ? '/conference' : `/conference?year=${year}`}
          className={styles.year}
          aria-current={year === current ? 'page' : undefined}
        >
          <span className={styles.yearNumber}>{year}</span>
          <span className={styles.yearPlace}>{place}</span>
        </Link>
      ))}
    </nav>
  );
}
