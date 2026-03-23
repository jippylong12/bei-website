import Hero from '../../components/Hero/Hero';
import styles from './Conference.module.css';

export default function Conference() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero
        title="Annual Bitcoin Education Institute Conference 2026"
        backgroundImage={`${base}images/event.jpg`}
      >
        <a
          href="http://forms.gle/dDMLL2XFuCEkPt1z5"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.registerButton}
        >
          Register
        </a>
      </Hero>

      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Who Should Attend</h2>
              <p>
                Our conference brings together educators, researchers, and
                practitioners from across higher education to advance the
                rigorous, interdisciplinary study of Bitcoin.
              </p>
              <p>
                Faculty, graduate students, researchers, and Bitcoin-interested
                individuals across disciplines including economics, finance,
                computer science, law, energy, or policy.
              </p>
            </div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>What to Expect</h2>
              <p>
                Keynote presentations from leading Bitcoin researchers and
                educators.
              </p>
              <p>
                Teaching and research talks showcasing innovative approaches to
                Bitcoin education.
              </p>
              <p>
                Networking with colleagues who are developing Bitcoin curricula
                nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
