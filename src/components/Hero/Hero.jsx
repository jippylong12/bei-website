import styles from './Hero.module.css';

export default function Hero({ title, subtitle, backgroundImage, children }) {
  const hasBackground = !!backgroundImage;
  const heroClass = `${styles.hero} ${hasBackground ? styles.heroFull : styles.heroCompact}`;

  return (
    <section
      className={heroClass}
      style={{
        backgroundImage: hasBackground
          ? `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${backgroundImage})`
          : undefined,
      }}
    >
      <div className={`container ${styles.content}`}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children && <div className={styles.cta}>{children}</div>}
      </div>
    </section>
  );
}
