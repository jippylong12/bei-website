import { motion } from 'motion/react';
import Hero from '../../components/Hero/Hero';
import styles from './Donate.module.css';

export default function Donate() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Hero
        title="Support Bitcoin Education"
        subtitle="Your contribution supports nonprofit academic programs, research, and curriculum development."
        backgroundImage={`${base}images/hero.png`}
        backgroundPosition="center"
      >
        <motion.a
          href="https://pay.zaprite.com/pl_JCxJao3lKs"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.donateButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Donate to BEI
        </motion.a>
      </Hero>

      <section className={styles.infoSection}>
        <div className="container">
          <motion.p
            className={styles.text}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            BEI is a 501(c)(3) tax-exempt nonprofit corporation. Your donation
            may be tax-deductible to the extent allowed by law.
          </motion.p>
        </div>
      </section>
    </>
  );
}
