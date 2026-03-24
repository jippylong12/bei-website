import { motion } from 'motion/react';
import Hero from '../../components/Hero/Hero';
import styles from './Contact.module.css';

export default function Contact() {
  return (
    <>
      <Hero title="Contact Us" subtitle="Drop us a line!" />

      <section className={styles.contactSection}>
        <div className="container">
          <motion.p
            className={styles.text}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Have questions about Bitcoin education, partnerships, or our programs?
            Reach out to us directly.
          </motion.p>
          <motion.a
            href="mailto:info@btcedu.org"
            className={styles.emailLink}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ scale: 1.05 }}
          >
            info@btcedu.org
          </motion.a>
        </div>
      </section>
    </>
  );
}
