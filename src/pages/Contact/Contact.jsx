import Hero from '../../components/Hero/Hero';
import styles from './Contact.module.css';

export default function Contact() {
  return (
    <>
      <Hero title="Contact Us" subtitle="Drop us a line!" />

      <section className={styles.contactSection}>
        <div className="container">
          <p className={styles.text}>
            Have questions about Bitcoin education, partnerships, or our programs?
            Reach out to us directly.
          </p>
          <a href="mailto:info@btcedu.org" className={styles.emailLink}>
            info@btcedu.org
          </a>
        </div>
      </section>
    </>
  );
}
