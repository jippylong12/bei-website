import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.col}>
          <p>&copy; {new Date().getFullYear()} Bitcoin Education Institute</p>
          <p>All Rights Reserved.</p>
        </div>
        <div className={styles.col}>
          <a href="mailto:info@btcedu.org">info@btcedu.org</a>
          <p className={styles.status}>
            BEI is a 501(c)(3) tax-exempt nonprofit corporation.
          </p>
        </div>
        <div className={styles.col}>
          <a
            href="https://pay.zaprite.com/pl_JCxJao3lKs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.donateLink}
          >
            Donate to BEI
          </a>
        </div>
      </div>
    </footer>
  );
}
