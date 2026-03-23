import Hero from '../../components/Hero/Hero';
import styles from './Donate.module.css';

export default function Donate() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero
        title="Support Bitcoin Education"
        subtitle="Your contribution helps advance Bitcoin research and education in higher learning"
        backgroundImage={`${base}images/hero.png`}
      >
        <a
          href="https://pay.zaprite.com/pl_JCxJao3lKs"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.donateButton}
        >
          Donate to BEI
        </a>
      </Hero>

      <section className={styles.infoSection}>
        <div className="container">
          <p className={styles.text}>
            BEI is a 501(c)(3) tax-exempt nonprofit corporation. Your donation
            may be tax-deductible to the extent allowed by law.
          </p>
        </div>
      </section>
    </>
  );
}
